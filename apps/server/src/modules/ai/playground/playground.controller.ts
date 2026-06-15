import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { PlaygroundService } from './playground.service';
import { JwtAuthGuard } from '../../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../../core/auth/current-user.decorator';

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
  async chat(
    @Body()
    body: {
      modelId: string;
      messages: ChatCompletionMessageParam[];
    },
    @Res() res: Response,
    @CurrentUser() user: { id: string },
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

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
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({ error: (error as Error).message })}\n\n`,
      );
    } finally {
      res.end();
    }
  }
}
