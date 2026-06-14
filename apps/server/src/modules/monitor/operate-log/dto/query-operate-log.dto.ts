import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOperateLogDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '操作模块' })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ description: '操作描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '操作状态 0=成功 1=失败' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  status?: number;
}
