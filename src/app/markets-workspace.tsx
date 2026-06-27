"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  Clock,
  Database,
  Funnel,
  LockKey,
  MagnifyingGlass,
  ShieldWarning,
  Wallet,
  WarningDiamond,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { IdentityPanel, type IdentityPanelMode } from "./identity-panel";
import { AnimatedTabs, DecryptedText, Reveal, SuccessRipple } from "./motion-primitives";
import type {
  HedgePlan,
  MatchResult,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

type ApiState = "idle" | "loading" | "ready" | "error";
type MarketFilter = "all" | "kalshi" | "polymarket" | "blocked";

const fallbackScenario =
  "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.";

export function MarketsWorkspace({ initialScenario }: { initialScenario?: string }) {
  const [rawText, setRawText] = useState(initialScenario || fallbackScenario);
  const [scenario, setScenario] = useState<(RiskScenario & { id?: string }) | null>(
    null,
  );
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>([]);
  const [plan, setPlan] = useState<HedgePlan | null>(null);
  const [execution, setExecution] = useState<OrderExecution | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [status, setStatus] = useState<ApiState>("idle");
  const [statusText, setStatusText] = useState("Ready to map markets");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MarketFilter>("all");
  const [identityPanel, setIdentityPanel] = useState<IdentityPanelMode | null>(null);
  const hasAutoRun = useRef(false);

  const executableMatches = useMemo(
    () => matches.filter((match) => match.executionAllowed),
    [matches],
  );
  const filteredMatches = useMemo(() => {
    if (filter === "kalshi") {
      return matches.filter((match) => match.market.provider === "kalshi");
    }

    if (filter === "polymarket") {
      return matches.filter((match) => match.market.provider === "polymarket");
    }

    if (filter === "blocked") {
      return matches.filter((match) => !match.executionAllowed);
    }

    return matches;
  }, [filter, matches]);

  async function findHedgePaths(nextRawText = rawText) {
    setStatus("loading");
    setStatusText("Parsing scenario");
    setError(null);
    setPlan(null);
    setExecution(null);
    setAcknowledged(false);

    try {
      const parsedScenario = await postJson<{ scenario: RiskScenario }>(
        "/api/scenarios/parse",
        { rawText: nextRawText },
      );
      setStatusText("Creating audit record");
      const draft = scenario ?? parsedScenario.scenario;
      const created = await postJson<{ scenario: RiskScenario & { id: string } }>(
        "/api/scenarios",
        {
          rawText: nextRawText,
          overrides: {
            subject: draft.subject,
            location: draft.location,
            trigger: draft.trigger,
            exposureAmount: draft.exposureAmount,
            budget: draft.budget,
            targetCoverage: draft.targetCoverage,
            timeWindow: draft.timeWindow,
          },
        },
      );
      setStatusText("Scoring markets");
      const matchResponse = await fetch(
        `/api/scenarios/${created.scenario.id}/matches`,
      );
      const matchPayload = (await matchResponse.json()) as {
        matches?: MatchResult[];
        error?: string;
      };

      if (!matchResponse.ok || !matchPayload.matches) {
        throw new Error(matchPayload.error ?? "Unable to load matches.");
      }

      setScenario(created.scenario);
      setMatches(matchPayload.matches);
      setSelectedMarketIds(
        matchPayload.matches
          .filter((match) => match.executionAllowed)
          .slice(0, 1)
          .map((match) => match.market.id),
      );
      setStatus("ready");
      setStatusText("Markets ranked");
    } catch (requestError) {
      setStatus("error");
      setStatusText("Mapping failed");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to analyze scenario.",
      );
    }
  }

  useEffect(() => {
    if (hasAutoRun.current || rawText.trim().length < 10) return;
    hasAutoRun.current = true;
    void findHedgePaths(rawText);
    // Run once for the scenario handed off from the landing page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawText]);

  async function createPlan() {
    if (!scenario?.id) return;

    setStatus("loading");
    setStatusText("Building quote");
    setError(null);
    setExecution(null);

    try {
      const payload = await postJson<{ plan: HedgePlan }>("/api/hedge-plans", {
        scenarioId: scenario.id,
        marketIds: selectedMarketIds,
        budget: scenario.budget ?? 12000,
        targetCoverage: scenario.targetCoverage ?? 0.4,
      });

      setPlan(payload.plan);
      setStatus("ready");
      setStatusText("Quote ready");
    } catch (requestError) {
      setStatus("error");
      setStatusText("Quote failed");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create hedge plan.",
      );
    }
  }

  async function runDemoOrder() {
    if (!plan || !acknowledged) return;

    setStatus("loading");
    setStatusText("Submitting demo order");
    setError(null);

    try {
      const payload = await postJson<{ execution: OrderExecution }>(
        "/api/orders/demo",
        {
          planId: plan.id,
          confirmationText: "I understand this is not insurance.",
          idempotencyKey: `demo-confirm-${plan.id}`,
        },
      );

      setExecution(payload.execution);
      setStatus("ready");
      setStatusText("Demo order recorded");
    } catch (requestError) {
      setStatus("error");
      setStatusText("Execution failed");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to execute demo order.",
      );
    }
  }

  function updateScenarioField<Key extends keyof RiskScenario>(
    key: Key,
    value: RiskScenario[Key],
  ) {
    if (!scenario) return;
    setScenario({ ...scenario, [key]: value });
  }

  return (
    <main className="min-h-[100dvh] bg-[rgb(var(--hf-bg))] text-[rgb(var(--hf-text))]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[rgb(var(--hf-line))] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:text-[rgb(var(--hf-text))]"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="font-mono text-xs text-[rgb(var(--hf-accent))]">
                Portfolio workspace
              </p>
              <h1 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                Prediction market candidates
              </h1>
            </div>
          </div>
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
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[330px_minmax(0,1fr)_390px]">
          <aside className="space-y-4">
            <ScenarioPanel
              rawText={rawText}
              scenario={scenario}
              status={status}
              onRawTextChange={setRawText}
              onAnalyze={() => findHedgePaths()}
              onChange={updateScenarioField}
            />
            <StatusPanel status={status} statusText={statusText} error={error} />
          </aside>

          <section className="min-w-0 space-y-4">
            <Reveal className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Market candidates</h2>
                  <p className="mt-1 text-sm text-[rgb(var(--hf-muted))]">
                    Filter by venue, review basis risk, then choose demo-eligible legs.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-[rgb(var(--hf-muted))]">
                  <Database size={14} />
                  mock provider catalog
                </div>
              </div>
              <AnimatedTabs
                value={filter}
                onChange={setFilter}
                tabs={[
                  { label: "All", value: "all" },
                  { label: "Kalshi demo", value: "kalshi" },
                  { label: "Polymarket", value: "polymarket" },
                  { label: "Blocked", value: "blocked" },
                ]}
              />
            </Reveal>
            <MatchesPanel
              matches={filteredMatches}
              selectedMarketIds={selectedMarketIds}
              loading={status === "loading" && matches.length === 0}
              onToggleMarket={(marketId) => {
                setSelectedMarketIds((current) =>
                  current.includes(marketId)
                    ? current.filter((id) => id !== marketId)
                    : [...current, marketId],
                );
              }}
            />
          </section>

          <PlanPanel
            plan={plan}
            executableCount={executableMatches.length}
            canCreatePlan={selectedMarketIds.length > 0 && Boolean(scenario?.id)}
            isBusy={status === "loading"}
            acknowledged={acknowledged}
            execution={execution}
            onCreatePlan={createPlan}
            onAcknowledge={setAcknowledged}
            onRunDemoOrder={runDemoOrder}
          />
        </section>
      </div>
      {identityPanel ? (
        <IdentityPanel mode={identityPanel} onClose={() => setIdentityPanel(null)} />
      ) : null}
    </main>
  );
}

