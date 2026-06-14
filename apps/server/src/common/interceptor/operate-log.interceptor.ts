import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { OPERATE_LOG_KEY, OperateLogOptions } from '../decorator/operate-log.decorator';
import { DatabaseService } from '../../database/database.service';
import { sysOperateLog } from '../../database/schema';

@Injectable()
export class OperateLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private databaseService: DatabaseService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logOptions = this.reflector.get<OperateLogOptions | undefined>(
      OPERATE_LOG_KEY,
      context.getHandler(),
    );

    if (!logOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    const method = request.method;
    const url = request.originalUrl;
    const ip = request.ip || request.socket.remoteAddress || '';
    const body = request.body ? JSON.stringify(request.body) : null;

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.saveLog({
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
        error: (err) => {
          this.saveLog({
            userId: user?.id,
            module: logOptions.module,
            description: logOptions.action,
            method,
            url,
            ip,
            status: 1,
            request: body,
            response: err?.message || 'Internal Server Error',
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
    } catch {
      // 日志写入失败不影响业务
    }
  }
}
