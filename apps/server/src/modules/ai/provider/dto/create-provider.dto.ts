import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({ description: '名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '类型', enum: ['openai', 'anthropic', 'gemini', 'deepseek'] })
  @IsString()
  @IsIn(['openai', 'anthropic', 'gemini', 'deepseek'])
  type: string;

  @ApiPropertyOptional({ description: 'Base URL' })
  @IsString()
  @IsOptional()
  baseUrl?: string;

  @ApiPropertyOptional({ description: 'API Key' })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiPropertyOptional({ description: '启用状态 0=启用 1=禁用' })
  @IsInt()
  @IsOptional()
  enabled?: number;

  @ApiPropertyOptional({ description: '优先级' })
  @IsInt()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
