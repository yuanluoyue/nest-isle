import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { QuerySessionDto } from './dto/query-session.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('会话管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitor/session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: '获取会话列表' })
  @RequirePermission('monitor:session:list')
  findAll(@Query() query: QuerySessionDto) {
    return this.sessionService.findAll(query);
  }

  @Post(':id/force-logout')
  @ApiOperation({ summary: '强制下线' })
  @OperateLog({ module: '会话管理', action: '强制下线' })
  @RequirePermission('monitor:session:force-logout')
  forceLogout(@Param('id') id: string) {
    return this.sessionService.forceLogout(id);
  }
}
