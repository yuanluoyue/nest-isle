import { Injectable } from '@nestjs/common';
import { ilike, or, and } from 'drizzle-orm';
import { sysAiPrompt } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { SearchProvider, SearchItem } from './provider.interface';

@Injectable()
export class PromptProvider implements SearchProvider {
  readonly name = 'prompt';

  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async search(keyword: string, userId: string, permissions: string[]): Promise<SearchItem[]> {
    if (!permissions.some((p) => p.startsWith('ai:prompt'))) return [];

    const prompts = await this.db.query.sysAiPrompt.findMany({
      where: and(
        or(
          ilike(sysAiPrompt.name, `%${keyword}%`),
          ilike(sysAiPrompt.code, `%${keyword}%`),
        )!,
      ),
      limit: 10,
      columns: {
        id: true,
        name: true,
        code: true,
      },
    });

    return prompts.map((prompt) => ({
      id: prompt.id,
      provider: this.name,
      title: prompt.name ?? '',
      subtitle: prompt.code ?? undefined,
      icon: 'RobotOutlined',
      url: '/ai/prompt',
      score: 1,
    }));
  }
}
