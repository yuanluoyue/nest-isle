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
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ResetPasswordDto } from './dto/password.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @RequirePermission('system:user:list')
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @RequirePermission('system:user:list')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @OperateLog({ module: '用户管理', action: '新增' })
  @RequirePermission('system:user:create')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @OperateLog({ module: '用户管理', action: '编辑' })
  @RequirePermission('system:user:update')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @OperateLog({ module: '用户管理', action: '删除' })
  @RequirePermission('system:user:delete')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Put(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @OperateLog({ module: '用户管理', action: '重置密码' })
  @RequirePermission('system:user:reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(id, dto);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: '分配用户角色' })
  @OperateLog({ module: '用户管理', action: '分配角色' })
  @RequirePermission('system:user:assign')
  assignRoles(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.userService.assignRoles(id, dto.roleIds);
  }
}
