import { Global, Module } from '@nestjs/common';
import { TraceService } from './trace.service';
import { TraceInterceptor } from './trace.interceptor';

@Global()
@Module({
  providers: [TraceService, TraceInterceptor],
  exports: [TraceService, TraceInterceptor],
})
export class TracingModule {}
