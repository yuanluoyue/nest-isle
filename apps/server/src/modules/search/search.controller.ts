import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { OperateLog } from '../../common/decorator/operate-log.decorator';

@ApiTags('全局搜索')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: '全局搜索' })
  search(
    @Query() query: SearchQueryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.searchService.search(query.keyword, user.id, query.providers);
  }

  @Get('history')
  @ApiOperation({ summary: '获取搜索历史' })
  getHistory(@CurrentUser() user: { id: string }) {
    return this.searchService.getHistory(user.id);
  }

  @Delete('history')
  @ApiOperation({ summary: '清空搜索历史' })
  @OperateLog({ module: '全局搜索', action: '清空搜索历史' })
  clearHistory(@CurrentUser() user: { id: string }) {
    return this.searchService.clearHistory(user.id);
  }

  @Delete('history/:id')
  @ApiOperation({ summary: '删除单条搜索历史' })
  removeHistoryItem(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.searchService.removeHistoryItem(id, user.id);
  }
}
