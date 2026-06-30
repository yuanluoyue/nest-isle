import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../types/auth-request';

/**
 * ctx.getResponse() 在 FastifyAdapter 下返回原生 Fastify Reply，
 * API 是 .code() / .send()，不是 Express 的 .status() / .json()。
 */
interface FastifyReply {
  code(status: number): FastifyReply;
  send(body: unknown): void;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<AuthenticatedRequest>();

    let code: number = HttpStatus.INTERNAL_SERVER_ERROR;
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
        `${request.method ?? ''} ${request.url ?? ''} ${code} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.code(code).send({
      code,
      message,
      data: null,
      time: new Date().toISOString(),
    });
  }
}
