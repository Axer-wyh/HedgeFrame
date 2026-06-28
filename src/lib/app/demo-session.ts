import { createHash, randomBytes } from "node:crypto";

export const DEMO_SESSION_COOKIE = "hf_demo_session";
export const DEMO_SESSION_DAYS = 30;

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken).digest("hex");
}

export function getSessionExpiry(now = new Date()): Date {
  return new Date(now.getTime() + DEMO_SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export function readDemoSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const cookie = cookies.find((item) =>
    item.startsWith(`${DEMO_SESSION_COOKIE}=`),
  );

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(DEMO_SESSION_COOKIE.length + 1));
}
