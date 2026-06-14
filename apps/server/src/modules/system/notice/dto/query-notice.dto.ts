import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class QueryNoticeDto {
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

  @ApiPropertyOptional({ description: '标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description:
      '分类: system=系统 release=发布 maintenance=维护 security=安全',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: '状态: 0=草稿 1=已发布 2=已归档' })
  @IsInt()
  @IsOptional()
  @IsIn([0, 1, 2])
  @Type(() => Number)
  status?: number;
}
