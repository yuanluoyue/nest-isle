import { Module } from '@nestjs/common';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { DatasourceService } from './datasource.service';
import { DatasourceController } from './datasource.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule],
  controllers: [DatasourceController],
  providers: [DatasourceService],
  exports: [DatasourceService],
})
export class DatasourceModule {}
