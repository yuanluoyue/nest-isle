import request from '../utils/request';
import type {
  ConfigItem,
  ConfigListResult,
  CreateConfigParams,
  UpdateConfigParams,
  QueryConfigParams,
} from '../types/api';

export const getConfigList = (params: QueryConfigParams) =>
  request.get<any, ConfigListResult>('/system/config', { params });

export const getConfigDetail = (id: string) =>
  request.get<any, ConfigItem>(`/system/config/${id}`);

export const getConfigByKey = (key: string) =>
  request.get<any, string>(`/system/config/key/${key}`);

export const createConfig = (data: CreateConfigParams) =>
  request.post<any, ConfigItem>('/system/config', data);

export const updateConfig = (id: string, data: UpdateConfigParams) =>
  request.put<any, ConfigItem>(`/system/config/${id}`, data);

export const deleteConfig = (id: string) =>
  request.delete<any, void>(`/system/config/${id}`);

export const refreshConfigCache = () =>
  request.post<any, { count: number }>('/system/config/refresh-cache');
