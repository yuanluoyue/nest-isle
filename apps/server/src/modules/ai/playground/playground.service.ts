import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { sysAiLog } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { ProviderService } from '../provider/provider.service';
import { ModelService } from '../model/model.service';
import { createAiClient } from '../utils/create-ai-client';

@Injectable()
export class PlaygroundService {
  private readonly logger = new Logger(PlaygroundService.name);

  constructor(
    private databaseService: DatabaseService,
    private providerService: ProviderService,
    private modelService: ModelService,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  async chatStream(
    modelId: string,
    messages: ChatCompletionMessageParam[],
    userId: string,
  ) {
    const model = await this.modelService.findOne(modelId);
    if (!model) {
      throw new NotFoundException('模型不存在');
    }

    const provider = await this.providerService.findOne(model.providerId);
    if (!provider) {
      throw new NotFoundException('Provider 不存在');
    }

    const client = createAiClient(provider);

    const startTime = Date.now();

    const stream = await client.chat.completions.create({
      model: model.name,
      messages,
      stream: true,
    });

    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    let fullContent = '';

    const db = this.db;
    const logger = this.logger;

    // Wrap the stream to capture tokens and log after completion
    const wrappedStream = async function* () {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
          }

          // Capture usage from the final chunk if available
          if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens ?? 0;
            completionTokens = chunk.usage.completion_tokens ?? 0;
            totalTokens = chunk.usage.total_tokens ?? 0;
          }

          yield chunk;
        }
      } finally {
        const duration = Date.now() - startTime;

        // If no usage info from stream, estimate tokens
        if (totalTokens === 0) {
          promptTokens = Math.ceil(
            messages.reduce(
              (acc, m) =>
                acc + (typeof m.content === 'string' ? m.content.length : 0),
              0,
            ) / 4,
          );
          completionTokens = Math.ceil(fullContent.length / 4);
          totalTokens = promptTokens + completionTokens;
        }

        try {
          await db.insert(sysAiLog).values({
            providerId: provider.id,
            modelId: model.id,
            userId,
            promptTokens,
            completionTokens,
            totalTokens,
            duration,
            status: 0,
          });
        } catch (error) {
          logger.error(`Failed to write AI log: ${(error as Error).message}`);
        }
      }
    };

    return wrappedStream();
  }
}
