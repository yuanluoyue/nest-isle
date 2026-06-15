import request from '../utils/request';
import type {
  AiModelItem,
  AiModelListResult,
  CreateAiModelParams,
  UpdateAiModelParams,
  QueryAiModelParams,
} from '../types/api';

export const getModelList = (params: QueryAiModelParams) =>
  request.get<any, AiModelListResult>('/ai/model', { params });

export const getModelDetail = (id: string) =>
  request.get<any, AiModelItem>(`/ai/model/${id}`);

export const createModel = (data: CreateAiModelParams) =>
  request.post<any, AiModelItem>('/ai/model', data);

export const updateModel = (id: string, data: UpdateAiModelParams) =>
  request.put<any, AiModelItem>(`/ai/model/${id}`, data);

export const deleteModel = (id: string) =>
  request.delete<any, void>(`/ai/model/${id}`);
