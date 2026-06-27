"use client";

import {
  ArrowRight,
  CaretDown,
  Check,
  CloudRain,
  GlobeHemisphereWest,
  LockKey,
  MagnifyingGlass,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Wallet,
} from "@phosphor-icons/react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { IdentityPanel, type IdentityPanelMode } from "./identity-panel";
import { DecryptedText, Reveal } from "./motion-primitives";

const sampleScenario =
  "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.";

const marketMenu = [
  ["Weather events", "Rain, snow, heat, wind, and event-window exposure."],
  ["Venue revenue", "Cancellation, access, and footfall-sensitive losses."],
  ["Shipping route review", "Parsed and explained, blocked unless market fit is strong."],
  ["Audit ledger", "Scenario, match version, quote, and demo response captured."],
];

const userGroups = [
  ["Event organizers", "When the weather can erase a weekend of revenue."],
  ["Venue owners", "When access, attendance, or cancellation risk hits the calendar."],
  ["SMB finance", "When a budgeted exposure needs a transparent hedge path."],
  ["Logistics coordinators", "When route risk needs a low-confidence review first."],
  ["Brokers and advisors", "When clients need the basis risk explained before action."],
  ["Risk ops", "When repeatable audit trails matter as much as the quote."],
];

const scenarios = [
  ["Austin outdoor rain", "Heavy rainfall around an event date", "demo ready"],
  ["Chicago snow closure", "Venue access and cancellation risk", "demo ready"],
  ["Dallas heat attendance", "Weather-sensitive footfall", "review"],
  ["Shipping route disruption", "Geopolitical route mapping", "low confidence"],
];

export function HomePage() {
  const router = useRouter();
  const [rawText, setRawText] = useState(sampleScenario);
  const [identityPanel, setIdentityPanel] = useState<IdentityPanelMode | null>(null);
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [tone, setTone] = useState<"dark" | "light">("dark");

  function submitScenario() {
    const scenario = rawText.trim();

    if (scenario.length < 10) return;
    router.push(`/markets?scenario=${encodeURIComponent(scenario)}`);
  }

  return (
    <main
      data-tone={tone}
      className="min-h-[100dvh] bg-[rgb(var(--hf-bg))] pt-14 text-[rgb(var(--hf-text))]"
    >
      <PixelField />
      <SiteHeader
        marketsOpen={marketsOpen}
        languageOpen={languageOpen}
        tone={tone}
        onMarketsToggle={() => {
          setLanguageOpen(false);
          setMarketsOpen((open) => !open);
        }}
        onLanguageToggle={() => {
          setMarketsOpen(false);
          setLanguageOpen((open) => !open);
        }}
        onToneToggle={() => setTone((value) => (value === "dark" ? "light" : "dark"))}
        onLogin={() => setIdentityPanel("login")}
        onWallet={() => setIdentityPanel("wallet")}
      />

      {marketsOpen ? <MarketsMegaMenu onClose={() => setMarketsOpen(false)} /> : null}
      {languageOpen ? <LanguageMenu onClose={() => setLanguageOpen(false)} /> : null}

      <PinnedHero rawText={rawText} onRawTextChange={setRawText} onSubmit={submitScenario} />
      <AudienceGrid />
      <MarketSystem />
      <ScenarioLibrary />
      <ExecutionBoundaries />
      <BottomPrompt rawText={rawText} onRawTextChange={setRawText} onSubmit={submitScenario} />
      <Footer />

      {identityPanel ? (
        <IdentityPanel mode={identityPanel} onClose={() => setIdentityPanel(null)} />
      ) : null}
    </main>
  );
}

