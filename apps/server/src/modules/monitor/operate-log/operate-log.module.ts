import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { OperateLogService } from './operate-log.service';
import { OperateLogController } from './operate-log.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [OperateLogController],
  providers: [OperateLogService],
  exports: [OperateLogService],
})
export class OperateLogModule {}
