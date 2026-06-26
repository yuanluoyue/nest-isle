import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService],
})
export class VersionModule {}
