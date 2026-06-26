import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecordDto {
  @ApiProperty({ description: '表单ID' })
  @IsString()
  @IsNotEmpty()
  formId: string;

  @ApiPropertyOptional({ description: '表单数据', example: {} })
  @IsOptional()
  data?: Record<string, any>;
}
