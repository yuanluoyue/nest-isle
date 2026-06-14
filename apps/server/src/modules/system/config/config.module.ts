import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigFeatureModule {}
