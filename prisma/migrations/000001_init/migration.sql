-- CreateTable
CREATE TABLE "RiskScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rawText" TEXT NOT NULL,
    "parsedJson" TEXT NOT NULL,
    "exposureAmount" REAL NOT NULL,
    "timeWindowJson" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "riskType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "pricesJson" TEXT NOT NULL,
    "orderbookJson" TEXT NOT NULL,
    "closeTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "marketSnapshotId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "direction" TEXT NOT NULL,
    "rationaleJson" TEXT NOT NULL,
    "basisRiskNotes" TEXT NOT NULL,
    CONSTRAINT "MatchResult_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RiskScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchResult_marketSnapshotId_fkey" FOREIGN KEY ("marketSnapshotId") REFERENCES "MarketSnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HedgePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "totalBudget" REAL NOT NULL,
    "targetCoverage" REAL NOT NULL,
    "estimatedCost" REAL NOT NULL,
    "maxPayout" REAL NOT NULL,
    "quoteCreatedAt" DATETIME NOT NULL,
    "quoteExpiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HedgePlan_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RiskScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HedgeLeg" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hedgePlanId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "limitPrice" REAL NOT NULL,
    "estimatedCost" REAL NOT NULL,
    "estimatedPayout" REAL NOT NULL,
    "orderType" TEXT NOT NULL,
    CONSTRAINT "HedgeLeg_hedgePlanId_fkey" FOREIGN KEY ("hedgePlanId") REFERENCES "HedgePlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderIntent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hedgePlanId" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "userConfirmedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OrderExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderIntentId" TEXT,
    "providerOrderId" TEXT,
    "provider" TEXT NOT NULL,
    "filledQuantity" REAL NOT NULL,
    "averagePrice" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "rawResponse" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RiskScenario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketSnapshot_provider_marketId_key" ON "MarketSnapshot"("provider", "marketId");
