export interface LoginParams {
  username: string;
  password: string;
  captchaId: string;
  captchaCode: string;
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

// ============ 登录日志 ============

export interface LoginLogItem {
  id: string;
  userId: string | null;
  username: string | null;
  ip: string | null;
  location: string | null;
  browser: string | null;
  os: string | null;
  userAgent: string | null;
  status: number | null;
  message: string | null;
  createdAt: string | null;
}

export interface LoginLogListResult {
  list: LoginLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryLoginLogParams {
  page?: number;
  pageSize?: number;
  username?: string;
  ip?: string;
  status?: number;
}

// ============ 角色管理 ============

export interface MenuItem {
  id: string;
  parentId: string | null;
  name: string | null;
  type: number | null;
  path: string | null;
  component: string | null;
  permission: string | null;
  icon: string | null;
  sort: number | null;
  visible: number | null;
  status: number | null;
  createdAt?: string;
  updatedAt?: string;
  children?: MenuItem[];
}

export interface CreateMenuParams {
  parentId?: string;
  name: string;
  type: number;
  path?: string;
  component?: string;
  permission?: string;
  icon?: string;
  sort?: number;
  visible?: number;
  status?: number;
}

export interface UpdateMenuParams {
  parentId?: string;
  name?: string;
  type?: number;
  path?: string;
  component?: string;
  permission?: string;
  icon?: string;
  sort?: number;
  visible?: number;
  status?: number;
}

export interface QueryMenuParams {
  name?: string;
  type?: number;
  status?: number;
}

export interface RoleItem {
  id: string;
  name: string;
  code: string;
  sort: number | null;
  status: number | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  menuIds?: string[];
}

export interface RoleListResult {
  list: RoleItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateRoleParams {
  name: string;
  code: string;
  sort?: number;
  status?: number;
  remark?: string;
}

export interface UpdateRoleParams {
  name?: string;
  code?: string;
  sort?: number;
  status?: number;
  remark?: string;
}

export interface QueryRoleParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
}

// ============ 仪表盘 ============

export interface DashboardStats {
  userCount: number;
  totalFileSize: number;
}

export interface UpdateProfileParams {
  nickname?: string;
  email?: string;
  phone?: string;
  gender?: number;
  avatar?: string;
}

// ============ 字典管理 ============

export interface DictTypeItem {
  id: string;
  name: string | null;
  code: string | null;
  status: number | null;
  remark: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DictTypeListResult {
  list: DictTypeItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateDictTypeParams {
  name: string;
  code: string;
  status?: number;
  remark?: string;
}

export interface UpdateDictTypeParams {
  name?: string;
  code?: string;
  status?: number;
  remark?: string;
}

export interface QueryDictTypeParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
}

export interface DictItem {
  id: string;
  dictTypeId: string | null;
  label: string | null;
  value: string | null;
  sort: number | null;
  color: string | null;
  status: number | null;
  extra: Record<string, unknown> | null;
  remark: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateDictItemParams {
  dictTypeId: string;
  label: string;
  value: string;
  sort?: number;
  color?: string;
  status?: number;
  extra?: Record<string, unknown>;
  remark?: string;
}

export interface UpdateDictItemParams {
  dictTypeId?: string;
  label?: string;
  value?: string;
  sort?: number;
  color?: string;
  status?: number;
  extra?: Record<string, unknown>;
  remark?: string;
}

export interface QueryDictItemParams {
  dictTypeId?: string;
  dictTypeCode?: string;
  label?: string;
  status?: number;
}
