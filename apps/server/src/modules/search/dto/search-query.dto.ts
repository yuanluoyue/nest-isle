import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ description: '搜索关键词' })
  @IsString()
  @MinLength(1)
  keyword: string;

  @ApiPropertyOptional({ description: '指定搜索范围', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providers?: string[];
}
