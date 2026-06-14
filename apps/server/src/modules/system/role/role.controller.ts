import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { AssignMenuDto } from './dto/assign-menu.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get('menu-tree')
  @ApiOperation({ summary: '获取菜单树（用于分配权限）' })
  getMenuTree() {
    return this.roleService.getMenuTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @OperateLog({ module: '角色管理', action: '新增' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @OperateLog({ module: '角色管理', action: '编辑' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @OperateLog({ module: '角色管理', action: '删除' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @Put(':id/menus')
  @ApiOperation({ summary: '分配角色菜单权限' })
  @OperateLog({ module: '角色管理', action: '分配权限' })
  assignMenus(@Param('id') id: string, @Body() dto: AssignMenuDto) {
    return this.roleService.assignMenus(id, dto.menuIds);
  }
}
