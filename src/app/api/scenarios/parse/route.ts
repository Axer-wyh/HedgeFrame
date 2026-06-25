import { NextResponse } from "next/server";
import { z } from "zod";

import { parseJsonBody } from "@/lib/app/api-utils";
import { parseScenario } from "@/lib/domain/scenario-parser";

const parseScenarioSchema = z.object({
  rawText: z.string().min(10),
});

export async function POST(request: Request) {
  const payload = await parseJsonBody(
    request,
    parseScenarioSchema,
    "Scenario text is required.",
  );

  if (!payload.ok) {
    return payload.response;
  }

  return NextResponse.json({ scenario: parseScenario(payload.data.rawText) });
}
