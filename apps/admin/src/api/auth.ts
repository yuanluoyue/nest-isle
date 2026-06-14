import request from '../utils/request';
import type { LoginParams, LoginResult, UserProfile, MenuItem, UpdateProfileParams } from '../types/api';

export const login = (data: LoginParams) =>
  request.post<any, LoginResult>('/auth/login', data);

export const getProfile = () =>
  request.get<any, UserProfile>('/auth/profile');

export const updateProfile = (data: UpdateProfileParams) =>
  request.put<any, UserProfile>('/auth/profile', data);

export const refreshToken = (refreshToken: string) =>
  request.post<any, { accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });

export const getUserMenus = () =>
  request.get<any, MenuItem[]>('/auth/menus');

export const getCaptcha = () =>
  request.get<any, { captchaId: string; svg: string }>('/auth/captcha');
