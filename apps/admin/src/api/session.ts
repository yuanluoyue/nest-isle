import request from '../utils/request';
import type { SessionItem, SessionListResult, QuerySessionParams } from '../types/api';

export const getSessionList = (params: QuerySessionParams) =>
  request.get<any, SessionListResult>('/monitor/session', { params });

export const forceLogout = (id: string) =>
  request.post<any, { success: boolean }>(`/monitor/session/${id}/force-logout`);
