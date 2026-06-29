import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { QueryJobLogDto } from './dto/query-job-log.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('定时任务')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitor/job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiOperation({ summary: '获取定时任务列表' })
  @RequirePermission('monitor:job:list')
  findAll(@Query() query: QueryJobDto) {
    return this.jobService.findAll(query);
  }

  @Get('log')
  @ApiOperation({ summary: '获取任务执行日志列表' })
  @RequirePermission('monitor:job:list')
  findLogs(@Query() query: QueryJobLogDto) {
    return this.jobService.findLogs(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取定时任务详情' })
  @RequirePermission('monitor:job:list')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建定时任务' })
  @OperateLog({ module: '定时任务', action: '新增' })
  @RequirePermission('monitor:job:create')
  create(@Body() dto: CreateJobDto) {
    return this.jobService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新定时任务' })
  @OperateLog({ module: '定时任务', action: '编辑' })
  @RequirePermission('monitor:job:update')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除定时任务' })
  @OperateLog({ module: '定时任务', action: '删除' })
  @RequirePermission('monitor:job:delete')
  remove(@Param('id') id: string) {
    return this.jobService.remove(id);
  }

  @Put(':id/start')
  @ApiOperation({ summary: '启动定时任务' })
  @OperateLog({ module: '定时任务', action: '启动' })
  @RequirePermission('monitor:job:start')
  start(@Param('id') id: string) {
    return this.jobService.start(id);
  }

  @Put(':id/stop')
  @ApiOperation({ summary: '停止定时任务' })
  @OperateLog({ module: '定时任务', action: '停止' })
  @RequirePermission('monitor:job:stop')
  stop(@Param('id') id: string) {
    return this.jobService.stop(id);
  }

  @Post(':id/run')
  @ApiOperation({ summary: '立即执行一次' })
  @OperateLog({ module: '定时任务', action: '立即执行' })
  @RequirePermission('monitor:job:run')
  runOnce(@Param('id') id: string) {
    return this.jobService.runOnce(id);
  }
}
