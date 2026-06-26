# Nest Isle

基于 NestJS + React 的后台管理系统，pnpm monorepo 架构。内置 RBAC 权限、AI 能力（LLM 网关）、可视化表单设计器等模块。

## 技术栈

**后端** — NestJS 11 + SWC · Drizzle ORM + PostgreSQL 16 · Redis · MinIO · JWT 认证 · OpenAI SDK（LLM 网关）· Winston 日志 · Swagger

**前端** — React 19 + Vite 6 · Ant Design 6 · Zustand 5 · React Router v7 · form-render + fr-generator（表单设计器）

**基础设施** — Docker Compose（PostgreSQL 16 + Redis + MinIO）

## 功能模块

| 模块 | 功能 |
| --- | --- |
| 认证 | 登录（图形验证码）、JWT 双 Token、无感刷新、登出 |
| 会话管理 | Session 存 Redis、在线状态查询、强制下线 |
| RBAC 权限 | 用户-角色-菜单、动态菜单、按钮级权限 |
| 用户管理 | CRUD、重置密码、分配角色 |
| 角色管理 | CRUD、分配菜单权限 |
| 菜单管理 | 树形 CRUD、目录/菜单/按钮三种类型 |
| 字典管理 | 字典类型 + 字典项 CRUD |
| 通知公告 | CRUD、草稿/发布/归档状态、分类管理 |
| 系统配置 | CRUD、Redis 缓存、刷新缓存 |
| 定时任务 | CRUD、Cron 调度、启动/停止/立即执行 |
| 操作日志 | 自动记录敏感操作 |
| 登录日志 | 记录 IP、UA、浏览器、OS |
| 文件管理 | StorageAdapter 抽象 + MinIO 实现 |
| 仪表盘 | 用户数、文件大小等统计 |
| AI 能力 | LLM 供应商/模型管理、Prompt 模板、Playground 调试（SSE 流式）、调用日志 |
| 表单引擎 | 可视化表单设计器、数据源管理、表单填写、数据预览、AI 生成 Schema |
| 个人中心 | 查看/编辑信息、上传头像 |

## 认证流程

```
登录：验证码校验 → 账号密码 → 创建 Session → 写 Redis → 签发 JWT
鉴权：解析 JWT → 获取 sid → 查询 Redis → 有效则通过
登出：删除 Redis Session → 更新数据库
强制下线：删除 Redis Session → 用户请求立即 401
```

JWT Payload：`{ sub: userId, sid: sessionId, type: userType }`

## 目录结构

```
nest-isle/
├── apps/
│   ├── admin/                  # React 前端
│   │   └── src/
│   │       ├── api/            # 接口封装
│   │       ├── components/     # 公共组件（AuthGuard、SideMenu 等）
│   │       ├── hooks/
│   │       ├── layouts/        # AdminLayout
│   │       ├── pages/          # 页面（按模块划分）
│   │       │   ├── ai/         # AI 供应商/模型/Playground/Prompt/日志
│   │       │   ├── form/       # 表单设计/填写/数据/数据源
│   │       │   ├── system/     # 用户/角色/菜单/字典/通知/配置
│   │       │   ├── monitor/    # 操作日志/登录日志/定时任务/会话
│   │       │   └── ...
│   │       ├── router/         # 路由（懒加载 + 认证守卫）
│   │       ├── stores/         # Zustand
│   │       └── utils/          # Axios 封装、自动刷新 Token、数据源解析
│   └── server/                 # NestJS 后端
│       └── src/
│           ├── common/         # 中间件、拦截器、过滤器、装饰器
│           ├── config/         # 配置
│           ├── core/           # 基础设施
│           │   ├── auth/       # JWT 策略、Guard、CurrentUser 装饰器
│           │   ├── cache/      # CacheService 抽象 + Redis 实现
│           │   ├── logger/     # Winston + 每日滚动
│           │   ├── queue/      # BullMQ
│           │   └── storage/    # StorageAdapter 抽象 + MinIO 实现
│           ├── database/       # Drizzle schema、migrations、seeds
│           └── modules/        # 业务模块
│               ├── ai/         # 供应商/模型/Prompt/Playground/日志
│               ├── auth/       # 登录、验证码、个人信息
│               ├── dashboard/
│               ├── file/
│               ├── form/       # 表单/数据源/记录/版本
│               ├── health/
│               ├── monitor/    # 操作日志/登录日志/定时任务/会话
│               └── system/     # 用户/角色/菜单/字典/通知/配置
├── docker/
│   └── docker-compose.dev.yml
├── data/                       # 持久化目录（gitignored）
└── .trae/rules/                # 项目规则
```

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 10
- Docker

