import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/server.ts'],
    },
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'test-jwt-secret-not-real-replace-in-production',
      ENCRYPTION_KEY: 'test-encryption-key-not-real-replace-in-production-must-be-64-chars-long-aaaaaaaaaaaaaaaa',
      PORTAL_SECRET: 'test-portal-secret-not-real-replace-in-production',
      NODE_ENV: 'test',
      PORT: '3010',
    },
  },
})
