import { OpenAI } from 'openai';

export interface ProviderConfig {
  type: string;
  baseUrl: string | null;
  apiKey: string | null;
}

const DEFAULT_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com',
  anthropic: 'https://api.anthropic.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
};

export function createAiClient(provider: ProviderConfig): OpenAI {
  const baseURL =
    provider.baseUrl || DEFAULT_BASE_URLS[provider.type] || undefined;

  return new OpenAI({
    apiKey: provider.apiKey || undefined,
    baseURL,
  });
}
