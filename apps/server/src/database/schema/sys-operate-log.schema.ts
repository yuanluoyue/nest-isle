import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
} from 'drizzle-orm/pg-core';

export const sysOperateLog = pgTable('sys_operate_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'),
  module: varchar('module', { length: 50 }),
  description: varchar('description', { length: 200 }),
  method: varchar('method', { length: 50 }),
  url: varchar('url', { length: 500 }),
  ip: varchar('ip', { length: 50 }),
  status: integer('status').default(0),
  request: text('request'),
  response: text('response'),
  createdAt: timestamp('created_at').defaultNow(),
});
