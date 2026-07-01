import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

/**
 * 站内信消息本体
 * type: announcement=通知公告 role_change=角色变更
 * priority: 0=普通 1=重要 2=紧急
 */
export const sysNotification = pgTable('sys_notification', {
  id: uuid('id').defaultRandom().primaryKey(),

  type: varchar('type', { length: 50 }),

  title: varchar('title', { length: 200 }),

  content: text('content'),

  link: varchar('link', { length: 500 }),

  payload: jsonb('payload'),

  priority: integer('priority').default(0),

  createdBy: uuid('created_by'),

  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * 站内信收件箱
 * status: unread=未读 read=已读
 */
export const sysNotificationReceiver = pgTable('sys_notification_receiver', {
  id: uuid('id').defaultRandom().primaryKey(),

  notificationId: uuid('notification_id'),

  receiverId: uuid('receiver_id'),

  status: varchar('status', { length: 20 }).default('unread'),

  readAt: timestamp('read_at'),

  createdAt: timestamp('created_at').defaultNow(),
});
