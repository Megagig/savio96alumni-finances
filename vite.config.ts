import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.savio96alumni.com.ng',
        changeOrigin: true,
        secure: true,
        ws: true
      }
    }
  }
})
