CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DemoSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemoSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DemoSession_tokenHash_key" ON "DemoSession"("tokenHash");
CREATE INDEX "DemoSession_userId_idx" ON "DemoSession"("userId");
CREATE INDEX "DemoSession_expiresAt_idx" ON "DemoSession"("expiresAt");

ALTER TABLE "RiskScenario" ADD COLUMN "userId" TEXT;
ALTER TABLE "HedgePlan" ADD COLUMN "userId" TEXT;
ALTER TABLE "OrderExecution" ADD COLUMN "userId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "userId" TEXT;

CREATE INDEX "RiskScenario_userId_idx" ON "RiskScenario"("userId");
CREATE INDEX "HedgePlan_userId_idx" ON "HedgePlan"("userId");
CREATE INDEX "OrderExecution_userId_idx" ON "OrderExecution"("userId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
