import { NextResponse } from "next/server";

import { requireDemoUser } from "@/lib/app/account-route-utils";
import { apiErrorResponse } from "@/lib/app/api-utils";
import { getRepository } from "@/lib/app/repository-factory";

export async function GET(request: Request) {
  const repository = getRepository();
  const auth = await requireDemoUser(repository, request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const dashboard = await repository.getAccountDashboard(auth.user.id);
    return NextResponse.json({ dashboard });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load dashboard.");
  }
}
