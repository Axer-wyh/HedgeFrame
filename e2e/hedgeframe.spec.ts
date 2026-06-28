import { expect, test } from "@playwright/test";

test("weather event user can create and execute a Kalshi demo hedge", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("heading", {
      name: "Name what you're afraid of. We'll find the hedge.",
    }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      page.getByText("Name what you're afraid of.", { exact: true }).evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return Array.from(range.getClientRects()).filter((rect) => rect.width > 1).length;
      }),
    )
    .toBe(1);
  await expect(page.getByText("Say what you're worried about.")).toBeVisible();
  const header = page.locator("header");
  await expect(header.getByRole("link", { name: "How it works" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Use cases" })).toBeVisible();
  const marketsLink = header.getByRole("link", { name: "Markets" });
  await expect(marketsLink).toBeVisible();
  await expect(marketsLink).toHaveAttribute("href", "/markets");
  await expect(header.getByRole("button", { name: /Markets/ })).toHaveCount(0);
  await expect(header.getByRole("link", { name: "Try a scenario" })).toBeVisible();
  await expect(header.getByRole("button", { name: "Connect wallet" })).toHaveCount(0);
  await header.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("dialog", { name: "Log in" })).toBeVisible();
  await page.getByRole("button", { name: "Continue in demo mode" }).click();
  await expect(
    header.getByRole("button", { name: /Open account menu for Demo operator/ }),
  ).toBeVisible();
  await expect(page.getByText("REAL WORRY", { exact: true })).toBeVisible();
  await expect(page.getByText("From one worry to one hedge path.")).toBeVisible();
  const partnerRail = page.getByRole("region", {
    name: "Market infrastructure platforms",
  });
  await expect(partnerRail).toBeVisible();
  await expect(partnerRail.getByRole("link", { name: "Kalshi" }).first()).toBeVisible();
  await expect(partnerRail.getByRole("link", { name: "Polymarket" }).first()).toBeVisible();
  await expect(page.getByText("Outdoor wedding planner")).toBeVisible();
  await expect(page.getByText("For people carrying weird risk.")).toBeVisible();

  await page.mouse.wheel(0, 1600);
  await expect
    .poll(async () =>
      page
        .locator("[data-hero-prompt]")
        .evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeGreaterThan(0.9);
  await expect(page.getByRole("button", { name: "Map markets" }).first()).toBeVisible();
  const heroPromptWidth = await page
    .locator("[data-hero-prompt]")
    .evaluate((element) => Math.round(element.getBoundingClientRect().width));
  await page.locator("#try-scenario").scrollIntoViewIfNeeded();
  const bottomPrompt = page.locator("[data-bottom-prompt]");
  await expect(bottomPrompt).toBeVisible();
  const bottomPromptWidth = await bottomPrompt.evaluate((element) =>
    Math.round(element.getBoundingClientRect().width),
  );
  expect(Math.abs(bottomPromptWidth - heroPromptWidth)).toBeLessThanOrEqual(2);
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.getByRole("button", { name: "Map this scenario" }).click();
  await expect(page).toHaveURL(/\/markets/);
  await expect(page.getByRole("link", { name: "HedgeFrame", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "How it works" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Use cases" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Markets" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to home" })).toHaveCount(0);
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
  await expect(page.locator("[data-market-card-title]")).toHaveCount(15);
  await expect(page.locator("[data-market-card]")).toHaveCount(15);
  await expect(page.getByText("Showing 1-15 of 15")).toBeVisible();
  await expect(page.getByText("30 per page")).toBeVisible();
  await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Continue 1\/15/ })).toBeEnabled();
  const firstMarketCard = page.locator("[data-market-card]").first();
  await expect(firstMarketCard).toHaveAttribute("data-selected", "true");
  await expect(firstMarketCard.getByRole("button", { name: "View details" })).toBeVisible();
  await firstMarketCard.click();
  await expect(page.getByRole("button", { name: /Continue 0\/15/ })).toBeDisabled();
  await expect(firstMarketCard).toHaveAttribute("data-selected", "false");
  await firstMarketCard.click();
  await expect(page.getByRole("button", { name: /Continue 1\/15/ })).toBeEnabled();
  await expect(firstMarketCard).toHaveAttribute("data-selected", "true");
  const filterWidths = await Promise.all(
    ["All", "Kalshi demo", "Polymarket", "Others"].map(async (name) => {
      const box = await page.getByRole("button", { name, exact: true }).boundingBox();
      return Math.round(box?.width ?? 0);
    }),
  );
  expect(filterWidths.every((width) => Math.abs(width - filterWidths[0]) <= 1)).toBe(true);
  const sortButton = page.getByRole("button", { name: /Sort candidates/ });
  await expect(sortButton).toContainText("Default");
  await sortButton.click();
  await page.getByRole("option", { name: "Liquidity" }).click();
  await expect(page.locator("[data-market-card-title]").first()).toContainText(
    "Will US CPI exceed 3 percent",
  );
  await sortButton.click();
  await page.getByRole("option", { name: "Relevance" }).click();
  await expect(page.locator("[data-market-card-title]").first()).toContainText(
    "Will Austin record heavy rain",
  );
  await expect(page.getByText("Direction").first()).toBeVisible();
  await expect(page.getByText("Buy Yes").first()).toBeVisible();
  await firstMarketCard.getByRole("button", { name: "View details" }).click();
  await expect(page.getByRole("button", { name: /Continue 1\/15/ })).toBeEnabled();
  const marketDialog = page.getByRole("dialog", {
    name: "Will Austin record heavy rain on Oct 12, 2026?",
  });
  await expect(marketDialog).toBeVisible();
  await expect(
    marketDialog.getByRole("link", {
      name: /Open kalshi market page for Will Austin record heavy rain/,
    }),
  ).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("img", { name: /Probability trend for Will Austin record heavy rain/ })).toBeVisible();
  await expect(marketDialog.getByText("YES", { exact: true })).toBeVisible();
  await expect(marketDialog.getByText("NO", { exact: true })).toBeVisible();
  await expect(page.getByText("Rules and market background")).toBeVisible();
  await expect(marketDialog.getByRole("button", { name: "展开" })).toBeVisible();
  await expect(marketDialog.getByText("Order ticket")).toBeVisible();
  await expect(marketDialog.getByText("Action")).toBeVisible();
  await expect(marketDialog.getByText("Outcome")).toBeVisible();
  await expect(marketDialog.getByText("Buy", { exact: true })).toBeVisible();
  await expect(marketDialog.getByText("Yes", { exact: true })).toBeVisible();
  await expect(marketDialog.getByRole("button", { name: "Sell" })).toHaveCount(0);
  await expect(marketDialog.getByRole("button", { name: /No 68%/ })).toHaveCount(0);
  await expect(marketDialog.getByLabel("Quantity")).toHaveValue("100");
  await marketDialog.getByRole("button", { name: "250" }).click();
  await expect(marketDialog.getByLabel("Quantity")).toHaveValue("250");
  await expect(marketDialog.getByText("$80.00")).toBeVisible();
  await expect(marketDialog.getByText("Demo balance")).toBeVisible();
  await expect(marketDialog.getByRole("button", { name: "Confirm" })).toBeVisible();
  await page.getByRole("button", { name: "Close market details" }).click();
  await expect(page.getByRole("dialog", { name: "Will Austin record heavy rain on Oct 12, 2026?" })).toBeHidden();

  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("dialog", { name: "Hedge plan" })).toBeVisible();
  await expect(page.getByText("Quote detail")).toBeVisible();
  await expect(page.getByText("Max payout")).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect wallet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run demo order" })).toHaveCount(0);
  await page.getByRole("button", { name: "Connect wallet" }).click();
  await expect(page.getByText("Demo wallet connected")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeDisabled();

  await page.getByLabel(/I understand this is not insurance/).check();
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByText(/Demo execution filled/)).toBeVisible();
  await page.goto("/account?view=orders");
  await expect(page.getByRole("link", { name: "HedgeFrame", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Markets" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to home" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "My orders" })).toBeVisible();
  await expect(page.getByText("My outdoor event loses $80k")).toBeVisible();
  await expect(page.getByText("filled", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Order exec_/ }).click();
  await expect(page.getByText("Associated hedge plan")).toBeVisible();

  await page.goto("/account?view=profile");
  await page.getByLabel("Organization").fill("North Pier Events");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Organization")).toHaveValue("North Pier Events");

  await page.goto("/account?view=security");
  await expect(page.getByRole("heading", { name: "Security center" })).toBeVisible();
  await expect(page.getByText("Platform Kalshi demo account")).toBeVisible();
  await expect(page.getByText("Wallet not connected")).toBeVisible();
  await expect(page.getByText("No private keys stored")).toBeVisible();
  await expect(page.getByText(/insurance payout|guaranteed coverage|risk-free/i)).toHaveCount(0);
  await expect(
    page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).resolves.toBe(true);
});
