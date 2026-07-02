import { Injectable, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, ScopeFlag } from '@nestjs/common';
import { Logger } from 'winston';
import { getRequestContext, RequestContext, requestContextStorage } from './request-context';

const SENSITIVE_KEYS = ['password', 'token', 'accessToken', 'refreshToken', 'apiKey', 'secret', 'authorization', 'cookie'];

function maskSensitive(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(maskSensitive);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
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

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService {
  private defaultModule: string;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private winston: Logger) {
    this.defaultModule = 'App';
  }

  /** 创建子 logger，自动注入 module */
  child(module: string): LoggerService {
    const childLogger = new LoggerService(this.winston);
    childLogger.defaultModule = module;
    return childLogger;
  }

  private buildMeta(entry: LogEntry): Record<string, unknown> {
    const ctx = getRequestContext();
    return {
      module: entry.module ?? this.defaultModule,
      action: entry.action ?? '',
      traceId: ctx.traceId ?? 'unknown',
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

  /** 在 AsyncLocalStorage 上下文中执行 */
  runWithContext(ctx: RequestContext, fn: () => void) {
    requestContextStorage.run(ctx, fn);
  }
}
