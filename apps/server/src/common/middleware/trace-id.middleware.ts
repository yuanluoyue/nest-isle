import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { randomUUID } from 'crypto';
import type { AuthenticatedRequest } from '../../types/auth-request';

interface TraceIdResponse {
  setHeader(name: string, value: string | number | string[]): void;
}

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: TraceIdResponse, next: NextFunction) {
    const headerValue = req.headers?.['x-trace-id'];
    const traceId =
      (Array.isArray(headerValue) ? headerValue[0] : headerValue) ||
      randomUUID();

    req.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);

    next();
  }
}
