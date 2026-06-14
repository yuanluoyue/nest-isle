import request from '../utils/request';
import type { OperateLogListResult, OperateLogItem, QueryOperateLogParams } from '../types/api';

export const getOperateLogList = (params: QueryOperateLogParams) =>
  request.get<any, OperateLogListResult>('/monitor/operate-log', { params });

export const getOperateLogDetail = (id: string) =>
  request.get<any, OperateLogItem>(`/monitor/operate-log/${id}`);
