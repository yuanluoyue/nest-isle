import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecordService } from './record.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('表单数据')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('form/record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get()
  @ApiOperation({ summary: '获取表单数据列表' })
  @RequirePermission('form:record:list')
  findAll(@Query() query: QueryRecordDto) {
    return this.recordService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取表单数据详情' })
  @RequirePermission('form:record:list')
  findOne(@Param('id') id: string) {
    return this.recordService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '提交表单数据' })
  @OperateLog({ module: '表单数据', action: '提交' })
  @RequirePermission('form:record:create')
  create(@Body() dto: CreateRecordDto, @CurrentUser() user?: { id: string }) {
    return this.recordService.create(dto, user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除表单数据' })
  @OperateLog({ module: '表单数据', action: '删除' })
  @RequirePermission('form:record:delete')
  remove(@Param('id') id: string) {
    return this.recordService.remove(id);
  }
}
