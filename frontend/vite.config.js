import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/*
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:xxxx', // url du backend
    },
  },
};*/

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
