import { Prisma, type PrismaClient } from "@prisma/client";

import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from "./demo-session";
import type { AuditEvent, HedgeFrameRepository } from "./repository";
import type {
  HedgePlan,
  MatchResult,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

export function createPrismaRepository(
  prisma: PrismaClient,
): HedgeFrameRepository {
  return {
    async createDemoSession(input) {
      const now = input?.now ?? new Date();
      const sessionToken = createSessionToken();
      const expiresAt = getSessionExpiry(now);
      const user = await prisma.user.create({
        data: {
          id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          displayName: "Demo operator",
          email: "demo@hedgeframe.local",
          organization: "HedgeFrame demo workspace",
          role: "Operator",
          createdAt: now,
          updatedAt: now,
          sessions: {
            create: {
              id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              tokenHash: hashSessionToken(sessionToken),
              expiresAt,
              createdAt: now,
              lastSeenAt: now,
            },
          },
        },
      });

      return {
        user: userToDemoUser(user),
        sessionToken,
        expiresAt: expiresAt.toISOString(),
      };
    },
    async getUserBySessionToken(sessionToken, input) {
      const now = input?.now ?? new Date();
      const session = await prisma.demoSession.findUnique({
        where: { tokenHash: hashSessionToken(sessionToken) },
        include: { user: true },
      });

      if (!session || session.expiresAt <= now) {
        return null;
      }

      await prisma.demoSession.update({
        where: { id: session.id },
        data: { lastSeenAt: now },
      });

      return userToDemoUser(session.user);
    },
    async clearDemoSession(sessionToken) {
      await prisma.demoSession.deleteMany({
        where: { tokenHash: hashSessionToken(sessionToken) },
      });
    },
    async updateUserProfile(userId, profile) {
      const user = await prisma.user.update({
        where: { id: userId },
        data: profile,
      });

      return userToDemoUser(user);
    },
    async getAccountDashboard(userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        throw new Error("Demo user not found");
      }

      const [activeScenarios, demoOrders, exposure, auditCount, auditRows] =
        await Promise.all([
          prisma.riskScenario.count({ where: { userId } }),
          prisma.orderExecution.count({ where: { userId } }),
          prisma.riskScenario.aggregate({
            where: { userId },
            _sum: { exposureAmount: true },
          }),
          prisma.auditLog.count({ where: { userId } }),
          prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 6,
          }),
        ]);

      return {
        user: userToDemoUser(user),
        metrics: {
          activeScenarios,
          demoOrders,
          estimatedExposure: exposure._sum.exposureAmount ?? 0,
          auditEvents: auditCount,
        },
        recentActivity: auditRows.map(auditLogToEvent),
        nextActions: accountNextActions(),
      };
    },
    async listAccountOrders(userId) {
      const executions = await prisma.orderExecution.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return Promise.all(
        executions.map(async (execution) => {
          const rawResponse = JSON.parse(execution.rawResponse) as {
            planId?: unknown;
          };
          const planId =
            typeof rawResponse.planId === "string" ? rawResponse.planId : "";
          const plan = planId
            ? await prisma.hedgePlan.findUnique({ where: { id: planId } })
            : null;
          const payload = plan
            ? (JSON.parse(plan.payloadJson) as HedgePlan)
            : null;

          return {
            id: execution.id,
            planId,
            provider: execution.provider,
            status: execution.status,
            demo: true,
            submittedAt: execution.createdAt.toISOString(),
            filledQuantity: execution.filledQuantity,
            averagePrice: execution.averagePrice,
            scenarioRawText: payload?.scenario.rawText ?? "Scenario unavailable",
          };
        }),
      );
    },
    async saveScenario(scenario, options) {
      await prisma.riskScenario.upsert({
        where: { id: scenario.id },
        create: {
          id: scenario.id,
          userId: options?.userId,
          rawText: scenario.rawText,
          parsedJson: JSON.stringify(scenario),
          exposureAmount: scenario.exposureAmount,
          timeWindowJson: JSON.stringify(scenario.timeWindow),
          status: scenario.status,
        },
        update: {
          userId: options?.userId ?? undefined,
          rawText: scenario.rawText,
          parsedJson: JSON.stringify(scenario),
          exposureAmount: scenario.exposureAmount,
          timeWindowJson: JSON.stringify(scenario.timeWindow),
          status: scenario.status,
        },
      });
    },
    async getScenario(id) {
      const scenario = await prisma.riskScenario.findUnique({ where: { id } });

      if (!scenario) {
        return null;
      }

      return JSON.parse(scenario.parsedJson) as RiskScenario & { id: string };
    },
    async saveMatches(scenarioId, matches) {
      await prisma.matchResult.deleteMany({ where: { scenarioId } });

      for (const match of matches) {
        const marketSnapshot = await prisma.marketSnapshot.upsert({
          where: {
            provider_marketId: {
              provider: match.market.provider,
              marketId: match.market.id,
            },
          },
          create: {
            id: `${match.market.provider}_${match.market.id}`,
            provider: match.market.provider,
            marketId: match.market.id,
            title: match.market.title,
            rules: match.market.rules,
            riskType: match.market.riskType,
            payloadJson: JSON.stringify(match.market),
            pricesJson: JSON.stringify({
              bestBid: match.market.bestBid,
              bestAsk: match.market.bestAsk,
            }),
            orderbookJson: JSON.stringify({
              liquidity: match.market.liquidity,
              openInterest: match.market.openInterest,
            }),
            closeTime: new Date(match.market.closeTime),
            status: match.market.status,
          },
          update: {
            title: match.market.title,
            rules: match.market.rules,
            riskType: match.market.riskType,
            payloadJson: JSON.stringify(match.market),
            pricesJson: JSON.stringify({
              bestBid: match.market.bestBid,
              bestAsk: match.market.bestAsk,
            }),
            orderbookJson: JSON.stringify({
              liquidity: match.market.liquidity,
              openInterest: match.market.openInterest,
            }),
            closeTime: new Date(match.market.closeTime),
            status: match.market.status,
          },
        });

        await prisma.matchResult.create({
          data: {
            id: `${scenarioId}_${match.market.provider}_${match.market.id}`,
            scenarioId,
            marketSnapshotId: marketSnapshot.id,
            score: match.score,
            direction: match.direction,
            rationaleJson: JSON.stringify({
              confidence: match.confidence,
              covered: match.covered,
              notCovered: match.notCovered,
              executionAllowed: match.executionAllowed,
            }),
            basisRiskNotes: JSON.stringify(match.basisRiskNotes),
          },
        });
      }
    },
    async getMatches(scenarioId) {
      const rows = await prisma.matchResult.findMany({
        where: { scenarioId },
        include: { marketSnapshot: true },
        orderBy: { score: "desc" },
      });

      return rows.map((row) => {
        const rationale = JSON.parse(row.rationaleJson) as Pick<
          MatchResult,
          "confidence" | "covered" | "notCovered" | "executionAllowed"
        >;

        return {
          market: JSON.parse(row.marketSnapshot.payloadJson),
          score: row.score,
          direction: row.direction,
          basisRiskNotes: JSON.parse(row.basisRiskNotes),
          ...rationale,
        } as MatchResult;
      });
    },
    async saveHedgePlan(plan, options) {
      await prisma.hedgePlan.upsert({
        where: { id: plan.id },
        create: {
          id: plan.id,
          scenarioId: plan.scenario.id ?? "",
          userId: options?.userId,
          totalBudget: plan.estimatedCost,
          targetCoverage:
            plan.scenario.targetCoverage ??
            plan.maxPayout / Math.max(plan.scenario.exposureAmount, 1),
          estimatedCost: plan.estimatedCost,
          maxPayout: plan.maxPayout,
          quoteCreatedAt: new Date(plan.quoteCreatedAt),
          quoteExpiresAt: new Date(plan.quoteExpiresAt),
          status: "quoted",
          payloadJson: JSON.stringify(plan),
          legs: {
            create: plan.legs.map((leg, index) => ({
              id: `${plan.id}_leg_${index + 1}`,
              provider: leg.provider,
              marketId: leg.marketId,
              side: leg.side,
              quantity: leg.quantity,
              limitPrice: leg.limitPrice,
              estimatedCost: leg.estimatedCost,
              estimatedPayout: leg.estimatedPayout,
              orderType: leg.orderType,
            })),
          },
        },
        update: {
          userId: options?.userId ?? undefined,
          estimatedCost: plan.estimatedCost,
          maxPayout: plan.maxPayout,
          quoteCreatedAt: new Date(plan.quoteCreatedAt),
          quoteExpiresAt: new Date(plan.quoteExpiresAt),
          payloadJson: JSON.stringify(plan),
        },
      });
    },
    async getHedgePlan(id) {
      const plan = await prisma.hedgePlan.findUnique({ where: { id } });

      if (!plan) {
        return null;
      }

      return JSON.parse(plan.payloadJson) as HedgePlan;
    },
    async saveOrderExecution(execution, options) {
      try {
        await prisma.orderExecution.create({
          data: {
            id: execution.id,
            userId: options?.userId,
            provider: execution.provider,
            filledQuantity: execution.filledQuantity,
            averagePrice: execution.averagePrice,
            status: execution.status,
            rawResponse: JSON.stringify(execution.rawResponse),
          },
        });
        return true;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return false;
        }

        throw error;
      }
    },
    async getOrderExecution(id) {
      const execution = await prisma.orderExecution.findUnique({ where: { id } });

      if (!execution) {
        return null;
      }

      const rawResponse = JSON.parse(execution.rawResponse) as {
        planId?: unknown;
      } & Record<string, unknown>;

      return {
        id: execution.id,
        planId: typeof rawResponse.planId === "string" ? rawResponse.planId : "",
        provider: execution.provider,
        status: execution.status,
        demo: true,
        submittedAt: execution.createdAt.toISOString(),
        filledQuantity: execution.filledQuantity,
        averagePrice: execution.averagePrice,
        rawResponse,
      } as OrderExecution;
    },
    async addAuditEvent(event) {
      const auditEvent = await prisma.auditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          userId: event.userId,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          metadata: JSON.stringify(event.metadata),
          createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
          scenarioId:
            event.entityType === "risk_scenario" ? event.entityId : undefined,
        },
      });

      return auditLogToEvent(auditEvent);
    },
    async listAuditEvents() {
      const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } });
      return rows.map(auditLogToEvent);
    },
  };
}

function auditLogToEvent(row: {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string;
  createdAt: Date;
}): AuditEvent {
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    metadata: JSON.parse(row.metadata),
    createdAt: row.createdAt.toISOString(),
  };
}

function userToDemoUser(row: {
  id: string;
  displayName: string;
  email: string;
  organization: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    displayName: row.displayName,
    email: row.email,
    organization: row.organization,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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
