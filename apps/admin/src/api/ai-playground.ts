import { useAuthStore } from '../stores/auth';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface StreamChatParams {
  modelId: string;
  messages: ChatMessage[];
}

export const streamChat = async (
  params: StreamChatParams,
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
) => {
  const token = useAuthStore.getState().accessToken;

  try {
    const response = await fetch('/api/v1/ai/playground/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      onError(`请求失败: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('无法读取响应流');
      return;
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch {
            // ignore parse errors for partial chunks
          }
        }
      }
    }

    onDone();
  } catch (err) {
    onError((err as Error).message || '未知错误');
  }
};
