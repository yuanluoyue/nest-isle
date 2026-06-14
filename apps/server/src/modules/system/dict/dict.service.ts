import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, isNull, ilike, asc, SQL } from 'drizzle-orm';
import { sysDictType, sysDictItem } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateDictTypeDto } from './dto/create-dict-type.dto';
import { UpdateDictTypeDto } from './dto/update-dict-type.dto';
import { QueryDictTypeDto } from './dto/query-dict-type.dto';
import { CreateDictItemDto } from './dto/create-dict-item.dto';
import { UpdateDictItemDto } from './dto/update-dict-item.dto';
import { QueryDictItemDto } from './dto/query-dict-item.dto';

@Injectable()
export class DictService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  // ============ 字典类型 ============

  async findAllTypes(query: QueryDictTypeDto) {
    const { page = 1, pageSize = 10, name, code, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [isNull(sysDictType.deletedAt)];
    if (name) conditions.push(ilike(sysDictType.name, `%${name}%`));
    if (code) conditions.push(ilike(sysDictType.code, `%${code}%`));
    if (status !== undefined) conditions.push(eq(sysDictType.status, status));

    const where = and(...conditions);

    const [list, countResult] = await Promise.all([
      this.db.query.sysDictType.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: asc(sysDictType.createdAt),
      }),
      this.db.select({ id: sysDictType.id }).from(sysDictType).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOneType(id: string) {
    const type = await this.db.query.sysDictType.findFirst({
      where: and(eq(sysDictType.id, id), isNull(sysDictType.deletedAt)),
    });
    if (!type) {
      throw new NotFoundException('字典类型不存在');
    }
    return type;
  }

  async createType(dto: CreateDictTypeDto) {
    const existing = await this.db.query.sysDictType.findFirst({
      where: and(eq(sysDictType.code, dto.code), isNull(sysDictType.deletedAt)),
    });
    if (existing) {
      throw new ConflictException('字典编码已存在');
    }

    const [created] = await this.db
      .insert(sysDictType)
      .values({
        name: dto.name,
        code: dto.code,
        status: dto.status ?? 0,
        remark: dto.remark,
      })
      .returning();
    return created;
  }

  async updateType(id: string, dto: UpdateDictTypeDto) {
    const type = await this.findOneType(id);

    if (dto.code && dto.code !== type.code) {
      const existing = await this.db.query.sysDictType.findFirst({
        where: and(eq(sysDictType.code, dto.code), isNull(sysDictType.deletedAt)),
      });
      if (existing) {
        throw new ConflictException('字典编码已存在');
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const [updated] = await this.db
      .update(sysDictType)
      .set(updateData)
      .where(eq(sysDictType.id, id))
      .returning();
    return updated;
  }

  async removeType(id: string) {
    const type = await this.findOneType(id);

    // 检查是否还有未删除的字典项
    const items = await this.db.query.sysDictItem.findMany({
      where: and(eq(sysDictItem.dictTypeId, type.id), isNull(sysDictItem.deletedAt)),
      columns: { id: true },
    });
    if (items.length > 0) {
      throw new ConflictException('字典类型下存在字典项，请先删除字典项');
    }

    await this.db
      .update(sysDictType)
      .set({ deletedAt: new Date() })
      .where(eq(sysDictType.id, id));
  }

  // ============ 字典项 ============

  async findAllItems(query: QueryDictItemDto) {
    let dictTypeId = query.dictTypeId;
    if (!dictTypeId && query.dictTypeCode) {
      const type = await this.db.query.sysDictType.findFirst({
        where: and(eq(sysDictType.code, query.dictTypeCode), isNull(sysDictType.deletedAt)),
      });
      if (!type) return [];
      dictTypeId = type.id;
    }

    const conditions: SQL[] = [isNull(sysDictItem.deletedAt)];
    if (dictTypeId) conditions.push(eq(sysDictItem.dictTypeId, dictTypeId));
    if (query.label) conditions.push(ilike(sysDictItem.label, `%${query.label}%`));
    if (query.status !== undefined) conditions.push(eq(sysDictItem.status, query.status));

    const list = await this.db.query.sysDictItem.findMany({
      where: and(...conditions),
      orderBy: [asc(sysDictItem.sort), asc(sysDictItem.createdAt)],
    });
    return list;
  }

  async findOneItem(id: string) {
    const item = await this.db.query.sysDictItem.findFirst({
      where: and(eq(sysDictItem.id, id), isNull(sysDictItem.deletedAt)),
    });
    if (!item) {
      throw new NotFoundException('字典项不存在');
    }
    return item;
  }

  async createItem(dto: CreateDictItemDto) {
    // 校验字典类型存在
    await this.findOneType(dto.dictTypeId);

    // 同一字典类型下 value 唯一
    const existing = await this.db.query.sysDictItem.findFirst({
      where: and(
        eq(sysDictItem.dictTypeId, dto.dictTypeId),
        eq(sysDictItem.value, dto.value),
        isNull(sysDictItem.deletedAt),
      ),
    });
    if (existing) {
      throw new ConflictException('字典项值已存在');
    }

    const [created] = await this.db
      .insert(sysDictItem)
      .values({
        dictTypeId: dto.dictTypeId,
        label: dto.label,
        value: dto.value,
        sort: dto.sort ?? 0,
        color: dto.color,
        status: dto.status ?? 0,
        extra: dto.extra,
        remark: dto.remark,
      })
      .returning();
    return created;
  }

  async updateItem(id: string, dto: UpdateDictItemDto) {
    const item = await this.findOneItem(id);

    // 修改了 value 或 dictTypeId 时，校验唯一
    const targetTypeId = dto.dictTypeId ?? item.dictTypeId;
    const targetValue = dto.value ?? item.value;
    if (
      (dto.value !== undefined && dto.value !== item.value) ||
      (dto.dictTypeId !== undefined && dto.dictTypeId !== item.dictTypeId)
    ) {
      if (targetTypeId && targetValue) {
        const existing = await this.db.query.sysDictItem.findFirst({
          where: and(
            eq(sysDictItem.dictTypeId, targetTypeId),
            eq(sysDictItem.value, targetValue),
            isNull(sysDictItem.deletedAt),
          ),
        });
        if (existing && existing.id !== id) {
          throw new ConflictException('字典项值已存在');
        }
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.dictTypeId !== undefined) updateData.dictTypeId = dto.dictTypeId;
    if (dto.label !== undefined) updateData.label = dto.label;
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.sort !== undefined) updateData.sort = dto.sort;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.extra !== undefined) updateData.extra = dto.extra;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const [updated] = await this.db
      .update(sysDictItem)
      .set(updateData)
      .where(eq(sysDictItem.id, id))
      .returning();
    return updated;
  }

  async removeItem(id: string) {
    await this.findOneItem(id);
    await this.db
      .update(sysDictItem)
      .set({ deletedAt: new Date() })
      .where(eq(sysDictItem.id, id));
  }
}
