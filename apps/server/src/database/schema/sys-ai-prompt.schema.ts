import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
} from 'drizzle-orm/pg-core';

export const sysAiPrompt = pgTable('sys_ai_prompt', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  content: text('content').notNull(),
  version: integer('version').default(1),
  enabled: integer('enabled').default(0),
  remark: varchar('remark', { length: 500 }),
});