### 安装

```bash
pnpm install
```

### 启动基础服务

```bash
pnpm docker:dev
```

| 服务 | 地址 | 凭证 |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | `postgres / postgres`，数据库 `nest_isle` |
| Redis | `localhost:6379` | 无密码 |
| MinIO API | `localhost:9000` | `minioadmin / minioadmin` |
| MinIO 控制台 | `localhost:9001` | `minioadmin / minioadmin` |

### 初始化数据库

```bash
pnpm --filter server run db:migrate   # 执行迁移
pnpm db:seed                          # 写入种子数据（幂等）
```

种子默认创建：部门 `总公司`、角色 `admin`、用户 `admin / 123456`、全部菜单和权限、表单 Schema 生成器 Prompt。

### 启动开发

```bash
pnpm server:dev    # 后端 http://localhost:3000
pnpm admin:dev     # 前端 http://localhost:5173
```

- API 基础路径：`http://localhost:3000/api/v1`
- Swagger 文档：`http://localhost:3000/api-docs`

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm docker:dev` | 启动 PostgreSQL + Redis + MinIO |
| `pnpm server:dev` | 启动后端（watch） |
| `pnpm admin:dev` | 启动前端（vite） |
| `pnpm db:seed` | 写入/同步种子数据（幂等） |
| `pnpm --filter server run db:generate` | 生成迁移文件 |
| `pnpm --filter server run db:migrate` | 执行迁移 |
| `pnpm --filter server run db:studio` | Drizzle Studio |
| `pnpm --filter server run lint` | 后端 lint |
| `pnpm --filter server run test` | 后端测试 |
| `pnpm --filter admin run build` | 前端构建 |
| `pnpm --filter admin run lint` | 前端 lint |

## 环境变量

配置文件位于 `apps/server/.env`（`.env.local` 优先级更高）。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3000` | 后端端口 |
| `DB_HOST` | `localhost` | 数据库主机 |
| `DB_PORT` | `5432` | 数据库端口 |
| `DB_NAME` | `nest_isle` | 数据库名 |
| `DB_USER` | `postgres` | 数据库用户 |
| `DB_PASSWORD` | `postgres` | 数据库密码 |
| `JWT_SECRET` | `nest-isle-secret` | JWT 密钥（生产必改） |
| `JWT_EXPIRES_IN` | `7d` | accessToken 过期时间 |
| `REDIS_HOST` | `localhost` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `REDIS_DB` | `0` | Redis 数据库索引 |
| `MINIO_ENDPOINT` | `localhost` | MinIO 地址 |
| `MINIO_PORT` | `9000` | MinIO 端口 |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO Access Key |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO Secret Key |
| `MINIO_USE_SSL` | `false` | MinIO 是否启用 SSL |
| `MINIO_BUCKET` | `nest-isle` | 默认桶 |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | 文件访问地址 |

## AI 模块

基于 OpenAI SDK 统一接入各类 LLM 供应商（OpenAI / DeepSeek / Anthropic / Gemini），通过 OpenAI 兼容协议调用。

- **供应商管理**：配置 API Key、BaseURL、类型
- **模型管理**：关联供应商，设置模型名、上下文长度、价格、默认模型
- **Prompt 模板**：按 code 存取，版本管理，启用/禁用
- **Playground**：SSE 流式对话调试
- **调用日志**：自动记录 token 用量、耗时、状态

业务侧通过 `AiService.chat(modelName, messages, userId)` 调用，自动写入调用日志。

## 表单引擎

基于 form-render + fr-generator 实现的可视化表单系统。

- **表单设计器**：拖拽式可视化设计，支持自定义组件面板、AI 生成 Schema
- **数据源管理**：支持字典 / API / 静态数据三种类型，表单组件可绑定数据源自动加载选项
- **表单填写**：根据已发布 Schema 渲染表单，提交数据到记录表
- **数据预览**：以只读模式渲染表单组件 + 已填数据
- **版本管理**：发布表单时生成版本快照

