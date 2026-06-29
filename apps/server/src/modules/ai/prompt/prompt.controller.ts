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
import { PromptService } from './prompt.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { QueryPromptDto } from './dto/query-prompt.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('AI Prompt')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Get()
  @ApiOperation({ summary: '获取 Prompt 列表' })
  @RequirePermission('ai:prompt:list')
  findAll(@Query() query: QueryPromptDto) {
    return this.promptService.findAll(query);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据 code 获取 Prompt 内容' })
  @RequirePermission('ai:prompt:list')
  findByCode(@Param('code') code: string) {
    return this.promptService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取 Prompt 详情' })
  @RequirePermission('ai:prompt:list')
  findOne(@Param('id') id: string) {
    return this.promptService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建 Prompt' })
  @OperateLog({ module: 'AI Prompt', action: '新增' })
  @RequirePermission('ai:prompt:create')
  create(@Body() dto: CreatePromptDto) {
    return this.promptService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新 Prompt' })
  @OperateLog({ module: 'AI Prompt', action: '编辑' })
  @RequirePermission('ai:prompt:update')
  update(@Param('id') id: string, @Body() dto: UpdatePromptDto) {
    return this.promptService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除 Prompt' })
  @OperateLog({ module: 'AI Prompt', action: '删除' })
  @RequirePermission('ai:prompt:delete')
  remove(@Param('id') id: string) {
    return this.promptService.remove(id);
  }
}
