import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, SQL, desc } from 'drizzle-orm';
import { sysFormVersion } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { QueryVersionDto } from './dto/query-version.dto';

@Injectable()
export class VersionService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryVersionDto) {
    const { page = 1, pageSize = 10, formId } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (formId) conditions.push(eq(sysFormVersion.formId, formId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [versions, countResult] = await Promise.all([
      this.db.query.sysFormVersion.findMany({
        where,
        limit: pageSize,
        offset,
        columns: {
          id: true,
          formId: true,
          version: true,
          schema: true,
          remark: true,
          isPublished: true,
          createdBy: true,
          createdAt: true,
        },
        orderBy: [desc(sysFormVersion.version)],
      }),
      this.db.select({ id: sysFormVersion.id }).from(sysFormVersion).where(where),
    ]);

    return {
      list: versions,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const version = await this.db.query.sysFormVersion.findFirst({
      where: eq(sysFormVersion.id, id),
    });

    if (!version) {
      throw new NotFoundException('版本不存在');
    }

    return version;
  }
}
