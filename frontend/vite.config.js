import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

import { visualizer } from 'rollup-plugin-visualizer' // 引入插件,查看包体积

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    AutoImport({
      resolvers: [VantResolver()],
    }),
    Components({
      resolvers: [VantResolver({ importStyle: true })],
    }),
    visualizer({
      open: true, // 打包完成后自动打开分析页面
      filename: 'stats.html', // 生成的分析文件名称
      gzipSize: true, // 显示压缩后的大小（这个最关键！模拟 Nginx Gzip 后的实际传输体积）
      brotliSize: true, // 显示 Brotli 压缩后的大小
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3300',
        changeOrigin: true,
        // 如果你后端没有 /images 前缀，可以 rewrite，这里不需要，因为你的路径就是 /images
      },
    },
  },
  build: {
    modulePreload: false,
  },
})
