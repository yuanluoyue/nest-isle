import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, ilike, desc, SQL } from 'drizzle-orm';
import { sysAiProvider } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { QueryProviderDto } from './dto/query-provider.dto';
import { createAiClient } from '../utils/create-ai-client';

@Injectable()
export class ProviderService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryProviderDto) {
    const { page = 1, pageSize = 10, name, type, enabled } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (name) conditions.push(ilike(sysAiProvider.name, `%${name}%`));
    if (type) conditions.push(eq(sysAiProvider.type, type));
    if (enabled !== undefined)
      conditions.push(eq(sysAiProvider.enabled, enabled));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [list, countResult] = await Promise.all([
      this.db.query.sysAiProvider.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysAiProvider.id),
      }),
      this.db.select({ id: sysAiProvider.id }).from(sysAiProvider).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const provider = await this.db.query.sysAiProvider.findFirst({
      where: eq(sysAiProvider.id, id),
    });
    if (!provider) {
      throw new NotFoundException('Provider 不存在');
    }
    return provider;
  }

  async create(dto: CreateProviderDto) {
    const [created] = await this.db
      .insert(sysAiProvider)
      .values({
        name: dto.name,
        type: dto.type,
        baseUrl: dto.baseUrl,
        apiKey: dto.apiKey,
        enabled: dto.enabled ?? 0,
        priority: dto.priority ?? 0,
        remark: dto.remark,
      })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateProviderDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.baseUrl !== undefined) updateData.baseUrl = dto.baseUrl;
    if (dto.apiKey !== undefined) updateData.apiKey = dto.apiKey;
    if (dto.enabled !== undefined) updateData.enabled = dto.enabled;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const [updated] = await this.db
      .update(sysAiProvider)
      .set(updateData)
      .where(eq(sysAiProvider.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(sysAiProvider).where(eq(sysAiProvider.id, id));
  }

  async testConnection(id: string) {
    const provider = await this.findOne(id);
    try {
      const client = createAiClient(provider);
      await client.models.list();
      return { success: true, message: '连接成功' };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }
}
