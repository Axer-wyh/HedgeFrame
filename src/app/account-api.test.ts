import { describe, expect, it, vi } from "vitest";

import { GET as dashboardGet } from "./api/account/dashboard/route";
import { GET as ordersGet } from "./api/account/orders/route";
import { GET as profileGet, PATCH as profilePatch } from "./api/account/profile/route";
import { POST as demoLoginPost } from "./api/auth/demo-login/route";
import { POST as logoutPost } from "./api/auth/logout/route";
import { POST as createPlanPost } from "./api/hedge-plans/route";
import { GET as meGet } from "./api/me/route";
import { POST as executeDemoPost } from "./api/orders/demo/route";
import { POST as createScenarioPost } from "./api/scenarios/route";
import { GET as matchesGet } from "./api/scenarios/[id]/matches/route";

vi.stubEnv("HEDGEFRAME_REPOSITORY", "memory");

describe("Account API", () => {
  it("creates a demo session, exposes the current user, updates profile, and logs out", async () => {
    const loginResponse = await demoLoginPost(request("/api/auth/demo-login"));
    const cookie = loginResponse.headers.get("set-cookie") ?? "";

    expect(loginResponse.status).toBe(201);
    expect(cookie).toContain("hf_demo_session=");

    const meResponse = await meGet(request("/api/me", { cookie }));
    const mePayload = (await meResponse.json()) as {
      authenticated: boolean;
      user: { displayName: string };
    };

    expect(mePayload.authenticated).toBe(true);
    expect(mePayload.user.displayName).toBe("Demo operator");

    const patchResponse = await profilePatch(
      request("/api/account/profile", {
        cookie,
        method: "PATCH",
        body: {
          displayName: "Avery Risk",
          email: "avery@hedgeframe.test",
          organization: "North Pier Events",
          role: "Event operator",
        },
      }),
    );

    expect(patchResponse.status).toBe(200);

    const profileResponse = await profileGet(
      request("/api/account/profile", { cookie }),
    );
    const profilePayload = (await profileResponse.json()) as {
      user: { organization: string };
    };

    expect(profilePayload.user.organization).toBe("North Pier Events");

    const logoutResponse = await logoutPost(
      request("/api/auth/logout", { cookie }),
    );

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("returns only the signed-in user's dashboard and order data", async () => {
    const firstLogin = await demoLoginPost(request("/api/auth/demo-login"));
    const firstCookie = firstLogin.headers.get("set-cookie") ?? "";
    const secondLogin = await demoLoginPost(request("/api/auth/demo-login"));
    const secondCookie = secondLogin.headers.get("set-cookie") ?? "";

    const scenarioResponse = await createScenarioPost(
      request("/api/scenarios", {
        cookie: firstCookie,
        method: "POST",
        body: {
          rawText:
            "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
        },
      }),
    );
    const scenarioPayload = (await scenarioResponse.json()) as {
      scenario: { id: string };
    };
    const matchesResponse = await matchesGet(
      request(`/api/scenarios/${scenarioPayload.scenario.id}/matches`, {
        cookie: firstCookie,
      }),
      { params: Promise.resolve({ id: scenarioPayload.scenario.id }) },
    );
    const matchesPayload = (await matchesResponse.json()) as {
      matches: Array<{ market: { id: string } }>;
    };
    const planResponse = await createPlanPost(
      request("/api/hedge-plans", {
        cookie: firstCookie,
        method: "POST",
        body: {
          scenarioId: scenarioPayload.scenario.id,
          marketIds: [matchesPayload.matches[0].market.id],
          budget: 12000,
          targetCoverage: 0.4,
        },
      }),
    );
    const planPayload = (await planResponse.json()) as { plan: { id: string } };

    await executeDemoPost(
      request("/api/orders/demo", {
        cookie: firstCookie,
        method: "POST",
        body: {
          planId: planPayload.plan.id,
          confirmationText: "I understand this is not insurance.",
          idempotencyKey: "account-api-order",
        },
      }),
    );

    const firstOrdersResponse = await ordersGet(
      request("/api/account/orders", { cookie: firstCookie }),
    );
    const secondOrdersResponse = await ordersGet(
      request("/api/account/orders", { cookie: secondCookie }),
    );
    const dashboardResponse = await dashboardGet(
      request("/api/account/dashboard", { cookie: firstCookie }),
    );

    const firstOrders = (await firstOrdersResponse.json()) as {
      orders: Array<{ scenarioRawText: string }>;
    };
    const secondOrders = (await secondOrdersResponse.json()) as {
      orders: unknown[];
    };
    const dashboard = (await dashboardResponse.json()) as {
      dashboard: { metrics: { demoOrders: number; activeScenarios: number } };
    };

    expect(firstOrders.orders).toHaveLength(1);
    expect(firstOrders.orders[0].scenarioRawText).toContain("heavy rain hits Austin");
    expect(secondOrders.orders).toHaveLength(0);
    expect(dashboard.dashboard.metrics).toMatchObject({
      activeScenarios: 1,
      demoOrders: 1,
    });
  });

  it("blocks account data without a demo session", async () => {
    const response = await ordersGet(request("/api/account/orders"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Demo login required." });
  });
});

function request(
  path: string,
  options: {
    method?: string;
    cookie?: string;
    body?: Record<string, unknown>;
  } = {},
): Request {
  return new Request(`http://localhost${path}`, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(options.cookie ? { cookie: options.cookie } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}
