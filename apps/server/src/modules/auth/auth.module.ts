import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CaptchaService } from './captcha.service';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, CaptchaService],
})
export class AuthFeatureModule {}
