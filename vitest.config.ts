import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'app/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.test.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/',
      'tests/e2e/**',
      '**/*.spec.*',
      '.next/',
      'coverage/',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.spec.*',
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
      '@/app': path.resolve(__dirname, './app'),
    },
  },
})