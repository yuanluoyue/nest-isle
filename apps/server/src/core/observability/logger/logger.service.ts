import { Injectable, Scope, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { getContext, type RequestContext } from '../context/async-context';

const SENSITIVE_KEYS = ['password', 'token', 'accesstoken', 'refreshtoken', 'apikey', 'secret', 'authorization', 'cookie'];

function maskSensitive(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(maskSensitive);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
      result[key] = '***';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = maskSensitive(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export interface LogEntry {
  module?: string;
  action?: string;
  message: string;
  duration?: number;
  data?: Record<string, unknown>;
}

/** HTTP access log 专用参数 */
export interface HttpLogEntry {
  method: string;
  /** 路由模板 e.g. /api/v1/user/:id */
  route: string;
  /** HTTP 状态码 */
  status: string | number;
  /** 耗时 (ms) */
  duration: number;
}

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService {
  private defaultModule = 'App';

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private winston: Logger) {}

  /** 创建子 logger，自动注入 module */
  child(module: string): LoggerService {
    const childLogger = new LoggerService(this.winston);
    childLogger.defaultModule = module;
    return childLogger;
  }

  private buildMeta(entry: LogEntry): Record<string, unknown> {
    const ctx = getContext();
    return {
      module: entry.module ?? this.defaultModule,
      action: entry.action ?? '',
      traceId: ctx.traceId,
      requestId: ctx.requestId,
      userId: ctx.userId ?? '',
      ...(entry.duration !== undefined ? { duration: entry.duration } : {}),
      ...(entry.data ? { data: maskSensitive(entry.data) } : {}),
    };
  }

  info(entry: LogEntry) {
    this.winston.info(entry.message, this.buildMeta(entry));
  }

  warn(entry: LogEntry) {
    this.winston.warn(entry.message, this.buildMeta(entry));
  }

  error(entry: LogEntry, stack?: string) {
    this.winston.error(entry.message, {
      ...this.buildMeta(entry),
      ...(stack ? { stack } : {}),
    });
  }

  debug(entry: LogEntry) {
    this.winston.debug(entry.message, this.buildMeta(entry));
  }

  /**
   * HTTP access log - 自动从 RequestContext 获取 traceId/requestId/userId/ip/url。
   * 业务代码只需传入 { method, route, status, duration }。
   */
  http(entry: HttpLogEntry) {
    const ctx = getContext();
    const realUrl = ctx.url ?? entry.route;
    this.winston.info(`${entry.method} ${realUrl} ${entry.status}`, {
      module: 'HTTP',
      action: `${entry.method} ${realUrl}`,
      traceId: ctx.traceId,
      requestId: ctx.requestId,
      userId: ctx.userId ?? '',
      duration: entry.duration,
      data: {
        method: entry.method,
        route: entry.route,
        status: entry.status,
        ip: ctx.ip,
      },
    });
  }
}
