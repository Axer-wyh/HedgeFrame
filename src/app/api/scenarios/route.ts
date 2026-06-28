import { NextResponse } from "next/server";
import { z } from "zod";

import { getOptionalDemoUser } from "@/lib/app/account-route-utils";
import { apiErrorResponse, parseJsonBody } from "@/lib/app/api-utils";
import { createScenario } from "@/lib/app/hedgeframe-service";
import { getRepository } from "@/lib/app/repository-factory";

const createScenarioSchema = z.object({
  rawText: z.string().min(10),
  overrides: z
    .object({
      subject: z.string().optional(),
      location: z.string().optional(),
      trigger: z.string().optional(),
      exposureAmount: z.number().positive().optional(),
      budget: z.number().positive().optional(),
      targetCoverage: z.number().min(0.05).max(1).optional(),
      timeWindow: z
        .object({
          start: z.string(),
          end: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const payload = await parseJsonBody(
    request,
    createScenarioSchema,
    "Scenario fields are invalid.",
  );

  if (!payload.ok) {
    return payload.response;
  }

  try {
    const repository = getRepository();
    const user = await getOptionalDemoUser(repository, request);
    const scenario = await createScenario(repository, {
      ...payload.data,
      userId: user?.id,
    });
    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Unable to create scenario.");
  }
}
