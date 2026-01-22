import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Allows any public URL (perfect for Railway/dynamic domains)
    allowedHosts: true,
    host: true, // Ensure this is also set to expose 0.0.0.0
  },
  // If you are running "npm run preview", use this instead:
  preview: {
    allowedHosts: true,
    host: true,
  },
})
