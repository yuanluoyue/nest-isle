import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { AuthenticatedRequest } from '../../types/auth-request';

/**
 * NestJS 在 FastifyAdapter 下用 middie 包装 middleware，
 * 提供的 res 对象是 Express 兼容 API（setHeader），
 * 不是 Fastify 原生 Reply（header）。
 */
interface MiddieResponse {
  setHeader(name: string, value: string | number | string[]): void;
}

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: MiddieResponse, next: () => void) {
    const headerValue = req.headers?.['x-trace-id'];
    const traceId =
      (Array.isArray(headerValue) ? headerValue[0] : headerValue) ||
      randomUUID();

    req.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);

    next();
  }
}
