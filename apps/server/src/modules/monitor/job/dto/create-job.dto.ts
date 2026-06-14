import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: '任务名称', example: '数据备份' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @ApiPropertyOptional({ description: '任务分组', example: 'default' })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  group?: string;

  @ApiProperty({ description: '处理器名称', example: 'DataBackupHandler' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  handler: string;

  @ApiProperty({ description: 'Cron 表达式', example: '0 0 2 * * *' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  cron: string;

  @ApiPropertyOptional({ description: '状态: 0=暂停 1=运行', example: 0 })
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
