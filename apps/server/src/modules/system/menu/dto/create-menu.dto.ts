import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, Length } from 'class-validator';

export class CreateMenuDto {
  @ApiPropertyOptional({ description: '父级ID' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: '菜单名称', example: '用户管理' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiProperty({ description: '类型 0=目录 1=菜单 2=按钮', example: 1 })
  @IsInt()
  @Min(0)
  @Max(2)
  type: number;

  @ApiPropertyOptional({ description: '路由路径', example: '/system/user' })
  @IsString()
  @IsOptional()
  @Length(0, 200)
  path?: string;

  @ApiPropertyOptional({ description: '组件路径', example: 'system/user' })
  @IsString()
  @IsOptional()
  @Length(0, 200)
  component?: string;

  @ApiPropertyOptional({ description: '权限标识', example: 'system:user:list' })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  permission?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  icon?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  sort?: number;

  @ApiPropertyOptional({ description: '是否可见 0=可见 1=隐藏', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  visible?: number;

  @ApiPropertyOptional({ description: '状态 0=正常 1=禁用', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;
}
