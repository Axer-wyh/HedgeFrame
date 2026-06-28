import { NextResponse } from "next/server";

import {
  DEMO_SESSION_COOKIE,
  readDemoSessionToken,
} from "@/lib/app/demo-session";
import { getRepository } from "@/lib/app/repository-factory";

export async function POST(request: Request) {
  const sessionToken = readDemoSessionToken(request);

  if (sessionToken) {
    await getRepository().clearDemoSession(sessionToken);
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
