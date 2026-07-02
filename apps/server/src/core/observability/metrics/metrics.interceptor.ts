import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { performance } from 'perf_hooks';
import { MetricsService } from './metrics.service';
import type { AuthenticatedRequest } from '../../../types/auth-request';

/**
 * 从 Fastify request 获取路由模板。
 * request.routeOptions.url => /api/v1/user/:id
 * 兜底使用真实 url。
 */
function getRoutePattern(request: AuthenticatedRequest): string {
  const routeOptions = (request as any).routeOptions;
  return routeOptions?.url ?? (request.url ?? '/').split('?')[0];
}

/** 将状态码归组为 2xx / 4xx / 5xx */
function statusGroup(status: number): string {
  return `${Math.floor(status / 100)}xx`;
}

/**
 * HTTP Metrics 拦截器 - 只负责记录 Prometheus 指标。
 *
 * 设计原则：
 * - 与 LoggerInterceptor 职责分离，互不依赖
 * - 使用路由模板 (route pattern) 而非真实 URL，避免高基数标签
 *   e.g. http_requests_total{route="/api/v1/user/:id"} 而非 {route="/api/v1/user/123"}
 *
 * 指标：
 * - http_requests_total{method, route, status}  Counter
 * - http_request_duration_seconds{method, route, status}  Histogram
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.metricsService.isEnabled()) return next.handle();

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method ?? 'UNKNOWN';
    const route = getRoutePattern(request);

    const start = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (performance.now() - start) / 1000;
          const status = statusGroup(200);
          void this.metricsService.observeHistogram('http_request_duration_seconds', duration, {
            method,
            route,
            status,
          });
          void this.metricsService.incrementCounter('http_requests_total', {
            method,
            route,
            status,
          });
        },
        error: (err: unknown) => {
          const duration = (performance.now() - start) / 1000;
          const statusCode = (err as { status?: number })?.status ?? 500;
          const status = statusGroup(statusCode);
          void this.metricsService.observeHistogram('http_request_duration_seconds', duration, {
            method,
            route,
            status,
          });
          void this.metricsService.incrementCounter('http_requests_total', {
            method,
            route,
            status,
          });
        },
      }),
    );
  }
}
