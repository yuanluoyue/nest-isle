import request from '../utils/request';
import type {
  AiProviderItem,
  AiProviderListResult,
  CreateAiProviderParams,
  UpdateAiProviderParams,
  QueryAiProviderParams,
} from '../types/api';

export const getProviderList = (params: QueryAiProviderParams) =>
  request.get<any, AiProviderListResult>('/ai/provider', { params });

export const getProviderDetail = (id: string) =>
  request.get<any, AiProviderItem>(`/ai/provider/${id}`);

export const createProvider = (data: CreateAiProviderParams) =>
  request.post<any, AiProviderItem>('/ai/provider', data);

export const updateProvider = (id: string, data: UpdateAiProviderParams) =>
  request.put<any, AiProviderItem>(`/ai/provider/${id}`, data);

export const deleteProvider = (id: string) =>
  request.delete<any, void>(`/ai/provider/${id}`);

export const testProviderConnection = (id: string) =>
  request.post<any, { success: boolean; message?: string }>(`/ai/provider/${id}/test`);
