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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('菜单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: '获取菜单树列表' })
  @RequirePermission('system:menu:list')
  findAll(@Query() query: QueryMenuDto) {
    return this.menuService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单详情' })
  @RequirePermission('system:menu:list')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @OperateLog({ module: '菜单管理', action: '新增' })
  @RequirePermission('system:menu:create')
  create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  @OperateLog({ module: '菜单管理', action: '编辑' })
  @RequirePermission('system:menu:update')
  update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @OperateLog({ module: '菜单管理', action: '删除' })
  @RequirePermission('system:menu:delete')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
