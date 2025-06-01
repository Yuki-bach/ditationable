import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.spec.*',
        '**/*.test.*',
        '.next/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/lib': path.resolve(__dirname, './app/lib'),
      '@/contexts': path.resolve(__dirname, './app/contexts'),
    },
  },
})