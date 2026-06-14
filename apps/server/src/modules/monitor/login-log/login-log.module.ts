import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { LoginLogService } from './login-log.service';
import { LoginLogController } from './login-log.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [LoginLogController],
  providers: [LoginLogService],
  exports: [LoginLogService],
})
export class LoginLogModule {}
