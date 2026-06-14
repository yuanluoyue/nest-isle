import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const sysRoleMenu = pgTable('sys_role_menu', {
  id: uuid('id').defaultRandom().primaryKey(),
  roleId: uuid('role_id'),
  menuId: uuid('menu_id'),
});
