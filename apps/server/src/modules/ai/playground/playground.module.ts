import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { ProviderModule } from '../provider/provider.module';
import { ModelModule } from '../model/model.module';
import { PlaygroundService } from './playground.service';
import { PlaygroundController } from './playground.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule, ProviderModule, ModelModule],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
})
export class PlaygroundModule {}
