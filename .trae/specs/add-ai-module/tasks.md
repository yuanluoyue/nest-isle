# Tasks

- [x] Task 1: 安装 openai SDK 依赖
  - [x] 在 apps/server 下执行 `pnpm add openai`

- [x] Task 2: 创建数据库 Schema（4 张表 + 关系 + 导出）
  - [x] 创建 sys-ai-provider.schema.ts
  - [x] 创建 sys-ai-model.schema.ts
  - [x] 创建 sys-ai-prompt.schema.ts
  - [x] 创建 sys-ai-log.schema.ts
  - [x] 在 relations.ts 中添加 Provider-Model 一对多、Provider-Log、Model-Log、User-Log 关系
  - [x] 在 schema/index.ts 中添加 4 个 export
  - [x] 执行 drizzle-kit generate 生成迁移

- [x] Task 3: 创建 Provider 子模块（后端 CRUD + 测试连接）
  - [x] 创建 dto/create-provider.dto.ts、update-provider.dto.ts、query-provider.dto.ts
  - [x] 创建 provider.service.ts（CRUD + testConnection 方法）
  - [x] 创建 provider.controller.ts（CRUD + POST /ai/provider/:id/test 端点）
  - [x] 创建 provider.module.ts

- [x] Task 4: 创建 Model 子模块（后端 CRUD + 默认模型逻辑）
  - [x] 创建 dto/create-model.dto.ts、update-model.dto.ts、query-model.dto.ts
  - [x] 创建 model.service.ts（CRUD + 设置默认模型时取消同类型其他默认）
  - [x] 创建 model.controller.ts
  - [x] 创建 model.module.ts

- [x] Task 5: 创建 Prompt 子模块（后端 CRUD）
  - [x] 创建 dto/create-prompt.dto.ts、update-prompt.dto.ts、query-prompt.dto.ts
  - [x] 创建 prompt.service.ts（CRUD + findByCode 方法）
  - [x] 创建 prompt.controller.ts
  - [x] 创建 prompt.module.ts

- [x] Task 6: 创建 AiService 统一调用服务
  - [x] 创建 ai.service.ts（chat 方法：根据 modelName 查找 Model+Provider，使用 openai SDK 调用，记录日志）
  - [x] 创建 ai.module.ts（聚合所有子模块，导出 AiService）

- [x] Task 7: 创建 Playground 子模块（SSE 流式对话）
  - [x] 创建 playground.controller.ts（POST /ai/playground/chat，SSE 流式返回）
  - [x] 创建 playground.service.ts（流式调用 + 日志记录）
  - [x] 创建 playground.module.ts

- [x] Task 8: 创建调用日志子模块（后端查询）
  - [x] 创建 dto/query-log.dto.ts
  - [x] 创建 log.service.ts（分页查询 + 统计）
  - [x] 创建 log.controller.ts（GET /ai/log）
  - [x] 创建 log.module.ts

- [x] Task 9: 创建 AI 聚合模块并注册到 AppModule
  - [x] 创建 modules/ai/ai.module.ts 聚合所有子模块
  - [x] 在 app.module.ts 中注册 AiModule

- [x] Task 10: 更新 Seed（AI 菜单 + 权限）
  - [x] 添加 AI 能力目录菜单
  - [x] 添加 Provider/Model/Prompt/Log 菜单和按钮权限
  - [x] Playground 菜单（仅查看权限，无按钮权限）
  - [x] 角色权限同步移到所有菜单创建之后

- [x] Task 11: 前端类型 + API 封装
  - [x] 在 types/api.ts 中添加 AiProvider/AiModel/AiPrompt/AiLog 相关类型
  - [x] 创建 api/ai-provider.ts
  - [x] 创建 api/ai-model.ts
  - [x] 创建 api/ai-prompt.ts
  - [x] 创建 api/ai-log.ts
  - [x] 创建 api/ai-playground.ts

- [x] Task 12: 前端页面 - Provider 管理
  - [x] 创建 pages/ai/provider/index.tsx（表格 + CRUD Modal + 测试连接按钮）

- [x] Task 13: 前端页面 - Model 管理
  - [x] 创建 pages/ai/model/index.tsx（表格 + CRUD Modal，关联 Provider 下拉）

- [x] Task 14: 前端页面 - Prompt 管理
  - [x] 创建 pages/ai/prompt/index.tsx（表格 + CRUD Modal，content 用 TextArea）

- [x] Task 15: 前端页面 - Playground
  - [x] 创建 pages/ai/playground/index.tsx（模型选择 + 对话界面 + SSE 流式显示）

- [x] Task 16: 前端页面 - 调用日志
  - [x] 创建 pages/ai/log/index.tsx（表格 + 筛选，只读）

- [x] Task 17: 前端路由 + 图标注册
  - [x] 在 routes.tsx 中添加 AI 模块路由
  - [x] 在 SideMenu/menu.tsx 中注册 RobotOutlined 图标

- [x] Task 18: 编译验证
  - [x] 后端 tsc --noEmit 通过
  - [x] 前端 tsc --noEmit 通过

# Task Dependencies
- Task 2 → Task 3, 4, 5, 6, 7, 8（Schema 是所有模块的基础）
- Task 1 → Task 6, 7（SDK 是 AiService 和 Playground 的基础）
- Task 3 → Task 6（AiService 需要 ProviderService）
- Task 4 → Task 6（AiService 需要 ModelService）
- Task 3, 4, 5, 6, 7, 8 → Task 9（聚合模块依赖所有子模块）
- Task 9 → Task 10（模块注册后才能正确 seed）
- Task 11 → Task 12, 13, 14, 15, 16（类型和 API 是页面的基础）
- Task 17 与 Task 12-16 可并行
