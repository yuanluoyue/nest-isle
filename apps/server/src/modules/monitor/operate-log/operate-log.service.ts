import { Injectable } from '@nestjs/common';
import { eq, and, ilike, desc, SQL } from 'drizzle-orm';
import { sysOperateLog } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { QueryOperateLogDto } from './dto/query-operate-log.dto';

@Injectable()
export class OperateLogService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryOperateLogDto) {
    const { page = 1, pageSize = 10, module, description, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (module) conditions.push(ilike(sysOperateLog.module, `%${module}%`));
    if (description)
      conditions.push(ilike(sysOperateLog.description, `%${description}%`));
    if (status !== undefined) conditions.push(eq(sysOperateLog.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [list, countResult] = await Promise.all([
      this.db.query.sysOperateLog.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysOperateLog.createdAt),
      }),
      this.db.select({ id: sysOperateLog.id }).from(sysOperateLog).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const log = await this.db.query.sysOperateLog.findFirst({
      where: eq(sysOperateLog.id, id),
    });
    return log;
  }
}
