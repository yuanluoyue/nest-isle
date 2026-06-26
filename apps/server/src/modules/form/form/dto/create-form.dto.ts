import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({ description: '表单名称', example: '用户信息表' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '表单编码', example: 'user_info' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  code: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ description: '表单Schema', example: {} })
  @IsOptional()
  schema?: Record<string, any>;
}
