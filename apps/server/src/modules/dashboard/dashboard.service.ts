import { Injectable } from '@nestjs/common';
import { isNull, count, sum } from 'drizzle-orm';
import { sysUser, sysFile } from '../../database/schema';
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

    const [fileSize] = await this.db
      .select({ totalSize: sum(sysFile.size) })
      .from(sysFile)
      .where(isNull(sysFile.deletedAt));

    return {
      userCount: userCount.count,
      totalFileSize: Number(fileSize.totalSize) || 0,
    };
  }
}
