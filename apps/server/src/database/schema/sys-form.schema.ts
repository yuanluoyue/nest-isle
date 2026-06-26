import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const sysForm = pgTable('sys_form', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  schema: jsonb('schema'),
  publishedSchema: jsonb('published_schema'),
  // 0=草稿 1=已发布 2=停用
  status: integer('status').default(0),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const sysFormRecord = pgTable('sys_form_record', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull(),
  data: jsonb('data'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sysFormDatasource = pgTable('sys_form_datasource', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }),
  code: varchar('code', { length: 100 }),
  // dict api static
  type: varchar('type', { length: 20 }),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sysFormVersion = pgTable('sys_form_version', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull(),
  version: integer('version').notNull(),
  schema: jsonb('schema').notNull(),
  remark: varchar('remark', { length: 500 }),
  // 是否发布版本
  isPublished: integer('is_published').default(0),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
});
