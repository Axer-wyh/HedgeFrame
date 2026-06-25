import type { HedgeFrameRepository, AuditEvent } from "./repository";
import type {
  HedgePlan,
  MatchResult,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

export function createMemoryRepository(): HedgeFrameRepository {
  const scenarios = new Map<string, RiskScenario & { id: string }>();
  const matches = new Map<string, MatchResult[]>();
  const plans = new Map<string, HedgePlan>();
  const executions = new Map<string, OrderExecution>();
  const auditEvents: AuditEvent[] = [];

  return {
    async saveScenario(scenario) {
      scenarios.set(scenario.id, scenario);
    },
    async getScenario(id) {
      return scenarios.get(id) ?? null;
    },
    async saveMatches(scenarioId, scenarioMatches) {
      matches.set(scenarioId, scenarioMatches);
    },
    async getMatches(scenarioId) {
      return matches.get(scenarioId) ?? [];
    },
    async saveHedgePlan(plan) {
      plans.set(plan.id, plan);
    },
    async getHedgePlan(id) {
      return plans.get(id) ?? null;
    },
    async saveOrderExecution(execution) {
      if (executions.has(execution.id)) {
        return false;
      }

      executions.set(execution.id, execution);
      return true;
    },
    async getOrderExecution(id) {
      return executions.get(id) ?? null;
    },
    async addAuditEvent(event) {
      const auditEvent = {
        ...event,
        id: `audit_${auditEvents.length + 1}`,
        createdAt: event.createdAt ?? new Date().toISOString(),
      };
      auditEvents.push(auditEvent);
      return auditEvent;
    },
    async listAuditEvents() {
      return auditEvents;
    },
  };
}
