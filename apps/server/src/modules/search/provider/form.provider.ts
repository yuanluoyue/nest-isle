import { Injectable } from '@nestjs/common';
import { eq, isNull, and, or, ilike, SQL } from 'drizzle-orm';
import { sysForm } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { SearchProvider, SearchItem } from './provider.interface';

@Injectable()
export class FormProvider implements SearchProvider {
  readonly name = 'form';

  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async search(keyword: string, userId: string, permissions: string[]): Promise<SearchItem[]> {
    if (!permissions.some((p) => p.startsWith('form:design'))) return [];

    const conditions: SQL[] = [
      isNull(sysForm.deletedAt),
      or(ilike(sysForm.name, `%${keyword}%`), ilike(sysForm.description, `%${keyword}%`))!,
    ];

    const forms = await this.db.query.sysForm.findMany({
      where: and(...conditions),
      limit: 10,
      columns: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });

    return forms.map((form) => ({
      id: form.id,
      provider: this.name,
      title: form.name ?? '',
      subtitle: form.description ?? undefined,
      icon: 'FormOutlined',
      url: `/form/design/${form.id}`,
      score: 1,
    }));
  }
}
