# HedgeFrame

HedgeFrame is a prediction-market hedge discovery and Kalshi demo execution prototype for weather/event loss scenarios.

This is not insurance, does not provide underwriting or claims handling, and does not make investment recommendations.

## Local Setup

```bash
npm install
npm run db:init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app uses mock market data and the local demo simulator by default. To test the real Kalshi demo API path, opt in explicitly and keep credentials server-side:

```bash
KALSHI_DEMO_EXECUTION_MODE="api"
KALSHI_DEMO_BASE_URL="https://external-api.demo.kalshi.co/trade-api/v2"
KALSHI_DEMO_API_KEY_ID=""
KALSHI_DEMO_PRIVATE_KEY=""
```

## Verification

```bash
npm test
npm run lint
npm run build
npm run test:e2e
npm audit --audit-level=high
```

## Data

Local persistence uses Prisma with SQLite at `prisma/dev.db`. The schema is structured for a future Postgres migration.
