import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { eq, and, desc, SQL, sql } from 'drizzle-orm';
import {
  sysNotification,
  sysNotificationReceiver,
} from '../../database/schema';
import { DatabaseService } from '../../database/database.service';
import { EventService } from '../../core/event/event.service';
import { WsService } from '../../core/gateway/ws.service';
import { QueueService } from '../../core/queue/queue.service';
import { NotificationEvent } from '../../core/event/event.service';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private databaseService: DatabaseService,
    private eventService: EventService,
    private wsService: WsService,
    private queueService: QueueService,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryNotificationDto, userId: string) {
    const { page = 1, pageSize = 10, status, type } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [eq(sysNotificationReceiver.receiverId, userId)];
    if (status) conditions.push(eq(sysNotificationReceiver.status, status));
    if (type) conditions.push(eq(sysNotification.type, type));

    const where = and(...conditions);

    const [list, countResult] = await Promise.all([
      this.db.query.sysNotificationReceiver.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysNotificationReceiver.createdAt),
        with: { notification: true },
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(sysNotificationReceiver)
        .leftJoin(
          sysNotification,
          eq(sysNotificationReceiver.notificationId, sysNotification.id),
        )
        .where(where),
    ]);

    return {
      list,
      total: Number(countResult[0]?.count ?? 0),
      page,
      pageSize,
    };
  }

  async findOne(id: string, userId: string) {
    const receiver = await this.db.query.sysNotificationReceiver.findFirst({
      where: and(
        eq(sysNotificationReceiver.id, id),
        eq(sysNotificationReceiver.receiverId, userId),
      ),
      with: { notification: true },
    });
    if (!receiver) {
      throw new NotFoundException('站内信不存在');
    }
    return receiver;
  }

  async getUnreadCount(userId: string) {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(sysNotificationReceiver)
      .where(
        and(
          eq(sysNotificationReceiver.receiverId, userId),
          eq(sysNotificationReceiver.status, 'unread'),
        ),
      );
    return { count: Number(result[0]?.count ?? 0) };
  }

  async markAsRead(id: string, userId: string) {
    const receiver = await this.findOne(id, userId);
    if (receiver.status === 'read') return receiver;

    const [updated] = await this.db
      .update(sysNotificationReceiver)
      .set({ status: 'read', readAt: new Date() })
      .where(eq(sysNotificationReceiver.id, id))
      .returning();
    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.db
      .update(sysNotificationReceiver)
      .set({ status: 'read', readAt: new Date() })
      .where(
        and(
          eq(sysNotificationReceiver.receiverId, userId),
          eq(sysNotificationReceiver.status, 'unread'),
        ),
      );
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.db
      .delete(sysNotificationReceiver)
      .where(eq(sysNotificationReceiver.id, id));
  }

  async sendNotification(data: NotificationEvent) {
    const [notification] = await this.db
      .insert(sysNotification)
      .values({
        type: data.type,
        title: data.title,
        content: data.content,
        link: data.link,
        payload: data.payload,
        priority: data.priority,
        createdBy: data.createdBy,
      })
      .returning();

    if (!notification) return;

    const receiverValues = data.receiverIds.map((receiverId) => ({
      notificationId: notification.id,
      receiverId,
      status: 'unread' as const,
    }));

    await this.db.insert(sysNotificationReceiver).values(receiverValues);

    for (const receiverId of data.receiverIds) {
      this.wsService.emitToUser(receiverId, 'notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        priority: notification.priority,
        createdAt: notification.createdAt,
      });
    }

    this.logger.log(
      `Notification sent: ${notification.id} to ${data.receiverIds.length} receivers`,
    );
  }
}
