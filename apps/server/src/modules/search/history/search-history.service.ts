import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { sysSearchHistory } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class SearchHistoryService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async addHistory(userId: string, keyword: string) {
    await this.db.insert(sysSearchHistory).values({ userId, keyword });
  }

  async getHistory(userId: string, limit = 10) {
    return this.db.query.sysSearchHistory.findMany({
      where: eq(sysSearchHistory.userId, userId),
      orderBy: desc(sysSearchHistory.createdAt),
      limit,
      columns: {
        id: true,
        keyword: true,
        createdAt: true,
      },
    });
  }

  async clearHistory(userId: string) {
    await this.db
      .delete(sysSearchHistory)
      .where(eq(sysSearchHistory.userId, userId));
  }

  async removeHistoryItem(id: string, userId: string) {
    await this.db
      .delete(sysSearchHistory)
      .where(eq(sysSearchHistory.id, id));
  }
}