function ScenarioPanel({
  rawText,
  scenario,
  status,
  onRawTextChange,
  onAnalyze,
  onChange,
}: {
  rawText: string;
  scenario: (RiskScenario & { id?: string }) | null;
  status: ApiState;
  onRawTextChange: (value: string) => void;
  onAnalyze: () => void;
  onChange: <Key extends keyof RiskScenario>(
    key: Key,
    value: RiskScenario[Key],
  ) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
      <label htmlFor="workspace-scenario" className="mb-2 block text-sm font-medium">
        Scenario
      </label>
      <textarea
        id="workspace-scenario"
        value={rawText}
        onChange={(event) => onRawTextChange(event.target.value)}
        rows={5}
        className="min-h-32 w-full resize-y rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-3 py-3 text-sm leading-6 outline-none transition focus:border-[rgb(var(--hf-accent))] focus:ring-2 focus:ring-[rgb(var(--hf-accent))]/25"
      />
      <button
        type="button"
        onClick={onAnalyze}
        disabled={status === "loading" || rawText.trim().length < 10}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[rgb(var(--hf-accent))] text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[rgb(var(--hf-disabled))] disabled:text-[rgb(var(--hf-muted))]"
      >
        <MagnifyingGlass size={16} weight="bold" />
        Re-map
      </button>
      <div className="mt-5 border-t border-[rgb(var(--hf-line))] pt-4">
        <h2 className="text-base font-semibold">Parsed fields</h2>
        {!scenario ? (
          <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">
            Fields appear after scenario parsing.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <InputField label="Subject" value={scenario.subject} onChange={(value) => onChange("subject", value)} />
            <InputField label="Location" value={scenario.location} onChange={(value) => onChange("location", value)} />
            <InputField label="Trigger" value={scenario.trigger} onChange={(value) => onChange("trigger", value)} />
            <InputField label="Exposure amount" type="number" value={String(scenario.exposureAmount)} onChange={(value) => onChange("exposureAmount", Number(value))} />
            <InputField label="Budget" type="number" value={String(scenario.budget ?? 12000)} onChange={(value) => onChange("budget", Number(value))} />
            <InputField label="Target coverage" type="number" value={String(scenario.targetCoverage ?? 0.4)} onChange={(value) => onChange("targetCoverage", Number(value))} />
          </div>
        )}
      </div>
    </section>
  );
}

