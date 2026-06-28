import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from "./demo-session";
import type {
  AccountDashboard,
  AccountOrderSummary,
  AuditEvent,
  DemoUser,
  HedgeFrameRepository,
} from "./repository";
import type {
  HedgePlan,
  MatchResult,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

export function createMemoryRepository(): HedgeFrameRepository {
  const scenarios = new Map<string, RiskScenario & { id: string }>();
  const scenarioOwners = new Map<string, string>();
  const matches = new Map<string, MatchResult[]>();
  const plans = new Map<string, HedgePlan>();
  const executions = new Map<string, OrderExecution>();
  const executionOwners = new Map<string, string>();
  const auditEvents: AuditEvent[] = [];
  const users = new Map<string, DemoUser>();
  const sessions = new Map<
    string,
    {
      id: string;
      userId: string;
      tokenHash: string;
      expiresAt: string;
      createdAt: string;
      lastSeenAt: string;
    }
  >();

  return {
    async createDemoSession(input) {
      const now = input?.now ?? new Date();
      const user: DemoUser = {
        id: `user_${users.size + 1}`,
        displayName: "Demo operator",
        email: "demo@hedgeframe.local",
        organization: "HedgeFrame demo workspace",
        role: "Operator",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      const sessionToken = createSessionToken();
      const expiresAt = getSessionExpiry(now).toISOString();

      users.set(user.id, user);
      sessions.set(hashSessionToken(sessionToken), {
        id: `session_${sessions.size + 1}`,
        userId: user.id,
        tokenHash: hashSessionToken(sessionToken),
        expiresAt,
        createdAt: now.toISOString(),
        lastSeenAt: now.toISOString(),
      });

      return { user, sessionToken, expiresAt };
    },
    async getUserBySessionToken(sessionToken, input) {
      const tokenHash = hashSessionToken(sessionToken);
      const session = sessions.get(tokenHash);
      const now = input?.now ?? new Date();

      if (!session || new Date(session.expiresAt) <= now) {
        return null;
      }

      session.lastSeenAt = now.toISOString();
      return users.get(session.userId) ?? null;
    },
    async clearDemoSession(sessionToken) {
      sessions.delete(hashSessionToken(sessionToken));
    },
    async updateUserProfile(userId, profile) {
      const existing = users.get(userId);

      if (!existing) {
        throw new Error("Demo user not found");
      }

      const updated = {
        ...existing,
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      users.set(userId, updated);
      return updated;
    },
    async getAccountDashboard(userId) {
      const user = users.get(userId);

      if (!user) {
        throw new Error("Demo user not found");
      }

      const userScenarioIds = [...scenarioOwners.entries()]
        .filter(([, ownerId]) => ownerId === userId)
        .map(([scenarioId]) => scenarioId);
      const recentActivity = auditEvents
        .filter((event) => event.userId === userId)
        .reverse()
        .slice(0, 6);
      const dashboard: AccountDashboard = {
        user,
        metrics: {
          activeScenarios: userScenarioIds.length,
          demoOrders: [...executionOwners.values()].filter(
            (ownerId) => ownerId === userId,
          ).length,
          estimatedExposure: userScenarioIds.reduce(
            (total, scenarioId) =>
              total + (scenarios.get(scenarioId)?.exposureAmount ?? 0),
            0,
          ),
          auditEvents: recentActivity.length,
        },
        recentActivity,
        nextActions: accountNextActions(),
      };

      return dashboard;
    },
    async listAccountOrders(userId) {
      const orders: AccountOrderSummary[] = [...executions.values()]
        .filter((execution) => executionOwners.get(execution.id) === userId)
        .map((execution) => {
          const plan = plans.get(execution.planId);
          return {
            id: execution.id,
            planId: execution.planId,
            provider: execution.provider,
            status: execution.status,
            demo: execution.demo,
            submittedAt: execution.submittedAt,
            filledQuantity: execution.filledQuantity,
            averagePrice: execution.averagePrice,
            scenarioRawText: plan?.scenario.rawText ?? "Scenario unavailable",
          };
        })
        .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));

      return orders;
    },
    async saveScenario(scenario, options) {
      scenarios.set(scenario.id, scenario);

      if (options?.userId) {
        scenarioOwners.set(scenario.id, options.userId);
      }
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
    async saveOrderExecution(execution, options) {
      if (executions.has(execution.id)) {
        return false;
      }

      executions.set(execution.id, execution);

      if (options?.userId) {
        executionOwners.set(execution.id, options.userId);
      }

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

function accountNextActions() {
  return [
    {
      title: "Map a new risk",
      body: "Start from a plain-language worry and build a new market map.",
      href: "/#try-scenario",
    },
    {
      title: "Review demo orders",
      body: "Check status, quantity, average price, and execution ids.",
      href: "/account?view=orders",
    },
    {
      title: "Check security boundary",
      body: "Confirm demo-only execution, wallet status, and audit coverage.",
      href: "/account?view=security",
    },
  ];
}
