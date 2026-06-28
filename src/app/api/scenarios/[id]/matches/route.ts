import { NextResponse } from "next/server";

import { getOptionalDemoUser } from "@/lib/app/account-route-utils";
import { apiErrorResponse } from "@/lib/app/api-utils";
import { getScenarioMatches } from "@/lib/app/hedgeframe-service";
import { getRepository } from "@/lib/app/repository-factory";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const repository = getRepository();
    const user = await getOptionalDemoUser(repository, request);
    const matches = await getScenarioMatches(repository, id, { userId: user?.id });
    return NextResponse.json({ matches });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load matches.");
  }
}
