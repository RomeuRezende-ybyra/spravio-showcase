import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'react',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
