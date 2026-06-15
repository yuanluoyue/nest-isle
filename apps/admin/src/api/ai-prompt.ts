import request from '../utils/request';
import type {
  AiPromptItem,
  AiPromptListResult,
  CreateAiPromptParams,
  UpdateAiPromptParams,
  QueryAiPromptParams,
} from '../types/api';

export const getPromptList = (params: QueryAiPromptParams) =>
  request.get<any, AiPromptListResult>('/ai/prompt', { params });

export const getPromptDetail = (id: string) =>
  request.get<any, AiPromptItem>(`/ai/prompt/${id}`);

export const createPrompt = (data: CreateAiPromptParams) =>
  request.post<any, AiPromptItem>('/ai/prompt', data);

export const updatePrompt = (id: string, data: UpdateAiPromptParams) =>
  request.put<any, AiPromptItem>(`/ai/prompt/${id}`, data);

export const deletePrompt = (id: string) =>
  request.delete<any, void>(`/ai/prompt/${id}`);
