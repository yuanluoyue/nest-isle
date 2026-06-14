import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsInt, IsUUID, Min, Max, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'zhangsan' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50)
  password: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsString()
  @IsOptional()
  @Length(0, 20)
  phone?: string;

  @ApiPropertyOptional({ description: '性别 0=未知 1=男 2=女', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(2)
  gender?: number;

  @ApiPropertyOptional({ description: '部门ID' })
  @IsUUID()
  @IsOptional()
  deptId?: string;

  @ApiPropertyOptional({ description: '状态 0=正常 1=禁用', example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  remark?: string;
}
