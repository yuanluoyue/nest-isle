import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoginLogService } from './login-log.service';
import { QueryLoginLogDto } from './dto/query-login-log.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';

@ApiTags('登录日志')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitor/login-log')
export class LoginLogController {
  constructor(private readonly loginLogService: LoginLogService) {}

  @Get()
  @ApiOperation({ summary: '获取登录日志列表' })
  findAll(@Query() query: QueryLoginLogDto) {
    return this.loginLogService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取登录日志详情' })
  findOne(@Param('id') id: string) {
    return this.loginLogService.findOne(id);
  }
}
