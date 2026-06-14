import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

export const sysDictItem = pgTable('sys_dict_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  dictTypeId: uuid('dict_type_id'),
  label: varchar('label', { length: 100 }),
  value: varchar('value', { length: 100 }),
  sort: integer('sort').default(0),
  color: varchar('color', { length: 50 }),
  status: integer('status').default(0),
  extra: jsonb('extra'),
  remark: varchar('remark', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
