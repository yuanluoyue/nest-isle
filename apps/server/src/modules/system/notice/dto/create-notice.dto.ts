import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Length,
} from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({ description: '标题', example: '系统维护通知' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({ description: '摘要', example: '系统将于今晚进行维护' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  summary?: string;

  @ApiProperty({ description: '正文内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description:
      '分类: system=系统 release=发布 maintenance=维护 security=安全',
    example: 'system',
  })
  @IsString()
  @IsOptional()
  @IsIn(['system', 'release', 'maintenance', 'security'])
  category?: string;

  @ApiPropertyOptional({
    description: '状态: 0=草稿 1=已发布 2=已归档',
    example: 0,
  })
  @IsOptional()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
