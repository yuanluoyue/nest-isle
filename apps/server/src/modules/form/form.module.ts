import { Module } from '@nestjs/common';
import { FormModule } from './form/form.module';
import { RecordModule } from './record/record.module';
import { DatasourceModule } from './datasource/datasource.module';
import { VersionModule } from './version/version.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    FormModule,
    RecordModule,
    DatasourceModule,
    VersionModule,
  ],
})
export class FormFeatureModule {}
