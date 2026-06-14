import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const sysConfig = pgTable('sys_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }),
  key: varchar('key', { length: 50 }),
  value: varchar('value', { length: 500 }),
  type: integer('type').default(0),
  status: integer('status').default(0),
  remark: varchar('remark', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
