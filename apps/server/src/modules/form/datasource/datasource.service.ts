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

/** 字典类型数据源配置 */
interface DictDatasourceConfig {
  dictCode?: string;
  code?: string;
}

/** 静态数据源配置 */
interface StaticDatasourceConfig {
  options?: unknown[];
}

/** API 类型数据源配置 */
interface ApiDatasourceConfig {
  url?: string;
  method?: string;
  labelField?: string;
  valueField?: string;
  headers?: Record<string, string>;
}

/** 数据源条目 */
interface DatasourceOption {
  label: unknown;
  value: unknown;
}

/** 静态选项条目 */
interface StaticOption {
  label?: unknown;
  name?: unknown;
  value?: unknown;
  id?: unknown;
  [key: string]: unknown;
}

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
  private async resolveDatasourceData(datasource: {
    type: string | null;
    config?: unknown;
  }): Promise<DatasourceOption[]> {
    const type = datasource.type ?? '';
    const { config } = datasource;

    switch (type) {
      case 'dict': {
        // 从字典加载选项，config 中存 dictCode
        const cfg = (config ?? {}) as DictDatasourceConfig;
        const dictCode = cfg.dictCode || cfg.code;
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

        return items.map((item) => ({
          label: item.label,
          value: item.value,
        }));
      }

      case 'static': {
        // 静态数据，config 中直接存 options 数组
        const cfg = (config ?? {}) as StaticDatasourceConfig;
        const options = cfg.options ?? (Array.isArray(config) ? config : []);
        if (!Array.isArray(options)) return [];

        return options.map((opt) => {
          if (opt && typeof opt === 'object') {
            const o = opt as StaticOption;
            return {
              label: o.label ?? o.name,
              value: o.value ?? o.id,
            };
          }
          return { label: String(opt), value: String(opt) };
        });
      }

      case 'api': {
        // 从外部 API 加载，config 中存 url、method、labelField、valueField
        const cfg = (config ?? {}) as ApiDatasourceConfig;
        const {
          url,
          method = 'GET',
          labelField = 'label',
          valueField = 'value',
          headers,
        } = cfg;
        if (!url) return [];

        try {
          const response = await fetch(url, {
            method: method.toUpperCase(),
            headers: headers ?? {},
          });
          const data: unknown = await response.json();
          const list = Array.isArray(data)
            ? data
            : Array.isArray((data as { data?: unknown[] })?.data)
              ? (data as { data: unknown[] }).data
              : Array.isArray((data as { list?: unknown[] })?.list)
                ? (data as { list: unknown[] }).list
                : [];

          return list.map((item) => {
            const o = (item ?? {}) as Record<string, unknown>;
            return {
              label: o[labelField],
              value: o[valueField],
            };
          });
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

    const updateData: Record<string, unknown> = {};
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
