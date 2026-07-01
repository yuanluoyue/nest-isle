import { Injectable } from '@nestjs/common';
import { eq, isNull, and, or, ilike, SQL } from 'drizzle-orm';
import { sysUser } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { SearchProvider, SearchItem } from './provider.interface';

@Injectable()
export class UserProvider implements SearchProvider {
  readonly name = 'user';

  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async search(keyword: string, userId: string, permissions: string[]): Promise<SearchItem[]> {
    if (!permissions.some((p) => p.startsWith('system:user'))) return [];

    const conditions: SQL[] = [
      isNull(sysUser.deletedAt),
      or(
        ilike(sysUser.username, `%${keyword}%`),
        ilike(sysUser.nickname, `%${keyword}%`),
        ilike(sysUser.email, `%${keyword}%`),
      )!,
    ];

    const users = await this.db.query.sysUser.findMany({
      where: and(...conditions),
      limit: 10,
      columns: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      provider: this.name,
      title: user.nickname ?? user.username ?? '',
      subtitle: user.email ?? undefined,
      description: user.phone ?? undefined,
      icon: user.avatar ?? undefined,
      url: '/system/user',
      score: 1,
    }));
  }
}
