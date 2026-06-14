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

// ============ 通知公告 ============

export interface NoticeItem {
  id: string;
  title: string | null;
  summary: string | null;
  content: string | null;
  category: string | null; // system=系统 release=发布 maintenance=维护 security=安全
  status: number | null; // 0=草稿 1=已发布 2=已归档
  publishedAt: string | null;
  remark: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface NoticeListResult {
  list: NoticeItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateNoticeParams {
  title: string;
  summary?: string;
  content: string;
  category?: string;
  status?: number;
  remark?: string;
}

export interface UpdateNoticeParams {
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  status?: number;
  remark?: string;
}

export interface QueryNoticeParams {
  page?: number;
  pageSize?: number;
  title?: string;
  category?: string;
  status?: number;
}

// ============ 定时任务 ============

export interface JobItem {
  id: string;
  name: string | null;
  group: string | null;
  handler: string | null;
  cron: string | null;
  status: number | null; // 0=暂停 1=运行
  remark: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface JobListResult {
  list: JobItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateJobParams {
  name: string;
  group?: string;
  handler: string;
  cron: string;
  status?: number;
  remark?: string;
}

export interface UpdateJobParams {
  name?: string;
  group?: string;
  handler?: string;
  cron?: string;
  status?: number;
  remark?: string;
}

export interface QueryJobParams {
  page?: number;
  pageSize?: number;
  name?: string;
  group?: string;
  handler?: string;
  status?: number;
}

// ============ 任务日志 ============

export interface JobLogItem {
  id: string;
  jobId: string | null;
  handler: string | null;
  status: number | null; // 0=成功 1=失败
  result: string | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string | null;
}

export interface JobLogListResult {
  list: JobLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryJobLogParams {
  page?: number;
  pageSize?: number;
  jobId?: string;
  handler?: string;
  status?: number;
}

// ============ 系统配置 ============

export interface ConfigItem {
  id: string;
  name: string | null;
  key: string | null;
  value: string | null;
  type: number | null; // 0=系统内置 1=自定义
  status: number | null; // 0=启用 1=禁用
  remark: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ConfigListResult {
  list: ConfigItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateConfigParams {
  name: string;
  key: string;
  value: string;
  type?: number;
  status?: number;
  remark?: string;
}

export interface UpdateConfigParams {
  name?: string;
  key?: string;
  value?: string;
  type?: number;
  status?: number;
  remark?: string;
}

export interface QueryConfigParams {
  page?: number;
  pageSize?: number;
  name?: string;
  key?: string;
  type?: number;
  status?: number;
}

// ============ 会话管理 ============

export interface SessionItem {
  id: string;
  sid: string | null;
  userId: string | null;
  userType: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  platform: string | null;
  loginAt: string | null;
  lastActiveAt: string | null;
  logoutAt: string | null;
  createdAt: string | null;
  online: boolean;
}

export interface SessionListResult {
  list: SessionItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuerySessionParams {
  page?: number;
  pageSize?: number;
  userType?: string;
  ip?: string;
}
