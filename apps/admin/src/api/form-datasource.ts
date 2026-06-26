import request from '../utils/request';
import type {
  FormDatasourceListResult,
  FormDatasourceItem,
  CreateFormDatasourceParams,
  UpdateFormDatasourceParams,
  QueryFormDatasourceParams,
} from '../types/api';

export const getFormDatasourceList = (params: QueryFormDatasourceParams) =>
  request.get<any, FormDatasourceListResult>('/form/datasource', { params });

export const getFormDatasourceDetail = (id: string) =>
  request.get<any, FormDatasourceItem>(`/form/datasource/${id}`);

export const createFormDatasource = (data: CreateFormDatasourceParams) =>
  request.post<any, FormDatasourceItem>('/form/datasource', data);

export const updateFormDatasource = (id: string, data: UpdateFormDatasourceParams) =>
  request.put<any, FormDatasourceItem>(`/form/datasource/${id}`, data);

export const deleteFormDatasource = (id: string) =>
  request.delete<any, void>(`/form/datasource/${id}`);
