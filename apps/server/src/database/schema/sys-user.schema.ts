import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

export const sysUser = pgTable('sys_user', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }),
  password: varchar('password', { length: 200 }),
  nickname: varchar('nickname', { length: 50 }),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  gender: integer('gender').default(0),
  avatar: varchar('avatar', { length: 500 }),
  deptId: uuid('dept_id'),
  status: integer('status').default(0),
  remark: varchar('remark', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
