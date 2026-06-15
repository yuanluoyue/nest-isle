import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Min } from 'class-validator';

export class QueryModelDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: 'Provider ID' })
  @IsString()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({ description: '模型类型' })
  @IsString()
  @IsOptional()
  modelType?: string;

  @ApiPropertyOptional({ description: '启用状态' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  enabled?: number;
}
