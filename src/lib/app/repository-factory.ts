import { createMemoryRepository } from "./memory-repository";
import { createPrismaRepository } from "./prisma-repository";
import type { HedgeFrameRepository } from "./repository";
import { getPrisma } from "@/lib/db/prisma";

const memoryRepository = createMemoryRepository();

export function getRepository(): HedgeFrameRepository {
  if (process.env.HEDGEFRAME_REPOSITORY === "memory") {
    return memoryRepository;
  }

  return createPrismaRepository(getPrisma());
}
