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

// ============ AI Provider ============

export interface AiProviderItem {
  id: string;
  name: string | null;
  type: string | null;
  baseUrl: string | null;
  apiKey: string | null;
  enabled: number | null;
  priority: number | null;
  remark: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface AiProviderListResult {
  list: AiProviderItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAiProviderParams {
  name: string;
  type: string;
  baseUrl?: string;
  apiKey?: string;
  enabled?: number;
  priority?: number;
  remark?: string;
}

export interface UpdateAiProviderParams {
  name?: string;
  type?: string;
  baseUrl?: string;
  apiKey?: string;
  enabled?: number;
  priority?: number;
  remark?: string;
}

export interface QueryAiProviderParams {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: string;
  enabled?: number;
}

// ============ AI Model ============

export interface AiModelItem {
  id: string;
  providerId: string | null;
  name: string | null;
  displayName: string | null;
  modelType: string | null;
  enabled: number | null;
  isDefault: number | null;
  contextLength: number | null;
  inputPrice: string | null;
  outputPrice: string | null;
  remark: string | null;
  provider?: AiProviderItem;
}

export interface AiModelListResult {
  list: AiModelItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAiModelParams {
  providerId: string;
  name: string;
  displayName?: string;
  modelType: string;
  enabled?: number;
  isDefault?: number;
  contextLength?: number;
  inputPrice?: string;
  outputPrice?: string;
  remark?: string;
}

export interface UpdateAiModelParams {
  providerId?: string;
  name?: string;
  displayName?: string;
  modelType?: string;
  enabled?: number;
  isDefault?: number;
  contextLength?: number;
  inputPrice?: string;
  outputPrice?: string;
  remark?: string;
}

export interface QueryAiModelParams {
  page?: number;
  pageSize?: number;
  providerId?: string;
  modelType?: string;
  enabled?: number;
}

// ============ AI Prompt ============

export interface AiPromptItem {
  id: string;
  code: string | null;
  name: string | null;
  content: string | null;
  version: number | null;
  enabled: number | null;
  remark: string | null;
}

export interface AiPromptListResult {
  list: AiPromptItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAiPromptParams {
  code: string;
  name: string;
  content: string;
  version?: number;
  enabled?: number;
  remark?: string;
}

export interface UpdateAiPromptParams {
  code?: string;
  name?: string;
  content?: string;
  version?: number;
  enabled?: number;
  remark?: string;
}

export interface QueryAiPromptParams {
  page?: number;
  pageSize?: number;
  code?: string;
  name?: string;
  enabled?: number;
}

// ============ AI Log ============

export interface AiLogItem {
  id: string;
  providerId: string | null;
  modelId: string | null;
  userId: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  duration: number | null;
  status: number | null;
  error: string | null;
  createdAt: string | null;
  provider?: AiProviderItem;
  model?: AiModelItem;
}

export interface AiLogListResult {
  list: AiLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryAiLogParams {
  page?: number;
  pageSize?: number;
  providerId?: string;
  modelId?: string;
  status?: number;
}

// ============ 表单管理 ============

export interface FormItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  schema: Record<string, any> | null;
  publishedSchema: Record<string, any> | null;
  status: number | null; // 0=草稿 1=已发布 2=停用
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FormListResult {
  list: FormItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateFormParams {
  name: string;
  code: string;
  description?: string;
  schema?: Record<string, any>;
}

export interface UpdateFormParams {
  name?: string;
  code?: string;
  description?: string;
  schema?: Record<string, any>;
}

export interface QueryFormParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
}

// ============ 表单数据 ============

export interface FormRecordItem {
  id: string;
  formId: string;
  data: Record<string, any> | null;
  createdBy: string | null;
  createdAt: string;
}

export interface FormRecordListResult {
  list: FormRecordItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateFormRecordParams {
  formId: string;
  data?: Record<string, any>;
}

export interface QueryFormRecordParams {
  page?: number;
  pageSize?: number;
  formId?: string;
}

// ============ 数据源管理 ============

export interface FormDatasourceItem {
  id: string;
  name: string | null;
  code: string | null;
  type: string | null; // dict/api/static
  config: Record<string, any> | null;
  createdAt: string | null;
}

export interface FormDatasourceListResult {
  list: FormDatasourceItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateFormDatasourceParams {
  name: string;
  code: string;
  type?: string;
  config?: Record<string, any>;
}

export interface UpdateFormDatasourceParams {
  name?: string;
  code?: string;
  type?: string;
  config?: Record<string, any>;
}

export interface QueryFormDatasourceParams {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: string;
}

// ============ 表单版本 ============

export interface FormVersionItem {
  id: string;
  formId: string;
  version: number;
  schema: Record<string, any>;
  remark: string | null;
  isPublished: number | null; // 0=否 1=是
  createdBy: string | null;
  createdAt: string;
}

export interface FormVersionListResult {
  list: FormVersionItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryFormVersionParams {
  page?: number;
  pageSize?: number;
  formId?: string;
}

// ============ 站内信 ============

export interface NotificationItem {
  id: string;
  type: string | null; // announcement | role_change
  title: string | null;
  content: string | null;
  link: string | null;
  payload: Record<string, unknown> | null;
  priority: number | null; // 0=普通 1=重要 2=紧急
  createdBy: string | null;
  createdAt: string | null;
}

export interface NotificationReceiverItem {
  id: string;
  notificationId: string | null;
  receiverId: string | null;
  status: string | null; // unread | read
  readAt: string | null;
  createdAt: string | null;
  notification?: NotificationItem | null;
}

export interface NotificationListResult {
  list: NotificationReceiverItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryNotificationParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
}

// ============ 全局搜索 ============

export interface SearchItem {
  id: string;
  provider: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  url: string;
  score?: number;
}

export interface SearchHistoryItem {
  id: string;
  keyword: string;
  createdAt: string;
}
