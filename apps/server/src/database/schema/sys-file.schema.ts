import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const sysFile = pgTable('sys_file', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }),
  originalName: varchar('original_name', { length: 200 }),
  path: varchar('path', { length: 500 }),
  url: varchar('url', { length: 500 }),
  size: integer('size'),
  mimeType: varchar('mime_type', { length: 100 }),
  storage: varchar('storage', { length: 20 }).default('minio'),
  bucket: varchar('bucket', { length: 100 }),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
