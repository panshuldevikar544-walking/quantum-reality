import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the built deck runs from any folder or static host.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // three.js is one large chunk; it is lazy-loaded behind the shell.
    chunkSizeWarningLimit: 1100,
  },
  server: { host: true },
})
