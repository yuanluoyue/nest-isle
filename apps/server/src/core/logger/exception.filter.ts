import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { getRequestContext } from './request-context';

@Catch()
export class LogExceptionFilter implements ExceptionFilter {
  private logger = this.loggerService.child('Exception');

  constructor(private loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      code = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 记录所有异常日志
    if (code >= 500) {
      this.logger.error(
        {
          action: `${request.method} ${request.url}`,
          message: `${request.method} ${request.url} ${code} - ${message}`,
          data: {
            code,
            method: request.method,
            url: request.url,
            userId: request.user?.id,
          },
        },
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn({
        action: `${request.method} ${request.url}`,
        message: `${request.method} ${request.url} ${code} - ${message}`,
        data: { code, userId: request.user?.id },
      });
    }

    response.code(code).send({
      code,
      message,
      data: null,
      time: new Date().toISOString(),
    });
  }
}
