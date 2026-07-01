import { Injectable, Logger } from '@nestjs/common';
import { PermissionService } from '../../core/auth/permission.service';
import { CacheService } from '../../core/cache/cache.service';
import { SearchRegistry } from './provider/search.registry';
import { SearchHistoryService } from './history/search-history.service';
import { SearchItem } from './provider/provider.interface';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly CACHE_TTL = 300; // 5 分钟缓存

  constructor(
    private searchRegistry: SearchRegistry,
    private permissionService: PermissionService,
    private historyService: SearchHistoryService,
    private cacheService: CacheService,
  ) {}

  async search(
    keyword: string,
    userId: string,
    providers?: string[],
  ): Promise<SearchItem[]> {
    // 检查缓存
    const cacheKey = `search:${userId}:${keyword}:${providers?.join(',') ?? 'all'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 获取用户权限
    const permissions = await this.permissionService.getPermissions(userId);

    // 获取要执行的 provider
    const allProviders = this.searchRegistry.getProviders();
    const targetProviders = providers
      ? allProviders.filter((p) => providers.includes(p.name))
      : allProviders;

    // 并行搜索
    const results = await Promise.all(
      targetProviders.map((p) =>
        p.search(keyword, userId, permissions).catch((err) => {
          this.logger.warn(`Search provider "${p.name}" failed: ${err.message}`);
          return [];
        }),
      ),
    );

    // 合并、排序
    const items = results
      .flat()
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // 写入缓存
    await this.cacheService
      .set(cacheKey, JSON.stringify(items), this.CACHE_TTL)
      .catch(() => {});

    // 有搜索结果时才记录历史
    if (items.length > 0) {
      await this.historyService.addHistory(userId, keyword);
    }

    return items;
  }

  async getHistory(userId: string, limit?: number) {
    return this.historyService.getHistory(userId, limit);
  }

  async clearHistory(userId: string) {
    return this.historyService.clearHistory(userId);
  }

  async removeHistoryItem(id: string, userId: string) {
    return this.historyService.removeHistoryItem(id, userId);
  }
}
