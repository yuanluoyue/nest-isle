import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './transport';
import { LoggerService } from './logger.service';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerMiddleware } from './logger.middleware';
import { LogExceptionFilter } from './logger.filter';

@Global()
@Module({
  imports: [WinstonModule.forRoot(createWinstonConfig())],
  providers: [LoggerService, LoggerInterceptor, LoggerMiddleware, LogExceptionFilter],
  exports: [LoggerService, LoggerInterceptor, LoggerMiddleware, LogExceptionFilter],
})
export class LoggerModule {}
