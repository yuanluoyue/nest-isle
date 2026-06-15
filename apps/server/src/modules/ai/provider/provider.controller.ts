import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { QueryProviderDto } from './dto/query-provider.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('AI Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get()
  @ApiOperation({ summary: '获取Provider列表' })
  findAll(@Query() query: QueryProviderDto) {
    return this.providerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Provider详情' })
  findOne(@Param('id') id: string) {
    return this.providerService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建Provider' })
  @OperateLog({ module: 'AI Provider', action: '新增' })
  create(@Body() dto: CreateProviderDto) {
    return this.providerService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新Provider' })
  @OperateLog({ module: 'AI Provider', action: '编辑' })
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.providerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Provider' })
  @OperateLog({ module: 'AI Provider', action: '删除' })
  remove(@Param('id') id: string) {
    return this.providerService.remove(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: '测试Provider连接' })
  testConnection(@Param('id') id: string) {
    return this.providerService.testConnection(id);
  }
}
