import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const sysFile = pgTable('sys_file', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }),
  url: varchar('url', { length: 500 }),
  type: varchar('type', { length: 50 }),
  size: integer('size'),
  storage: varchar('storage', { length: 20 }).default('local'),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
