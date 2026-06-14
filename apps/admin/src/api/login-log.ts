import request from '../utils/request';
import type { LoginLogListResult, LoginLogItem, QueryLoginLogParams } from '../types/api';

export const getLoginLogList = (params: QueryLoginLogParams) =>
  request.get<any, LoginLogListResult>('/monitor/login-log', { params });

export const getLoginLogDetail = (id: string) =>
  request.get<any, LoginLogItem>(`/monitor/login-log/${id}`);
