import type { HedgePlan, MarketCandidate, OrderExecution } from "./types";

type ExecuteDemoOrderInput = {
  plan: HedgePlan;
  confirmedAt?: Date;
  confirmationText: string;
  idempotencyKey: string;
  latestMarkets: MarketCandidate[];
};

export async function executeDemoOrder({
  plan,
  confirmedAt = new Date(),
  confirmationText,
  idempotencyKey,
  latestMarkets,
}: ExecuteDemoOrderInput): Promise<OrderExecution> {
  if (confirmedAt >= new Date(plan.quoteExpiresAt)) {
    throw new Error("Quote expired");
  }

  if (!idempotencyKey.trim()) {
    throw new Error("Idempotency key required");
  }

  if (!confirmationText.toLowerCase().includes("not insurance")) {
    throw new Error("Risk acknowledgement required");
  }

  if (plan.legs.length === 0) {
    throw new Error("No order legs selected");
  }

  const nonDemoLeg = plan.legs.find((leg) => leg.executionMode !== "demo");

  if (nonDemoLeg) {
    throw new Error("Only Kalshi demo execution is enabled");
  }

  revalidateLegs(plan, latestMarkets);

  const [firstLeg] = plan.legs;

  return {
    id: createDemoExecutionId(plan.id, idempotencyKey),
    planId: plan.id,
    status: "filled",
    provider: firstLeg.provider,
    demo: true,
    submittedAt: confirmedAt.toISOString(),
    filledQuantity: firstLeg.quantity,
    averagePrice: firstLeg.limitPrice,
    rawResponse: {
      adapter: "local-demo-simulator",
      planId: plan.id,
      orderType: firstLeg.orderType,
      marketId: firstLeg.marketId,
      idempotencyKey,
    },
  };
}

function revalidateLegs(plan: HedgePlan, latestMarkets: MarketCandidate[]) {
  const marketByKey = new Map(
    latestMarkets.map((market) => [`${market.provider}:${market.id}`, market]),
  );

  for (const leg of plan.legs) {
    const market = marketByKey.get(`${leg.provider}:${leg.marketId}`);

    if (!market || market.status !== "open") {
      throw new Error("Market is no longer open");
    }

    if (market.executionMode !== "demo") {
      throw new Error("Only Kalshi demo execution is enabled");
    }

    if (market.liquidity < 10000) {
      throw new Error("Market liquidity is below demo threshold");
    }

    if (market.bestAsk <= 0 || market.bestAsk > 0.95) {
      throw new Error("Market ask is outside demo limit guard");
    }

    if (market.bestAsk > leg.limitPrice) {
      throw new Error("Market ask moved above limit price");
    }
  }
}

export function createDemoExecutionId(
  planId: string,
  idempotencyKey: string,
): string {
  return createStableId("exec", planId, idempotencyKey);
}

function createStableId(prefix: string, planId: string, key: string): string {
  let hash = 0;
  const input = `${planId}:${key}`;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }

  return `${prefix}_${hash.toString(36)}`;
}
