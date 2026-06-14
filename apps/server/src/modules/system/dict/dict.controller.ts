import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DictService } from './dict.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { QueryDictTypeDto } from './dto/query-dict-type.dto';
import { CreateDictItemDto } from './dto/create-dict-item.dto';
import { UpdateDictItemDto } from './dto/update-dict-item.dto';
import { QueryDictItemDto } from './dto/query-dict-item.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('字典管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  // ============ 字典类型 ============

  @Get('type')
  @ApiOperation({ summary: '获取字典类型列表' })
  findAllTypes(@Query() query: QueryDictTypeDto) {
    return this.dictService.findAllTypes(query);
  }

  @Get('type/:id')
  @ApiOperation({ summary: '获取字典类型详情' })
  findOneType(@Param('id') id: string) {
    return this.dictService.findOneType(id);
  }

  @Post('type')
  @ApiOperation({ summary: '创建字典类型' })
  @OperateLog({ module: '字典管理', action: '新增字典类型' })
  createType(@Body() dto: CreateDictTypeDto) {
    return this.dictService.createType(dto);
  }

  @Put('type/:id')
  @ApiOperation({ summary: '更新字典类型' })
  @OperateLog({ module: '字典管理', action: '编辑字典类型' })
  updateType(@Param('id') id: string, @Body() dto: UpdateDictTypeDto) {
    return this.dictService.updateType(id, dto);
  }

  @Delete('type/:id')
  @ApiOperation({ summary: '删除字典类型' })
  @OperateLog({ module: '字典管理', action: '删除字典类型' })
  removeType(@Param('id') id: string) {
    return this.dictService.removeType(id);
  }

  // ============ 字典项 ============

  @Get('item')
  @ApiOperation({ summary: '获取字典项列表（按字典类型）' })
  findAllItems(@Query() query: QueryDictItemDto) {
    return this.dictService.findAllItems(query);
  }

  @Get('item/:id')
  @ApiOperation({ summary: '获取字典项详情' })
  findOneItem(@Param('id') id: string) {
    return this.dictService.findOneItem(id);
  }

  @Post('item')
  @ApiOperation({ summary: '创建字典项' })
  @OperateLog({ module: '字典管理', action: '新增字典项' })
  createItem(@Body() dto: CreateDictItemDto) {
    return this.dictService.createItem(dto);
  }

  @Put('item/:id')
  @ApiOperation({ summary: '更新字典项' })
  @OperateLog({ module: '字典管理', action: '编辑字典项' })
  updateItem(@Param('id') id: string, @Body() dto: UpdateDictItemDto) {
    return this.dictService.updateItem(id, dto);
  }

  @Delete('item/:id')
  @ApiOperation({ summary: '删除字典项' })
  @OperateLog({ module: '字典管理', action: '删除字典项' })
  removeItem(@Param('id') id: string) {
    return this.dictService.removeItem(id);
  }
}
