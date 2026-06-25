import type {
  HedgePlan,
  MatchResult,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

export type AuditEvent = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type HedgeFrameRepository = {
  saveScenario(scenario: RiskScenario & { id: string }): Promise<void>;
  getScenario(id: string): Promise<(RiskScenario & { id: string }) | null>;
  saveMatches(scenarioId: string, matches: MatchResult[]): Promise<void>;
  getMatches(scenarioId: string): Promise<MatchResult[]>;
  saveHedgePlan(plan: HedgePlan): Promise<void>;
  getHedgePlan(id: string): Promise<HedgePlan | null>;
  saveOrderExecution(execution: OrderExecution): Promise<boolean>;
  getOrderExecution(id: string): Promise<OrderExecution | null>;
  addAuditEvent(
    event: Omit<AuditEvent, "id" | "createdAt"> & { createdAt?: string },
  ): Promise<AuditEvent>;
  listAuditEvents(): Promise<AuditEvent[]>;
};
