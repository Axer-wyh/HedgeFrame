import { describe, expect, it } from "vitest";

import {
  createDemoOrder,
  createHedgePlan,
  createScenario,
  getScenarioMatches,
} from "./hedgeframe-service";
import { createMemoryRepository } from "./memory-repository";

describe("HedgeFrame application service", () => {
  it("creates a scenario, returns ranked matches, creates a hedge plan, and records audit events", async () => {
    const repository = createMemoryRepository();

    const scenario = await createScenario(repository, {
      rawText: "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
      overrides: {
        budget: 12000,
        targetCoverage: 0.4,
      },
    });

    const matches = await getScenarioMatches(repository, scenario.id);
    const plan = await createHedgePlan(repository, {
      scenarioId: scenario.id,
      marketIds: [matches[0].market.id],
      budget: 12000,
      targetCoverage: 0.4,
      now: new Date("2026-06-24T12:00:00Z"),
    });

    expect(scenario.id).toMatch(/^scenario_/);
    expect(matches[0].score).toBeGreaterThan(80);
    expect(plan.legs[0].marketId).toBe(matches[0].market.id);

    const auditEvents = await repository.listAuditEvents();
    expect(auditEvents.map((event) => event.action)).toEqual([
      "scenario.created",
      "matches.generated",
      "hedge_plan.created",
    ]);
  });

  it("persists a demo execution only when quote is current and risk acknowledgement is present", async () => {
    const repository = createMemoryRepository();
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
      confirmedAt: new Date("2026-06-24T12:02:00Z"),
      confirmationText: "I understand this is not insurance.",
      idempotencyKey: "weather-demo-confirmation",
    });

    expect(execution.status).toBe("filled");
    expect((await repository.listAuditEvents()).at(-1)?.action).toBe(
      "order.demo_executed",
    );
  });

  it("returns the prior execution for a repeated idempotency key", async () => {
    const repository = createMemoryRepository();
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

    const firstExecution = await createDemoOrder(repository, {
      planId: plan.id,
      confirmedAt: new Date("2026-06-24T12:01:00Z"),
      confirmationText: "I understand this is not insurance.",
      idempotencyKey: "duplicate-key",
    });
    const secondExecution = await createDemoOrder(repository, {
      planId: plan.id,
      confirmedAt: new Date("2026-06-24T12:02:00Z"),
      confirmationText: "I understand this is not insurance.",
      idempotencyKey: "duplicate-key",
    });

    expect(secondExecution).toEqual(firstExecution);
    expect(
      (await repository.listAuditEvents()).filter(
        (event) => event.action === "order.demo_executed",
      ),
    ).toHaveLength(1);
  });

  it("records one execution and one audit event for concurrent duplicate keys", async () => {
    const repository = createMemoryRepository();
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

    const [firstExecution, secondExecution] = await Promise.all([
      createDemoOrder(repository, {
        planId: plan.id,
        confirmedAt: new Date("2026-06-24T12:01:00Z"),
        confirmationText: "I understand this is not insurance.",
        idempotencyKey: "parallel-key",
      }),
      createDemoOrder(repository, {
        planId: plan.id,
        confirmedAt: new Date("2026-06-24T12:01:01Z"),
        confirmationText: "I understand this is not insurance.",
        idempotencyKey: "parallel-key",
      }),
    ]);

    expect(secondExecution).toEqual(firstExecution);
    expect(
      (await repository.listAuditEvents()).filter(
        (event) => event.action === "order.demo_executed",
      ),
    ).toHaveLength(1);
  });

  it("revalidates current market conditions before creating a demo order", async () => {
    const repository = createMemoryRepository();
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

    await expect(
      createDemoOrder(repository, {
        planId: plan.id,
        confirmedAt: new Date("2026-06-24T12:01:00Z"),
        confirmationText: "I understand this is not insurance.",
        idempotencyKey: "stale-market-key",
        latestMarkets: [
          { ...matches[0].market, liquidity: 5000 },
          ...matches.slice(1).map((match) => match.market),
        ],
      }),
    ).rejects.toThrow("Market liquidity is below demo threshold");
  });
});
