import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FileService } from './file.service';
import { FileController } from './file.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