function SiteHeader({
  marketsOpen,
  languageOpen,
  tone,
  onMarketsToggle,
  onLanguageToggle,
  onToneToggle,
  onLogin,
  onWallet,
}: {
  marketsOpen: boolean;
  languageOpen: boolean;
  tone: "dark" | "light";
  onMarketsToggle: () => void;
  onLanguageToggle: () => void;
  onToneToggle: () => void;
  onLogin: () => void;
  onWallet: () => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-bg))]/94 backdrop-blur-xl">
      <div className="grid h-14 grid-cols-[56px_190px_repeat(3,112px)_1fr_104px_152px_56px_56px] border-r border-[rgb(var(--hf-line))] max-xl:grid-cols-[56px_180px_repeat(3,100px)_1fr_92px_142px_52px_52px]">
        <a
          href="#top"
          aria-label="HedgeFrame home"
          className="flex items-center justify-center border-l border-[rgb(var(--hf-line))] transition hover:bg-[rgb(var(--hf-panel))]"
        >
          <BrandMark />
        </a>
        <a
          href="#top"
          className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 font-mono text-sm font-semibold tracking-[0.08em]"
        >
          HedgeFrame
        </a>
        <button
          type="button"
          onClick={onMarketsToggle}
          aria-expanded={marketsOpen}
          className="flex items-center justify-between border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
        >
          Markets
          <CaretDown size={14} weight="bold" />
        </button>
        <a
          href="#teams"
          className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
        >
          Teams
        </a>
        <a
          href="#security"
          className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
        >
          Security
        </a>
        <a
          href="#about"
          className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
        >
          About
        </a>
        <button
          type="button"
          onClick={onLogin}
          className="flex items-center justify-center gap-2 border-l border-[rgb(var(--hf-line))] text-sm transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px"
        >
          <LockKey size={15} />
          Log in
        </button>
        <button
          type="button"
          onClick={onWallet}
          className="flex items-center justify-center gap-2 border-l border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-accent))] text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px"
        >
          <Wallet size={15} weight="bold" />
          Connect wallet
        </button>
        <button
          type="button"
          aria-expanded={languageOpen}
          aria-label="Select language"
          onClick={onLanguageToggle}
          className="flex items-center justify-center border-l border-[rgb(var(--hf-line))] transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px"
        >
          <GlobeHemisphereWest size={19} />
        </button>
        <button
          type="button"
          aria-label="Toggle day and night mode"
          onClick={onToneToggle}
          className="flex items-center justify-center border-l border-[rgb(var(--hf-line))] transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px"
        >
          {tone === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
}

function MarketsMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed left-0 right-0 top-14 z-40 border-b border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-bg))]/98 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1.2fr_0.8fr] border-x border-[rgb(var(--hf-line))]">
        <div className="grid grid-cols-2">
          {marketMenu.map(([title, body]) => (
            <button
              type="button"
              key={title}
              onClick={onClose}
              className="min-h-36 border-b border-r border-[rgb(var(--hf-line))] p-6 text-left transition hover:bg-[rgb(var(--hf-panel))]"
            >
              <span className="font-mono text-xs text-[rgb(var(--hf-accent))]">market path</span>
              <span className="mt-5 block text-2xl font-semibold tracking-[-0.03em]">
                {title}
              </span>
              <span className="mt-2 block max-w-[34ch] text-sm leading-6 text-[rgb(var(--hf-muted))]">
                {body}
              </span>
            </button>
          ))}
        </div>
        <div className="bg-[rgb(var(--hf-panel-strong))] p-8">
          <div className="mb-10 flex items-center gap-2 font-mono text-xs text-[rgb(var(--hf-muted))]">
            <DecryptedText text="mock provider / kalshi demo / polymarket read-only" />
          </div>
          <h2 className="max-w-[12ch] text-5xl font-semibold leading-none tracking-[-0.05em]">
            Find the contract before the window closes.
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 inline-flex h-11 items-center gap-2 bg-[rgb(var(--hf-accent))] px-4 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px"
          >
            Open catalog
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LanguageMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed right-14 top-14 z-50 w-52 border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel-strong))] p-2 shadow-[0_22px_60px_rgba(0,0,0,0.38)]">
      {["English", "简体中文", "日本語"].map((item) => (
        <button
          key={item}
          type="button"
          onClick={onClose}
          className="flex h-10 w-full items-center justify-between px-3 text-left text-sm transition hover:bg-[rgb(var(--hf-panel))]"
        >
          {item}
          {item === "English" ? <Check size={15} weight="bold" /> : null}
        </button>
      ))}
    </div>
  );
}

