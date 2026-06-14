import { pgTable, uuid, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';

export const sysJobLog = pgTable('sys_job_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id'),
  handler: varchar('handler', { length: 200 }),
  status: integer('status').default(0),
  result: text('result'),
  error: text('error'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
