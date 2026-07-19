import { PrismaClient } from '@prisma/client';

// Singleton — в dev Next.js/tsx перезагружают модули, не плодим коннекты.
const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export { Prisma } from '@prisma/client';
