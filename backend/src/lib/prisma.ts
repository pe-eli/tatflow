import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // Only log warnings and errors — never log queries in production (data leakage risk)
  log: process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['warn', 'error'],
});

// Graceful shutdown — close DB connections properly
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
