import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';
import { requestContextStorage, RequestContext } from './request-context';
import { setRequestContext } from './request-context';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = this.loggerService.child('HTTP');

  constructor(private loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method ?? '';
    const url = request.url ?? '';
    const userId = request.user?.id;
    const traceId = request.headers?.['x-trace-id'] ?? request.id ?? 'unknown';

    const start = Date.now();

    // 设置请求上下文
    if (requestContextStorage.getStore()) {
      setRequestContext({ traceId, userId });
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.info({
            action: `${method} ${url}`,
            message: `${method} ${url}`,
            duration,
            data: { userId },
          });
        },
        error: () => {
          const duration = Date.now() - start;
          this.logger.warn({
            action: `${method} ${url}`,
            message: `${method} ${url} (error)`,
            duration,
            data: { userId },
          });
        },
      }),
    );
  }
}
