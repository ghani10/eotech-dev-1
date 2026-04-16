import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import inertia from '@adonisjs/inertia/vite'

export default defineConfig({
  plugins: [
    vue(),
    inertia({ ssr: { enabled: false } }),
  ],
})