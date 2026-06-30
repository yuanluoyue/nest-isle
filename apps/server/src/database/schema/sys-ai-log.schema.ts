import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const sysAiLog = pgTable('sys_ai_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  providerId: uuid('provider_id'),
  modelId: uuid('model_id'),
  userId: uuid('user_id'),
  promptTokens: integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  totalTokens: integer('total_tokens'),
  duration: integer('duration'),
  status: integer('status').notNull(),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
});
