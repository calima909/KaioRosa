import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/KaioRosa/',
  plugins: [
    vue(),
    UnoCSS()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
