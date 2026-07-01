import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
  constructor(private eventEmitter: EventEmitter2) {}

  emit(event: string, data: unknown): boolean {
    return this.eventEmitter.emit(event, data);
  }

  emitNotification(data: NotificationEvent): boolean {
    return this.eventEmitter.emit('notification:send', data);
  }

  on(event: string, handler: (data: NotificationEvent) => void): void {
    this.eventEmitter.on(event, handler as any); // eslint-disable-line @typescript-eslint/no-unsafe-argument
  }
}
