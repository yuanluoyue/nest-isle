import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { Public } from '../../auth/public.decorator';

@ApiTags('Metrics')
@Controller('metrics')
@Public()
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: '获取 Prometheus 指标' })
  async getMetrics(@Res() res: any) {
    if (!this.metricsService.isEnabled()) {
      res.code(404).send('Metrics disabled');
      return;
    }
    const metrics = await this.metricsService.getMetrics();
    res.header('Content-Type', this.metricsService.getContentType());
    res.send(metrics);
  }
}
