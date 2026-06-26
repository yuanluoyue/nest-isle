import request from '../utils/request';
import type {
  FormListResult,
  FormItem,
  CreateFormParams,
  UpdateFormParams,
  QueryFormParams,
} from '../types/api';

export const getFormList = (params: QueryFormParams) =>
  request.get<any, FormListResult>('/form/form', { params });

export const getFormDetail = (id: string) =>
  request.get<any, FormItem>(`/form/form/${id}`);

export const createForm = (data: CreateFormParams) =>
  request.post<any, FormItem>('/form/form', data);

export const updateForm = (id: string, data: UpdateFormParams) =>
  request.put<any, FormItem>(`/form/form/${id}`, data);

export const deleteForm = (id: string) =>
  request.delete<any, void>(`/form/form/${id}`);

export const publishForm = (id: string) =>
  request.put<any, FormItem>(`/form/form/${id}/publish`);

export const unpublishForm = (id: string) =>
  request.put<any, FormItem>(`/form/form/${id}/unpublish`);

export const getPublishedSchema = (code: string) =>
  request.get<any, { schema: Record<string, any> }>(`/form/form/published/${code}`);
