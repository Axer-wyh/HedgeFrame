import { NextResponse } from "next/server";

import { readDemoSessionToken } from "./demo-session";
import type { DemoUser, HedgeFrameRepository } from "./repository";

export async function getOptionalDemoUser(
  repository: HedgeFrameRepository,
  request: Request,
): Promise<DemoUser | null> {
  const sessionToken = readDemoSessionToken(request);

  if (!sessionToken) {
    return null;
  }

  return repository.getUserBySessionToken(sessionToken);
}

export async function requireDemoUser(
  repository: HedgeFrameRepository,
  request: Request,
): Promise<
  | { ok: true; user: DemoUser; sessionToken: string }
  | { ok: false; response: NextResponse<{ error: string }> }
> {
  const sessionToken = readDemoSessionToken(request);

  if (!sessionToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Demo login required." },
        { status: 401 },
      ),
    };
  }

  const user = await repository.getUserBySessionToken(sessionToken);

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Demo login required." },
        { status: 401 },
      ),
    };
  }

  return { ok: true, user, sessionToken };
}
