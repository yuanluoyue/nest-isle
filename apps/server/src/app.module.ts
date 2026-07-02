import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { PermissionsGuard } from './core/auth/permissions.guard';
import { CacheModule } from './core/cache/cache.module';
import { LoggerModule } from './core/observability/logger/logger.module';
import { MetricsModule } from './core/observability/metrics/metrics.module';
import { TracingModule } from './core/observability/tracing/tracing.module';
import { QueueModule } from './core/queue/queue.module';
import { StorageModule } from './core/storage/storage.module';
import { AuthFeatureModule } from './modules/auth/auth.module';
import { SystemModule } from './modules/system/system.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { FileModule } from './modules/file/file.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';
import { FormFeatureModule } from './modules/form/form.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SearchModule } from './modules/search/search.module';
import { LoggerMiddleware } from './core/observability/logger/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    HealthModule,
    CacheModule,
    LoggerModule,
    MetricsModule,
    TracingModule,
    QueueModule,
    StorageModule,
    AuthModule,
    AuthFeatureModule,
    SystemModule,
    MonitorModule,
    FileModule,
    DashboardModule,
    AiModule,
    FormFeatureModule,
    NotificationModule,
    SearchModule,
  ],
  providers: [
    // 顺序很重要：先认证（JwtAuthGuard），后授权（PermissionsGuard）
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
