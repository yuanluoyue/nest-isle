import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const sysMenu = pgTable('sys_menu', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id'),
  name: varchar('name', { length: 50 }),
  type: integer('type').default(0), // 0=目录 1=菜单 2=按钮
  path: varchar('path', { length: 200 }),
  component: varchar('component', { length: 200 }),
  permission: varchar('permission', { length: 100 }),
  icon: varchar('icon', { length: 100 }),
  sort: integer('sort').default(0),
  visible: integer('visible').default(0),
  status: integer('status').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
