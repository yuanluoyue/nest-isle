import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

/**
 * 系统配置
 * type: 0=系统内置 1=自定义
 * status: 0=启用 1=禁用
 */
export const sysConfig = pgTable('sys_config', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: varchar('name', { length: 100 }).notNull(),

  key: varchar('key', { length: 100 }).notNull(),

  value: text('value').notNull(),

  type: integer('type').default(1).notNull(),

  status: integer('status').default(0).notNull(),

  remark: varchar('remark', {
    length: 500,
  }),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  deletedAt: timestamp('deleted_at'),
});
