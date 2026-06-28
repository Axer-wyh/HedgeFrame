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

  it("scopes scenarios, plans, demo orders, and audit activity to a demo user", async () => {
    const repository = createMemoryRepository();
    const { user } = await repository.createDemoSession({
      now: new Date("2026-06-24T10:00:00Z"),
    });
    const { user: otherUser } = await repository.createDemoSession({
      now: new Date("2026-06-24T10:05:00Z"),
    });

    const scenario = await createScenario(repository, {
      rawText: "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
      userId: user.id,
    });
    const matches = await getScenarioMatches(repository, scenario.id, {
      userId: user.id,
    });
    const plan = await createHedgePlan(repository, {
      scenarioId: scenario.id,
      marketIds: [matches[0].market.id],
      budget: 12000,
      targetCoverage: 0.4,
      now: new Date("2026-06-24T12:00:00Z"),
      userId: user.id,
    });
    await createDemoOrder(repository, {
      planId: plan.id,
      confirmedAt: new Date("2026-06-24T12:01:00Z"),
      confirmationText: "I understand this is not insurance.",
      idempotencyKey: "user-scoped-order",
      userId: user.id,
    });

    const dashboard = await repository.getAccountDashboard(user.id);
    const orders = await repository.listAccountOrders(user.id);

    expect(dashboard.metrics).toMatchObject({
      activeScenarios: 1,
      demoOrders: 1,
      estimatedExposure: 80000,
    });
    expect(dashboard.recentActivity.map((event) => event.action)).toEqual([
      "order.demo_executed",
      "hedge_plan.created",
      "matches.generated",
      "scenario.created",
    ]);
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      provider: "kalshi",
      status: "filled",
      planId: plan.id,
      scenarioRawText:
        "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    });
    expect(await repository.listAccountOrders(otherUser.id)).toHaveLength(0);
  });
});
