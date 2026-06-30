import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, isNull, ilike, desc, SQL } from 'drizzle-orm';
import { sysConfig } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CacheService } from '../../../core/cache/cache.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';

const CACHE_PREFIX = 'sys:config:';
const CACHE_TTL = 3600; // 1 小时

@Injectable()
export class ConfigService {
  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryConfigDto) {
    const { page = 1, pageSize = 10, name, key, type, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [isNull(sysConfig.deletedAt)];
    if (name) conditions.push(ilike(sysConfig.name, `%${name}%`));
    if (key) conditions.push(ilike(sysConfig.key, `%${key}%`));
    if (type !== undefined) conditions.push(eq(sysConfig.type, type));
    if (status !== undefined) conditions.push(eq(sysConfig.status, status));

    const where = and(...conditions);

    const [list, countResult] = await Promise.all([
      this.db.query.sysConfig.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysConfig.createdAt),
      }),
      this.db.select({ id: sysConfig.id }).from(sysConfig).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const config = await this.db.query.sysConfig.findFirst({
      where: and(eq(sysConfig.id, id), isNull(sysConfig.deletedAt)),
    });
    if (!config) {
      throw new NotFoundException('配置不存在');
    }
    return config;
  }

  async findByKey(key: string): Promise<string | null> {
    // 先查缓存
    const cached = await this.cacheService.get(`${CACHE_PREFIX}${key}`);
    if (cached !== null) {
      return cached;
    }

    // 查数据库
    const config = await this.db.query.sysConfig.findFirst({
      where: and(
        eq(sysConfig.key, key),
        eq(sysConfig.status, 0),
        isNull(sysConfig.deletedAt),
      ),
    });
    if (!config) {
      return null;
    }

    // 写入缓存
    await this.cacheService.set(
      `${CACHE_PREFIX}${key}`,
      config.value,
      CACHE_TTL,
    );
    return config.value;
  }

  async create(dto: CreateConfigDto) {
    const [created] = await this.db
      .insert(sysConfig)
      .values({
        name: dto.name,
        key: dto.key,
        value: dto.value,
        type: dto.type ?? 1,
        status: dto.status ?? 0,
        remark: dto.remark,
      })
      .returning();

    // 写入缓存
    await this.cacheService.set(
      `${CACHE_PREFIX}${dto.key}`,
      dto.value,
      CACHE_TTL,
    );

    return created;
  }

  async update(id: string, dto: UpdateConfigDto) {
    const existing = await this.findOne(id);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.key !== undefined) updateData.key = dto.key;
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const [updated] = await this.db
      .update(sysConfig)
      .set(updateData)
      .where(eq(sysConfig.id, id))
      .returning();

    // 删除旧缓存，写入新缓存
    await this.cacheService.del(`${CACHE_PREFIX}${existing.key}`);
    if (updated.status === 0) {
      await this.cacheService.set(
        `${CACHE_PREFIX}${updated.key}`,
        updated.value,
        CACHE_TTL,
      );
    }

    return updated;
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.db
      .update(sysConfig)
      .set({ deletedAt: new Date() })
      .where(eq(sysConfig.id, id));

    // 删除缓存
    await this.cacheService.del(`${CACHE_PREFIX}${existing.key}`);
  }

  /** 刷新所有配置到缓存 */
  async refreshCache() {
    // 清除所有配置缓存
    await this.cacheService.delByPattern(`${CACHE_PREFIX}*`);

    // 加载所有启用的配置
    const configs = await this.db.query.sysConfig.findMany({
      where: and(eq(sysConfig.status, 0), isNull(sysConfig.deletedAt)),
    });

    // 批量写入缓存
    for (const config of configs) {
      await this.cacheService.set(
        `${CACHE_PREFIX}${config.key}`,
        config.value,
        CACHE_TTL,
      );
    }

    return { count: configs.length };
  }
}
