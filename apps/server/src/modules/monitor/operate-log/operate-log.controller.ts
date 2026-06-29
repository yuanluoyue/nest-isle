import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OperateLogService } from './operate-log.service';
import { QueryOperateLogDto } from './dto/query-operate-log.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';

@ApiTags('操作日志')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitor/operate-log')
export class OperateLogController {
  constructor(private readonly operateLogService: OperateLogService) {}

  @Get()
  @ApiOperation({ summary: '获取操作日志列表' })
  @RequirePermission('monitor:operate-log:list')
  findAll(@Query() query: QueryOperateLogDto) {
    return this.operateLogService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取操作日志详情' })
  @RequirePermission('monitor:operate-log:list')
  findOne(@Param('id') id: string) {
    return this.operateLogService.findOne(id);
  }
}
