import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 本机开发走同源代理；生产由 Nginx 同源分发，不启用 CORS。
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/download': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
})
