import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const sysLoginLog = pgTable('sys_login_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }),
  ip: varchar('ip', { length: 50 }),
  location: varchar('location', { length: 100 }),
  browser: varchar('browser', { length: 50 }),
  os: varchar('os', { length: 50 }),
  status: integer('status').default(0),
  message: varchar('message', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
});
