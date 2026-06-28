import type { HedgeFrameRepository } from "./repository";
import {
  shouldUseKalshiDemoApi,
  submitKalshiDemoOrder,
} from "@/lib/adapters/kalshi-demo";
import {
  createDemoExecutionId,
  executeDemoOrder,
} from "@/lib/domain/execution";
import { buildHedgePlan } from "@/lib/domain/hedge-planner";
import { rankMarketsForScenario } from "@/lib/domain/matcher";
import { mockMarkets } from "@/lib/domain/mock-markets";
import { parseScenario } from "@/lib/domain/scenario-parser";
import type {
  HedgePlan,
  MarketCandidate,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

type ScenarioOverrides = Partial<
  Pick<
    RiskScenario,
    | "subject"
    | "location"
    | "trigger"
    | "exposureAmount"
    | "budget"
    | "targetCoverage"
    | "timeWindow"
  >
>;

export async function createScenario(
  repository: HedgeFrameRepository,
  input: { rawText: string; overrides?: ScenarioOverrides; userId?: string },
): Promise<RiskScenario & { id: string }> {
  const parsed = parseScenario(input.rawText);
  const scenario = {
    ...parsed,
    ...input.overrides,
    id: createStableId("scenario", input.rawText),
  };

  await repository.saveScenario(scenario, { userId: input.userId });
  await repository.addAuditEvent({
    userId: input.userId,
    action: "scenario.created",
    entityType: "risk_scenario",
    entityId: scenario.id,
    metadata: { riskType: scenario.riskType },
  });

  return scenario;
}

export async function getScenarioMatches(
  repository: HedgeFrameRepository,
  scenarioId: string,
  options: { userId?: string } = {},
) {
  const scenario = await requireScenario(repository, scenarioId);
  const existingMatches = await repository.getMatches(scenarioId);

  if (existingMatches.length > 0) {
    return existingMatches;
  }

  const matches = rankMarketsForScenario(scenario, mockMarkets);
  await repository.saveMatches(scenarioId, matches);
  await repository.addAuditEvent({
    userId: options.userId,
    action: "matches.generated",
    entityType: "risk_scenario",
    entityId: scenarioId,
    metadata: {
      candidateCount: matches.length,
      topScore: matches[0]?.score ?? 0,
    },
  });

  return matches;
}

export async function createHedgePlan(
  repository: HedgeFrameRepository,
  input: {
    scenarioId: string;
    marketIds: string[];
    budget: number;
    targetCoverage: number;
    now?: Date;
    userId?: string;
  },
): Promise<HedgePlan> {
  const scenario = await requireScenario(repository, input.scenarioId);
  const matches = await getScenarioMatches(repository, input.scenarioId, {
    userId: input.userId,
  });
  const selectedMatches = matches.filter((match) =>
    input.marketIds.includes(match.market.id),
  );
  const plan = buildHedgePlan({
    scenario,
    selectedMatches,
    budget: input.budget,
    targetCoverage: input.targetCoverage,
    now: input.now,
  });

  await repository.saveHedgePlan(plan, { userId: input.userId });
  await repository.addAuditEvent({
    userId: input.userId,
    action: "hedge_plan.created",
    entityType: "hedge_plan",
    entityId: plan.id,
    metadata: {
      scenarioId: input.scenarioId,
      estimatedCost: plan.estimatedCost,
      maxPayout: plan.maxPayout,
    },
  });

  return plan;
}

export async function createDemoOrder(
  repository: HedgeFrameRepository,
  input: {
    planId: string;
    confirmedAt?: Date;
    confirmationText: string;
    idempotencyKey: string;
    latestMarkets?: MarketCandidate[];
    userId?: string;
  },
): Promise<OrderExecution> {
  const plan = await repository.getHedgePlan(input.planId);

  if (!plan) {
    throw new Error("Hedge plan not found");
  }

  const existingExecution = await repository.getOrderExecution(
    createDemoExecutionId(plan.id, input.idempotencyKey),
  );

  if (existingExecution) {
    return existingExecution;
  }

  const execution = await executeDemoOrder({
    plan,
    confirmedAt: input.confirmedAt,
    confirmationText: input.confirmationText,
    idempotencyKey: input.idempotencyKey,
    latestMarkets: input.latestMarkets ?? mockMarkets,
  });
  const executionWithProviderResponse = shouldUseKalshiDemoApi()
    ? await attachKalshiDemoResponse(execution, plan.legs[0], input.idempotencyKey)
    : execution;

  const created = await repository.saveOrderExecution(executionWithProviderResponse, {
    userId: input.userId,
  });

  if (!created) {
    return (
      (await repository.getOrderExecution(executionWithProviderResponse.id)) ??
      executionWithProviderResponse
    );
  }

  await repository.addAuditEvent({
    userId: input.userId,
    action: "order.demo_executed",
    entityType: "order_execution",
    entityId: execution.id,
    metadata: {
      planId: input.planId,
      provider: executionWithProviderResponse.provider,
      status: executionWithProviderResponse.status,
    },
  });

  return executionWithProviderResponse;
}

async function attachKalshiDemoResponse(
  execution: OrderExecution,
  leg: HedgePlan["legs"][number],
  idempotencyKey: string,
): Promise<OrderExecution> {
  const providerResponse = await submitKalshiDemoOrder({ leg, idempotencyKey });

  return {
    ...execution,
    status: "submitted",
    rawResponse: {
      ...execution.rawResponse,
      providerResponse,
    },
  };
}

async function requireScenario(
  repository: HedgeFrameRepository,
  scenarioId: string,
): Promise<RiskScenario & { id: string }> {
  const scenario = await repository.getScenario(scenarioId);

  if (!scenario) {
    throw new Error("Scenario not found");
  }

  return scenario;
}

function createStableId(prefix: string, text: string): string {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return `${prefix}_${hash.toString(36)}`;
}
