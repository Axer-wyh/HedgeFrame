import { NextResponse } from "next/server";
import { z } from "zod";

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
    const scenario = await createScenario(getRepository(), payload.data);
    return NextResponse.json({ scenario }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Unable to create scenario.");
  }
}
