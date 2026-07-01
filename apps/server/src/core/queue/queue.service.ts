import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, QueueEvents } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private connection: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };

  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();
  private queueEvents = new Map<string, QueueEvents>();

  constructor(private configService: ConfigService) {
    this.connection = {
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password:
        this.configService.get<string>('redis.password', '') || undefined,
      db: this.configService.get<number>('redis.db', 0),
    };
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, { connection: this.connection }));
    }
    return this.queues.get(name)!;
  }

  createWorker(name: string, handler: (job: any) => Promise<void>): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!;
    }
    const worker = new Worker(name, handler, {
      connection: this.connection,
      concurrency: 5,
    });
    this.workers.set(name, worker);
    return worker;
  }

  getQueueEvents(name: string): QueueEvents {
    if (!this.queueEvents.has(name)) {
      this.queueEvents.set(
        name,
        new QueueEvents(name, { connection: this.connection }),
      );
    }
    return this.queueEvents.get(name)!;
  }

  async onModuleDestroy() {
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    for (const events of this.queueEvents.values()) {
      await events.close();
    }
  }
}
