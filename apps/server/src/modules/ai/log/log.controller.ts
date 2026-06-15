import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/query-log.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';

@ApiTags('AI 调用日志')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ summary: '获取AI调用日志列表' })
  findAll(@Query() query: QueryLogDto) {
    return this.logService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取AI调用日志详情' })
  findOne(@Param('id') id: string) {
    return this.logService.findOne(id);
  }
}
