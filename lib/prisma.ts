import { PrismaClient } from '../prisma/generated/client';

// Udržení instance Prismy napříč hot-reloads v Node.js
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Díky tomuto uvidíš v terminálu reálné SQL dotazy
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;