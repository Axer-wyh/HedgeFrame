import { constants, createPrivateKey, sign } from "node:crypto";

import type { HedgeLeg } from "@/lib/domain/types";

const DEFAULT_DEMO_BASE_URL = "https://external-api.demo.kalshi.co/trade-api/v2";
const ORDER_PATH = "/portfolio/events/orders";

export type KalshiDemoOrderResponse = {
  adapter: "kalshi-demo-api";
  request: {
    ticker: string;
    client_order_id: string;
    side: "bid" | "ask";
    count: string;
    price: string;
  };
  response: Record<string, unknown>;
};

export function shouldUseKalshiDemoApi(): boolean {
  return (
    process.env.KALSHI_DEMO_EXECUTION_MODE === "api" &&
    Boolean(process.env.KALSHI_DEMO_API_KEY_ID) &&
    Boolean(process.env.KALSHI_DEMO_PRIVATE_KEY)
  );
}

export async function submitKalshiDemoOrder({
  leg,
  idempotencyKey,
}: {
  leg: HedgeLeg;
  idempotencyKey: string;
}): Promise<KalshiDemoOrderResponse> {
  const apiKeyId = process.env.KALSHI_DEMO_API_KEY_ID;
  const privateKey = process.env.KALSHI_DEMO_PRIVATE_KEY;

  if (!apiKeyId || !privateKey) {
    throw new Error("Kalshi demo credentials are not configured");
  }

  const baseUrl = process.env.KALSHI_DEMO_BASE_URL ?? DEFAULT_DEMO_BASE_URL;
  const url = new URL(`${baseUrl}${ORDER_PATH}`);
  const timestamp = Date.now().toString();
  const signature = signKalshiRequest({
    privateKey,
    timestamp,
    method: "POST",
    path: url.pathname,
  });
  const side: "bid" | "ask" = leg.side === "yes" ? "bid" : "ask";
  const count = leg.quantity.toFixed(2);
  const price = leg.limitPrice.toFixed(4);
  const orderBody = {
    ticker: leg.marketId,
    client_order_id: idempotencyKey,
    side,
    count,
    price,
    time_in_force: "good_till_canceled",
    self_trade_prevention_type: "taker_at_cross",
    post_only: false,
    cancel_order_on_pause: true,
    reduce_only: false,
    subaccount: 0,
    exchange_index: 0,
  } as const;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "KALSHI-ACCESS-KEY": apiKeyId,
      "KALSHI-ACCESS-TIMESTAMP": timestamp,
      "KALSHI-ACCESS-SIGNATURE": signature,
    },
    body: JSON.stringify(orderBody),
  });
  const responseBody = await safeJson(response);

  if (!response.ok) {
    throw new Error(`Kalshi demo order rejected with status ${response.status}`);
  }

  return {
    adapter: "kalshi-demo-api",
    request: {
      ticker: orderBody.ticker,
      client_order_id: orderBody.client_order_id,
      side: orderBody.side,
      count: orderBody.count,
      price: orderBody.price,
    },
    response: responseBody,
  };
}

export function signKalshiRequest({
  privateKey,
  timestamp,
  method,
  path,
}: {
  privateKey: string;
  timestamp: string;
  method: "GET" | "POST" | "DELETE";
  path: string;
}): string {
  const normalizedKey = privateKey.replace(/\\n/g, "\n");
  const keyObject = createPrivateKey(normalizedKey);
  const pathWithoutQuery = path.split("?")[0];
  const message = Buffer.from(`${timestamp}${method}${pathWithoutQuery}`);
  const signature = sign("sha256", message, {
    key: keyObject,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
  });

  return signature.toString("base64");
}

async function safeJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
