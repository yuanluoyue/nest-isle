import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [NoticeController],
  providers: [NoticeService],
  exports: [NoticeService],
})
export class NoticeModule {}
