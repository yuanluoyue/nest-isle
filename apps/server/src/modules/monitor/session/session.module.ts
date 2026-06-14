import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionFeatureModule {}
