import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server config with API proxy to the local Node server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All requests starting with /api go to the Node server (server/index.cjs)
      '/api': 'http://localhost:8787'
    }
  }
})
