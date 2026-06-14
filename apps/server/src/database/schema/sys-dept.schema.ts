import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const sysDept = pgTable('sys_dept', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id'),
  name: varchar('name', { length: 50 }),
  sort: integer('sort').default(0),
  leader: varchar('leader', { length: 50 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  status: integer('status').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
