import { Injectable } from '@nestjs/common';
import { eq, isNull, and, or, ilike, SQL } from 'drizzle-orm';
import { sysMenu } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { SearchProvider, SearchItem } from './provider.interface';

@Injectable()
export class MenuProvider implements SearchProvider {
  readonly name = 'menu';

  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async search(keyword: string, userId: string, permissions: string[]): Promise<SearchItem[]> {
    if (!permissions.some((p) => p.startsWith('system:menu'))) return [];

    const conditions: SQL[] = [
      isNull(sysMenu.deletedAt),
      or(ilike(sysMenu.name, `%${keyword}%`), ilike(sysMenu.path, `%${keyword}%`))!,
    ];

    const menus = await this.db.query.sysMenu.findMany({
      where: and(...conditions),
      limit: 10,
    });

    return menus.map((menu) => ({
      id: menu.id,
      provider: this.name,
      title: menu.name ?? '',
      subtitle: menu.path ?? undefined,
      description: menu.permission ?? undefined,
      icon: menu.icon ?? undefined,
      url: `/system/menu`,
      score: 1,
    }));
  }
}
