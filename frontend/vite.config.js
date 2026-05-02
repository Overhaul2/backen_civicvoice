import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/*
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:xxxx', // URL de ton backend
    },
  },
};*/

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
