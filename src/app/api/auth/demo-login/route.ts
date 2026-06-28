import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE } from "@/lib/app/demo-session";
import { getRepository } from "@/lib/app/repository-factory";

export async function POST() {
  const { user, sessionToken, expiresAt } =
    await getRepository().createDemoSession();
  const response = NextResponse.json({ user }, { status: 201 });

  response.cookies.set(DEMO_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });

  return response;
}
