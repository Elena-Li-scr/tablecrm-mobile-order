import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/bootstrap-api": {
        target: "https://tablecrm-mobile-order.vercel.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/bootstrap-api/, "/api"),
      },

      "/tablecrm-api": {
        target: "https://app.tablecrm.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tablecrm-api/, "/api/v1"),
      },
    },
  },
})
