import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseHealthIndicator } from './database.health';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dbHealthIndicator: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: '健康检查' })
  check() {
    return this.health.check([
      () => this.dbHealthIndicator.isHealthy('database'),
    ]);
  }
}
