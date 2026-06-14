import request from '../utils/request';
import type { RoleListResult, RoleItem, CreateRoleParams, UpdateRoleParams, QueryRoleParams, MenuItem } from '../types/api';

export const getRoleList = (params: QueryRoleParams) =>
  request.get<any, RoleListResult>('/system/role', { params });

export const getRoleDetail = (id: string) =>
  request.get<any, RoleItem>(`/system/role/${id}`);

export const createRole = (data: CreateRoleParams) =>
  request.post<any, RoleItem>('/system/role', data);

export const updateRole = (id: string, data: UpdateRoleParams) =>
  request.put<any, RoleItem>(`/system/role/${id}`, data);

export const deleteRole = (id: string) =>
  request.delete<any, void>(`/system/role/${id}`);

export const assignRoleMenus = (id: string, menuIds: string[]) =>
  request.put<any, RoleItem>(`/system/role/${id}/menus`, { menuIds });

export const getMenuTree = () =>
  request.get<any, MenuItem[]>('/system/role/menu-tree');
