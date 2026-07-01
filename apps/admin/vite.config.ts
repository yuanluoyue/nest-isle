import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const emptyStyle = path.resolve(__dirname, 'empty-style.js');

// antd 6 使用 CSS-in-JS，form-render 引用的 antd 4 样式路径不存在，映射到空模块
function antdStyleCompat(): Plugin {
  return {
    name: 'antd-style-compat',
    enforce: 'pre',
    resolveId(id) {
      if (/^antd\/es\/.*\/style(\/index)?$/.test(id)) {
        return emptyStyle;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), antdStyleCompat()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: 'antd-style-compat',
          setup(build) {
            build.onResolve({ filter: /^antd\/es\/.*\/style(\/index)?$/ }, () => ({
              path: emptyStyle,
            }));
          },
        },
      ],
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
        },
      },
    },
  },
});