function PinnedHero({
  rawText,
  onRawTextChange,
  onSubmit,
}: {
  rawText: string;
  onRawTextChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const panelsOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const panelsY = useTransform(scrollY, [0, 640], [0, -96]);
  const panelsScale = useTransform(scrollY, [0, 640], [1, 0.97]);
  const visionOpacity = useTransform(scrollY, [520, 940], [0, 1]);
  const visionY = useTransform(scrollY, [520, 940], [86, 0]);
  const visionScale = useTransform(scrollY, [520, 980], [0.74, 1]);
  const promptOpacity = useTransform(scrollY, [980, 1360], [0, 1]);
  const promptY = useTransform(scrollY, [980, 1360], [42, 0]);
  const mosaicShift = useTransform(scrollY, [0, 900], [0, -58]);
  const mosaicOpacity = useTransform(scrollY, [0, 900], [1, 0.32]);

  const panelsStyle = reduce
    ? { opacity: 0 }
    : { opacity: panelsOpacity, y: panelsY, scale: panelsScale };
  const visionStyle = reduce
    ? { opacity: 1 }
    : { opacity: visionOpacity, y: visionY, scale: visionScale };
  const promptStyle = reduce ? { opacity: 1 } : { opacity: promptOpacity, y: promptY };
  const mosaicStyle = reduce ? undefined : { y: mosaicShift, opacity: mosaicOpacity };

  return (
    <section
      id="top"
      ref={ref}
      data-hero-scroll
      className="relative h-[240dvh] border-b border-[rgb(var(--hf-line))]"
    >
      <div className="sticky top-14 h-[calc(100dvh-56px)] overflow-hidden bg-[rgb(var(--hf-bg))]">
        <motion.div
          data-hero-panels
          style={panelsStyle}
          className="absolute inset-0 grid origin-center grid-cols-[minmax(0,1fr)_432px] grid-rows-[minmax(0,1fr)_330px]"
        >
          <div className="border-r border-b border-[rgb(var(--hf-line))] p-10">
            <div className="flex h-full flex-col justify-end">
              <p className="mb-6 max-w-fit bg-[rgb(var(--hf-accent))] px-2 py-1 font-mono text-xs text-[rgb(var(--hf-ink))]">
                Prediction-market hedge discovery
              </p>
              <h1 className="max-w-[900px] text-[clamp(68px,7vw,116px)] font-semibold leading-[0.9] tracking-[-0.08em]">
                AI and prediction markets for long-tail hedging.
              </h1>
            </div>
          </div>

          <div className="border-b border-[rgb(var(--hf-line))] p-10">
            <div className="flex h-full items-end">
              <p className="max-w-[21ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em]">
                We help you quickly build risk-transfer and hedge strategies with prediction-market tools.
              </p>
            </div>
          </div>

          <motion.div
            aria-hidden="true"
            style={mosaicStyle}
            className="relative overflow-hidden border-r border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]"
          >
            <PixelMosaic dense />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.26))]" />
            <span className="absolute bottom-5 right-5 font-mono text-xs text-[rgb(var(--hf-accent))]">
              RISK WINDOWS MOVE
            </span>
          </motion.div>

          <div className="grid grid-rows-[1fr_auto] p-10">
            <div className="space-y-5">
              <div className="font-mono text-xs text-[rgb(var(--hf-muted))]">FEATURED WORKFLOW</div>
              <div className="border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]">
                <div className="flex items-center gap-4 border-b border-[rgb(var(--hf-line))] p-4">
                  <CloudRain size={28} className="text-[rgb(var(--hf-accent))]" />
                  <div>
                    <div className="text-sm font-semibold">Austin outdoor rain</div>
                    <div className="text-xs text-[rgb(var(--hf-muted))]">
                      5 candidates / 2 demo ready
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="flex h-12 w-full items-center justify-between px-4 text-left text-sm transition hover:bg-[rgb(var(--hf-accent))] hover:text-[rgb(var(--hf-ink))] active:translate-y-px"
                >
                  Map this scenario
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
            <p className="border-t border-[rgb(var(--hf-line))] pt-5 text-sm leading-6 text-[rgb(var(--hf-muted))]">
              This is not insurance. Demo execution only.
            </p>
          </div>
        </motion.div>

        <motion.div
          data-hero-vision
          style={visionStyle}
          className="pointer-events-none absolute inset-0 z-10 flex origin-center items-center justify-center px-10"
        >
          <div className="grid w-full max-w-[1120px] justify-items-center text-center">
            <div className="mb-7 flex justify-center gap-3">
              {["AI PARSE", "MARKET FIT", "AUDIT"].map((item) => (
                <span
                  key={item}
                  className="border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] px-3 py-2 font-mono text-xs text-[rgb(var(--hf-accent))]"
                >
                  {item}
                </span>
              ))}
            </div>
            <h2 className="max-w-[1060px] text-[clamp(48px,5.4vw,86px)] font-semibold leading-[0.94] tracking-[-0.075em]">
              We help you quickly build risk-transfer and hedge strategies with prediction-market tools.
            </h2>
            <motion.div
              data-hero-prompt
              style={promptStyle}
              className="pointer-events-auto mt-12 w-full max-w-[760px]"
            >
              <PromptBox rawText={rawText} onRawTextChange={onRawTextChange} onSubmit={onSubmit} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PromptBox({
  rawText,
  onRawTextChange,
  onSubmit,
  compact = false,
}: {
  rawText: string;
  onRawTextChange: (value: string) => void;
  onSubmit: () => void;
  compact?: boolean;
}) {
  const disabled = rawText.trim().length < 10;

  return (
    <div className="border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel-strong))] shadow-[0_24px_90px_rgba(0,0,0,0.26)]">
      <label htmlFor={compact ? "hero-risk-compact" : "hero-risk"} className="sr-only">
        Risk scenario
      </label>
      <textarea
        id={compact ? "hero-risk-compact" : "hero-risk"}
        value={rawText}
        onChange={(event) => onRawTextChange(event.target.value)}
        rows={compact ? 3 : 4}
        className="min-h-24 w-full resize-none border-0 bg-transparent px-5 py-4 text-base leading-7 text-[rgb(var(--hf-text))] outline-none placeholder:text-[rgb(var(--hf-muted))]"
        placeholder="Describe the event, trigger, date range, and amount at risk..."
      />
      <div className="flex items-center justify-between border-t border-[rgb(var(--hf-line))] px-3 py-3">
        <button
          type="button"
          aria-label="Attach context"
          className="flex h-9 w-9 items-center justify-center border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:text-[rgb(var(--hf-text))]"
        >
          <Plus size={17} />
        </button>
        <div className="flex items-center gap-2">
          <span className="border border-[rgb(var(--hf-line))] px-3 py-2 font-mono text-xs text-[rgb(var(--hf-muted))]">
            Discover
          </span>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="inline-flex h-10 items-center gap-2 bg-[rgb(var(--hf-accent))] px-4 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[rgb(var(--hf-disabled))] disabled:text-[rgb(var(--hf-muted))]"
          >
            <MagnifyingGlass size={16} weight="bold" />
            Map markets
          </button>
        </div>
      </div>
      <p className="border-t border-[rgb(var(--hf-line))] px-5 py-3 text-sm text-[rgb(var(--hf-muted))]">
        This is not insurance. Demo execution only.
      </p>
    </div>
  );
}

