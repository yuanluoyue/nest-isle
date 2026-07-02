import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import type { AuthenticatedRequest } from '../../types/auth-request';
import {
  OPERATE_LOG_KEY,
  OperateLogOptions,
} from '../decorator/operate-log.decorator';
import { DatabaseService } from '../../database/database.service';
import { sysOperateLog } from '../../database/schema';
import { LoggerService } from '../../core/observability/logger/logger.service';

@Injectable()
export class OperateLogInterceptor implements NestInterceptor {
  private readonly logger: LoggerService;

  constructor(
    private reflector: Reflector,
    private databaseService: DatabaseService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.child('OperateLog');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const logOptions = this.reflector.get<OperateLogOptions | undefined>(
      OPERATE_LOG_KEY,
      context.getHandler(),
    );

    if (!logOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const method = request.method ?? '';
    const url = request.url ?? '';
    const ip = request.ip ?? '';
    const body = request.body ? JSON.stringify(request.body) : null;

    return next.handle().pipe(
      tap({
        next: (response: unknown) => {
          void this.saveLog({
            userId: user?.id,
            module: logOptions.module,
            description: logOptions.action,
            method,
            url,
            ip,
            status: 0,
            request: body,
            response: response ? JSON.stringify(response) : null,
          });
        },
        error: (err: unknown) => {
          void this.saveLog({
            userId: user?.id,
            module: logOptions.module,
            description: logOptions.action,
            method,
            url,
            ip,
            status: 1,
            request: body,
            response:
              err instanceof Error ? err.message : 'Internal Server Error',
          });
        },
      }),
    );
  }

  private async saveLog(data: {
    userId?: string;
    module: string;
    description: string;
    method: string;
    url: string;
    ip: string;
    status: number;
    request: string | null;
    response: string | null;
  }) {
    try {
      await this.databaseService.db.insert(sysOperateLog).values(data);
    } catch (err) {
      // 日志写入失败不影响业务
      this.logger.error({
        action: 'SaveFailed',
        message: 'Failed to save operation log',
        data: { error: (err as Error).message },
      });
    }
  }
}