function InputField({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: "text" | "number";
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-[rgb(var(--hf-muted))]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-3 text-sm text-[rgb(var(--hf-text))] outline-none transition focus:border-[rgb(var(--hf-accent))] focus:ring-2 focus:ring-[rgb(var(--hf-accent))]/25"
      />
    </div>
  );
}

function StatusPanel({
  status,
  statusText,
  error,
}: {
  status: ApiState;
  statusText: string;
  error: string | null;
}) {
  if (status === "error") {
    return (
      <section className="flex gap-3 rounded-[16px] border border-red-300/30 bg-red-950/30 p-4 text-red-100">
        <WarningDiamond size={20} weight="bold" />
        <p className="text-sm leading-6">{error}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-accent))]">
            {status === "loading" ? <Funnel size={17} /> : <ShieldWarning size={17} />}
          </div>
          <div>
            <p className="text-sm font-semibold">{statusText}</p>
            <p className="mt-1 text-xs text-[rgb(var(--hf-muted))]">
              Recommendations include settlement rules, liquidity, slippage, max loss, and basis risk.
            </p>
          </div>
        </div>
      </div>
      {status === "loading" ? (
        <div className="mt-4 space-y-2">
          <div className="h-2 rounded-full bg-[rgb(var(--hf-accent))]/35" />
          <DecryptedText
            text="scanning market catalog"
            className="font-mono text-xs text-[rgb(var(--hf-accent))]"
          />
        </div>
      ) : null}
    </section>
  );
}

