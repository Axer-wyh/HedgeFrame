import { describe, expect, it } from "vitest";

import { POST as createPlanPost } from "./api/hedge-plans/route";
import { POST as executeDemoPost } from "./api/orders/demo/route";
import { POST as parseScenarioPost } from "./api/scenarios/parse/route";
import { POST as createScenarioPost } from "./api/scenarios/route";

describe("API route guards", () => {
  it("returns sanitized 400 responses for malformed JSON", async () => {
    const responses = await Promise.all([
      parseScenarioPost(badJsonRequest()),
      createScenarioPost(badJsonRequest()),
      createPlanPost(badJsonRequest()),
      executeDemoPost(badJsonRequest()),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      400, 400, 400, 400,
    ]);

    for (const response of responses) {
      const payload = (await response.json()) as { error: string };
      expect(payload.error).not.toMatch(/SyntaxError|Prisma|stack/i);
    }
  });
});

function badJsonRequest(): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{bad json",
  });
}
