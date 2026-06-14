import request from '../utils/request';
import type {
  DictTypeItem,
  DictTypeListResult,
  CreateDictTypeParams,
  UpdateDictTypeParams,
  QueryDictTypeParams,
  DictItem,
  CreateDictItemParams,
  UpdateDictItemParams,
  QueryDictItemParams,
} from '../types/api';

// ---------- 字典类型 ----------
export const getDictTypeList = (params: QueryDictTypeParams) =>
  request.get<any, DictTypeListResult>('/system/dict/type', { params });

export const getDictTypeDetail = (id: string) =>
  request.get<any, DictTypeItem>(`/system/dict/type/${id}`);

export const createDictType = (data: CreateDictTypeParams) =>
  request.post<any, DictTypeItem>('/system/dict/type', data);

export const updateDictType = (id: string, data: UpdateDictTypeParams) =>
  request.put<any, DictTypeItem>(`/system/dict/type/${id}`, data);

export const deleteDictType = (id: string) =>
  request.delete<any, void>(`/system/dict/type/${id}`);

// ---------- 字典项 ----------
export const getDictItemList = (params: QueryDictItemParams) =>
  request.get<any, DictItem[]>('/system/dict/item', { params });

export const getDictItemDetail = (id: string) =>
  request.get<any, DictItem>(`/system/dict/item/${id}`);

export const createDictItem = (data: CreateDictItemParams) =>
  request.post<any, DictItem>('/system/dict/item', data);

export const updateDictItem = (id: string, data: UpdateDictItemParams) =>
  request.put<any, DictItem>(`/system/dict/item/${id}`, data);

export const deleteDictItem = (id: string) =>
  request.delete<any, void>(`/system/dict/item/${id}`);
