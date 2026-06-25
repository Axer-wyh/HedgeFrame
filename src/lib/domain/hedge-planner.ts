import type { HedgePlan, MatchResult, RiskScenario } from "./types";

type BuildHedgePlanInput = {
  scenario: RiskScenario;
  selectedMatches: MatchResult[];
  targetCoverage: number;
  budget: number;
  now?: Date;
};

export function buildHedgePlan({
  scenario,
  selectedMatches,
  targetCoverage,
  budget,
  now = new Date(),
}: BuildHedgePlanInput): HedgePlan {
  const usableMatches = selectedMatches.filter((match) => match.executionAllowed);

  if (usableMatches.length === 0) {
    throw new Error("No executable demo markets selected");
  }

  const targetPayout = Math.round(scenario.exposureAmount * targetCoverage);
  const perLegPayout = Math.floor(targetPayout / usableMatches.length);
  const perLegBudget = budget / usableMatches.length;
  const quoteCreatedAt = now.toISOString();
  const quoteExpiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

  const legs = usableMatches.map((match) => {
    const limitPrice = match.market.bestAsk;
    const quantityByCoverage = perLegPayout;
    const quantityByBudget = Math.floor(perLegBudget / limitPrice);
    const quantity = Math.max(1, Math.min(quantityByCoverage, quantityByBudget));
    const estimatedCost = roundMoney(quantity * limitPrice);

    return {
      provider: match.market.provider,
      marketId: match.market.id,
      side: match.direction,
      quantity,
      limitPrice,
      estimatedCost,
      estimatedPayout: quantity,
      orderType: "limit" as const,
      executionMode: match.market.executionMode,
    };
  });

  const estimatedCost = roundMoney(
    legs.reduce((sum, leg) => sum + leg.estimatedCost, 0),
  );
  const maxPayout = roundMoney(
    legs.reduce((sum, leg) => sum + leg.estimatedPayout, 0),
  );
  const remainingExposure = roundMoney(
    Math.max(0, scenario.exposureAmount - maxPayout),
  );

  return {
    id: createStableId("plan", scenario.rawText, quoteCreatedAt),
    scenario,
    legs,
    estimatedCost,
    maxPayout,
    remainingExposure,
    quoteCreatedAt,
    quoteExpiresAt,
    scenarioTable: [
      {
        label: "Trigger occurs and selected market resolves Yes",
        userLoss: -scenario.exposureAmount,
        hedgePayout: maxPayout,
        hedgeCost: -estimatedCost,
        netAfterHedge: roundMoney(-scenario.exposureAmount + maxPayout - estimatedCost),
      },
      {
        label: "Trigger occurs but selected market does not resolve Yes",
        userLoss: -scenario.exposureAmount,
        hedgePayout: 0,
        hedgeCost: -estimatedCost,
        netAfterHedge: roundMoney(-scenario.exposureAmount - estimatedCost),
      },
      {
        label: "Trigger does not occur",
        userLoss: 0,
        hedgePayout: 0,
        hedgeCost: -estimatedCost,
        netAfterHedge: -estimatedCost,
      },
    ],
    riskDisclosure:
      "This is not insurance. The market may settle differently from your real-world loss, and the cost is at risk.",
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function createStableId(prefix: string, text: string, createdAt: string): string {
  let hash = 0;
  const input = `${text}:${createdAt}`;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return `${prefix}_${hash.toString(36)}`;
}
