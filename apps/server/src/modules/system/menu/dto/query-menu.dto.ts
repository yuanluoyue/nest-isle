import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMenuDto {
  @ApiPropertyOptional({ description: '菜单名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '类型 0=目录 1=菜单 2=按钮' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  type?: number;

  @ApiPropertyOptional({ description: '状态 0=正常 1=禁用' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  status?: number;
}
