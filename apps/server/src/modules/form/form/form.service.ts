import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, isNull, ilike, SQL } from 'drizzle-orm';
import { sysForm, sysFormVersion } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { QueryFormDto } from './dto/query-form.dto';

@Injectable()
export class FormService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryFormDto) {
    const { page = 1, pageSize = 10, name, code, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [isNull(sysForm.deletedAt)];
    if (name) conditions.push(ilike(sysForm.name, `%${name}%`));
    if (code) conditions.push(ilike(sysForm.code, `%${code}%`));
    if (status !== undefined) conditions.push(eq(sysForm.status, status));

    const where = and(...conditions);

    const [forms, countResult] = await Promise.all([
      this.db.query.sysForm.findMany({
        where,
        limit: pageSize,
        offset,
        columns: {
          id: true,
          name: true,
          code: true,
          description: true,
          status: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.db.select({ id: sysForm.id }).from(sysForm).where(where),
    ]);

    return {
      list: forms,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const form = await this.db.query.sysForm.findFirst({
      where: and(eq(sysForm.id, id), isNull(sysForm.deletedAt)),
    });

    if (!form) {
      throw new NotFoundException('表单不存在');
    }

    return form;
  }

  async create(dto: CreateFormDto, userId?: string) {
    const existing = await this.db.query.sysForm.findFirst({
      where: eq(sysForm.code, dto.code),
    });
    if (existing) {
      throw new ConflictException('表单编码已存在');
    }

    const [form] = await this.db
      .insert(sysForm)
      .values({
        name: dto.name,
        code: dto.code,
        description: dto.description,
        schema: dto.schema,
        status: 0,
        createdBy: userId,
      })
      .returning();

    return form;
  }

  async update(id: string, dto: UpdateFormDto) {
    const form = await this.db.query.sysForm.findFirst({
      where: and(eq(sysForm.id, id), isNull(sysForm.deletedAt)),
    });
    if (!form) {
      throw new NotFoundException('表单不存在');
    }

    if (dto.code && dto.code !== form.code) {
      const existing = await this.db.query.sysForm.findFirst({
        where: eq(sysForm.code, dto.code),
      });
      if (existing) {
        throw new ConflictException('表单编码已存在');
      }
    }

    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.schema !== undefined) updateData.schema = dto.schema;

    if (Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }

    const [updated] = await this.db
      .update(sysForm)
      .set(updateData)
      .where(eq(sysForm.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    const form = await this.db.query.sysForm.findFirst({
      where: and(eq(sysForm.id, id), isNull(sysForm.deletedAt)),
    });
    if (!form) {
      throw new NotFoundException('表单不存在');
    }

    await this.db
      .update(sysForm)
      .set({ deletedAt: new Date() })
      .where(eq(sysForm.id, id));
  }

  async publish(id: string, userId?: string) {
    const form = await this.db.query.sysForm.findFirst({
      where: and(eq(sysForm.id, id), isNull(sysForm.deletedAt)),
    });
    if (!form) {
      throw new NotFoundException('表单不存在');
    }

    if (!form.schema) {
      throw new ConflictException('表单Schema为空，无法发布');
    }

    // 获取当前最大版本号
    const versions = await this.db.query.sysFormVersion.findMany({
      where: eq(sysFormVersion.formId, id),
    });
    const maxVersion = versions.length > 0 ? Math.max(...versions.map((v) => v.version)) : 0;
    const newVersion = maxVersion + 1;

    // 将之前的发布版本取消发布
    await this.db
      .update(sysFormVersion)
      .set({ isPublished: 0 })
      .where(and(eq(sysFormVersion.formId, id), eq(sysFormVersion.isPublished, 1)));

    // 创建新版本
    await this.db.insert(sysFormVersion).values({
      formId: id,
      version: newVersion,
      schema: form.schema,
      isPublished: 1,
      createdBy: userId,
    });

    // 更新表单状态和已发布Schema
    const [updated] = await this.db
      .update(sysForm)
      .set({
        publishedSchema: form.schema,
        status: 1,
      })
      .where(eq(sysForm.id, id))
      .returning();

    return updated;
  }

  async unpublish(id: string) {
    const form = await this.db.query.sysForm.findFirst({
      where: and(eq(sysForm.id, id), isNull(sysForm.deletedAt)),
    });
    if (!form) {
      throw new NotFoundException('表单不存在');
    }

    // 取消所有发布版本
    await this.db
      .update(sysFormVersion)
      .set({ isPublished: 0 })
      .where(and(eq(sysFormVersion.formId, id), eq(sysFormVersion.isPublished, 1)));

    const [updated] = await this.db
      .update(sysForm)
      .set({ status: 2 })
      .where(eq(sysForm.id, id))
      .returning();

    return updated;
  }

  async getPublishedSchema(code: string) {
    const form = await this.db.query.sysForm.findFirst({
      where: and(eq(sysForm.code, code), eq(sysForm.status, 1), isNull(sysForm.deletedAt)),
    });

    if (!form) {
      throw new NotFoundException('表单不存在或未发布');
    }

    return { schema: form.publishedSchema };
  }
}
