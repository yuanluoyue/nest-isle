import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class QueryConfigDto {
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

  @ApiPropertyOptional({ description: '配置名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '配置键' })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({ description: '类型: 0=系统内置 1=自定义' })
  @IsInt()
  @IsOptional()
  @IsIn([0, 1])
  @Type(() => Number)
  type?: number;

  @ApiPropertyOptional({ description: '状态: 0=启用 1=禁用' })
  @IsInt()
  @IsOptional()
  @IsIn([0, 1])
  @Type(() => Number)
  status?: number;
}
