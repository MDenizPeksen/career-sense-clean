/**
 * Prisma client singleton.
 *
 * Reuses a single PrismaClient across hot reloads (nodemon) to avoid exhausting
 * database connections. In production a single instance is created per process.
 */
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__careersensePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__careersensePrisma = prisma;
}

module.exports = { prisma };
