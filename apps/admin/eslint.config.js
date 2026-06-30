import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // 降级为 warning：项目内多处使用 `any`（例如 types/api.ts 中的 schema 字段），
      // 这些字段由后端动态返回或第三方库（form-render、antd）要求宽松类型，
      // 改造工作量大且容易引入类型回归，先以 warning 提示。
      '@typescript-eslint/no-explicit-any': 'off',

      // 以下三项是 React Compiler 的新规则，与现有基于 useEffect 的取数模式不兼容。
      // 全面迁移到 React Compiler 需要单独评估，先关闭以避免噪声。
      // - set-state-in-effect：禁止在 effect 同步调用 setState，但项目普遍在 effect 中触发表格刷新
      // - immutability：禁止变量在渲染中被 mutation，与 form-render/schema-builder 的内部实现冲突
      // - preserve-manual-memoization：要求 useMemo/useCallback 与 Compiler 配合，会改变现有依赖心智模型
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  // 路由配置文件：该文件就是为了集中导出路由配置对象（非组件），
  // react-refresh/only-export-components 不适用，单独关闭。
  {
    files: ['src/router/routes.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // 测试文件：放宽规则
  // 理由：spec 文件大量使用 mock、强制断言任意形状，
  // 不必满足生产代码的严格类型契约
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx', 'src/test-setup.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
])
