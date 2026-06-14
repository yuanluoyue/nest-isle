import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const sysUserRole = pgTable('sys_user_role', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'),
  roleId: uuid('role_id'),
});
