import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
