import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/app/api-utils";
import { getScenarioMatches } from "@/lib/app/hedgeframe-service";
import { getRepository } from "@/lib/app/repository-factory";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const matches = await getScenarioMatches(getRepository(), id);
    return NextResponse.json({ matches });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load matches.");
  }
}
