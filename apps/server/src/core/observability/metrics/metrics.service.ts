import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { METRICS_ENABLED } from './metrics.constants';

/** No-op 实现：未启用 Prometheus 时所有方法为空操作 */
class NoOpMetricsService {
  incrementCounter(_name: string, _labels?: Record<string, string>, _value?: number) {}
  observeHistogram(_name: string, _value: number, _labels?: Record<string, string>) {}
  setGauge(_name: string, _value: number, _labels?: Record<string, string>) {}
  timing(_name: string, _startMs: number, _labels?: Record<string, string>) {}
  registerCollector(_collector: unknown) {}
}

@Injectable()
export class MetricsService extends NoOpMetricsService {
  private enabled = false;
  private registry: import('prom-client').Registry | null = null;
  private counters = new Map<string, import('prom-client').Counter>();
  private histograms = new Map<string, import('prom-client').Histogram>();
  private gauges = new Map<string, import('prom-client').Gauge>();

  constructor(private configService: ConfigService) {
    super();
    this.enabled = this.configService.get<string>(METRICS_ENABLED) === 'true';
    if (this.enabled) {
      this.init();
    }
  }

  private async init() {
    const promClient = await import('prom-client');
    this.registry = new promClient.Registry();
    promClient.collectDefaultMetrics({ register: this.registry });

    // 预注册标准 HTTP 指标，确保 labelNames 一致
    const httpLabels = ['method', 'route', 'status'];
    this.counters.set(
      'http_requests_total',
      new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: httpLabels,
        registers: [this.registry],
      }),
    );
    this.histograms.set(
      'http_request_duration_seconds',
      new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds',
        labelNames: httpLabels,
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry],
      }),
    );
  }

  private async getOrCreateCounter(name: string, labels?: Record<string, string>) {
    if (!this.registry) return null;
    if (!this.counters.has(name)) {
      const promClient = await import('prom-client');
      const labelNames = labels ? Object.keys(labels) : [];
      const counter = new promClient.Counter({
        name,
        help: name,
        labelNames,
        registers: [this.registry],
      });
      this.counters.set(name, counter);
    }
    return this.counters.get(name)!;
  }

  private async getOrCreateHistogram(name: string, labels?: Record<string, string>) {
    if (!this.registry) return null;
    if (!this.histograms.has(name)) {
      const promClient = await import('prom-client');
      const labelNames = labels ? Object.keys(labels) : [];
      const histogram = new promClient.Histogram({
        name,
        help: name,
        labelNames,
        buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
        registers: [this.registry],
      });
      this.histograms.set(name, histogram);
    }
    return this.histograms.get(name)!;
  }

  private async getOrCreateGauge(name: string, labels?: Record<string, string>) {
    if (!this.registry) return null;
    if (!this.gauges.has(name)) {
      const promClient = await import('prom-client');
      const labelNames = labels ? Object.keys(labels) : [];
      const gauge = new promClient.Gauge({
        name,
        help: name,
        labelNames,
        registers: [this.registry],
      });
      this.gauges.set(name, gauge);
    }
    return this.gauges.get(name)!;
  }

  override async incrementCounter(name: string, labels?: Record<string, string>, value = 1) {
    if (!this.enabled) return;
    const counter = await this.getOrCreateCounter(name, labels);
    if (!counter) return;
    if (labels) {
      counter.labels(labels).inc(value);
    } else {
      counter.inc(value);
    }
  }

  override async observeHistogram(name: string, value: number, labels?: Record<string, string>) {
    if (!this.enabled) return;
    const histogram = await this.getOrCreateHistogram(name, labels);
    if (!histogram) return;
    if (labels) {
      histogram.labels(labels).observe(value);
    } else {
      histogram.observe(value);
    }
  }

  override async setGauge(name: string, value: number, labels?: Record<string, string>) {
    if (!this.enabled) return;
    const gauge = await this.getOrCreateGauge(name, labels);
    if (!gauge) return;
    if (labels) {
      gauge.labels(labels).set(value);
    } else {
      gauge.set(value);
    }
  }

  override async timing(name: string, startMs: number, labels?: Record<string, string>) {
    const durationSeconds = (Date.now() - startMs) / 1000;
    await this.observeHistogram(name, durationSeconds, labels);
  }

  async getMetrics(): Promise<string> {
    if (!this.registry) return '';
    return this.registry.metrics();
  }

  getContentType(): string {
    if (!this.registry) return 'text/plain';
    return this.registry.contentType;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
