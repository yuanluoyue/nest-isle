import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsObject, Min, Max, Length } from 'class-validator';

export class CreateDictItemDto {
  @ApiProperty({ description: '字典类型 ID' })
  @IsString()
  @IsNotEmpty()
  dictTypeId: string;

  @ApiProperty({ description: '标签', example: '男' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  label: string;

  @ApiProperty({ description: '值', example: '1' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  value: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional({ description: '颜色（用于 Tag 显示）', example: 'blue' })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  color?: string;

  @ApiPropertyOptional({ description: '状态 0=正常 1=禁用', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;

  @ApiPropertyOptional({ description: '扩展信息（任意 JSON）' })
  @IsObject()
  @IsOptional()
  extra?: Record<string, unknown>;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
