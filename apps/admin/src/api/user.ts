import request from '../utils/request';
import type { UserListResult, UserItem, CreateUserParams, UpdateUserParams, QueryUserParams } from '../types/api';

export const getUserList = (params: QueryUserParams) =>
  request.get<any, UserListResult>('/system/user', { params });

export const getUserDetail = (id: string) =>
  request.get<any, UserItem>(`/system/user/${id}`);

export const createUser = (data: CreateUserParams) =>
  request.post<any, UserItem>('/system/user', data);

export const updateUser = (id: string, data: UpdateUserParams) =>
  request.put<any, UserItem>(`/system/user/${id}`, data);

export const deleteUser = (id: string) =>
  request.delete<any, void>(`/system/user/${id}`);

export const resetPassword = (id: string, newPassword: string) =>
  request.put<any, void>(`/system/user/${id}/reset-password`, { newPassword });

export const assignUserRoles = (id: string, roleIds: string[]) =>
  request.put<any, UserItem>(`/system/user/${id}/roles`, { roleIds });
