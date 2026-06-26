import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, ilike, SQL } from 'drizzle-orm';
import { sysFormDatasource } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateDatasourceDto } from './dto/create-datasource.dto';
import { UpdateDatasourceDto } from './dto/update-datasource.dto';
import { QueryDatasourceDto } from './dto/query-datasource.dto';

@Injectable()
export class DatasourceService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryDatasourceDto) {
    const { page = 1, pageSize = 10, name, type } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (name) conditions.push(ilike(sysFormDatasource.name, `%${name}%`));
    if (type) conditions.push(eq(sysFormDatasource.type, type));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [datasources, countResult] = await Promise.all([
      this.db.query.sysFormDatasource.findMany({
        where,
        limit: pageSize,
        offset,
      }),
      this.db.select({ id: sysFormDatasource.id }).from(sysFormDatasource).where(where),
    ]);

    return {
      list: datasources,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const datasource = await this.db.query.sysFormDatasource.findFirst({
      where: eq(sysFormDatasource.id, id),
    });

    if (!datasource) {
      throw new NotFoundException('数据源不存在');
    }

    return datasource;
  }

  async create(dto: CreateDatasourceDto) {
    const existing = await this.db.query.sysFormDatasource.findFirst({
      where: eq(sysFormDatasource.code, dto.code),
    });
    if (existing) {
      throw new ConflictException('数据源编码已存在');
    }

    const [datasource] = await this.db
      .insert(sysFormDatasource)
      .values({
        name: dto.name,
        code: dto.code,
        type: dto.type,
        config: dto.config,
      })
      .returning();

    return datasource;
  }

  async update(id: string, dto: UpdateDatasourceDto) {
    const datasource = await this.db.query.sysFormDatasource.findFirst({
      where: eq(sysFormDatasource.id, id),
    });
    if (!datasource) {
      throw new NotFoundException('数据源不存在');
    }

    if (dto.code && dto.code !== datasource.code) {
      const existing = await this.db.query.sysFormDatasource.findFirst({
        where: eq(sysFormDatasource.code, dto.code),
      });
      if (existing) {
        throw new ConflictException('数据源编码已存在');
      }
    }

    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.config !== undefined) updateData.config = dto.config;

    if (Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }

    const [updated] = await this.db
      .update(sysFormDatasource)
      .set(updateData)
      .where(eq(sysFormDatasource.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const datasource = await this.db.query.sysFormDatasource.findFirst({
      where: eq(sysFormDatasource.id, id),
    });
    if (!datasource) {
      throw new NotFoundException('数据源不存在');
    }

    await this.db.delete(sysFormDatasource).where(eq(sysFormDatasource.id, id));
  }
}
