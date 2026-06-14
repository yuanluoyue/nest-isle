import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const sysDictData = pgTable('sys_dict_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  typeId: uuid('type_id'),
  label: varchar('label', { length: 50 }),
  value: varchar('value', { length: 50 }),
  sort: integer('sort').default(0),
  status: integer('status').default(0),
  remark: varchar('remark', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
