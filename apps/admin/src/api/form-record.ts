import request from '../utils/request';
import type {
  FormRecordListResult,
  FormRecordItem,
  CreateFormRecordParams,
  QueryFormRecordParams,
} from '../types/api';

export const getFormRecordList = (params: QueryFormRecordParams) =>
  request.get<any, FormRecordListResult>('/form/record', { params });

export const getFormRecordDetail = (id: string) =>
  request.get<any, FormRecordItem>(`/form/record/${id}`);

export const createFormRecord = (data: CreateFormRecordParams) =>
  request.post<any, FormRecordItem>('/form/record', data);

export const deleteFormRecord = (id: string) =>
  request.delete<any, void>(`/form/record/${id}`);
