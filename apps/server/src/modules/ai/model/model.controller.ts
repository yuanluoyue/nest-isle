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
import { ModelService } from './model.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { QueryModelDto } from './dto/query-model.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('AI Model')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get()
  @ApiOperation({ summary: '获取模型列表' })
  @RequirePermission('ai:model:list')
  findAll(@Query() query: QueryModelDto) {
    return this.modelService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取模型详情' })
  @RequirePermission('ai:model:list')
  findOne(@Param('id') id: string) {
    return this.modelService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建模型' })
  @OperateLog({ module: 'AI模型', action: '新增' })
  @RequirePermission('ai:model:create')
  create(@Body() dto: CreateModelDto) {
    return this.modelService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新模型' })
  @OperateLog({ module: 'AI模型', action: '编辑' })
  @RequirePermission('ai:model:update')
  update(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return this.modelService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模型' })
  @OperateLog({ module: 'AI模型', action: '删除' })
  @RequirePermission('ai:model:delete')
  remove(@Param('id') id: string) {
    return this.modelService.remove(id);
  }
}
