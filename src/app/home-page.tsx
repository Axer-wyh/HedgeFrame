"use client";

import {
  ArrowRight,
  Check,
  CloudRain,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
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
import { BrandMark, SiteHeader, type SiteTone } from "./site-header";

const sampleScenario =
  "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.";

const heroTitlePrimary = "Name what you're afraid of.";
const heroTitleSecondary = "We'll find the hedge.";
const heroTitle = `${heroTitlePrimary} ${heroTitleSecondary}`;
const heroSubtitle =
  "HedgeFrame turns a plain-words worry into a real, executable hedge on prediction markets. Not insurance. No paperwork.";
const heroEyebrow = "Say what you're worried about.";
const visionLinePrimary = "Plain-words worry to";
const visionLineSecondary = "executable hedge.";
const visionLine = `${visionLinePrimary} ${visionLineSecondary}`;

const promptExamples = [
  "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.",
  "My outdoor wedding loses $50k if it rains that day.",
  "Our concert gets canceled by a typhoon and we can't cover refunds.",
  "Freight costs jump 20% in the next three months.",
];

const userGroups = [
  ["Event organizers", "Weather can erase a weekend of ticket revenue."],
  ["Venue owners", "Access, attendance, and refunds can hit the same calendar week."],
  ["SMB finance", "A budgeted exposure needs a fast, explainable hedge path."],
  ["Logistics coordinators", "Route risk needs low-confidence signals before anyone acts."],
  ["Brokers and advisors", "Clients need basis risk explained in plain language."],
  ["Risk ops", "Repeatable audit trails matter as much as the quote."],
];

const howItWorks = [
  ["Say it", "Describe the worry in plain words."],
  ["We map it", "We match it to a real market contract and explain the fit."],
  ["Hedge it", "Simulate or place the hedge in one step."],
];

const scenarios = [
  {
    persona: "Outdoor wedding planner",
    worry: "Rain on the venue date could erase $50k in deposits.",
    outcome: "See weather contracts, estimated cost, and basis risk before committing.",
    state: "demo ready",
    example: "My outdoor wedding loses $50k if it rains that day.",
  },
  {
    persona: "Concert producer",
    worry: "A typhoon cancellation could force refunds before sponsor cash arrives.",
    outcome: "Compare storm-linked markets and see why some are blocked.",
    state: "review",
    example: "Our concert gets canceled by a typhoon and we can't cover refunds.",
  },
  {
    persona: "SMB importer",
    worry: "Freight costs jumping 20% could wipe out the quarter's margin.",
    outcome: "Surface freight, inflation, and shipping proxies with confidence notes.",
    state: "proxy only",
    example: "Freight costs jump 20% in the next three months.",
  },
  {
    persona: "Route coordinator",
    worry: "A geopolitical disruption could delay cargo without a clean contract match.",
    outcome: "Show low-confidence markets, basis risk, and the no-trade reason.",
    state: "low confidence",
    example: "Middle East crude shipping route faces disruption next quarter.",
  },
];

export function HomePage() {
  const router = useRouter();
  const [rawText, setRawText] = useState(sampleScenario);
  const [identityPanel, setIdentityPanel] = useState<IdentityPanelMode | null>(null);
  const [tone, setTone] = useState<SiteTone>("dark");

  function submitScenario() {
    const scenario = rawText.trim();

    if (scenario.length < 10) return;
    router.push(`/markets?scenario=${encodeURIComponent(scenario)}`);
  }

  function chooseScenario(value: string) {
    setRawText(value);
    document
      .getElementById("try-scenario")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main
      data-tone={tone}
      className="min-h-[100dvh] bg-[rgb(var(--hf-bg))] pt-14 text-[rgb(var(--hf-text))]"
    >
      <PixelField />
      <SiteHeader
        anchorPrefix=""
        tone={tone}
        onToneToggle={() => setTone((value) => (value === "dark" ? "light" : "dark"))}
        onLogin={() => setIdentityPanel("login")}
      />

      <PinnedHero rawText={rawText} onRawTextChange={setRawText} onSubmit={submitScenario} />
      <HowItWorks />
      <ScenarioLibrary onSelectScenario={chooseScenario} />
      <AudienceGrid />
      <ExecutionBoundaries />
      <BottomPrompt rawText={rawText} onRawTextChange={setRawText} onSubmit={submitScenario} />
      <Footer />

      {identityPanel ? (
        <IdentityPanel mode={identityPanel} onClose={() => setIdentityPanel(null)} />
      ) : null}
    </main>
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

  const introOpacity = useTransform(scrollY, [0, 560], [1, 0]);
  const introY = useTransform(scrollY, [0, 640], [0, -300]);
  const newsOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const newsY = useTransform(scrollY, [0, 650], [0, 260]);
  const mosaicX = useTransform(scrollY, [0, 520, 960, 1280], [0, -40, -150, -230]);
  const mosaicY = useTransform(scrollY, [0, 520, 960, 1280], [0, -70, -230, -280]);
  const mosaicScaleX = useTransform(scrollY, [0, 440, 840, 1120, 1340], [1, 0.72, 0.34, 0.08, 0.015]);
  const mosaicScaleY = useTransform(scrollY, [0, 720, 1340], [1, 1.08, 1.18]);
  const mosaicOpacity = useTransform(scrollY, [1160, 1440], [1, 0]);
  const visionClipPath = useTransform(
    scrollY,
    [0, 1040],
    ["inset(0% 0% 32% 70%)", "inset(0% 0% 0% 0%)"],
  );
  const visionTextLeft = useTransform(scrollY, [0, 1040], ["72.8%", "13.2%"]);
  const visionTextTop = useTransform(scrollY, [0, 1040, 1280], ["50%", "27.8%", "5%"]);
  const visionTextWidth = useTransform(scrollY, [0, 1040], ["43%", "73.6%"]);
  const visionTextScale = useTransform(scrollY, [0, 1040], [0.46, 1]);
  const visionBadgesOpacity = useTransform(scrollY, [520, 900], [0, 1]);
  const promptOpacity = useTransform(scrollY, [1040, 1280], [0, 1]);
  const promptY = useTransform(scrollY, [1040, 1280], [38, 0]);

  const introStyle = reduce ? { opacity: 0 } : { opacity: introOpacity, y: introY };
  const newsStyle = reduce ? { opacity: 0 } : { opacity: newsOpacity, y: newsY };
  const mosaicStyle = reduce
    ? { opacity: 0 }
    : {
        opacity: mosaicOpacity,
        scaleX: mosaicScaleX,
        scaleY: mosaicScaleY,
        x: mosaicX,
        y: mosaicY,
      };
  const visionPanelStyle = reduce ? { clipPath: "inset(0% 0% 0% 0%)" } : { clipPath: visionClipPath };
  const visionTextStyle = reduce
    ? { left: "190px", top: "290px", width: "1060px", opacity: 1 }
    : {
        left: visionTextLeft,
        top: visionTextTop,
        width: visionTextWidth,
        scale: visionTextScale,
      };
  const visionBadgesStyle = reduce ? { opacity: 1 } : { opacity: visionBadgesOpacity };
  const promptStyle = reduce ? { opacity: 1 } : { opacity: promptOpacity, y: promptY };

  return (
    <section
      id="top"
      ref={ref}
      data-hero-scroll
      className="relative h-[320dvh] border-b border-[rgb(var(--hf-line))]"
    >
      <div className="sticky top-14 h-[calc(100dvh-56px)] overflow-hidden bg-[rgb(var(--hf-bg))]">
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 grid grid-cols-[minmax(0,1fr)_432px] grid-rows-[minmax(0,1fr)_330px]"
        >
          <div className="border-r border-b border-[rgb(var(--hf-line))]" />
          <div className="border-b border-[rgb(var(--hf-line))]" />
          <div className="border-r border-[rgb(var(--hf-line))]" />
          <div />
        </div>

        <motion.div
          data-hero-vision
          style={visionPanelStyle}
          className="pointer-events-none absolute inset-0 z-10 bg-[rgb(var(--hf-panel))]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,198,66,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(245,198,66,0.045)_1px,transparent_1px)] bg-[size:86px_86px]" />
        </motion.div>

        <motion.div
          style={visionTextStyle}
          className="pointer-events-none absolute z-40 origin-top-left text-center"
        >
          <div className="grid justify-items-center">
            <motion.div style={visionBadgesStyle} className="mb-7 flex justify-center gap-3">
              {["AI PARSE", "MARKET FIT", "AUDIT"].map((item) => (
                <span
                  key={item}
                  className="border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] px-3 py-2 font-mono text-xs text-[rgb(var(--hf-accent))]"
                >
                  {item}
                </span>
              ))}
            </motion.div>
            <h2
              aria-label={visionLine}
              className="text-[clamp(48px,5.4vw,86px)] font-semibold leading-[0.94] tracking-[-0.075em]"
            >
              <span className="block whitespace-nowrap">{visionLinePrimary}</span>{" "}
              <span className="block whitespace-nowrap">{visionLineSecondary}</span>
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

        <motion.div
          data-hero-panels
          style={introStyle}
          className="absolute left-0 top-0 z-20 h-[calc(100%-330px)] w-[calc(100%-432px)] p-10"
        >
          <div className="flex h-full flex-col justify-end">
            <p className="mb-6 max-w-fit bg-[rgb(var(--hf-accent))] px-2 py-1 font-mono text-xs text-[rgb(var(--hf-ink))]">
              {heroEyebrow}
            </p>
            <h1
              aria-label={heroTitle}
              className="max-w-[1280px] text-[clamp(54px,4.9vw,90px)] font-semibold leading-[0.9] tracking-[-0.08em]"
            >
              <span className="block whitespace-nowrap">{heroTitlePrimary}</span>
              <span className="block whitespace-nowrap">{heroTitleSecondary}</span>
            </h1>
            <p className="mt-7 max-w-[640px] text-lg leading-7 text-[rgb(var(--hf-muted))]">
              {heroSubtitle}
            </p>
          </div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={mosaicStyle}
          className="absolute bottom-0 left-0 z-30 h-[330px] w-[calc(100%-432px)] origin-left overflow-hidden border-r border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]"
        >
          <PixelMosaic dense />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.26))]" />
          <span className="absolute bottom-5 right-5 font-mono text-xs text-[rgb(var(--hf-accent))]">
            RISK WINDOWS MOVE
          </span>
        </motion.div>

        <motion.div
          style={newsStyle}
          className="absolute bottom-0 right-0 z-20 grid h-[330px] w-[432px] grid-rows-[1fr_auto] p-10"
        >
          <div className="space-y-5">
            <div className="font-mono text-xs text-[rgb(var(--hf-muted))]">REAL WORRY</div>
            <div className="border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]">
              <div className="flex items-center gap-4 border-b border-[rgb(var(--hf-line))] p-4">
                <CloudRain size={28} className="text-[rgb(var(--hf-accent))]" />
                <div>
                  <div className="text-sm font-semibold">Austin event rain risk</div>
                  <div className="text-xs text-[rgb(var(--hf-muted))]">
                    15 candidates / basis risk explained
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
            We also flag weak fits before you trade.
          </p>
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
  const visibleExamples = compact ? promptExamples.slice(0, 2) : promptExamples;

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
        placeholder="Describe the event, trigger, date range, and amount at risk."
      />
      <div className="border-t border-[rgb(var(--hf-line))] px-4 py-3">
        <div className="mb-2 font-mono text-xs text-[rgb(var(--hf-muted))]">
          Click a real worry to start
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onRawTextChange(example)}
              className="border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-3 py-2 text-left text-xs leading-5 text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-accent))] hover:text-[rgb(var(--hf-text))] active:translate-y-px"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
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
        Not insurance. Demo execution only.
      </p>
    </div>
  );
}

