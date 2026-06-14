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
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { QueryNoticeDto } from './dto/query-notice.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('通知公告')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  @ApiOperation({ summary: '获取通知公告列表' })
  findAll(@Query() query: QueryNoticeDto) {
    return this.noticeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取通知公告详情' })
  findOne(@Param('id') id: string) {
    return this.noticeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建通知公告' })
  @OperateLog({ module: '通知公告', action: '新增' })
  create(@Body() dto: CreateNoticeDto, @CurrentUser() user: { id: string }) {
    return this.noticeService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新通知公告' })
  @OperateLog({ module: '通知公告', action: '编辑' })
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知公告' })
  @OperateLog({ module: '通知公告', action: '删除' })
  remove(@Param('id') id: string) {
    return this.noticeService.remove(id);
  }
}
