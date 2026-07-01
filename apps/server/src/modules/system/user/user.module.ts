import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { EventModule } from '../../../core/event/event.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule, EventModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
