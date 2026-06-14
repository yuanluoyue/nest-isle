import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, isNull, ilike, desc, SQL } from 'drizzle-orm';
import { sysNotice } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { QueryNoticeDto } from './dto/query-notice.dto';

@Injectable()
export class NoticeService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryNoticeDto) {
    const { page = 1, pageSize = 10, title, category, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [isNull(sysNotice.deletedAt)];
    if (title) conditions.push(ilike(sysNotice.title, `%${title}%`));
    if (category) conditions.push(eq(sysNotice.category, category));
    if (status !== undefined) conditions.push(eq(sysNotice.status, status));

    const where = and(...conditions);

    const [list, countResult] = await Promise.all([
      this.db.query.sysNotice.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysNotice.createdAt),
      }),
      this.db.select({ id: sysNotice.id }).from(sysNotice).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const notice = await this.db.query.sysNotice.findFirst({
      where: and(eq(sysNotice.id, id), isNull(sysNotice.deletedAt)),
    });
    if (!notice) {
      throw new NotFoundException('通知公告不存在');
    }
    return notice;
  }

  async create(dto: CreateNoticeDto, createdBy: string) {
    const [created] = await this.db
      .insert(sysNotice)
      .values({
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        category: dto.category,
        status: dto.status ?? 0,
        publishedAt: dto.status === 1 ? new Date() : null,
        remark: dto.remark,
        createdBy,
      })
      .returning();
    return created;
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const existing = await this.findOne(id);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.summary !== undefined) updateData.summary = dto.summary;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      // 首次发布时设置发布时间
      if (dto.status === 1 && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const [updated] = await this.db
      .update(sysNotice)
      .set(updateData)
      .where(eq(sysNotice.id, id))
      .returning();
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db
      .update(sysNotice)
      .set({ deletedAt: new Date() })
      .where(eq(sysNotice.id, id));
  }
}
