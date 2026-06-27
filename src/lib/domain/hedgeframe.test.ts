import { describe, expect, it } from "vitest";

import { executeDemoOrder } from "./execution";
import { buildHedgePlan } from "./hedge-planner";
import { rankMarketsForScenario } from "./matcher";
import { mockMarkets } from "./mock-markets";
import { parseScenario } from "./scenario-parser";

describe("HedgeFrame domain flow", () => {
  it("parses a weather event exposure into editable scenario fields", () => {
    const scenario = parseScenario(
      "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    );

    expect(scenario.riskType).toBe("weather_event");
    expect(scenario.subject).toBe("outdoor event");
    expect(scenario.location).toBe("Austin");
    expect(scenario.exposureAmount).toBe(80000);
    expect(scenario.currency).toBe("USD");
    expect(scenario.trigger).toContain("heavy rain");
    expect(scenario.timeWindow.start).toBe("2026-10-12");
    expect(scenario.timeWindow.end).toBe("2026-10-12");
  });

  it("ranks weather markets above shipping and geopolitical markets for an event rain scenario", () => {
    const scenario = parseScenario(
      "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    );

    const matches = rankMarketsForScenario(scenario, mockMarkets);

    expect(matches).toHaveLength(15);
    expect(matches[0].market.riskType).toBe("weather_event");
    expect(matches[0].score).toBeGreaterThan(80);
    expect(matches[0].covered).toContain("Weather trigger");
    expect(matches[0].notCovered.join(" ")).toContain("not a loss contract");
  });

  it("keeps Middle East shipping exposures low confidence and blocks execution guidance", () => {
    const scenario = parseScenario(
      "A crude oil shipment from the Middle East to the US could lose $2m if war blocks the route.",
    );

    const matches = rankMarketsForScenario(scenario, mockMarkets);

    expect(scenario.riskType).toBe("shipping_geopolitical");
    expect(matches[0].score).toBeLessThan(60);
    expect(matches[0].executionAllowed).toBe(false);
    expect(matches[0].notCovered.join(" ")).toContain("shipping loss");
  });

  it("builds a limit-only hedge plan with transparent cost, payout, and quote expiry", () => {
    const scenario = parseScenario(
      "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    );
    const [match] = rankMarketsForScenario(scenario, mockMarkets);

    const plan = buildHedgePlan({
      scenario,
      selectedMatches: [match],
      targetCoverage: 0.4,
      budget: 12000,
      now: new Date("2026-06-24T12:00:00Z"),
    });

    expect(plan.legs).toHaveLength(1);
    expect(plan.legs[0].side).toBe("yes");
    expect(plan.legs[0].orderType).toBe("limit");
    expect(plan.estimatedCost).toBeLessThanOrEqual(12000);
    expect(plan.maxPayout).toBeGreaterThan(25000);
    expect(plan.quoteExpiresAt).toBe("2026-06-24T12:05:00.000Z");
    expect(plan.scenarioTable[0].netAfterHedge).toBeLessThan(0);
    expect(plan.riskDisclosure).toContain("not insurance");
  });

  it("blocks execution for closed, thin, or price-capped markets", () => {
    const scenario = parseScenario(
      "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    );
    const [closedMatch] = rankMarketsForScenario(scenario, [
      { ...mockMarkets[0], id: "CLOSED", status: "closed" },
    ]);
    const [thinMatch] = rankMarketsForScenario(scenario, [
      { ...mockMarkets[0], id: "THIN", liquidity: 5000 },
    ]);
    const [priceCappedMatch] = rankMarketsForScenario(scenario, [
      { ...mockMarkets[0], id: "PRICE-CAPPED", bestAsk: 0.98 },
    ]);

    expect(closedMatch.executionAllowed).toBe(false);
    expect(thinMatch.executionAllowed).toBe(false);
    expect(priceCappedMatch.executionAllowed).toBe(false);
    expect(() =>
      buildHedgePlan({
        scenario,
        selectedMatches: [thinMatch],
        targetCoverage: 0.4,
        budget: 12000,
      }),
    ).toThrow("No executable demo markets selected");
  });

  it("rejects demo execution after a quote expires", async () => {
    const scenario = parseScenario(
      "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    );
    const [match] = rankMarketsForScenario(scenario, mockMarkets);
    const plan = buildHedgePlan({
      scenario,
      selectedMatches: [match],
      targetCoverage: 0.4,
      budget: 12000,
      now: new Date("2026-06-24T12:00:00Z"),
    });

    await expect(
      executeDemoOrder({
        plan,
        confirmedAt: new Date("2026-06-24T12:06:00Z"),
        confirmationText: "I understand this is not insurance.",
        idempotencyKey: "quote-expiry-test",
        latestMarkets: mockMarkets,
      }),
    ).rejects.toThrow("Quote expired");

    await expect(
      executeDemoOrder({
        plan,
        confirmedAt: new Date("2026-06-24T12:05:00Z"),
        confirmationText: "I understand this is not insurance.",
        idempotencyKey: "quote-expiry-boundary-test",
        latestMarkets: mockMarkets,
      }),
    ).rejects.toThrow("Quote expired");
  });

  it("revalidates current market status, liquidity, and ask before execution", async () => {
    const scenario = parseScenario(
      "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    );
    const [match] = rankMarketsForScenario(scenario, mockMarkets);
    const plan = buildHedgePlan({
      scenario,
      selectedMatches: [match],
      targetCoverage: 0.4,
      budget: 12000,
      now: new Date("2026-06-24T12:00:00Z"),
    });
    const currentMarkets = [
      {
        ...mockMarkets[0],
        status: "closed" as const,
      },
      ...mockMarkets.slice(1),
    ];

    await expect(
      executeDemoOrder({
        plan,
        confirmedAt: new Date("2026-06-24T12:01:00Z"),
        confirmationText: "I understand this is not insurance.",
        idempotencyKey: "closed-market-test",
        latestMarkets: currentMarkets,
      }),
    ).rejects.toThrow("Market is no longer open");
  });

  it("requires an idempotency key and keeps duplicate demo order ids stable", async () => {
    const scenario = parseScenario(
      "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
    );
    const [match] = rankMarketsForScenario(scenario, mockMarkets);
    const plan = buildHedgePlan({
      scenario,
      selectedMatches: [match],
      targetCoverage: 0.4,
      budget: 12000,
      now: new Date("2026-06-24T12:00:00Z"),
    });

    await expect(
      executeDemoOrder({
        plan,
        confirmedAt: new Date("2026-06-24T12:01:00Z"),
        confirmationText: "I understand this is not insurance.",
        idempotencyKey: "",
        latestMarkets: mockMarkets,
      }),
    ).rejects.toThrow("Idempotency key required");

    const firstExecution = await executeDemoOrder({
      plan,
      confirmedAt: new Date("2026-06-24T12:01:00Z"),
      confirmationText: "I understand this is not insurance.",
      idempotencyKey: "same-user-confirmation",
      latestMarkets: mockMarkets,
    });
    const secondExecution = await executeDemoOrder({
      plan,
      confirmedAt: new Date("2026-06-24T12:02:00Z"),
      confirmationText: "I understand this is not insurance.",
      idempotencyKey: "same-user-confirmation",
      latestMarkets: mockMarkets,
    });

    expect(secondExecution.id).toBe(firstExecution.id);
    expect(secondExecution.rawResponse.idempotencyKey).toBe(
      "same-user-confirmation",
    );
  });
});
