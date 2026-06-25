import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  createDemoOrder,
  createHedgePlan,
  createScenario,
  getScenarioMatches,
} from "./hedgeframe-service";
import { createPrismaRepository } from "./prisma-repository";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${process.cwd()}/prisma/dev.db`,
    },
  },
});

describe("Prisma repository", () => {
  beforeEach(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.orderExecution.deleteMany();
    await prisma.orderIntent.deleteMany();
    await prisma.hedgeLeg.deleteMany();
    await prisma.hedgePlan.deleteMany();
    await prisma.matchResult.deleteMany();
    await prisma.marketSnapshot.deleteMany();
    await prisma.riskScenario.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("persists the scenario to demo execution flow", async () => {
    const repository = createPrismaRepository(prisma);
    const scenario = await createScenario(repository, {
      rawText: "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    });
    const matches = await getScenarioMatches(repository, scenario.id);
    const plan = await createHedgePlan(repository, {
      scenarioId: scenario.id,
      marketIds: [matches[0].market.id],
      budget: 12000,
      targetCoverage: 0.4,
      now: new Date("2026-06-24T12:00:00Z"),
    });
    const execution = await createDemoOrder(repository, {
      planId: plan.id,
      confirmedAt: new Date("2026-06-24T12:01:00Z"),
      confirmationText: "I understand this is not insurance.",
      idempotencyKey: "prisma-flow-confirmation",
    });

    expect(execution.status).toBe("filled");
    expect(await prisma.riskScenario.count()).toBe(1);
    expect(await prisma.matchResult.count()).toBe(5);
    expect(await prisma.hedgePlan.count()).toBe(1);
    expect(await prisma.orderExecution.count()).toBe(1);
    expect(await prisma.auditLog.count()).toBe(4);
  });
});
