import { render, screen, within } from "@testing-library/react";
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
        name: "Name what you're afraid of. We'll find the hedge.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Plain-words worry to executable hedge.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("你担心什么，就说出来试试。")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Map markets" }).length).toBeGreaterThan(0);
    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: "How it works" })).toBeInTheDocument();
    expect(header.getByRole("link", { name: "Use cases" })).toBeInTheDocument();
    expect(header.getByRole("button", { name: /Markets/ })).toBeInTheDocument();
    expect(header.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(header.queryByRole("button", { name: "Connect wallet" })).not.toBeInTheDocument();
    expect(header.getByRole("link", { name: "Try a scenario" })).toBeInTheDocument();
    expect(header.getByRole("button", { name: "Select language" })).toBeInTheDocument();
    expect(header.getByRole("button", { name: "Toggle day and night mode" })).toBeInTheDocument();
    expect(screen.getByText("From one worry to one hedge path.")).toBeInTheDocument();
    expect(screen.getByText("We'll also tell you when a hedge isn't worth it.")).toBeInTheDocument();
    expect(screen.getByText("Outdoor wedding planner")).toBeInTheDocument();
    expect(screen.getByText("For people carrying weird risk.")).toBeInTheDocument();
    expect(screen.getByText(/Trust before execution/)).toBeInTheDocument();
    expect(screen.getAllByText(/Not insurance/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Making hedging a part of your life.")).toBeInTheDocument();
    expect(screen.queryByText(/保险赔付|保证覆盖|无风险/)).not.toBeInTheDocument();
  });
});
