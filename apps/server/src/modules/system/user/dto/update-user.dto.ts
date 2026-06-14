import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsUUID, Min, Max, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: '头像URL' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  avatar?: string;
}
