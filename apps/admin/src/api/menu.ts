import request from '../utils/request';
import type { MenuItem, CreateMenuParams, UpdateMenuParams, QueryMenuParams } from '../types/api';

export const getMenuList = (params?: QueryMenuParams) =>
  request.get<any, MenuItem[]>('/system/menu', { params });

export const getMenuDetail = (id: string) =>
  request.get<any, MenuItem>(`/system/menu/${id}`);

export const createMenu = (data: CreateMenuParams) =>
  request.post<any, MenuItem>('/system/menu', data);

export const updateMenu = (id: string, data: UpdateMenuParams) =>
  request.put<any, MenuItem>(`/system/menu/${id}`, data);

export const deleteMenu = (id: string) =>
  request.delete<any, void>(`/system/menu/${id}`);