function AudienceGrid() {
  return (
    <section id="teams" className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid grid-cols-3">
        <div className="border-r border-[rgb(var(--hf-line))] p-10">
          <h2 className="text-6xl font-semibold leading-none tracking-[-0.07em]">
            Built for exposed operators.
          </h2>
          <p className="mt-6 max-w-[34ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
            The old path is slow underwriting language. The HedgeFrame path is scenario, market fit, quote, and audit trail.
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-3">
          {userGroups.map(([title, body], index) => (
            <Reveal
              key={title}
              delay={index * 0.03}
              className="min-h-56 border-b border-r border-[rgb(var(--hf-line))] p-6"
            >
              <div className="mb-10 h-8 w-8 bg-[rgb(var(--hf-accent))] text-center font-mono text-sm leading-8 text-[rgb(var(--hf-ink))]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[rgb(var(--hf-muted))]">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketSystem() {
  return (
    <section className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid min-h-[760px] grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between border-r border-[rgb(var(--hf-line))] p-10">
          <div>
            <DecryptedText
              text="market fit / basis risk / execution gates"
              className="font-mono text-xs text-[rgb(var(--hf-accent))]"
            />
            <h2 className="mt-8 max-w-[11ch] text-7xl font-semibold leading-[0.9] tracking-[-0.08em]">
              Not every match should trade.
            </h2>
          </div>
          <p className="max-w-[42ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
            Candidate markets are valuable only when the settlement rule, event trigger, and time window survive review.
          </p>
        </div>
        <div className="grid grid-rows-4">
          {[
            ["Parse", "Object, place, date range, trigger, exposure, budget."],
            ["Rank", "Event fit, location fit, time overlap, rule clarity, liquidity."],
            ["Block", "Closed markets, stale quotes, weak basis, Polymarket read-only."],
            ["Execute", "Limit-only Kalshi demo order with idempotency and audit response."],
          ].map(([title, body]) => (
            <div
              key={title}
              className="grid grid-cols-[220px_1fr] border-b border-[rgb(var(--hf-line))]"
            >
              <div className="flex items-center border-r border-[rgb(var(--hf-line))] p-8 text-4xl font-semibold tracking-[-0.05em]">
                {title}
              </div>
              <div className="flex items-center p-8 text-2xl leading-tight tracking-[-0.035em] text-[rgb(var(--hf-muted))]">
                {body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScenarioLibrary() {
  return (
    <section className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid grid-cols-4">
        {scenarios.map(([title, body, state], index) => (
          <button
            key={title}
            type="button"
            className="group min-h-[440px] border-r border-[rgb(var(--hf-line))] p-6 text-left transition hover:bg-[rgb(var(--hf-panel))]"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-xs text-[rgb(var(--hf-muted))]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="border border-[rgb(var(--hf-line))] px-2 py-1 font-mono text-xs text-[rgb(var(--hf-accent))]">
                {state}
              </span>
            </div>
            <div className="mb-16 h-36 border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))]">
              <MiniMarketGraphic index={index} />
            </div>
            <h3 className="text-4xl font-semibold leading-none tracking-[-0.06em] group-hover:text-[rgb(var(--hf-accent))]">
              {title}
            </h3>
            <p className="mt-5 max-w-[25ch] text-sm leading-6 text-[rgb(var(--hf-muted))]">
              {body}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ExecutionBoundaries() {
  return (
    <section id="security" className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid grid-cols-[0.9fr_1.1fr]">
        <div className="border-r border-[rgb(var(--hf-line))] p-10">
          <ShieldCheck size={34} className="text-[rgb(var(--hf-accent))]" />
          <h2 className="mt-8 max-w-[10ch] text-7xl font-semibold leading-[0.9] tracking-[-0.08em]">
            Execution boundaries.
          </h2>
          <p className="mt-8 max-w-[40ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
            The prototype helps discover and simulate hedges. It does not underwrite losses, hold funds, or store private keys.
          </p>
        </div>
        <div className="grid grid-cols-2">
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
              className="flex min-h-40 items-center gap-4 border-b border-r border-[rgb(var(--hf-line))] p-6 text-xl leading-tight tracking-[-0.03em]"
            >
              <Check size={20} weight="bold" className="text-[rgb(var(--hf-accent))]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomPrompt({
  rawText,
  onRawTextChange,
  onSubmit,
}: {
  rawText: string;
  onRawTextChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section id="about" className="relative border-b border-[rgb(var(--hf-line))] p-10">
      <div className="absolute inset-0 opacity-60">
        <PixelMosaic dense />
      </div>
      <div className="relative mx-auto grid max-w-[1120px] gap-10 py-24 text-center">
        <h2 className="text-7xl font-semibold leading-[0.9] tracking-[-0.08em]">
          Ready to map an exposure?
        </h2>
        <p className="mx-auto max-w-[52ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
          Describe the loss scenario, trigger, date range, and amount at risk. The workspace will show candidates and reasons to block execution.
        </p>
        <PromptBox rawText={rawText} onRawTextChange={onRawTextChange} onSubmit={onSubmit} />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="grid grid-cols-[1fr_2fr] border-b border-[rgb(var(--hf-line))] text-sm">
      <div className="border-r border-[rgb(var(--hf-line))] p-10">
        <BrandMark />
        <p className="mt-6 max-w-[32ch] text-[rgb(var(--hf-muted))]">
          HedgeFrame is a prediction-market hedge discovery and demo execution assistant.
        </p>
      </div>
      <div className="grid grid-cols-4">
        {[
          ["Product", "Weather events", "Venue revenue", "Shipping route review", "Audit ledger"],
          ["Resources", "Market catalog", "Scenario library", "Kalshi demo guide", "Basis risk"],
          ["Legal", "This is not insurance", "Risk disclosure", "Privacy", "Terms"],
          ["Community", "Operator council", "Partner network", "X / Twitter", "LinkedIn"],
        ].map(([heading, ...links]) => (
          <div key={heading} className="border-r border-[rgb(var(--hf-line))] p-8">
            <h3 className="mb-6 font-mono text-xs text-[rgb(var(--hf-accent))]">{heading}</h3>
            <div className="grid gap-3 text-[rgb(var(--hf-muted))]">
              {links.map((link) => (
                <a key={link} href="#top" className="transition hover:text-[rgb(var(--hf-text))]">
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

function PixelMosaic({ dense = false }: { dense?: boolean }) {
  const blocks = dense
    ? [
        "bg-[rgb(var(--hf-accent))]",
        "bg-[rgb(var(--hf-panel))]",
        "bg-[rgb(var(--hf-warning))]",
        "bg-[rgb(var(--hf-field))]",
        "bg-[rgb(var(--hf-panel-strong))]",
        "bg-[rgb(var(--hf-accent))]",
        "bg-[rgb(var(--hf-warning))]",
        "bg-[rgb(var(--hf-field))]",
        "bg-[rgb(var(--hf-panel))]",
        "bg-[rgb(var(--hf-warning))]",
        "bg-[rgb(var(--hf-accent))]",
        "bg-[rgb(var(--hf-panel-strong))]",
      ]
    : [
        "bg-[rgb(var(--hf-panel))]",
        "bg-[rgb(var(--hf-warning))]",
        "bg-[rgb(var(--hf-accent))]",
        "bg-[rgb(var(--hf-field))]",
        "bg-[rgb(var(--hf-warning))]",
        "bg-[rgb(var(--hf-panel-strong))]",
        "bg-[rgb(var(--hf-accent))]",
        "bg-[rgb(var(--hf-field))]",
      ];

  return (
    <div className="grid h-full w-full grid-cols-4 grid-rows-3">
      {blocks.map((className, index) => (
        <div
          key={`${className}-${index}`}
          className={`${className} hf-mosaic-block border border-[rgb(var(--hf-line))]`}
          style={{ animationDelay: `${(index % 6) * 180}ms` }}
        />
      ))}
    </div>
  );
}

function MiniMarketGraphic({ index }: { index: number }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0 hf-risk-map" />
      <div
        className="absolute h-14 w-14 bg-[rgb(var(--hf-accent))]"
        style={{
          left: `${18 + index * 12}%`,
          top: `${20 + index * 8}%`,
        }}
      />
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
        {["fit", "time", "basis"].map((item) => (
          <span
            key={item}
            className="border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-bg))]/80 px-2 py-1 font-mono text-[10px] text-[rgb(var(--hf-muted))]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="grid h-8 w-8 grid-cols-4 grid-rows-4 overflow-hidden border border-[rgb(var(--hf-line))]">
      {Array.from({ length: 16 }).map((_, index) => (
        <span
          key={index}
          className={
            [1, 2, 4, 7, 8, 10, 13, 14].includes(index)
              ? "bg-[rgb(var(--hf-accent))]"
              : [0, 5, 11, 15].includes(index)
                ? "bg-[rgb(var(--hf-warning))]"
                : "bg-[rgb(var(--hf-field))]"
          }
        />
      ))}
    </div>
  );
}

function PixelField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-30"
      style={{
        backgroundImage:
          "linear-gradient(rgba(245,198,66,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(245,198,66,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}
