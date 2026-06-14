import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Min } from 'class-validator';

export class QuerySessionDto {
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

  @ApiPropertyOptional({ description: '用户类型' })
  @IsString()
  @IsOptional()
  userType?: string;

  @ApiPropertyOptional({ description: 'IP 地址' })
  @IsString()
  @IsOptional()
  ip?: string;
}
