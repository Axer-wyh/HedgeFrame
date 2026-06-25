import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function getPrisma() {
  process.env.DATABASE_URL ??= "file:./dev.db";

  prisma ??= new PrismaClient();

  return prisma;
}
