import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import { sysFormRecord, sysForm } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';

@Injectable()
export class RecordService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryRecordDto) {
    const { page = 1, pageSize = 10, formId } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (formId) conditions.push(eq(sysFormRecord.formId, formId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [records, countResult] = await Promise.all([
      this.db.query.sysFormRecord.findMany({
        where,
        limit: pageSize,
        offset,
        columns: {
          id: true,
          formId: true,
          data: true,
          createdBy: true,
          createdAt: true,
        },
      }),
      this.db.select({ id: sysFormRecord.id }).from(sysFormRecord).where(where),
    ]);

    return {
      list: records,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const record = await this.db.query.sysFormRecord.findFirst({
      where: eq(sysFormRecord.id, id),
    });

    if (!record) {
      throw new NotFoundException('记录不存在');
    }

    return record;
  }

  async create(dto: CreateRecordDto, userId?: string) {
    const [record] = await this.db
      .insert(sysFormRecord)
      .values({
        formId: dto.formId,
        data: dto.data,
        createdBy: userId,
      })
      .returning();

    return record;
  }

  async remove(id: string) {
    const record = await this.db.query.sysFormRecord.findFirst({
      where: eq(sysFormRecord.id, id),
    });
    if (!record) {
      throw new NotFoundException('记录不存在');
    }

    await this.db.delete(sysFormRecord).where(eq(sysFormRecord.id, id));
  }
}
