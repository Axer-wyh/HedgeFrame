import { expect, test } from "@playwright/test";

test("weather event user can create and execute a Kalshi demo hedge", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("heading", {
      name: "AI and prediction markets based hedging tool.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Markets/ })).toBeVisible();
  await expect(page.getByText("FEATURED WORKFLOW")).toBeVisible();
  await expect(page.getByText("Built for exposed operators.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect wallet" })).toBeVisible();

  await page.mouse.wheel(0, 1600);
  await expect
    .poll(async () =>
      page
        .locator("[data-hero-prompt]")
        .evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeGreaterThan(0.9);
  await expect(page.getByRole("button", { name: "Map markets" }).first()).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.getByRole("button", { name: "Map this scenario" }).click();
  await expect(page).toHaveURL(/\/markets/);
  await expect(page.getByText("Portfolio workspace")).toBeVisible();
  await expect(page.getByText("Will Austin record heavy rain")).toBeVisible();
  await expect(page.getByRole("button", { name: "Kalshi demo" })).toBeVisible();
  await expect(page.getByText("demo ready").first()).toBeVisible();
  const sourceMarketLink = page.getByRole("link", {
    name: /Open kalshi market page for Will Austin record heavy rain/,
  });
  await expect(sourceMarketLink).toHaveAttribute(
    "href",
    "https://kalshi.com/markets/KXRAIN-AUS-2026OCT12",
  );
  await expect(sourceMarketLink).toHaveAttribute("target", "_blank");
  const filterWidths = await Promise.all(
    ["All", "Kalshi demo", "Polymarket", "Others"].map(async (name) => {
      const box = await page.getByRole("button", { name, exact: true }).boundingBox();
      return Math.round(box?.width ?? 0);
    }),
  );
  expect(filterWidths.every((width) => Math.abs(width - filterWidths[0]) <= 1)).toBe(true);

  await page.getByRole("button", { name: "Build plan" }).click();
  await expect(page.getByText("Max payout")).toBeVisible();

  await page.getByLabel(/I understand this is not insurance/).check();
  await page.getByRole("button", { name: "Run demo order" }).click();

  await expect(page.getByText(/Demo execution filled/)).toBeVisible();
  await expect(
    page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).resolves.toBe(true);
});
