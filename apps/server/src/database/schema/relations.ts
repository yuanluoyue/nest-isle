import { relations } from 'drizzle-orm';
import { sysUser } from './sys-user.schema';
import { sysRole } from './sys-role.schema';
import { sysMenu } from './sys-menu.schema';
import { sysDept } from './sys-dept.schema';
import { sysUserRole } from './sys-user-role.schema';
import { sysRoleMenu } from './sys-role-menu.schema';

export const sysUserRelations = relations(sysUser, ({ many, one }) => ({
  userRoles: many(sysUserRole),
  dept: one(sysDept, {
    fields: [sysUser.deptId],
    references: [sysDept.id],
  }),
}));

export const sysRoleRelations = relations(sysRole, ({ many }) => ({
  userRoles: many(sysUserRole),
  roleMenus: many(sysRoleMenu),
}));

export const sysUserRoleRelations = relations(sysUserRole, ({ one }) => ({
  user: one(sysUser, {
    fields: [sysUserRole.userId],
    references: [sysUser.id],
  }),
  role: one(sysRole, {
    fields: [sysUserRole.roleId],
    references: [sysRole.id],
  }),
}));

export const sysMenuRelations = relations(sysMenu, ({ many }) => ({
  roleMenus: many(sysRoleMenu),
}));

export const sysRoleMenuRelations = relations(sysRoleMenu, ({ one }) => ({
  role: one(sysRole, {
    fields: [sysRoleMenu.roleId],
    references: [sysRole.id],
  }),
  menu: one(sysMenu, {
    fields: [sysRoleMenu.menuId],
    references: [sysMenu.id],
  }),
}));

export const sysDeptRelations = relations(sysDept, ({ many }) => ({
  users: many(sysUser),
}));
