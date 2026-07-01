import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventService } from '../../core/event/event.service';
import { QueueService } from '../../core/queue/queue.service';
import type { NotificationEvent } from '../../core/event/event.service';

@Injectable()
export class NotificationEventListener implements OnModuleInit {
  constructor(
    private eventService: EventService,
    private queueService: QueueService,
  ) {}

  onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.eventService.on('notification:send', (data: NotificationEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const queue = this.queueService.getQueue('notification');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      void queue.add('send', data as Record<string, unknown>, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
    });
  }
}
