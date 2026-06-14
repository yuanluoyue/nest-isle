import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      code = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as Record<string, unknown>;
        if (typeof res.message === 'string') {
          message = res.message;
        } else if (Array.isArray(res.message)) {
          message = res.message.join('; ');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 500 错误打印完整日志
    if (code >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${code} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(code).json({
      code,
      message,
      data: null,
      time: new Date().toISOString(),
    });
  }
}
