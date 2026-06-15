import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, desc, SQL } from 'drizzle-orm';
import { sysAiModel } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { QueryModelDto } from './dto/query-model.dto';

@Injectable()
export class ModelService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryModelDto) {
    const { page = 1, pageSize = 10, providerId, modelType, enabled } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (providerId) conditions.push(eq(sysAiModel.providerId, providerId));
    if (modelType) conditions.push(eq(sysAiModel.modelType, modelType));
    if (enabled !== undefined) conditions.push(eq(sysAiModel.enabled, enabled));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [list, countResult] = await Promise.all([
      this.db.query.sysAiModel.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysAiModel.id),
        with: {
          provider: true,
        },
      }),
      this.db.select({ id: sysAiModel.id }).from(sysAiModel).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const model = await this.db.query.sysAiModel.findFirst({
      where: eq(sysAiModel.id, id),
      with: {
        provider: true,
      },
    });
    if (!model) {
      throw new NotFoundException('模型不存在');
    }
    return model;
  }

  async create(dto: CreateModelDto) {
    // 如果设置为默认，先清除同类型的默认
    if (dto.isDefault === 1) {
      await this.clearDefault(dto.modelType);
    }

    const [created] = await this.db
      .insert(sysAiModel)
      .values({
        providerId: dto.providerId,
        name: dto.name,
        displayName: dto.displayName,
        modelType: dto.modelType,
        enabled: dto.enabled ?? 0,
        isDefault: dto.isDefault ?? 0,
        contextLength: dto.contextLength,
        inputPrice: dto.inputPrice,
        outputPrice: dto.outputPrice,
        remark: dto.remark,
      })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateModelDto) {
    await this.findOne(id);

    // 如果设置为默认，先清除同类型的默认
    if (dto.isDefault === 1) {
      const existing = await this.db.query.sysAiModel.findFirst({
        where: eq(sysAiModel.id, id),
      });
      const modelType = dto.modelType ?? existing!.modelType;
      await this.clearDefault(modelType);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.providerId !== undefined) updateData.providerId = dto.providerId;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.modelType !== undefined) updateData.modelType = dto.modelType;
    if (dto.enabled !== undefined) updateData.enabled = dto.enabled;
    if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;
    if (dto.contextLength !== undefined)
      updateData.contextLength = dto.contextLength;
    if (dto.inputPrice !== undefined) updateData.inputPrice = dto.inputPrice;
    if (dto.outputPrice !== undefined) updateData.outputPrice = dto.outputPrice;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const [updated] = await this.db
      .update(sysAiModel)
      .set(updateData)
      .where(eq(sysAiModel.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(sysAiModel).where(eq(sysAiModel.id, id));
  }

  private async clearDefault(modelType: string) {
    await this.db
      .update(sysAiModel)
      .set({ isDefault: 0 })
      .where(
        and(eq(sysAiModel.modelType, modelType), eq(sysAiModel.isDefault, 1)),
      );
  }
}
