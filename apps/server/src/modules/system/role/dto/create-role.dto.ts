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

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '普通用户' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiProperty({ description: '角色编码', example: 'user' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  code: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  sort?: number;

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
