import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const sysPost = pgTable('sys_post', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }),
  code: varchar('code', { length: 50 }),
  sort: integer('sort').default(0),
  status: integer('status').default(0),
  remark: varchar('remark', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
