import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../../../core/queue/queue.service';
import { NotificationService } from '../notification.service';
import { NotificationEvent } from '../../../core/event/event.service';

@Injectable()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private queueService: QueueService,
    private notificationService: NotificationService,
  ) {}

  register() {
    this.queueService.createWorker('notification', async (job) => {
      this.logger.log(`Processing notification job: ${job.id}`);
      await this.notificationService.sendNotification(
        job.data as NotificationEvent,
      );
    });
    this.logger.log('Notification queue worker registered');
  }
}
