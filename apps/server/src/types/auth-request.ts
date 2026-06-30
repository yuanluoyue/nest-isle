/**
 * Express Request 上的自定义字段类型定义。
 *
 * 说明：原本通过 `declare module 'express-serve-static-core'` 在 express.d.ts
 * 中扩展 Express Request，但 typescript-eslint 的 projectService 在解析
 * 模块增强时无法稳定解析 `Request` 类型（报 "type cannot be resolved"），
 * 因此改为导出本地接口并显式传入 `ctx.getRequest<AuthenticatedRequest>()`。
 */
export interface AuthUser {
  id: string;
  username: string;
  permissions: string[];
  [key: string]: unknown;
}

/**
 * 项目中用到的 Express Request 字段子集。
 * 仅声明业务代码访问到的字段，避免依赖 @types/express 在 ESLint project service
 * 下解析不稳定的 `Request` 类型。
 */
export interface AuthenticatedRequest {
  user?: AuthUser;
  traceId?: string;
  method?: string;
  originalUrl?: string;
  url?: string;
  ip?: string;
  socket?: { remoteAddress?: string };
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  [key: string]: unknown;
}
