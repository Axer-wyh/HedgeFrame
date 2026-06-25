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
        name: "What risk are you exposed to?",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Map markets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
    expect(screen.getByText("How HedgeFrame works")).toBeInTheDocument();
    expect(screen.getByText("Execution boundaries")).toBeInTheDocument();
    expect(screen.getAllByText(/This is not insurance/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/保险赔付|保证覆盖|无风险/)).not.toBeInTheDocument();
  });
});
