import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { FileModule } from '../file/file.module';
import { LoginLogModule } from '../monitor/login-log/login-log.module';
import { SessionFeatureModule } from '../monitor/session/session.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CaptchaService } from './captcha.service';

@Module({
  imports: [
    CoreAuthModule,
    DatabaseModule,
    FileModule,
    LoginLogModule,
    SessionFeatureModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CaptchaService],
})
export class AuthFeatureModule {}
