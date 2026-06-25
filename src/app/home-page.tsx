"use client";

import {
  ChartLineUp,
  Check,
  CloudRain,
  LockKey,
  MagnifyingGlass,
  ShieldCheck,
  Wallet,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { IdentityPanel, type IdentityPanelMode } from "./identity-panel";
import { DecryptedText, Reveal } from "./motion-primitives";

const sampleScenario =
  "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.";

export function HomePage() {
  const router = useRouter();
  const [rawText, setRawText] = useState(sampleScenario);
  const [identityPanel, setIdentityPanel] = useState<IdentityPanelMode | null>(null);

  function submitScenario() {
    const scenario = rawText.trim();

    if (scenario.length < 10) return;
    router.push(`/markets?scenario=${encodeURIComponent(scenario)}`);
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[rgb(var(--hf-bg))] text-[rgb(var(--hf-text))]">
      <PixelAtmosphere />
      <header className="sticky top-0 z-30 border-b border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-bg))]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <BrandMark />
            <span className="font-mono text-sm font-semibold tracking-[0.08em] text-[rgb(var(--hf-text))]">
              HedgeFrame
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[rgb(var(--hf-muted))] md:flex">
            <a href="#how" className="transition hover:text-[rgb(var(--hf-text))]">
              How it works
            </a>
            <a href="#safeguards" className="transition hover:text-[rgb(var(--hf-text))]">
              Boundaries
            </a>
            <a href="#coverage" className="transition hover:text-[rgb(var(--hf-text))]">
              Scenarios
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIdentityPanel("login")}
              className="hidden h-10 items-center gap-2 rounded-[8px] border border-[rgb(var(--hf-line-strong))] px-3 text-sm text-[rgb(var(--hf-text))] transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px sm:inline-flex"
            >
              <LockKey size={15} />
              Log in
            </button>
            <button
              type="button"
              onClick={() => setIdentityPanel("wallet")}
              className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[rgb(var(--hf-accent))] px-3 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px"
            >
              <Wallet size={15} weight="bold" />
              Connect wallet
            </button>
          </div>
        </div>
      </header>

      <section
        id="top"
        className="mx-auto grid min-h-[calc(86dvh-64px)] max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-center lg:px-8 lg:py-10"
      >
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-[rgb(var(--hf-accent))]">
            Prediction-market hedge discovery
          </p>
          <h1 className="max-w-[780px] text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[rgb(var(--hf-text))] sm:text-5xl lg:text-6xl">
            What risk are you exposed to?
          </h1>
          <p className="mt-5 max-w-[54ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
            Map exposed revenue to prediction-market contracts before you review basis risk.
          </p>
          <div className="mt-7 rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]/82 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <label
              htmlFor="landing-risk-scenario"
              className="mb-2 block px-1 text-sm font-medium text-[rgb(var(--hf-text))]"
            >
              Risk scenario
            </label>
            <textarea
              id="landing-risk-scenario"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={4}
              className="min-h-32 w-full resize-none rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-4 py-3 text-base leading-7 text-[rgb(var(--hf-text))] outline-none transition placeholder:text-[rgb(var(--hf-muted))] focus:border-[rgb(var(--hf-accent))] focus:ring-2 focus:ring-[rgb(var(--hf-accent))]/25"
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={submitScenario}
                disabled={rawText.trim().length < 10}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[rgb(var(--hf-accent))] px-4 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[rgb(var(--hf-disabled))] disabled:text-[rgb(var(--hf-muted))]"
              >
                <MagnifyingGlass size={16} weight="bold" />
                Map markets
              </button>
              <span className="text-sm leading-6 text-[rgb(var(--hf-muted))]">
                This is not insurance. Demo execution only.
              </span>
            </div>
          </div>
        </div>
        <RiskMapPreview />
      </section>

      <section id="how" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-5xl">
              How HedgeFrame works
            </h2>
            <p className="mt-4 max-w-[58ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
              A scenario becomes a transparent set of candidates, calculations, and execution gates.
            </p>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-6">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["Parse", "Extract object, location, date range, trigger, exposure, and budget."],
                ["Rank", "Score markets by event fit, time overlap, liquidity, rules, and basis risk."],
                ["Execute", "Use limit-only Kalshi demo orders with quote expiry and idempotency."],
              ].map(([title, body]) => (
                <div key={title} className="border-l border-[rgb(var(--hf-line))] pl-4">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal
            delay={0.06}
            className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel-strong))] p-6"
          >
            <DecryptedText
              text="basis risk visible before execution"
              className="font-mono text-sm text-[rgb(var(--hf-accent))]"
            />
            <p className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.02em]">
              Recommendations explain what matches, what fails, and why a market can be blocked.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="coverage" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-6">
            <CloudRain size={28} className="text-[rgb(var(--hf-accent))]" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.025em]">
              Weather first, edge risks visible.
            </h2>
            <p className="mt-4 text-base leading-7 text-[rgb(var(--hf-muted))]">
              The primary path targets event and weather exposure. Shipping and geopolitical scenarios can be parsed, but stay low-confidence unless a direct market exists.
            </p>
          </Reveal>
          <Reveal delay={0.06} className="grid gap-4 sm:grid-cols-2">
            {[
              ["Outdoor event", "Rainfall and storm contracts around date-specific losses."],
              ["Venue revenue", "Candidate discovery for cancellations, footfall, and weather-sensitive spend."],
              ["Shipping route", "Low-confidence mapping with clear non-execution reasons."],
              ["Audit trail", "Scenario, match version, quote, and demo response captured."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-5"
              >
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">{body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="safeguards" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel-strong))] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <ShieldCheck size={30} className="text-[rgb(var(--hf-accent))]" />
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                Execution boundaries
              </h2>
              <p className="mt-4 text-base leading-7 text-[rgb(var(--hf-muted))]">
                The prototype helps discover and simulate hedges. It does not underwrite losses, hold funds, or store private keys.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Server-side Kalshi credentials only",
                "Quote expiry blocks stale execution",
                "Limit orders and idempotency keys",
                "Market closure and liquidity rechecked",
                "Polymarket read-only in phase one",
                "Audit log for every recommendation",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4 text-sm leading-6"
                >
                  <Check size={16} weight="bold" className="mt-1 text-[rgb(var(--hf-accent))]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="mx-auto flex max-w-[1400px] flex-col gap-4 border-t border-[rgb(var(--hf-line))] px-4 py-8 text-sm text-[rgb(var(--hf-muted))] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>HedgeFrame. Market-based risk hedge discovery.</span>
        <span>This is not insurance or investment advice.</span>
      </footer>

      {identityPanel ? (
        <IdentityPanel mode={identityPanel} onClose={() => setIdentityPanel(null)} />
      ) : null}
    </main>
  );
}

function RiskMapPreview() {
  return (
    <Reveal className="relative min-h-[460px] rounded-[20px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
      <div className="absolute inset-4 rounded-[16px] border border-[rgb(var(--hf-line))] bg-[linear-gradient(135deg,rgba(150,249,255,0.08),rgba(11,17,22,0.2)_42%,rgba(150,249,255,0.04))]" />
      <div className="relative grid h-full min-h-[420px] grid-rows-[auto_1fr_auto] gap-4">
        <div className="flex items-center justify-between rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))]/78 p-3">
          <DecryptedText
            text="risk graph online"
            className="font-mono text-xs text-[rgb(var(--hf-accent))]"
          />
          <span className="font-mono text-xs text-[rgb(var(--hf-muted))]">mock catalog</span>
        </div>
        <div className="relative overflow-hidden rounded-[16px] border border-[rgb(var(--hf-line))]">
          <div className="absolute inset-0 hf-risk-map" />
          <div className="absolute left-[12%] top-[22%] h-3 w-3 rounded-full bg-[rgb(var(--hf-accent))] shadow-[0_0_28px_rgba(150,249,255,0.55)]" />
          <div className="absolute right-[18%] top-[34%] h-3 w-3 rounded-full border border-[rgb(var(--hf-accent))] bg-[rgb(var(--hf-ink))]" />
          <div className="absolute bottom-[24%] left-[42%] h-3 w-3 rounded-full border border-[rgb(var(--hf-accent))] bg-[rgb(var(--hf-ink))]" />
          <div className="absolute bottom-4 left-4 right-4 grid gap-2 sm:grid-cols-3">
            {["weather", "liquidity", "basis risk"].map((item) => (
              <div
                key={item}
                className="rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]/86 px-3 py-2 font-mono text-xs text-[rgb(var(--hf-text))] backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <PreviewMetric label="Candidates" value="5" />
          <PreviewMetric label="Demo eligible" value="2" />
          <PreviewMetric label="Quote TTL" value="5m" />
        </div>
      </div>
    </Reveal>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3">
      <div className="font-mono text-[11px] text-[rgb(var(--hf-muted))]">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold text-[rgb(var(--hf-text))]">{value}</div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] text-[rgb(var(--hf-accent))]">
      <ChartLineUp size={19} weight="bold" />
    </div>
  );
}

function PixelAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
      style={{
        backgroundImage:
          "linear-gradient(rgba(150,249,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(150,249,255,0.055) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}
