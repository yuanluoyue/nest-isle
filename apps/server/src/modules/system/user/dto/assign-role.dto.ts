import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: '角色ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  roleIds: string[];
}
