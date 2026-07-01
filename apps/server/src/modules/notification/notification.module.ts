import { Module, OnModuleInit } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationConsumer } from './consumers/notification.consumer';
import { NotificationEventListener } from './notification-event.listener';
import { QueueModule } from '../../core/queue/queue.module';
import { GatewayModule } from '../../core/gateway/gateway.module';

@Module({
  imports: [CoreAuthModule, DatabaseModule, QueueModule, GatewayModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationConsumer,
    NotificationEventListener,
  ],
  exports: [NotificationService],
})
export class NotificationModule implements OnModuleInit {
  constructor(private notificationConsumer: NotificationConsumer) { }

  onModuleInit() {
    this.notificationConsumer.register();
  }
}
