import { NextResponse } from "next/server";
import { z } from "zod";

import { apiErrorResponse, parseJsonBody } from "@/lib/app/api-utils";
import { createHedgePlan } from "@/lib/app/hedgeframe-service";
import { getRepository } from "@/lib/app/repository-factory";

const createHedgePlanSchema = z.object({
  scenarioId: z.string().min(1),
  marketIds: z.array(z.string()).min(1),
  budget: z.number().positive(),
  targetCoverage: z.number().min(0.05).max(1),
});

export async function POST(request: Request) {
  const payload = await parseJsonBody(
    request,
    createHedgePlanSchema,
    "Hedge plan fields are invalid.",
  );

  if (!payload.ok) {
    return payload.response;
  }

  try {
    const plan = await createHedgePlan(getRepository(), payload.data);
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Unable to create plan.");
  }
}
