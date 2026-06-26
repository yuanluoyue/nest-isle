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
import { eq } from 'drizzle-orm';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { QueryFormDto } from './dto/query-form.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';
import { AiService } from '../../ai/ai.service';
import { PromptService } from '../../ai/prompt/prompt.service';
import { ModelService } from '../../ai/model/model.service';
import { DatabaseService } from '../../../database/database.service';
import { sysAiModel } from '../../../database/schema';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@ApiTags('表单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('form/form')
export class FormController {
  constructor(
    private readonly formService: FormService,
    private readonly aiService: AiService,
    private readonly promptService: PromptService,
    private readonly modelService: ModelService,
    private readonly databaseService: DatabaseService,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  @Post('ai-generate')
  @ApiOperation({ summary: 'AI 生成表单 Schema' })
  @OperateLog({ module: '表单管理', action: 'AI生成' })
  async aiGenerate(
    @Body() body: { requirement: string; modelId?: string },
    @CurrentUser() user?: { id: string },
  ) {
    const { requirement, modelId } = body;
    if (!requirement) {
      return { schema: null, error: '需求描述不能为空' };
    }

    // 从数据库获取 prompt 模板
    const promptTemplate = await this.promptService.findByCode('form_schema_generator');

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: promptTemplate,
      },
      {
        role: 'user',
        content: requirement,
      },
    ];

    try {
      // 通过 modelId 查模型名，未指定则用默认模型
      let targetModelName = 'deepseek-chat';
      if (modelId) {
        const model = await this.modelService.findOne(modelId);
        targetModelName = model.name;
      } else {
        // 查找默认模型
        const defaultModel = await this.db.query.sysAiModel.findFirst({
          where: eq(sysAiModel.isDefault, 1),
        });
        if (defaultModel) {
          targetModelName = defaultModel.name;
        }
      }
      const result = await this.aiService.chat(targetModelName, messages, user?.id || '');

      // 提取 JSON schema
      let schema = null;
      try {
        // 尝试从 markdown 代码块中提取 JSON
        const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : result.trim();
        schema = JSON.parse(jsonStr);
      } catch {
        // JSON 解析失败，返回原始文本
        return { schema: null, rawContent: result, error: 'AI 返回的内容不是有效的 JSON' };
      }

      return { schema, rawContent: result };
    } catch (err) {
      return {
        schema: null,
        error: 'AI 生成失败: ' + (err as Error).message,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: '获取表单列表' })
  findAll(@Query() query: QueryFormDto) {
    return this.formService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取表单详情' })
  findOne(@Param('id') id: string) {
    return this.formService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建表单' })
  @OperateLog({ module: '表单管理', action: '新增' })
  create(@Body() dto: CreateFormDto, @CurrentUser() user?: { id: string }) {
    return this.formService.create(dto, user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新表单' })
  @OperateLog({ module: '表单管理', action: '编辑' })
  update(@Param('id') id: string, @Body() dto: UpdateFormDto) {
    return this.formService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除表单' })
  @OperateLog({ module: '表单管理', action: '删除' })
  remove(@Param('id') id: string) {
    return this.formService.remove(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: '发布表单' })
  @OperateLog({ module: '表单管理', action: '发布' })
  publish(@Param('id') id: string, @CurrentUser() user?: { id: string }) {
    return this.formService.publish(id, user?.id);
  }

  @Put(':id/unpublish')
  @ApiOperation({ summary: '停用表单' })
  @OperateLog({ module: '表单管理', action: '停用' })
  unpublish(@Param('id') id: string) {
    return this.formService.unpublish(id);
  }

  @Get('published/:code')
  @ApiOperation({ summary: '获取已发布表单Schema（按编码）' })
  getPublishedSchema(@Param('code') code: string) {
    return this.formService.getPublishedSchema(code);
  }
}
