import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNotificationDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: '状态: unread=未读 read=已读',
  })
  @IsString()
  @IsIn(['unread', 'read'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: '类型: announcement=通知公告 role_change=角色变更',
  })
  @IsString()
  @IsIn(['announcement', 'role_change'])
  @IsOptional()
  type?: string;
}
