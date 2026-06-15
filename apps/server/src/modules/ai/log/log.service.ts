import { Injectable } from '@nestjs/common';
import { eq, and, desc, SQL } from 'drizzle-orm';
import { sysAiLog } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { QueryLogDto } from './dto/query-log.dto';

@Injectable()
export class LogService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryLogDto) {
    const { page = 1, pageSize = 10, providerId, modelId, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (providerId) conditions.push(eq(sysAiLog.providerId, providerId));
    if (modelId) conditions.push(eq(sysAiLog.modelId, modelId));
    if (status !== undefined) conditions.push(eq(sysAiLog.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [list, countResult] = await Promise.all([
      this.db.query.sysAiLog.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysAiLog.createdAt),
        with: {
          provider: true,
          model: true,
        },
      }),
      this.db.select({ id: sysAiLog.id }).from(sysAiLog).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    return this.db.query.sysAiLog.findFirst({
      where: eq(sysAiLog.id, id),
      with: {
        provider: true,
        model: true,
      },
    });
  }
}
