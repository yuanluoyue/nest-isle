# Nest Isle

基于 NestJS + React 的通用后台管理系统模板，pnpm monorepo 架构，开箱即用。

## 技术栈

### 后端（apps/server）
- NestJS 11 + SWC
- Drizzle ORM + PostgreSQL
- JWT 双 Token 认证（accessToken + refreshToken）
- Passport + svg-captcha 登录验证码
- MinIO 对象存储（基于 StorageAdapter 抽象，可扩展 S3/OSS/COS）
- Winston 日志 + 每日滚动
- Swagger API 文档
- 全局：TraceId 中间件、统一响应拦截、全局异常过滤、操作日志拦截器

### 前端（apps/admin）
- React 19 + Vite 6 + TypeScript
- Ant Design 6
- Zustand 5（仅持久化 tokens）
- React Router v7
- Axios 封装请求、自动刷新 Token

### 基础设施
- pnpm workspace（monorepo）
- Docker Compose：PostgreSQL 16 + MinIO

## 已实现功能

- **认证**：登录（含图形验证码）、JWT 双 Token、刷新令牌、获取/修改个人信息、上传头像（替换头像时自动清理旧资源）
- **权限**：基于 RBAC（用户-角色-菜单），动态菜单 + 按钮级权限
- **系统管理**：用户管理、角色管理、菜单管理
- **系统监控**：操作日志、登录日志（记录 IP、UA、浏览器、操作系统、状态、消息）
- **仪表盘**：用户数、文件总大小等统计
- **文件系统**：StorageAdapter 抽象 + MinIO 实现，头像与普通文件分目录存储（avatars/、uploads/）
- **个人中心**：查看/编辑信息、上传头像、面包屑导航

## 目录结构

```
nest-isle/
├── apps/
│   ├── admin/                # React 前端
│   │   └── src/
│   │       ├── api/          # 接口封装
│   │       ├── components/   # 公共组件
│   │       ├── hooks/
│   │       ├── layouts/      # AdminLayout
│   │       ├── pages/        # 页面
│   │       ├── router/       # 路由
│   │       ├── stores/       # Zustand
│   │       ├── types/
│   │       └── utils/        # request 等
│   └── server/               # NestJS 后端
│       └── src/
│           ├── common/       # 中间件、拦截器、过滤器、装饰器
│           ├── config/       # 配置
│           ├── core/         # auth/cache/logger/queue 基础设施
│           ├── database/     # Drizzle schema、migrations、seeds
│           └── modules/      # 业务模块
│               ├── auth/
│               ├── dashboard/
│               ├── file/
│               ├── health/
│               ├── monitor/  # operate-log、login-log
│               └── system/   # user、role、menu
├── docker/
│   └── docker-compose.dev.yml
├── data/                     # postgres / minio 持久化目录（gitignored）
└── .trae/rules/              # 项目规则（数据库迁移、API 开发、UI 设计）
```

## 快速开始

### 1. 环境要求
- Node.js ≥ 20
- pnpm ≥ 10
- Docker（用于本地 PostgreSQL + MinIO）

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动基础服务

```bash
pnpm docker:dev
```

启动后会拉起：
- PostgreSQL：`localhost:5432`（user/password: `postgres/postgres`，db: `nest_isle`）
- MinIO API：`localhost:9000`，控制台：`localhost:9001`（账号 `minioadmin/minioadmin`）

### 4. 初始化数据库

```bash
# 执行迁移
pnpm --filter server run db:migrate

# 写入种子数据（管理员账号 + 菜单/权限）
pnpm db:seed
```

种子默认创建：
- 部门：`总公司`
- 角色：`admin`（超级管理员）
- 用户：`admin / 123456`
- 菜单：仪表盘、系统管理（用户/角色/菜单）、系统监控（操作日志/登录日志）

### 5. 启动开发服务

```bash
# 后端：http://localhost:3000  Swagger：http://localhost:3000/api
pnpm server:dev

# 前端：http://localhost:5173
pnpm admin:dev
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm docker:dev` | 启动本地 PostgreSQL + MinIO |
| `pnpm server:dev` | 启动后端（watch） |
| `pnpm admin:dev` | 启动前端（vite） |
| `pnpm db:seed` | 写入/同步种子数据（幂等） |
| `pnpm --filter server run db:generate` | 根据 schema 生成迁移 |
| `pnpm --filter server run db:migrate` | 执行迁移 |
| `pnpm --filter server run db:studio` | 打开 Drizzle Studio |
| `pnpm --filter server run lint` | 后端 lint |
| `pnpm --filter admin run build` | 前端构建 |

## 环境变量

后端默认从环境变量读取（见 `apps/server/src/config/configuration.ts`）：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3000` | 后端端口 |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `localhost` / `5432` / `nest_isle` / `postgres` / `postgres` | 数据库 |
| `JWT_SECRET` | `nest-isle-secret` | JWT 密钥（生产必改） |
| `JWT_EXPIRES_IN` | `7d` | accessToken 过期时间 |
| `MINIO_ENDPOINT` / `MINIO_PORT` | `localhost` / `9000` | MinIO 服务 |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | `minioadmin` / `minioadmin` | MinIO 凭证 |
| `MINIO_BUCKET` | `nest-isle` | 默认桶 |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | 对外访问地址（用于拼接文件 URL） |
| `MINIO_USE_SSL` | `false` | 是否启用 SSL |

## 项目规则

详见 `.trae/rules/`：

- **api-dev-checklist.md**：开发新接口要补 Swagger 文档；新功能涉及菜单/路由/权限要更新 seed；敏感操作要加操作日志
- **database-migration-safety.md**：只能用 Drizzle 定义 schema，禁止手写 SQL；迁移必须向前兼容；禁止 DROP/RENAME；新字段必须 nullable；菜单/权限/插入数据要走 seed
- **ui-design.md**：表格操作按钮使用 icon，hover 显示文字

## API 文档

后端启动后访问 `http://localhost:3000/api` 查看 Swagger。

## License

ISC
