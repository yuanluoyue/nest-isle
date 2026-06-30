/**
 * Fastify Request 上的自定义字段类型定义。
 *
 * 说明：业务代码访问到的 request 字段（user/traceId/method/url/ip/headers/body）
 * 在此显式声明，避免依赖 fastify 原生 Request 在 ESLint project service
 * 下解析不稳定的类型推断。
 */
export interface AuthUser {
  id: string;
  username: string;
  permissions: string[];
  [key: string]: unknown;
}

/**
 * 项目中用到的 Fastify Request 字段子集。
 * Fastify 的 request 没有 socket/originalUrl，ip 已直接解析完成。
 */
export interface AuthenticatedRequest {
  user?: AuthUser;
  traceId?: string;
  method?: string;
  url?: string;
  ip?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  [key: string]: unknown;
}
