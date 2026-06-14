import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const sysJob = pgTable('sys_job', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }),
  group: varchar('group', { length: 50 }),
  handler: varchar('handler', { length: 200 }),
  cron: varchar('cron', { length: 50 }),
  status: integer('status').default(0),
  remark: varchar('remark', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