function MatchesPanel({
  matches,
  selectedMarketIds,
  loading,
  onToggleMarket,
}: {
  matches: MatchResult[];
  selectedMarketIds: string[];
  loading: boolean;
  onToggleMarket: (marketId: string) => void;
}) {
  if (loading) {
    return (
      <section className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]"
          />
        ))}
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="rounded-[16px] border border-dashed border-[rgb(var(--hf-line-strong))] bg-[rgb(var(--hf-panel))]/70 p-6">
        <h2 className="text-lg font-semibold">No visible candidates</h2>
        <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">
          Adjust the filter or re-map the scenario to refresh candidates.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      {matches.map((match, index) => {
        const selected = selectedMarketIds.includes(match.market.id);
        return (
          <Reveal key={match.market.id} delay={index * 0.03}>
            <div
              className={`rounded-[16px] border p-4 transition ${
                selected
                  ? "border-[rgb(var(--hf-accent))]/75 bg-[rgb(var(--hf-accent))]/10"
                  : "border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] hover:border-[rgb(var(--hf-line-strong))]"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge>{match.market.provider}</Badge>
                  <Badge>{match.confidence} confidence</Badge>
                  <Badge>{match.executionAllowed ? "demo ready" : "blocked"}</Badge>
                </div>
                {match.market.sourceUrl ? (
                  <a
                    href={match.market.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open source market"
                    aria-label={`Open ${match.market.provider} market page for ${match.market.title}`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-accent))] hover:text-[rgb(var(--hf-accent))] active:translate-y-px"
                  >
                    <ArrowSquareOut size={15} weight="bold" />
                  </a>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onToggleMarket(match.market.id)}
                className="block w-full text-left transition active:translate-y-px"
              >
                <div className="grid gap-4 xl:grid-cols-[1fr_130px]">
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.015em]">
                      {match.market.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">
                      {match.market.rules}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
                    <Metric label="Score" value={String(Math.round(match.score))} />
                    <Metric label="Ask" value={`$${match.market.bestAsk.toFixed(2)}`} />
                    <Metric label="Liquidity" value={formatMoney(match.market.liquidity)} />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-[rgb(var(--hf-muted))] md:grid-cols-2">
                  <p>
                    <span className="text-[rgb(var(--hf-text))]">Covers:</span>{" "}
                    {match.covered.join(", ")}
                  </p>
                  <p>
                    <span className="text-[rgb(var(--hf-text))]">Does not cover:</span>{" "}
                    {match.notCovered.join(", ")}
                  </p>
                </div>
              </button>
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}

function PlanPanel({
  plan,
  executableCount,
  canCreatePlan,
  isBusy,
  acknowledged,
  execution,
  onCreatePlan,
  onAcknowledge,
  onRunDemoOrder,
}: {
  plan: HedgePlan | null;
  executableCount: number;
  canCreatePlan: boolean;
  isBusy: boolean;
  acknowledged: boolean;
  execution: OrderExecution | null;
  onCreatePlan: () => void;
  onAcknowledge: (value: boolean) => void;
  onRunDemoOrder: () => void;
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Hedge plan</h2>
          <span className="font-mono text-xs text-[rgb(var(--hf-muted))]">
            {executableCount} demo eligible
          </span>
        </div>
        <button
          type="button"
          onClick={onCreatePlan}
          disabled={!canCreatePlan || isBusy}
          className="mb-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-[rgb(var(--hf-line-strong))] px-3 text-sm font-semibold text-[rgb(var(--hf-text))] transition hover:bg-[rgb(var(--hf-field))] active:translate-y-px disabled:cursor-not-allowed disabled:border-[rgb(var(--hf-line))] disabled:text-[rgb(var(--hf-muted))]"
        >
          Build plan
          <ArrowRight size={15} weight="bold" />
        </button>

        {!plan ? (
          <p className="text-sm leading-6 text-[rgb(var(--hf-muted))]">
            Choose demo-eligible markets to calculate cost, payout, remaining exposure, and execution checks.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              <Metric label="Cost" value={formatMoney(plan.estimatedCost)} />
              <Metric label="Max payout" value={formatMoney(plan.maxPayout)} />
              <Metric label="Remaining" value={formatMoney(plan.remainingExposure)} />
            </div>
            <div className="rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3">
              <div className="mb-2 flex items-center gap-2 text-sm">
                <Clock size={16} />
                Quote expires {new Date(plan.quoteExpiresAt).toLocaleTimeString()}
              </div>
              <p className="text-sm leading-6 text-[rgb(var(--hf-muted))]">{plan.riskDisclosure}</p>
            </div>
            <div className="space-y-2">
              {plan.scenarioTable.map((row) => (
                <div
                  key={row.label}
                  className="rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3 text-sm"
                >
                  <span className="block text-[rgb(var(--hf-muted))]">{row.label}</span>
                  <span className="mt-1 block font-mono font-semibold">
                    {formatMoney(row.netAfterHedge)}
                  </span>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-3 rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3 text-sm leading-6 text-[rgb(var(--hf-muted))]">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => onAcknowledge(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[rgb(var(--hf-accent))]"
              />
              I understand this is not insurance, and the demo order may not match any real-world loss.
            </label>
            <button
              type="button"
              onClick={onRunDemoOrder}
              disabled={!acknowledged || isBusy || Boolean(execution)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[rgb(var(--hf-accent))] px-3 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[rgb(var(--hf-disabled))] disabled:text-[rgb(var(--hf-muted))]"
            >
              <CheckCircle size={16} weight="bold" />
              Run demo order
            </button>
          </div>
        )}
      </section>
      {execution ? (
        <section className="flex gap-4 rounded-[16px] border border-[rgb(var(--hf-accent))]/45 bg-[rgb(var(--hf-accent))]/10 p-4">
          <SuccessRipple active />
          <div>
            <h2 className="font-semibold">Demo execution {execution.status}</h2>
            <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">
              Filled {execution.filledQuantity} contracts at ${execution.averagePrice.toFixed(2)}. The response is stored in the audit ledger.
            </p>
          </div>
        </section>
      ) : null}
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3">
      <div className="mb-1 font-mono text-[11px] text-[rgb(var(--hf-muted))]">{label}</div>
      <div className="font-mono text-sm font-semibold text-[rgb(var(--hf-text))]">{value}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[8px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-2 py-1 font-mono text-xs text-[rgb(var(--hf-muted))]">
      {children}
    </span>
  );
}

async function postJson<Response>(
  url: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as Response & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
