import { NextResponse } from "next/server";

import { getOptionalDemoUser } from "@/lib/app/account-route-utils";
import { getRepository } from "@/lib/app/repository-factory";

export async function GET(request: Request) {
  const user = await getOptionalDemoUser(getRepository(), request);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({ authenticated: true, user });
}
