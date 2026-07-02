import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { TraceService } from './trace.service';
import { runWithSpan, generateSpanId } from './trace.context';
import { getContext, setContext } from '../context/async-context';
import type { AuthenticatedRequest } from '../../../types/auth-request';

/**
 * Trace 拦截器 - 为每个 HTTP 请求创建 span。
 *
 * traceId 来自 LoggerMiddleware 已初始化的 RequestContext（W3C 兼容），
 * 这里只生成新的 spanId 并创建 span 上下文。
 */
@Injectable()
export class TraceInterceptor implements NestInterceptor {
  constructor(private traceService: TraceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.traceService.isEnabled()) return next.handle();

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method ?? 'UNKNOWN';
    const routeOptions = (request as any).routeOptions;
    const route = routeOptions?.url ?? (request.url ?? '/').split('?')[0];
    const operationName = `HTTP ${method} ${route}`;

    // 从请求上下文获取 traceId（由 LoggerMiddleware 通过 W3C traceparent 初始化）
    const reqCtx = getContext();
    const spanId = generateSpanId();

    const span = this.traceService.startSpan(operationName, {
      traceId: reqCtx.traceId,
      spanId,
      // parentSpanId 仅当 traceparent 从外部传入时存在
      ...(reqCtx.parentSpanId ? { parentSpanId: reqCtx.parentSpanId } : {}),
      operationName,
      startTime: Date.now(),
    });

    // 同步 spanId 到请求上下文
    setContext({ spanId });

    return next.handle().pipe(
      tap({
        next: () => {
          this.traceService.endSpan(span, 'ok');
        },
        error: () => {
          this.traceService.endSpan(span, 'error');
        },
      }),
    );
  }
}
