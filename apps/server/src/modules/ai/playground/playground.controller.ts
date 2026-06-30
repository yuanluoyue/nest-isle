import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { PlaygroundService } from './playground.service';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { RequirePermission } from '../../../core/auth/permissions.decorator';
import { CurrentUser } from '../../../core/auth/current-user.decorator';

/**
 * SSE 场景下需要直接操作底层 Node 原生 response。
 * ESLint projectService 无法稳定解析 fastify 的 FastifyReply 类型，
 * 因此显式声明用到的 raw 字段。
 */
interface SseReply {
  raw: {
    setHeader(name: string, value: string | number | string[]): void;
    write(chunk: string | Buffer): boolean;
    end(): void;
  };
}

@ApiTags('AI Playground')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/playground')
export class PlaygroundController {
  constructor(private readonly playgroundService: PlaygroundService) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI对话（SSE流式）' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: '模型ID' },
        messages: {
          type: 'array',
          description: '消息列表',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @RequirePermission('ai:playground:view')
  async chat(
    @Body()
    body: {
      modelId: string;
      messages: ChatCompletionMessageParam[];
    },
    @Res() res: SseReply,
    @CurrentUser() user: { id: string },
  ) {
    // Fastify 下 SSE 需直接操作底层 Node 原生 response（res.raw）
    res.raw.setHeader('Content-Type', 'text/event-stream');
    res.raw.setHeader('Cache-Control', 'no-cache');
    res.raw.setHeader('Connection', 'keep-alive');
    res.raw.setHeader('X-Accel-Buffering', 'no');

    const userId = user?.id;
    const stream = await this.playgroundService.chatStream(
      body.modelId,
      body.messages,
      userId,
    );

    try {
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content || '';
        if (content) {
          res.raw.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      res.raw.write('data: [DONE]\n\n');
    } catch (error) {
      res.raw.write(
        `data: ${JSON.stringify({ error: (error as Error).message })}\n\n`,
      );
    } finally {
      res.raw.end();
    }
  }
}
