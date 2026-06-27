import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomePage } from "./home-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("HomePage", () => {
  it("renders a landing page with product intake, auth entry, and brand sections", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "AI and prediction markets for long-tail hedging.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "We help you quickly build risk-transfer and hedge strategies with prediction-market tools.",
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Map markets" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Markets/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select language" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle day and night mode" })).toBeInTheDocument();
    expect(screen.getByText("Built for exposed operators.")).toBeInTheDocument();
    expect(screen.getByText("Event organizers")).toBeInTheDocument();
    expect(screen.getByText(/Execution boundaries/)).toBeInTheDocument();
    expect(screen.getAllByText(/This is not insurance/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/保险赔付|保证覆盖|无风险/)).not.toBeInTheDocument();
  });
});
