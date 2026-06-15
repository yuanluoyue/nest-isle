import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Length,
} from 'class-validator';

export class CreatePromptDto {
  @ApiProperty({ description: '唯一标识' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  code: string;

  @ApiProperty({ description: '名称' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Prompt 内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '版本号', default: 1 })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiPropertyOptional({ description: '启用状态 0=启用 1=禁用', default: 0 })
  @IsInt()
  @IsOptional()
  enabled?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
