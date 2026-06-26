import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { AiModule } from '../../ai/ai.module';
import { PromptModule } from '../../ai/prompt/prompt.module';
import { ModelModule } from '../../ai/model/model.module';
import { FormService } from './form.service';
import { FormController } from './form.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule, AiModule, PromptModule, ModelModule],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService],
})
export class FormModule {}
