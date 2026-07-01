import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { OperateLog } from '../../common/decorator/operate-log.decorator';

@ApiTags('站内信')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取站内信列表' })
  findAll(
    @Query() query: QueryNotificationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.notificationService.findAll(query, user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读数量' })
  getUnreadCount(@CurrentUser() user: { id: string }) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取站内信详情' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notificationService.findOne(id, user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记为已读' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notificationService.markAsRead(id, user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: '全部标记已读' })
  @OperateLog({ module: '站内信', action: '全部标记已读' })
  markAllAsRead(@CurrentUser() user: { id: string }) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除站内信' })
  @OperateLog({ module: '站内信', action: '删除' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notificationService.remove(id, user.id);
  }
}
