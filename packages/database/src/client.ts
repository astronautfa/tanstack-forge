import { PrismaClient } from "@prisma/client";
import { env } from "@app/env";

const prismaClientSingleton = () => {
    return new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    });
  };

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
}

export { prisma as db };
