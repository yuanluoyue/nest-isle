import { Injectable } from '@nestjs/common';
import { eq, isNull, count } from 'drizzle-orm';
import { sysUser } from '../../database/schema';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async getStats() {
    const [userCount] = await this.db
      .select({ count: count() })
      .from(sysUser)
      .where(isNull(sysUser.deletedAt));

    return {
      userCount: userCount.count,
    };
  }
}
