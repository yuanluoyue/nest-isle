import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDictItemDto {
  @ApiPropertyOptional({ description: '字典类型 ID' })
  @IsString()
  @IsOptional()
  dictTypeId?: string;

  @ApiPropertyOptional({ description: '字典类型编码（与 dictTypeId 二选一）' })
  @IsString()
  @IsOptional()
  dictTypeCode?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ description: '状态 0=正常 1=禁用' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  status?: number;
}
