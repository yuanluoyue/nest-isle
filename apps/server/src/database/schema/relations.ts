import { relations } from 'drizzle-orm';
import { sysUser } from './sys-user.schema';
import { sysRole } from './sys-role.schema';
import { sysMenu } from './sys-menu.schema';
import { sysDept } from './sys-dept.schema';
import { sysUserRole } from './sys-user-role.schema';
import { sysRoleMenu } from './sys-role-menu.schema';
import { sysJob } from './sys-job.schema';
import { sysJobLog } from './sys-job-log.schema';
import { sysSession } from './sys-session.schema';
import { sysAiProvider } from './sys-ai-provider.schema';
import { sysAiModel } from './sys-ai-model.schema';
import { sysAiLog } from './sys-ai-log.schema';

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

export const sysJobRelations = relations(sysJob, ({ many }) => ({
  logs: many(sysJobLog),
}));

export const sysJobLogRelations = relations(sysJobLog, ({ one }) => ({
  job: one(sysJob, {
    fields: [sysJobLog.jobId],
    references: [sysJob.id],
  }),
}));

export const sysSessionRelations = relations(sysSession, ({ one }) => ({
  user: one(sysUser, {
    fields: [sysSession.userId],
    references: [sysUser.id],
  }),
}));

export const sysAiProviderRelations = relations(sysAiProvider, ({ many }) => ({
  models: many(sysAiModel),
  logs: many(sysAiLog),
}));

export const sysAiModelRelations = relations(sysAiModel, ({ one, many }) => ({
  provider: one(sysAiProvider, {
    fields: [sysAiModel.providerId],
    references: [sysAiProvider.id],
  }),
  logs: many(sysAiLog),
}));

export const sysAiLogRelations = relations(sysAiLog, ({ one }) => ({
  provider: one(sysAiProvider, {
    fields: [sysAiLog.providerId],
    references: [sysAiProvider.id],
  }),
  model: one(sysAiModel, {
    fields: [sysAiLog.modelId],
    references: [sysAiModel.id],
  }),
  user: one(sysUser, {
    fields: [sysAiLog.userId],
    references: [sysUser.id],
  }),
}));
