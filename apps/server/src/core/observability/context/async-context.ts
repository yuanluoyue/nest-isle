import { AsyncLocalStorage } from 'async_hooks';
import { randomBytes, randomUUID } from 'crypto';

/**
 * 请求上下文 - 通过 AsyncLocalStorage 在整个请求生命周期内传播。
 * 由 LoggerMiddleware 在请求入口处通过 asyncContextStorage.run() 初始化。
 */
export interface RequestContext {
  /** W3C Trace ID (32 hex chars) */
  traceId: string;
  /** W3C Span ID (16 hex chars) - 当前 span */
  spanId: string;
  /** 父 span ID - 仅当 traceparent 从外部传入时设置 */
  parentSpanId?: string;
  /** 请求唯一 ID (UUID) */
  requestId: string;
  /** 客户端 IP */
  ip?: string;
  /** 认证用户 ID - JWT 验证后由 setUserId() 写入 */
  userId?: string;
  /** HTTP 方法 */
  method?: string;
  /** 路由模板, e.g. /api/v1/user/:id */
  route?: string;
  /** 真实 URL, e.g. /api/v1/user/123 */
  url?: string;
}

export const asyncContextStorage = new AsyncLocalStorage<RequestContext>();

/** 获取当前请求上下文，若不在请求上下文中则返回空壳 */
export function getContext(): RequestContext {
  return (
    asyncContextStorage.getStore() ?? {
      traceId: '00000000000000000000000000000000',
      spanId: '0000000000000000',
      requestId: 'unknown',
    }
  );
}

/** 更新当前上下文（在请求处理过程中追加信息，如 JWT 验证后写入 userId） */
export function setContext(ctx: Partial<RequestContext>): void {
  const current = asyncContextStorage.getStore();
  if (current) {
    Object.assign(current, ctx);
  }
}

/** JWT 验证完成后设置 userId */
export function setUserId(userId: string): void {
  setContext({ userId });
}

/** 在请求上下文中执行函数 */
export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return asyncContextStorage.run(ctx, fn);
}

// ─── W3C Trace Context 工具 ───────────────────────────────────

/** W3C traceparent 解析结果 */
export interface TraceParent {
  traceId: string;
  spanId: string;
  flags: string;
}

/**
 * 解析 W3C traceparent header
 * 格式: 00-<traceId(32hex)>-<spanId(16hex)>-<flags(2hex)>
 */
export function parseTraceparent(header: string | string[] | undefined): TraceParent | null {
  if (!header || Array.isArray(header)) return null;
  const parts = header.trim().split('-');
  if (parts.length !== 4) return null;

  const [, traceId, spanId, flags] = parts;
  const hex32 = /^[0-9a-f]{32}$/i;
  const hex16 = /^[0-9a-f]{16}$/i;
  const hex2 = /^[0-9a-f]{2}$/i;

  if (!hex32.test(traceId) || !hex16.test(spanId) || !hex2.test(flags)) return null;
  // 全零 traceId / spanId 非法
  if (traceId === '00000000000000000000000000000000') return null;
  if (spanId === '0000000000000000') return null;

  return { traceId, spanId, flags };
}

/** 生成 W3C Trace ID (16 bytes = 32 hex chars) */
export function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}

/** 生成 W3C Span ID (8 bytes = 16 hex chars) */
export function generateSpanId(): string {
  return randomBytes(8).toString('hex');
}

/** 格式化 W3C traceparent header */
export function formatTraceparent(traceId: string, spanId: string, flags = '00'): string {
  return `00-${traceId}-${spanId}-${flags}`;
}

/** 生成请求 ID (UUID v4) */
export function generateRequestId(): string {
  return randomUUID();
}
