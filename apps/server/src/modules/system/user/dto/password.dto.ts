import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: '新密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50)
  newPassword: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: '新密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50)
  newPassword: string;
}
