import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典名称', example: '性别' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @ApiProperty({ description: '字典编码', example: 'sys_gender' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  code: string;

  @ApiPropertyOptional({ description: '状态 0=正常 1=禁用', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
