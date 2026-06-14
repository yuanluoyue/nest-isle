import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthFeatureModule {}
