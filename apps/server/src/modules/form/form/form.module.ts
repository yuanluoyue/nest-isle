import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { FormService } from './form.service';
import { FormController } from './form.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [FormController],
  providers: [FormService],
  exports: [FormService],
})
export class FormModule {}
