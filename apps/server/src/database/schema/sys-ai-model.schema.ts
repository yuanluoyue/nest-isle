import { pgTable, uuid, varchar, integer } from 'drizzle-orm/pg-core';

export const sysAiModel = pgTable('sys_ai_model', {
  id: uuid('id').defaultRandom().primaryKey(),
  providerId: uuid('provider_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 100 }),
  modelType: varchar('model_type', { length: 20 }).notNull(),
  enabled: integer('enabled').default(0),
  isDefault: integer('is_default').default(0),
  contextLength: integer('context_length'),
  inputPrice: varchar('input_price', { length: 50 }),
  outputPrice: varchar('output_price', { length: 50 }),
  remark: varchar('remark', { length: 500 }),
});
