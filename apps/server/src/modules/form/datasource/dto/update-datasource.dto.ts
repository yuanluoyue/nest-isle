import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateDatasourceDto } from './create-datasource.dto';

export class UpdateDatasourceDto extends PartialType(CreateDatasourceDto) {}
