export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string | null;
  avatar: string | null;
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

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  time: string;
}

// ============ 用户管理 ============

export interface UserRole {
  id: string;
  name: string;
  code: string;
}

export interface UserItem {
  id: string;
  username: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  gender: number | null;
  avatar: string | null;
  deptId: string | null;
  status: number | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

export interface UserListResult {
  list: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserParams {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
  gender?: number;
  deptId?: string;
  status?: number;
  remark?: string;
}

export interface UpdateUserParams {
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  gender?: number;
  avatar?: string;
  deptId?: string;
  status?: number;
  remark?: string;
}

export interface QueryUserParams {
  page?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  phone?: string;
  status?: number;
}

// ============ 操作日志 ============

export interface OperateLogItem {
  id: string;
  userId: string | null;
  module: string | null;
  description: string | null;
  method: string | null;
  url: string | null;
  ip: string | null;
  status: number | null;
  request: string | null;
  response: string | null;
  createdAt: string | null;
}

export interface OperateLogListResult {
  list: OperateLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryOperateLogParams {
  page?: number;
  pageSize?: number;
  module?: string;
  description?: string;
  status?: number;
}
