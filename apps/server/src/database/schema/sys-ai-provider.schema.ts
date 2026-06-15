import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const sysAiProvider = pgTable('sys_ai_provider', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  baseUrl: varchar('base_url', { length: 500 }),
  apiKey: varchar('api_key', { length: 500 }),
  enabled: integer('enabled').default(0),
  priority: integer('priority').default(0),
  remark: varchar('remark', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
