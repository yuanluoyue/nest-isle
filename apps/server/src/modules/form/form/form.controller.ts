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
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { QueryFormDto } from './dto/query-form.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('表单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('form/form')
export class FormController {
  constructor(private readonly formService: FormService) {}

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
