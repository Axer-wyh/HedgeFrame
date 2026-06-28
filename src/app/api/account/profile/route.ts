import { NextResponse } from "next/server";
import { z } from "zod";

import { requireDemoUser } from "@/lib/app/account-route-utils";
import { apiErrorResponse, parseJsonBody } from "@/lib/app/api-utils";
import { getRepository } from "@/lib/app/repository-factory";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  organization: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(80),
});

export async function GET(request: Request) {
  const repository = getRepository();
  const auth = await requireDemoUser(repository, request);

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({ user: auth.user });
}

export async function PATCH(request: Request) {
  const payload = await parseJsonBody(
    request,
    profileSchema,
    "Profile fields are invalid.",
  );

  if (!payload.ok) {
    return payload.response;
  }

  const repository = getRepository();
  const auth = await requireDemoUser(repository, request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const user = await repository.updateUserProfile(auth.user.id, payload.data);
    return NextResponse.json({ user });
  } catch (error) {
    return apiErrorResponse(error, "Unable to update profile.");
  }
}
