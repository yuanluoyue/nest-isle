# AI 能力模块 Spec

## Why
系统需要集成 AI 大模型能力，支持多 Provider（DeepSeek/OpenAI/Anthropic/Gemini）接入，提供统一的模型调用、Prompt 管理和 Playground 调试能力，并记录调用日志用于成本追踪。

## What Changes
- 新增 `modules/ai` 业务模块，包含 provider、model、prompt、playground、log 五个子模块
- 新增 4 张数据库表：`sys_ai_provider`、`sys_ai_model`、`sys_ai_prompt`、`sys_ai_log`
- 新增 `AiService` 统一调用服务，基于 OpenAI SDK（DeepSeek 兼容 OpenAI API）
- 新增前端 AI 能力菜单组及 5 个管理页面
- 安装 `openai` npm 包

## Impact
- Affected code: `app.module.ts`、`database/schema/index.ts`、`database/schema/relations.ts`、`database/seeds/admin.seed.ts`、前端路由/类型/图标/API
- 新增依赖: `openai` SDK

## ADDED Requirements

### Requirement: AI Provider 管理
系统 SHALL 提供 AI Provider CRUD 功能，每个 Provider 包含 name、type（openai/anthropic/gemini）、baseUrl、apiKey、enabled、priority、remark 字段。type 决定使用哪个 SDK 进行调用。

#### Scenario: 创建 Provider
- **WHEN** 管理员填写 Provider 信息并提交
- **THEN** 系统创建 Provider 记录，apiKey 加密存储

#### Scenario: 测试 Provider 连通性
- **WHEN** 管理员点击测试连接
- **THEN** 系统使用该 Provider 配置发送简单请求验证连通性，返回成功或失败信息

### Requirement: AI Model 管理
系统 SHALL 提供 AI Model CRUD 功能，每个 Model 关联一个 Provider，包含 name、displayName、modelType（chat/embedding）、enabled、isDefault、contextLength、inputPrice、outputPrice、remark 字段。

#### Scenario: 设置默认模型
- **WHEN** 管理员将某个模型设为默认
- **THEN** 系统取消同类型其他模型的默认标记，确保每种 modelType 只有一个默认模型

### Requirement: AI Prompt 管理
系统 SHALL 提供 Prompt CRUD 功能，每个 Prompt 包含 code（唯一标识）、name、content、version、enabled、remark 字段。

#### Scenario: 通过 code 获取 Prompt
- **WHEN** 系统内部或外部调用需要获取 Prompt 模板
- **THEN** 通过 code 查找对应的 Prompt 内容

### Requirement: AI Playground
系统 SHALL 提供 Playground 功能，允许用户选择模型、输入 Prompt 进行实时对话调试，流式返回结果。

#### Scenario: 流式对话
- **WHEN** 用户在 Playground 中发送消息
- **THEN** 系统以 SSE 流式返回模型响应，同时记录调用日志

### Requirement: AI 调用日志
系统 SHALL 自动记录每次 AI 调用的 providerId、modelId、userId、promptTokens、completionTokens、totalTokens、duration、status、error、createdAt。

#### Scenario: 查看调用日志
- **WHEN** 管理员查看调用日志列表
- **THEN** 显示日志详情，支持按 provider、model、状态、时间范围筛选

### Requirement: AiService 统一调用
系统 SHALL 提供 `AiService` 作为统一调用入口，封装模型选择、Provider 路由、日志记录逻辑。当前先接入 DeepSeek（兼容 OpenAI API，使用 openai SDK）。

#### Scenario: 调用 AI 模型
- **WHEN** 业务代码调用 `AiService.chat(modelName, messages)`
- **THEN** 系统根据 modelName 查找 Model 和 Provider，使用对应 SDK 发起请求，记录调用日志，返回结果

### Requirement: 数据库表设计

#### sys_ai_provider
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, defaultRandom | |
| name | varchar(100) | notNull | Provider 名称 |
| type | varchar(20) | notNull | openai/anthropic/gemini |
| baseUrl | varchar(500) | | API 基础地址 |
| apiKey | varchar(500) | | API Key |
| enabled | integer | default 0 | 0=启用 1=禁用 |
| priority | integer | default 0 | 优先级，数字越大越优先 |
| remark | varchar(500) | | 备注 |
| createdAt | timestamp | defaultNow | |
| updatedAt | timestamp | defaultNow | |

#### sys_ai_model
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, defaultRandom | |
| providerId | uuid | notNull | 关联 Provider |
| name | varchar(100) | notNull | 模型标识（如 deepseek-chat） |
| displayName | varchar(100) | | 显示名称 |
| modelType | varchar(20) | notNull | chat/embedding |
| enabled | integer | default 0 | 0=启用 1=禁用 |
| isDefault | integer | default 0 | 0=否 1=是 |
| contextLength | integer | | 上下文长度 |
| inputPrice | varchar(50) | | 输入价格 |
| outputPrice | varchar(50) | | 输出价格 |
| remark | varchar(500) | | 备注 |

#### sys_ai_prompt
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, defaultRandom | |
| code | varchar(100) | notNull, unique | 唯一标识 |
| name | varchar(100) | notNull | 名称 |
| content | text | notNull | Prompt 内容 |
| version | integer | default 1 | 版本号 |
| enabled | integer | default 0 | 0=启用 1=禁用 |
| remark | varchar(500) | | 备注 |

#### sys_ai_log
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, defaultRandom | |
| providerId | uuid | | 关联 Provider |
| modelId | uuid | | 关联 Model |
| userId | uuid | | 调用用户 |
| promptTokens | integer | | 输入 token 数 |
| completionTokens | integer | | 输出 token 数 |
| totalTokens | integer | | 总 token 数 |
| duration | integer | | 耗时（ms） |
| status | integer | notNull | 0=成功 1=失败 |
| error | text | | 错误信息 |
| createdAt | timestamp | defaultNow | |

### Requirement: 前端菜单结构
AI 能力（目录，icon: RobotOutlined）
├── Provider 管理（/ai/provider）
├── Model 管理（/ai/model）
├── Playground（/ai/playground）
├── Prompt 管理（/ai/prompt）
└── 调用日志（/ai/log）
