import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: [
      // Mock the problematic package.json import for both dev and build
      { find: /.*\/package\.json$/, replacement: './mock-package.json' },
      { find: '../package.json', replacement: './mock-package.json' },
    ],
  },
  optimizeDeps: {
    include: ['@namada/sdk/web', '@namada/sdk/web-init'],
    exclude: ['@namada/sdk'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          namada: ['@namada/sdk/web', '@namada/sdk/web-init'],
        },
      },
    },
  },
})
