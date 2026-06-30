import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, ilike, SQL } from 'drizzle-orm';
import {
  sysFormDatasource,
  sysDictType,
  sysDictItem,
} from '../../../database/schema';
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

  /**
   * 根据数据源配置获取选项数据
   * 返回格式: [{ label, value }, ...]
   */
  async getData(id: string) {
    const datasource = await this.db.query.sysFormDatasource.findFirst({
      where: eq(sysFormDatasource.id, id),
    });

    if (!datasource) {
      throw new NotFoundException('数据源不存在');
    }

    return this.resolveDatasourceData(datasource);
  }

  /**
   * 根据数据源编码获取选项数据
   */
  async getDataByCode(code: string) {
    const datasource = await this.db.query.sysFormDatasource.findFirst({
      where: eq(sysFormDatasource.code, code),
    });

    if (!datasource) {
      throw new NotFoundException('数据源不存在');
    }

    return this.resolveDatasourceData(datasource);
  }

  /**
   * 解析数据源数据
   */
  private async resolveDatasourceData(datasource: any) {
    const { type, config } = datasource;

    switch (type) {
      case 'dict': {
        // 从字典加载选项，config 中存 dictCode
        const dictCode = config?.dictCode || config?.code;
        if (!dictCode) return [];

        const dictType = await this.db.query.sysDictType.findFirst({
          where: eq(sysDictType.code, dictCode),
        });
        if (!dictType) return [];

        const items = await this.db.query.sysDictItem.findMany({
          where: and(
            eq(sysDictItem.dictTypeId, dictType.id),
            eq(sysDictItem.status, 0),
          ),
          orderBy: (items, { asc }) => [asc(items.sort)],
        });

        return items.map((item: any) => ({
          label: item.label,
          value: item.value,
        }));
      }

      case 'static': {
        // 静态数据，config 中直接存 options 数组
        const options = config?.options || config || [];
        if (Array.isArray(options)) {
          return options.map((opt: any) => {
            if (typeof opt === 'object') {
              return {
                label: opt.label || opt.name,
                value: opt.value || opt.id,
              };
            }
            return { label: String(opt), value: String(opt) };
          });
        }
        return [];
      }

      case 'api': {
        // 从外部 API 加载，config 中存 url、method、labelField、valueField
        const {
          url,
          method = 'GET',
          labelField = 'label',
          valueField = 'value',
          headers,
        } = config || {};
        if (!url) return [];

        try {
          const response = await fetch(url, {
            method: method.toUpperCase(),
            headers: headers || {},
          });
          const data = await response.json();
          const list = Array.isArray(data)
            ? data
            : data.data || data.list || [];

          return list.map((item: any) => ({
            label: item[labelField],
            value: item[valueField],
          }));
        } catch {
          return [];
        }
      }

      default:
        return [];
    }
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
      this.db
        .select({ id: sysFormDatasource.id })
        .from(sysFormDatasource)
        .where(where),
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
