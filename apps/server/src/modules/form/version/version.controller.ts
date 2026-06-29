import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VersionService } from './version.service';
import { QueryVersionDto } from './dto/query-version.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';

@ApiTags('表单版本')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('form/version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  @ApiOperation({ summary: '获取版本列表' })
  @RequirePermission('form:design:list')
  findAll(@Query() query: QueryVersionDto) {
    return this.versionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取版本详情' })
  @RequirePermission('form:design:list')
  findOne(@Param('id') id: string) {
    return this.versionService.findOne(id);
  }
}