function AudienceGrid() {
  return (
    <section className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid grid-cols-3">
        <div className="border-r border-[rgb(var(--hf-line))] p-10">
          <h2 className="text-6xl font-semibold leading-none tracking-[-0.07em]">
            For people carrying weird risk.
          </h2>
          <p className="mt-6 max-w-[34ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
            The old path starts with forms and underwriting language. HedgeFrame starts with the worry in your own words.
          </p>
        </div>
        <div className="col-span-2 grid grid-cols-3">
          {userGroups.map(([title, body], index) => (
            <Reveal
              key={title}
              delay={index * 0.03}
              className="min-h-56 border-b border-r border-[rgb(var(--hf-line))] p-6"
            >
              <div className="mb-10 inline-flex border border-[rgb(var(--hf-line))] px-2 py-1 font-mono text-xs text-[rgb(var(--hf-accent))]">
                Hedge path
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

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid min-h-[680px] grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-between border-r border-[rgb(var(--hf-line))] p-10">
          <div>
            <DecryptedText
              text="plain words / market fit / hedge path"
              className="font-mono text-xs text-[rgb(var(--hf-accent))]"
            />
            <h2 className="mt-8 max-w-[11ch] text-7xl font-semibold leading-[0.9] tracking-[-0.08em]">
              From one worry to one hedge path.
            </h2>
          </div>
          <div className="max-w-[43ch] space-y-4 text-base leading-7 text-[rgb(var(--hf-muted))]">
            <p>
              Describe the exposure, review the market fit, then simulate a demo execution path.
            </p>
            <p className="border-l border-[rgb(var(--hf-accent))] pl-4 text-[rgb(var(--hf-text))]">
              {"We'll also tell you when a hedge isn't worth it."}
            </p>
          </div>
        </div>
        <div className="grid grid-rows-3">
          {howItWorks.map(([title, body]) => (
            <div
              key={title}
              className="grid grid-cols-[240px_1fr] border-b border-[rgb(var(--hf-line))]"
            >
              <div className="flex items-center border-r border-[rgb(var(--hf-line))] p-8 text-5xl font-semibold tracking-[-0.06em]">
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

function ScenarioLibrary({
  onSelectScenario,
}: {
  onSelectScenario: (value: string) => void;
}) {
  return (
    <section id="use-cases" className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid grid-cols-[1.15fr_0.95fr_0.95fr_0.95fr]">
        {scenarios.map((scenario, index) => (
          <button
            key={scenario.persona}
            type="button"
            onClick={() => onSelectScenario(scenario.example)}
            className="group min-h-[500px] border-r border-[rgb(var(--hf-line))] p-6 text-left transition hover:bg-[rgb(var(--hf-panel))]"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-xs text-[rgb(var(--hf-muted))]">Use case</span>
              <span className="border border-[rgb(var(--hf-line))] px-2 py-1 font-mono text-xs text-[rgb(var(--hf-accent))]">
                {scenario.state}
              </span>
            </div>
            <div className="mb-12 h-32 border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))]">
              <MiniMarketGraphic index={index} />
            </div>
            <h3 className="text-4xl font-semibold leading-none tracking-[-0.06em] group-hover:text-[rgb(var(--hf-accent))]">
              {scenario.persona}
            </h3>
            <p className="mt-6 text-lg leading-7 tracking-[-0.02em]">
              {scenario.worry}
            </p>
            <p className="mt-5 max-w-[28ch] text-sm leading-6 text-[rgb(var(--hf-muted))]">
              {scenario.outcome}
            </p>
            <span className="mt-10 inline-flex h-10 items-center gap-2 border border-[rgb(var(--hf-line))] px-3 text-sm font-semibold text-[rgb(var(--hf-text))] transition group-hover:border-[rgb(var(--hf-accent))] group-hover:bg-[rgb(var(--hf-accent))] group-hover:text-[rgb(var(--hf-ink))]">
              Try this
              <ArrowRight size={15} weight="bold" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ExecutionBoundaries() {
  return (
    <section className="border-b border-[rgb(var(--hf-line))]">
      <div className="grid grid-cols-[0.9fr_1.1fr]">
        <div className="border-r border-[rgb(var(--hf-line))] p-10">
          <ShieldCheck size={34} className="text-[rgb(var(--hf-accent))]" />
          <h2 className="mt-8 max-w-[10ch] text-7xl font-semibold leading-[0.9] tracking-[-0.08em]">
            Trust before execution.
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
      <div id="try-scenario" className="relative mx-auto grid max-w-[1120px] gap-10 py-24 text-center">
        <h2 className="text-7xl font-semibold leading-[0.9] tracking-[-0.08em]">
          Making hedging a part of your life.
        </h2>
        <p className="mx-auto max-w-[52ch] text-base leading-7 text-[rgb(var(--hf-muted))]">
          Start with the thing that could hurt your calendar, cash flow, or route. HedgeFrame maps what can be matched and what should be blocked.
        </p>
        <div data-bottom-prompt className="mx-auto w-full max-w-[760px]">
          <PromptBox rawText={rawText} onRawTextChange={onRawTextChange} onSubmit={onSubmit} />
        </div>
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
          HedgeFrame turns plain-words worries into prediction-market hedge paths.
        </p>
      </div>
      <div className="grid grid-cols-4">
        {[
          ["Product", "How it works", "Use cases", "Markets", "Audit ledger"],
          ["Resources", "Market catalog", "Scenario library", "Kalshi demo guide", "Basis risk"],
          ["Legal", "Disclosure", "Risk notice", "Privacy", "Terms"],
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
