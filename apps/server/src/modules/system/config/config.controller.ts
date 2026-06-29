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
import { ConfigService } from './config.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { QueryConfigDto } from './dto/query-config.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('系统配置')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: '获取配置列表' })
  @RequirePermission('system:config:list')
  findAll(@Query() query: QueryConfigDto) {
    return this.configService.findAll(query);
  }

  @Get('key/:key')
  @ApiOperation({ summary: '根据 key 获取配置值' })
  @RequirePermission('system:config:list')
  findByKey(@Param('key') key: string) {
    return this.configService.findByKey(key);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取配置详情' })
  @RequirePermission('system:config:list')
  findOne(@Param('id') id: string) {
    return this.configService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建配置' })
  @OperateLog({ module: '系统配置', action: '新增' })
  @RequirePermission('system:config:create')
  create(@Body() dto: CreateConfigDto) {
    return this.configService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新配置' })
  @OperateLog({ module: '系统配置', action: '编辑' })
  @RequirePermission('system:config:update')
  update(@Param('id') id: string, @Body() dto: UpdateConfigDto) {
    return this.configService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除配置' })
  @OperateLog({ module: '系统配置', action: '删除' })
  @RequirePermission('system:config:delete')
  remove(@Param('id') id: string) {
    return this.configService.remove(id);
  }

  @Post('refresh-cache')
  @ApiOperation({ summary: '刷新配置缓存' })
  @OperateLog({ module: '系统配置', action: '刷新缓存' })
  @RequirePermission('system:config:refresh-cache')
  refreshCache() {
    return this.configService.refreshCache();
  }
}
