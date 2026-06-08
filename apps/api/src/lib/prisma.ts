import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  // Connection pool configuration
  // Ref: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Log connection pool info in production
if (process.env.NODE_ENV === 'production') {
  console.log('[Prisma] Connection pool configured with defaults:')
  console.log('  - connection_limit: 10 (can be set via DATABASE_URL param)')
  console.log('  - pool_timeout: 10s')
  console.log('  - To customize: DATABASE_URL=postgresql://...?connection_limit=20&pool_timeout=20')
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
