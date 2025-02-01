import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // This sets the alias for the 'src' folder
    },
  },
})

