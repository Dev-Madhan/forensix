import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG_QUERY === 'true' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Resilient database query wrapper that catches transient connection drops,
 * PgBouncer socket resets, or Neon serverless cold starts (P1001), retrying
 * with backoff so page loads never crash unexpectedly.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 700
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      const isConnectionError =
        msg.includes("Can't reach database server") ||
        msg.includes("connection closed") ||
        msg.includes("Connection terminated") ||
        msg.includes("Connection reset") ||
        msg.includes("timed out") ||
        msg.includes("timeout") ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ECONNREFUSED") ||
        err?.code === "P1001" || // Prisma: Can't reach database server
        err?.code === "P1002" || // Prisma: Database server timed out
        err?.code === "P1008" || // Prisma: Operations timed out
        err?.code === "P1017";   // Prisma: Server has closed the connection

      if (isConnectionError && attempt < retries) {
        console.warn(
          `[Forensix DB] Neon cold start / connection retry ${attempt + 1}/${retries} after ${delayMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
