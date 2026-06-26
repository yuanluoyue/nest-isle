import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateDatasourceDto {
  @ApiProperty({ description: '数据源名称', example: '性别字典' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '数据源编码', example: 'gender' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  code: string;

  @ApiPropertyOptional({ description: '类型 dict/api/static', example: 'dict' })
  @IsString()
  @IsOptional()
  @Length(0, 20)
  type?: string;

  @ApiPropertyOptional({ description: '配置', example: {} })
  @IsOptional()
  config?: Record<string, any>;
}
