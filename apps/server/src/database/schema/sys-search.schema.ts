import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sysUser } from './sys-user.schema';

export const sysSearchHistory = pgTable('sys_search_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => sysUser.id),
  keyword: varchar('keyword', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
});
