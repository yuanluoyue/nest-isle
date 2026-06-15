import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [PromptController],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
