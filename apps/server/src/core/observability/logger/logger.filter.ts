import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { getContext } from '../context/async-context';

@Catch()
export class LogExceptionFilter implements ExceptionFilter {
  private logger: LoggerService;

  constructor(loggerService: LoggerService) {
    this.logger = loggerService.child('Exception');
  }

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

    const method = request.method ?? '';
    const url = request.url ?? '';
    const reqCtx = getContext();

    if (code >= 500) {
      this.logger.error(
        {
          action: `${method} ${url}`,
          message: `${method} ${url} ${code} - ${message}`,
          data: { code, method, url, userId: reqCtx.userId },
        },
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn({
        action: `${method} ${url}`,
        message: `${method} ${url} ${code} - ${message}`,
        data: { code, userId: reqCtx.userId },
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
