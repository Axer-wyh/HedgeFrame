import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/lib/app/api-utils";
import { getRepository } from "@/lib/app/repository-factory";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const execution = await getRepository().getOrderExecution(id);

    if (!execution) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ execution });
  } catch (error) {
    return apiErrorResponse(error, "Unable to load order.");
  }
}
