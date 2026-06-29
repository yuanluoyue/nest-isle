import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../core/auth/permissions.decorator';

@ApiTags('仪表盘')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  @RequirePermission('dashboard:view')
  getStats() {
    return this.dashboardService.getStats();
  }
}
