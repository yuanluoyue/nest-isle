import { Module } from '@nestjs/common';
import { ProviderModule } from './provider/provider.module';
import { ModelModule } from './model/model.module';
import { PromptModule } from './prompt/prompt.module';
import { LogModule } from './log/log.module';
import { PlaygroundModule } from './playground/playground.module';
import { AiService } from './ai.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    ProviderModule,
    ModelModule,
    PromptModule,
    LogModule,
    PlaygroundModule,
  ],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
