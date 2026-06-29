import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Length,
} from 'class-validator';

export class CreateConfigDto {
  @ApiProperty({ description: '配置名称', example: '系统名称' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '配置键', example: 'sys.site.name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  key: string;

  @ApiProperty({ description: '配置值', example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({
    description: '类型: 0=系统内置 1=自定义',
    example: 1,
  })
  @IsOptional()
  @IsIn([0, 1])
  type?: number;

  @ApiPropertyOptional({
    description: '状态: 0=启用 1=禁用',
    example: 0,
  })
  @IsOptional()
  @IsIn([0, 1])
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
