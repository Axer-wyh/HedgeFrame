import { NextResponse } from "next/server";
import type { z } from "zod";

const knownClientErrors = new Map<string, number>([
  ["Scenario not found", 404],
  ["Hedge plan not found", 404],
  ["Order not found", 404],
  ["No executable demo markets selected", 400],
  ["Quote expired", 409],
  ["Risk acknowledgement required", 400],
  ["Idempotency key required", 400],
  ["No order legs selected", 400],
  ["Only Kalshi demo execution is enabled", 400],
  ["Market is no longer open", 409],
  ["Market liquidity is below demo threshold", 409],
  ["Market ask is outside demo limit guard", 409],
  ["Market ask moved above limit price", 409],
]);

export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
  invalidMessage: string,
): Promise<
  | { ok: true; data: z.infer<Schema> }
  | { ok: false; response: NextResponse }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: invalidMessage }, { status: 400 }),
    };
  }

  const payload = schema.safeParse(body);

  if (!payload.success) {
    return {
      ok: false,
      response: NextResponse.json({ error: invalidMessage }, { status: 400 }),
    };
  }

  return { ok: true, data: payload.data };
}

export function apiErrorResponse(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : "";
  const status = knownClientErrors.get(message);

  if (status) {
    return NextResponse.json({ error: message }, { status });
  }

  console.error(error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
