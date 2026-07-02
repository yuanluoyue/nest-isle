import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './logger.factory';
import { LoggerService } from './logger.service';
import { LoggerInterceptor } from './logger.interceptor';
import { LogExceptionFilter } from './exception.filter';

@Global()
@Module({
  imports: [WinstonModule.forRoot(createWinstonConfig())],
  providers: [LoggerService, LoggerInterceptor, LogExceptionFilter],
  exports: [LoggerService, LoggerInterceptor, LogExceptionFilter],
})
export class LoggerModule {}
