import { pgTable, uuid, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';

export const sysLoginLog = pgTable('sys_login_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'),
  username: varchar('username', { length: 50 }),
  ip: varchar('ip', { length: 50 }),
  location: varchar('location', { length: 100 }),
  browser: varchar('browser', { length: 50 }),
  os: varchar('os', { length: 50 }),
  userAgent: text('user_agent'),
  status: integer('status').default(0),
  message: varchar('message', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
});
