import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, ilike, desc, SQL } from 'drizzle-orm';
import { sysAiPrompt } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { QueryPromptDto } from './dto/query-prompt.dto';

@Injectable()
export class PromptService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryPromptDto) {
    const { page = 1, pageSize = 10, code, name, enabled } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (code) conditions.push(ilike(sysAiPrompt.code, `%${code}%`));
    if (name) conditions.push(ilike(sysAiPrompt.name, `%${name}%`));
    if (enabled !== undefined)
      conditions.push(eq(sysAiPrompt.enabled, enabled));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [list, countResult] = await Promise.all([
      this.db.query.sysAiPrompt.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysAiPrompt.id),
      }),
      this.db.select({ id: sysAiPrompt.id }).from(sysAiPrompt).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const prompt = await this.db.query.sysAiPrompt.findFirst({
      where: eq(sysAiPrompt.id, id),
    });
    if (!prompt) {
      throw new NotFoundException('Prompt 不存在');
    }
    return prompt;
  }

  async findByCode(code: string) {
    const prompt = await this.db.query.sysAiPrompt.findFirst({
      where: and(eq(sysAiPrompt.code, code), eq(sysAiPrompt.enabled, 0)),
    });
    if (!prompt) {
      throw new NotFoundException('Prompt 不存在');
    }
    return prompt.content;
  }

  async create(dto: CreatePromptDto) {
    const [created] = await this.db
      .insert(sysAiPrompt)
      .values({
        code: dto.code,
        name: dto.name,
        content: dto.content,
        version: dto.version ?? 1,
        enabled: dto.enabled ?? 0,
        remark: dto.remark,
      })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdatePromptDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.version !== undefined) updateData.version = dto.version;
    if (dto.enabled !== undefined) updateData.enabled = dto.enabled;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    const [updated] = await this.db
      .update(sysAiPrompt)
      .set(updateData)
      .where(eq(sysAiPrompt.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(sysAiPrompt).where(eq(sysAiPrompt.id, id));
  }
}
