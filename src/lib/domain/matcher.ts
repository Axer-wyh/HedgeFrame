import type { MarketCandidate, MatchResult, RiskScenario } from "./types";

export function rankMarketsForScenario(
  scenario: RiskScenario,
  markets: MarketCandidate[],
): MatchResult[] {
  return markets
    .map((market) => scoreMarket(scenario, market))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function scoreMarket(
  scenario: RiskScenario,
  market: MarketCandidate,
): MatchResult {
  let score = 20;
  const covered: string[] = [];
  const notCovered: string[] = [];
  const basisRiskNotes: string[] = [];

  if (market.riskType === scenario.riskType) {
    score += 30;
    covered.push(labelForRiskType(market.riskType));
  } else {
    score -= 15;
    notCovered.push("Different event class");
  }

  if (market.location.toLowerCase() === scenario.location.toLowerCase()) {
    score += 25;
    covered.push("Location match");
  } else if (
    market.location.toLowerCase().includes("texas") &&
    scenario.location.toLowerCase() === "austin"
  ) {
    score += 12;
    covered.push("Regional location match");
    basisRiskNotes.push("The market is broader than the event location.");
  } else {
    score -= 8;
    notCovered.push("Location is broader or different");
  }

  if (sameMonth(market.closeTime, scenario.timeWindow.start)) {
    score += 14;
    covered.push("Time window overlap");
  } else {
    score -= 10;
    notCovered.push("Time window mismatch");
  }

  if (market.tags.some((tag) => scenario.trigger.toLowerCase().includes(tag))) {
    score += 12;
    covered.push("Trigger language match");
  }

  if (market.liquidity >= 10000) {
    score += 8;
    covered.push("Executable demo liquidity");
  } else {
    score -= 8;
    basisRiskNotes.push("Thin order book may create material slippage.");
  }

  if (market.status !== "open") {
    basisRiskNotes.push("Market is not open for demo execution.");
  }

  if (market.bestAsk <= 0 || market.bestAsk > 0.95) {
    basisRiskNotes.push("Ask price is outside the demo limit guard.");
  }

  if (scenario.riskType === "shipping_geopolitical") {
    score = Math.min(score, 55);
    notCovered.push("This is not a direct shipping loss contract");
    basisRiskNotes.push(
      "Route disruption can occur without matching the shipment economics.",
    );
  } else {
    notCovered.push("This is not a loss contract and may settle differently.");
  }

  const clampedScore = Math.max(0, Math.min(100, score));

  return {
    market,
    score: clampedScore,
    confidence:
      clampedScore >= 75 ? "high" : clampedScore >= 55 ? "medium" : "low",
    direction: "yes",
    covered: dedupe(covered),
    notCovered: dedupe(notCovered),
    basisRiskNotes: dedupe([
      ...basisRiskNotes,
      "Market settlement may not match the user's actual financial loss.",
    ]),
    executionAllowed:
      market.status === "open" &&
      market.executionMode === "demo" &&
      market.liquidity >= 10000 &&
      market.bestAsk > 0 &&
      market.bestAsk <= 0.95 &&
      clampedScore >= 65,
  };
}

function labelForRiskType(riskType: MarketCandidate["riskType"]): string {
  if (riskType === "weather_event") {
    return "Weather trigger";
  }

  if (riskType === "shipping_geopolitical") {
    return "Route disruption trigger";
  }

  return "Event trigger";
}

function sameMonth(closeTime: string, scenarioDate: string): boolean {
  return closeTime.slice(0, 7) === scenarioDate.slice(0, 7);
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}
