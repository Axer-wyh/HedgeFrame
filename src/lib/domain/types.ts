export type RiskType =
  | "weather_event"
  | "shipping_geopolitical"
  | "macro_event"
  | "unknown";

export type Provider = "kalshi" | "polymarket";
export type MarketSide = "yes" | "no";
export type OrderType = "limit";

export type RiskScenario = {
  id?: string;
  rawText: string;
  riskType: RiskType;
  subject: string;
  location: string;
  trigger: string;
  exposureAmount: number;
  currency: "USD";
  budget?: number;
  targetCoverage?: number;
  timeWindow: {
    start: string;
    end: string;
  };
  status: "parsed" | "needs_review";
};

export type MarketCandidate = {
  provider: Provider;
  id: string;
  sourceUrl?: string;
  title: string;
  rules: string;
  riskType: RiskType;
  location: string;
  closeTime: string;
  resolutionTime: string;
  outcomes: ["yes", "no"];
  bestBid: number;
  bestAsk: number;
  liquidity: number;
  openInterest: number;
  status: "open" | "closed" | "paused";
  executionMode: "demo" | "read_only" | "simulated";
  tags: string[];
};

export type MatchResult = {
  market: MarketCandidate;
  score: number;
  confidence: "high" | "medium" | "low";
  direction: MarketSide;
  covered: string[];
  notCovered: string[];
  basisRiskNotes: string[];
  executionAllowed: boolean;
};

export type HedgeLeg = {
  provider: Provider;
  marketId: string;
  side: MarketSide;
  quantity: number;
  limitPrice: number;
  estimatedCost: number;
  estimatedPayout: number;
  orderType: OrderType;
  executionMode: MarketCandidate["executionMode"];
};

export type ScenarioTableRow = {
  label: string;
  userLoss: number;
  hedgePayout: number;
  hedgeCost: number;
  netAfterHedge: number;
};

export type HedgePlan = {
  id: string;
  scenario: RiskScenario;
  legs: HedgeLeg[];
  estimatedCost: number;
  maxPayout: number;
  remainingExposure: number;
  quoteCreatedAt: string;
  quoteExpiresAt: string;
  scenarioTable: ScenarioTableRow[];
  riskDisclosure: string;
};

export type OrderExecution = {
  id: string;
  planId: string;
  status: "submitted" | "filled" | "rejected";
  provider: Provider;
  demo: true;
  submittedAt: string;
  filledQuantity: number;
  averagePrice: number;
  rawResponse: Record<string, unknown>;
};
