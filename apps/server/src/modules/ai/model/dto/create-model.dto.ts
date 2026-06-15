import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsInt,
  Length,
} from 'class-validator';

export class CreateModelDto {
  @ApiProperty({ description: 'Provider ID' })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({ description: '模型标识' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ description: '显示名称' })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  displayName?: string;

  @ApiProperty({ description: '模型类型', enum: ['chat', 'embedding'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['chat', 'embedding'])
  modelType: string;

  @ApiPropertyOptional({ description: '启用状态 0=启用 1=禁用', default: 0 })
  @IsInt()
  @IsOptional()
  enabled?: number;

  @ApiPropertyOptional({ description: '是否默认 0=否 1=是', default: 0 })
  @IsInt()
  @IsOptional()
  isDefault?: number;

  @ApiPropertyOptional({ description: '上下文长度' })
  @IsInt()
  @IsOptional()
  contextLength?: number;

  @ApiPropertyOptional({ description: '输入价格' })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  inputPrice?: string;

  @ApiPropertyOptional({ description: '输出价格' })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  outputPrice?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
