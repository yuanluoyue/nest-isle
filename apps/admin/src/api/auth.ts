import request from '../utils/request';
import type { LoginParams, LoginResult, UserProfile } from '../types/api';

export const login = (data: LoginParams) =>
  request.post<any, LoginResult>('/auth/login', data);

export const getProfile = () =>
  request.get<any, UserProfile>('/auth/profile');

export const refreshToken = (refreshToken: string) =>
  request.post<any, { accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
