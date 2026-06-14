import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';

export class AssignMenuDto {
  @ApiProperty({ description: '菜单ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  menuIds: string[];
}
