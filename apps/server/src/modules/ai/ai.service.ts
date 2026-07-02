import { Injectable, NotFoundException } from '@nestjs/common';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { eq } from 'drizzle-orm';
import { sysAiModel, sysAiLog } from '../../database/schema';
import { DatabaseService } from '../../database/database.service';
import { ProviderService } from './provider/provider.service';
import { ModelService } from './model/model.service';
import { LogService } from './log/log.service';
import { createAiClient } from './utils/create-ai-client';
import { LoggerService } from '../../core/logger/logger.service';

@Injectable()
export class AiService {
  private readonly logger: LoggerService;

  constructor(
    private databaseService: DatabaseService,
    private providerService: ProviderService,
    private modelService: ModelService,
    private logService: LogService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.child('AI');
  }

  private get db() {
    return this.databaseService.db;
  }

  async chat(
    modelName: string,
    messages: ChatCompletionMessageParam[],
    userId: string,
  ) {
    const model = await this.db.query.sysAiModel.findFirst({
      where: eq(sysAiModel.name, modelName),
    });
    if (!model) {
      throw new NotFoundException(`模型 ${modelName} 不存在`);
    }

    const provider = await this.providerService.findOne(model.providerId);

    const client = createAiClient(provider);

    const startTime = Date.now();
    let error: string | null = null;
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;

    this.logger.info({
      action: 'CompletionStart',
      message: 'AI completion start',
      data: { model: model.name, provider: provider.name },
    });

    try {
      const completion = await client.chat.completions.create({
        model: model.name,
        messages,
        stream: false,
      });

      const duration = Date.now() - startTime;

      promptTokens = completion.usage?.prompt_tokens ?? 0;
      completionTokens = completion.usage?.completion_tokens ?? 0;
      totalTokens = completion.usage?.total_tokens ?? 0;

      this.logger.info({
        action: 'CompletionEnd',
        message: 'AI completion end',
        data: { model: model.name, duration, totalTokens },
      });

      // Record log
      await this.db.insert(sysAiLog).values({
        providerId: provider.id,
        modelId: model.id,
        userId,
        promptTokens,
        completionTokens,
        totalTokens,
        duration,
        status: 0,
      });

      return completion.choices?.[0]?.message?.content || '';
    } catch (err) {
      error = (err as Error).message;
      const duration = Date.now() - startTime;

      this.logger.error({
        action: 'CompletionFailed',
        message: 'AI completion failed',
        data: { model: model.name, error: (err as Error).message },
      });

      // Record error log
      try {
        await this.db.insert(sysAiLog).values({
          providerId: provider.id,
          modelId: model.id,
          userId,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          duration,
          status: 1,
          error,
        });
      } catch (logErr) {
        this.logger.error({
          action: 'LogWriteFailed',
          message: 'Failed to write AI error log',
          data: { error: (logErr as Error).message },
        });
      }

      throw err;
    }
  }
}
