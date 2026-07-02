import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerService } from '../logger/logger.service';

export interface NotificationEvent {
  type: string;
  title: string;
  content: string;
  link?: string;
  payload?: Record<string, unknown>;
  priority?: number;
  receiverIds: string[];
  createdBy?: string;
}

@Injectable()
export class EventService {
  private readonly logger: LoggerService;

  constructor(
    private eventEmitter: EventEmitter2,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.child('EventBus');
  }

  emit(event: string, data: unknown): boolean {
    const result = this.eventEmitter.emit(event, data);
    this.logger.info({
      action: 'Publish',
      message: 'Publish event',
      data: { event },
    });
    return result;
  }

  emitNotification(data: NotificationEvent): boolean {
    return this.eventEmitter.emit('notification:send', data);
  }

  on(event: string, handler: (data: NotificationEvent) => void): void {
    this.eventEmitter.on(event, handler as any); // eslint-disable-line @typescript-eslint/no-unsafe-argument
    this.logger.info({
      action: 'Subscribe',
      message: 'Subscribe event',
      data: { event },
    });
  }
}
