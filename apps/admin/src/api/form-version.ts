import request from '../utils/request';
import type {
  FormVersionListResult,
  FormVersionItem,
  QueryFormVersionParams,
} from '../types/api';

export const getFormVersionList = (params: QueryFormVersionParams) =>
  request.get<any, FormVersionListResult>('/form/version', { params });

export const getFormVersionDetail = (id: string) =>
  request.get<any, FormVersionItem>(`/form/version/${id}`);
