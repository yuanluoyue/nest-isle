import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DatabaseService } from '../../database/database.service';
import { sysUser } from '../../database/schema';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private databaseService: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.databaseService.db
        .select({ id: sysUser.id })
        .from(sysUser)
        .limit(1);
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: (error as Error).message });
    }
  }
}
