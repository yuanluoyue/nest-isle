import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

/**
 * 通知公告
 * status: 0=draft 1=published 2=archived
 * category: system | release | maintenance | security
 */
export const sysNotice = pgTable('sys_notice', {
  id: uuid('id').defaultRandom().primaryKey(),

  title: varchar('title', { length: 200 }).notNull(),

  summary: varchar('summary', {
    length: 500,
  }),

  content: text('content').notNull(),

  category: varchar('category', {
    length: 50,
  }),

  status: integer('status').default(0).notNull(),

  publishedAt: timestamp('published_at'),

  remark: varchar('remark', {
    length: 500,
  }),

  createdBy: uuid('created_by'),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  deletedAt: timestamp('deleted_at'),
});
