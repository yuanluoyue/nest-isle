import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { LoggerService } from './logger.service';
import { setContext } from '../context/async-context';
import type { AuthenticatedRequest } from '../../../types/auth-request';

/** 不记录 HTTP access log 的路径 */
const SKIP_PATH_PATTERNS = ['/metrics', '/health'];

function shouldSkip(url: string): boolean {
  return SKIP_PATH_PATTERNS.some((p) => url.includes(p));
}

/**
 * 从 Fastify request 获取路由模板。
 * request.routeOptions.url => /api/v1/user/:id
 * 兜底使用真实 url。
 */
function getRoutePattern(request: AuthenticatedRequest): string {
  const routeOptions = (request as any).routeOptions;
  return routeOptions?.url ?? (request.url ?? '/').split('?')[0];
}

/**
 * HTTP Access Log 拦截器 - 只负责记录 HTTP 请求日志。
 *
 * 设计原则：
 * - 薄：只做 logger.http() 调用
 * - 不负责 metrics（由 MetricsInterceptor 独立处理）
 * - 不负责 context 初始化（由 LoggerMiddleware 完成）
 * - 不负责 traceId 生成（由 LoggerMiddleware 通过 W3C traceparent 完成）
 *
 * 上下文流转：
 *   LoggerMiddleware → asyncContextStorage.run()
 *     → JwtStrategy.validate() → setUserId()
 *       → LoggerInterceptor → logger.http()  (自动读取 context)
 */
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger: LoggerService;

  constructor(loggerService: LoggerService) {
    this.logger = loggerService.child('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const url = (request.url ?? '/').split('?')[0];

    // 跳过 /metrics 和 /health 的 access log
    if (shouldSkip(url)) {
      return next.handle();
    }

    const method = request.method ?? 'UNKNOWN';
    const route = getRoutePattern(request);

    // 同步路由模板到上下文（供 logger.http() 使用）
    setContext({ route });

    const start = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.http({
            method,
            route,
            status: 200,
            duration: Number((performance.now() - start).toFixed(2)),
          });
        },
        error: (err: unknown) => {
          const status = (err as { status?: number })?.status ?? 500;
          this.logger.http({
            method,
            route,
            status,
            duration: Number((performance.now() - start).toFixed(2)),
          });
        },
      }),
    );
  }
}
