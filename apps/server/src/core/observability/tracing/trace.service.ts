import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TRACING_ENABLED } from './tracing.constants';
import { LoggerService } from '../logger/logger.service';
import { type SpanContext, runWithSpan, getSpanContext } from './trace.context';
import { generateTraceId, generateSpanId } from '../context/async-context';

/** OTLP HTTP JSON 请求体 */
interface OTLPTraceRequest {
  resourceSpans: Array<{
    resource: {
      attributes: Array<{ key: string; value: { stringValue: string } }>;
    };
    scopeSpans: Array<{
      scope: { name: string };
      spans: Array<{
        traceId: string;
        spanId: string;
        parentSpanId?: string;
        name: string;
        kind: number;
        startTimeUnixNano: string;
        endTimeUnixNano: string;
        status: { code: number };
        attributes?: Array<{ key: string; value: { stringValue: string } }>;
      }>;
    }>;
  }>;
}

/** No-op 实现 */
class NoOpTraceService {
  startSpan(_operationName: string, _parentSpan?: Partial<SpanContext>): SpanContext {
    return {
      traceId: '00000000000000000000000000000000',
      spanId: '0000000000000000',
      operationName: 'noop',
      startTime: 0,
    };
  }
  endSpan(_span: SpanContext, _status?: string) {}
  isEnabled() { return false; }
}

@Injectable()
export class TraceService extends NoOpTraceService {
  private enabled = false;
  private logger: LoggerService;
  private otlpEndpoint: string;
  private serviceName: string;

  constructor(
    private configService: ConfigService,
    loggerService: LoggerService,
  ) {
    super();
    this.logger = loggerService.child('Tracing');
    this.enabled = this.configService.get<string>(TRACING_ENABLED) === 'true';
    this.otlpEndpoint =
      this.configService.get<string>('OTLP_ENDPOINT') ?? 'http://localhost:4318';
    this.serviceName =
      this.configService.get<string>('appName') ?? 'nest-isle-server';
  }

  override isEnabled(): boolean {
    return this.enabled;
  }

  override startSpan(operationName: string, parentSpan?: Partial<SpanContext>): SpanContext {
    const span: SpanContext = {
      traceId: parentSpan?.traceId ?? generateTraceId(),
      spanId: parentSpan?.spanId ?? generateSpanId(),
      parentSpanId: parentSpan?.parentSpanId,
      operationName,
      startTime: Date.now(),
    };

    if (this.enabled) {
      this.logger.debug({
        action: 'SpanStart',
        message: `Span started: ${operationName}`,
        data: { traceId: span.traceId, spanId: span.spanId, parentSpanId: span.parentSpanId },
      });
    }

    return span;
  }

  override endSpan(span: SpanContext, status = 'ok') {
    if (!this.enabled) return;
    span.endTime = Date.now();
    span.status = status;
    const duration = span.endTime - span.startTime;
    this.logger.debug({
      action: 'SpanEnd',
      message: `Span ended: ${span.operationName}`,
      duration,
      data: { traceId: span.traceId, spanId: span.spanId, status },
    });

    // 异步发送 OTLP span 到 Tempo（不阻塞请求）
    void this.exportSpan(span, status);
  }

  /** 通过 OTLP HTTP JSON 发送 span 到 Tempo */
  private async exportSpan(span: SpanContext, status: string) {
    const otlpRequest: OTLPTraceRequest = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: this.serviceName } },
            ],
          },
          scopeSpans: [
            {
              scope: { name: 'nest-isle' },
              spans: [
                {
                  traceId: span.traceId,
                  spanId: span.spanId,
                  ...(span.parentSpanId
                    ? { parentSpanId: span.parentSpanId }
                    : {}),
                  name: span.operationName,
                  kind: 2, // SPAN_KIND_SERVER
                  startTimeUnixNano: String(span.startTime * 1_000_000),
                  endTimeUnixNano: String(
                    (span.endTime ?? span.startTime) * 1_000_000,
                  ),
                  status: {
                    code: status === 'error' ? 2 : 1, // 1=OK, 2=ERROR
                  },
                  attributes: [
                    { key: 'duration_ms', value: { stringValue: String((span.endTime ?? span.startTime) - span.startTime) } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    try {
      const res = await fetch(`${this.otlpEndpoint}/v1/traces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(otlpRequest),
      });
      if (!res.ok) {
        this.logger.warn({
          action: 'OTLPExportFailed',
          message: `OTLP export failed: ${res.status}`,
          data: { traceId: span.traceId },
        });
      }
    } catch (err) {
      this.logger.warn({
        action: 'OTLPExportFailed',
        message: `OTLP export error: ${(err as Error).message}`,
        data: { traceId: span.traceId },
      });
    }
  }

  /** 在 span 上下文中执行函数 */
  runInSpan<T>(operationName: string, fn: () => T, parentSpan?: Partial<SpanContext>): T {
    const span = this.startSpan(operationName, parentSpan);
    try {
      return runWithSpan(span, fn);
    } finally {
      this.endSpan(span);
    }
  }

  /** 获取当前 span */
  getCurrentSpan(): SpanContext | undefined {
    return getSpanContext();
  }
}
