import type {
  HedgePlan,
  MatchResult,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

export type AuditEvent = {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DemoUser = {
  id: string;
  displayName: string;
  email: string;
  organization: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoSessionResult = {
  user: DemoUser;
  sessionToken: string;
  expiresAt: string;
};

export type AccountDashboard = {
  user: DemoUser;
  metrics: {
    activeScenarios: number;
    demoOrders: number;
    estimatedExposure: number;
    auditEvents: number;
  };
  recentActivity: AuditEvent[];
  nextActions: Array<{
    title: string;
    body: string;
    href: string;
  }>;
};

export type AccountOrderSummary = {
  id: string;
  planId: string;
  provider: string;
  status: string;
  demo: boolean;
  submittedAt: string;
  filledQuantity: number;
  averagePrice: number;
  scenarioRawText: string;
};

export type HedgeFrameRepository = {
  createDemoSession(input?: { now?: Date }): Promise<DemoSessionResult>;
  getUserBySessionToken(
    sessionToken: string,
    input?: { now?: Date },
  ): Promise<DemoUser | null>;
  clearDemoSession(sessionToken: string): Promise<void>;
  updateUserProfile(
    userId: string,
    profile: Pick<DemoUser, "displayName" | "email" | "organization" | "role">,
  ): Promise<DemoUser>;
  getAccountDashboard(userId: string): Promise<AccountDashboard>;
  listAccountOrders(userId: string): Promise<AccountOrderSummary[]>;
  saveScenario(
    scenario: RiskScenario & { id: string },
    options?: { userId?: string },
  ): Promise<void>;
  getScenario(id: string): Promise<(RiskScenario & { id: string }) | null>;
  saveMatches(scenarioId: string, matches: MatchResult[]): Promise<void>;
  getMatches(scenarioId: string): Promise<MatchResult[]>;
  saveHedgePlan(plan: HedgePlan, options?: { userId?: string }): Promise<void>;
  getHedgePlan(id: string): Promise<HedgePlan | null>;
  saveOrderExecution(
    execution: OrderExecution,
    options?: { userId?: string },
  ): Promise<boolean>;
  getOrderExecution(id: string): Promise<OrderExecution | null>;
  addAuditEvent(
    event: Omit<AuditEvent, "id" | "createdAt"> & { createdAt?: string },
  ): Promise<AuditEvent>;
  listAuditEvents(): Promise<AuditEvent[]>;
};
