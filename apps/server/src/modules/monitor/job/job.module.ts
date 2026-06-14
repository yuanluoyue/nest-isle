import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule as CoreAuthModule } from '../../../core/auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { JobService } from './job.service';
import { JobController } from './job.controller';

@Module({
  imports: [CoreAuthModule, DatabaseModule, ScheduleModule.forRoot()],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule implements OnModuleInit {
  constructor(private jobService: JobService) {}

  async onModuleInit() {
    await this.jobService.loadRunningJobs();
  }
}
