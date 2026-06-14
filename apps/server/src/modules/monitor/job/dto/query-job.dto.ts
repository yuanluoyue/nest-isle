import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryJobDto {
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

  @ApiPropertyOptional({ description: '任务名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '任务分组' })
  @IsString()
  @IsOptional()
  group?: string;

  @ApiPropertyOptional({ description: '处理器名称' })
  @IsString()
  @IsOptional()
  handler?: string;

  @ApiPropertyOptional({ description: '状态: 0=暂停 1=运行' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  status?: number;
}
