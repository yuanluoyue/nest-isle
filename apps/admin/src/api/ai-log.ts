import request from '../utils/request';
import type {
  AiLogItem,
  AiLogListResult,
  QueryAiLogParams,
} from '../types/api';

export const getAiLogList = (params: QueryAiLogParams) =>
  request.get<any, AiLogListResult>('/ai/log', { params });

export const getAiLogDetail = (id: string) =>
  request.get<any, AiLogItem>(`/ai/log/${id}`);
