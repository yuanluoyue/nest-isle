import { OpenAI } from 'openai';
import { createAiClient } from './create-ai-client';

jest.mock('openai', () => ({
  __esModule: true,
  OpenAI: jest.fn().mockImplementation((opts) => ({ __opts: opts })),
}));

const MockedOpenAI = OpenAI as unknown as jest.Mock;

describe('createAiClient', () => {
  beforeEach(() => {
    MockedOpenAI.mockClear();
  });

  it('指定 baseUrl 时优先使用传入值', () => {
    createAiClient({
      type: 'openai',
      baseUrl: 'https://custom.example.com/v1',
      apiKey: 'sk-x',
    });

    expect(MockedOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk-x',
      baseURL: 'https://custom.example.com/v1',
    });
  });

  it('未指定 baseUrl 时按 type 解析默认 URL', () => {
    createAiClient({ type: 'deepseek', baseUrl: null, apiKey: 'sk' });

    expect(MockedOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk',
      baseURL: 'https://api.deepseek.com',
    });
  });

  it('gemini 使用 OpenAI 兼容端点', () => {
    createAiClient({ type: 'gemini', baseUrl: null, apiKey: 'sk' });

    expect(MockedOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    });
  });

  it('未知 type 且无 baseUrl 时 baseURL 为 undefined', () => {
    createAiClient({ type: 'unknown', baseUrl: null, apiKey: 'sk' });

    expect(MockedOpenAI).toHaveBeenCalledWith({
      apiKey: 'sk',
      baseURL: undefined,
    });
  });

  it('apiKey 为 null 时传 undefined 给 OpenAI', () => {
    createAiClient({ type: 'openai', baseUrl: null, apiKey: null });

    expect(MockedOpenAI).toHaveBeenCalledWith({
      apiKey: undefined,
      baseURL: 'https://api.openai.com/v1',
    });
  });
});
