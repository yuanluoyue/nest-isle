import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, isNull, ilike, desc, SQL } from 'drizzle-orm';
import { sysNotice, sysUser } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { EventService } from '../../../core/event/event.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { QueryNoticeDto } from './dto/query-notice.dto';

@Injectable()
export class NoticeService {
  constructor(
    private databaseService: DatabaseService,
    private eventService: EventService,
  ) {}

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

    // 直接发布时，发送站内信通知所有用户
    if (created.status === 1) {
      await this.sendNoticeNotification(
        created.id,
        created.title,
        created.summary ?? created.content,
        createdBy,
      );
    }

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

    // 从非发布状态变为发布状态时，发送站内信通知所有用户
    if (dto.status === 1 && existing.status !== 1) {
      await this.sendNoticeNotification(
        updated.id,
        updated.title,
        updated.summary ?? updated.content,
        updated.createdBy,
      );
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db
      .update(sysNotice)
      .set({ deletedAt: new Date() })
      .where(eq(sysNotice.id, id));
  }

  private async sendNoticeNotification(
    noticeId: string,
    title: string,
    content: string,
    createdBy: string | null,
  ) {
    // 查询所有活跃用户
    const users = await this.db
      .select({ id: sysUser.id })
      .from(sysUser)
      .where(isNull(sysUser.deletedAt));

    if (users.length === 0) return;

    this.eventService.emitNotification({
      type: 'announcement',
      title: `通知公告：${title}`,
      content: content?.slice(0, 200) ?? '',
      link: `/system/notice`,
      payload: { noticeId },
      priority: 0,
      receiverIds: users.map((u) => u.id),
      createdBy: createdBy ?? undefined,
    });
  }
}
