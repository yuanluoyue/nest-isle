import { Module } from '@nestjs/common';
import { LoginLogModule } from './login-log/login-log.module';
import { OperateLogModule } from './operate-log/operate-log.module';
import { JobModule } from './job/job.module';
import { SessionFeatureModule } from './session/session.module';

@Module({
  imports: [LoginLogModule, OperateLogModule, JobModule, SessionFeatureModule],
})
export class MonitorModule {}
