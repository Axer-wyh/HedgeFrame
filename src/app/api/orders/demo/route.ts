import { NextResponse } from "next/server";
import { z } from "zod";

import { apiErrorResponse, parseJsonBody } from "@/lib/app/api-utils";
import { createDemoOrder } from "@/lib/app/hedgeframe-service";
import { getRepository } from "@/lib/app/repository-factory";

const createDemoOrderSchema = z.object({
  planId: z.string().min(1),
  confirmationText: z.string().min(10),
  idempotencyKey: z.string().min(8),
});

export async function POST(request: Request) {
  const payload = await parseJsonBody(
    request,
    createDemoOrderSchema,
    "Order confirmation is invalid.",
  );

  if (!payload.ok) {
    return payload.response;
  }

  try {
    const execution = await createDemoOrder(getRepository(), payload.data);
    return NextResponse.json({ execution }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Unable to execute demo order.");
  }
}
