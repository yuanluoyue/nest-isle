import request from '../utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    nickname: string | null;
    avatar: string | null;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  gender: number | null;
  avatar: string | null;
  deptId: string | null;
  status: number | null;
}

export const login = (data: LoginParams) =>
  request.post<any, LoginResult>('/auth/login', data);

export const getProfile = () =>
  request.get<any, UserProfile>('/auth/profile');

export const refreshToken = (refreshToken: string) =>
  request.post<any, { accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
