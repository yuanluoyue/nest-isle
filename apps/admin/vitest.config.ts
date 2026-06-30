import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const emptyStyle = path.resolve(__dirname, 'empty-style.js');

// antd 6 使用 CSS-in-JS，form-render 引用的 antd 4 样式路径不存在，映射到空模块
function antdStyleCompat() {
  return {
    name: 'antd-style-compat',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (/^antd\/es\/.*\/style(\/index)?$/.test(id)) {
        return emptyStyle;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), antdStyleCompat()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
  },
});
