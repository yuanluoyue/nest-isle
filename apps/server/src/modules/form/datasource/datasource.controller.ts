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
import { DatasourceService } from './datasource.service';
import { CreateDatasourceDto } from './dto/create-datasource.dto';
import { UpdateDatasourceDto } from './dto/update-datasource.dto';
import { QueryDatasourceDto } from './dto/query-datasource.dto';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { OperateLog } from '../../../common/decorator/operate-log.decorator';

@ApiTags('数据源管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('form/datasource')
export class DatasourceController {
  constructor(private readonly datasourceService: DatasourceService) {}

  @Get()
  @ApiOperation({ summary: '获取数据源列表' })
  findAll(@Query() query: QueryDatasourceDto) {
    return this.datasourceService.findAll(query);
  }

  @Get('code/:code/data')
  @ApiOperation({ summary: '根据编码获取数据源数据' })
  getDataByCode(@Param('code') code: string) {
    return this.datasourceService.getDataByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取数据源详情' })
  findOne(@Param('id') id: string) {
    return this.datasourceService.findOne(id);
  }

  @Get(':id/data')
  @ApiOperation({ summary: '获取数据源数据' })
  getData(@Param('id') id: string) {
    return this.datasourceService.getData(id);
  }

  @Post()
  @ApiOperation({ summary: '创建数据源' })
  @OperateLog({ module: '数据源管理', action: '新增' })
  create(@Body() dto: CreateDatasourceDto) {
    return this.datasourceService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新数据源' })
  @OperateLog({ module: '数据源管理', action: '编辑' })
  update(@Param('id') id: string, @Body() dto: UpdateDatasourceDto) {
    return this.datasourceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除数据源' })
  @OperateLog({ module: '数据源管理', action: '删除' })
  remove(@Param('id') id: string) {
    return this.datasourceService.remove(id);
  }
}
