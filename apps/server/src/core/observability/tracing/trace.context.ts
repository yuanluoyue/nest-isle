import { AsyncLocalStorage } from 'async_hooks';
import { generateTraceId, generateSpanId } from '../context/async-context';

export interface SpanContext {
  /** W3C Trace ID (32 hex chars) */
  traceId: string;
  /** W3C Span ID (16 hex chars) */
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  status?: string;
}

export const traceContextStorage = new AsyncLocalStorage<SpanContext>();

export function getSpanContext(): SpanContext | undefined {
  return traceContextStorage.getStore();
}

export function runWithSpan<T>(span: SpanContext, fn: () => T): T {
  return traceContextStorage.run(span, fn);
}

// 复用 context 模块的 W3C ID 生成器
export { generateTraceId, generateSpanId } from '../context/async-context';
