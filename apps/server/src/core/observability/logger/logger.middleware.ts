import { Injectable, NestMiddleware } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../types/auth-request';
import {
  asyncContextStorage,
  parseTraceparent,
  formatTraceparent,
  generateTraceId,
  generateSpanId,
  generateRequestId,
  type RequestContext,
} from '../context/async-context';

/**
 * NestJS 在 FastifyAdapter 下用 middie 包装 middleware，
 * 提供的 res 对象是 Express 兼容 API（setHeader），
 * 不是 Fastify 原生 Reply（header）。
 */
interface MiddieResponse {
  setHeader(name: string, value: string | number | string[]): void;
}

/**
 * 请求上下文中间件 - 在请求入口处初始化 AsyncLocalStorage。
 *
 * 职责：
 * 1. 解析 / 生成 W3C traceparent (兼容 OpenTelemetry)
 * 2. 初始化 RequestContext (traceId, spanId, requestId, ip, method, url)
 * 3. 通过 asyncContextStorage.run() 传播上下文
 * 4. 设置响应头 (traceparent, x-trace-id, x-request-id)
 *
 * 后续在请求生命周期内：
 * - JWT 验证后调用 setUserId() 写入 userId
 * - LoggerInterceptor 记录 HTTP access log
 * - MetricsInterceptor 记录指标
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: MiddieResponse, next: () => void) {
    // ─── W3C Trace Context ───
    const incomingTraceparent = req.headers?.['traceparent'];
    const parsed = parseTraceparent(
      incomingTraceparent as string | string[] | undefined,
    );

    const traceId = parsed?.traceId ?? generateTraceId();
    const spanId = parsed?.spanId ?? generateSpanId();
    const flags = parsed?.flags ?? '01';
    const requestId =
      (req.headers?.['x-request-id'] as string | undefined) ?? generateRequestId();

    // ─── 初始化请求上下文 ───
    // parentSpanId 仅当 traceparent 从外部传入时设置（外部调用方是 parent span）
    const ctx: RequestContext = {
      traceId,
      spanId,
      ...(parsed ? { parentSpanId: parsed.spanId } : {}),
      requestId,
      ip: req.ip,
      method: req.method,
      url: (req.url ?? '/').split('?')[0],
      // userId 由 JWT 验证后写入
    };

    // ─── 设置响应头 ───
    res.setHeader('traceparent', formatTraceparent(traceId, spanId, flags));
    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-request-id', requestId);

    // ─── 在上下文中执行后续中间件 / 路由处理 ───
    asyncContextStorage.run(ctx, () => next());
  }
}
