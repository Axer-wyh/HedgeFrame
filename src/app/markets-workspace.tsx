"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  CaretDown,
  CheckCircle,
  Clock,
  Database,
  Funnel,
  MagnifyingGlass,
  ShieldWarning,
  WarningDiamond,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { IdentityPanel, type IdentityPanelMode } from "./identity-panel";
import { AnimatedTabs, DecryptedText, Reveal, SuccessRipple } from "./motion-primitives";
import { SiteHeader, type SiteTone } from "./site-header";
import type {
  HedgePlan,
  MarketCandidate,
  MarketSide,
  MatchResult,
  OrderExecution,
  RiskScenario,
} from "@/lib/domain/types";

type ApiState = "idle" | "loading" | "ready" | "error";
type MarketFilter = "all" | "kalshi" | "polymarket" | "blocked";
type MarketSort = "default" | "liquidity" | "relevance" | "timeliness";

const MATCHES_PER_PAGE = 30;
const DETAIL_DEMO_BALANCE = 12000;
const DEFAULT_DETAIL_QUANTITY = 100;
const DETAIL_QUANTITY_PRESETS = [100, 250, 500, 1000];

const fallbackScenario =
  "My outdoor event loses $80k if heavy rain hits Austin on Oct 12.";

const sortOptions: { label: string; value: MarketSort }[] = [
  { label: "Default", value: "default" },
  { label: "Liquidity", value: "liquidity" },
  { label: "Relevance", value: "relevance" },
  { label: "Timeliness", value: "timeliness" },
];

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
  const [sort, setSort] = useState<MarketSort>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [detailMatch, setDetailMatch] = useState<MatchResult | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [identityPanel, setIdentityPanel] = useState<IdentityPanelMode | null>(null);
  const [page, setPage] = useState(1);
  const [tone, setTone] = useState<SiteTone>("dark");
  const hasAutoRun = useRef(false);

  const executableMatches = useMemo(
    () => matches.filter((match) => match.executionAllowed),
    [matches],
  );
  const selectedCount = selectedMarketIds.length;
  const hasSelectedMarkets = selectedCount > 0;
  const canContinue = hasSelectedMarkets && Boolean(scenario?.id) && status !== "loading";
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
  const sortedMatches = useMemo(() => {
    if (sort === "default") return filteredMatches;

    return filteredMatches
      .map((match, index) => ({ match, index }))
      .sort((a, b) => {
        if (sort === "liquidity") {
          return (
            b.match.market.liquidity - a.match.market.liquidity ||
            b.match.score - a.match.score ||
            a.index - b.index
          );
        }

        if (sort === "timeliness") {
          return (
            Date.parse(a.match.market.closeTime) -
              Date.parse(b.match.market.closeTime) ||
            b.match.score - a.match.score ||
            a.index - b.index
          );
        }

        return b.match.score - a.match.score || a.index - b.index;
      })
      .map(({ match }) => match);
  }, [filteredMatches, sort]);
  const pageCount = Math.max(1, Math.ceil(sortedMatches.length / MATCHES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * MATCHES_PER_PAGE;
    return sortedMatches.slice(start, start + MATCHES_PER_PAGE);
  }, [currentPage, sortedMatches]);

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
      setPage(1);
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
    setPlan(null);
    setExecution(null);
    setAcknowledged(false);

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

  async function continueToPlan() {
    if (!canContinue) return;
    setPlanOpen(true);
    await createPlan();
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
    <main
      data-tone={tone}
      className="min-h-[100dvh] bg-[rgb(var(--hf-bg))] pb-24 pt-14 text-[rgb(var(--hf-text))]"
    >
      <SiteHeader
        tone={tone}
        onToneToggle={() => setTone((value) => (value === "dark" ? "light" : "dark"))}
        onLogin={() => setIdentityPanel("login")}
      />
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[1680px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[330px_minmax(0,1fr)]">
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
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="flex items-center gap-2 font-mono text-xs text-[rgb(var(--hf-muted))]">
                    <Database size={14} />
                    mock provider catalog
                  </div>
                  <SortMenu
                    value={sort}
                    open={sortOpen}
                    onOpenChange={setSortOpen}
                    onChange={(nextSort) => {
                      setSort(nextSort);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <AnimatedTabs
                value={filter}
                onChange={(nextFilter) => {
                  setFilter(nextFilter);
                  setPage(1);
                }}
                tabs={[
                  { label: "All", value: "all" },
                  { label: "Kalshi demo", value: "kalshi" },
                  { label: "Polymarket", value: "polymarket" },
                  { label: "Others", value: "blocked" },
                ]}
              />
            </Reveal>
            <MatchesPanel
              matches={paginatedMatches}
              selectedMarketIds={selectedMarketIds}
              loading={status === "loading" && matches.length === 0}
              onOpenDetails={setDetailMatch}
              onToggleMarket={(marketId) => {
                setSelectedMarketIds((current) =>
                  current.includes(marketId)
                    ? current.filter((id) => id !== marketId)
                    : [...current, marketId],
                );
              }}
            />
            {sortedMatches.length > 0 ? (
              <PaginationBar
                totalCount={sortedMatches.length}
                pageSize={MATCHES_PER_PAGE}
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            ) : null}
          </section>

        </section>
      </div>
      <div
        className="group fixed bottom-5 left-1/2 z-40 -translate-x-1/2"
        title="Selected markets / total markets"
      >
        <button
          type="button"
          onClick={continueToPlan}
          disabled={!canContinue}
          className={`inline-flex h-12 items-center gap-3 rounded-[12px] border px-5 text-sm font-semibold shadow-[0_18px_70px_rgba(0,0,0,0.42)] transition ${
            canContinue
              ? "border-[rgb(var(--hf-accent))] bg-[rgb(var(--hf-accent))] text-[rgb(var(--hf-ink))] hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px"
              : "cursor-not-allowed border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-disabled))] text-[rgb(var(--hf-muted))] shadow-none"
          }`}
        >
          Continue
          <span
            className={`font-mono text-xs ${
              canContinue
                ? "text-[rgb(var(--hf-ink))]/75"
                : "text-[rgb(var(--hf-muted))]"
            }`}
          >
            {selectedCount}/{matches.length}
          </span>
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel-strong))] px-3 py-2 font-mono text-xs text-[rgb(var(--hf-muted))] opacity-0 shadow-[0_14px_48px_rgba(0,0,0,0.38)] transition group-hover:opacity-100 group-focus-within:opacity-100">
          Selected markets / total markets
        </span>
      </div>
      {detailMatch ? (
        <MarketDetailDialog
          match={detailMatch}
          selected={selectedMarketIds.includes(detailMatch.market.id)}
          onClose={() => setDetailMatch(null)}
          onToggleMarket={() => onToggleMarketFromDialog(detailMatch.market.id)}
        />
      ) : null}
      {planOpen ? (
        <PlanDialog onClose={() => setPlanOpen(false)}>
          <PlanPanel
            plan={plan}
            executableCount={executableMatches.length}
            isBusy={status === "loading"}
            error={status === "error" ? error : null}
            acknowledged={acknowledged}
            execution={execution}
            onAcknowledge={setAcknowledged}
            onRunDemoOrder={runDemoOrder}
          />
        </PlanDialog>
      ) : null}
      {identityPanel ? (
        <IdentityPanel mode={identityPanel} onClose={() => setIdentityPanel(null)} />
      ) : null}
    </main>
  );

  function onToggleMarketFromDialog(marketId: string) {
    setSelectedMarketIds((current) =>
      current.includes(marketId)
        ? current.filter((id) => id !== marketId)
        : [...current, marketId],
    );
  }
}

function SortMenu({
  value,
  open,
  onOpenChange,
  onChange,
}: {
  value: MarketSort;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: MarketSort) => void;
}) {
  const current = sortOptions.find((option) => option.value === value) ?? sortOptions[0];

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort candidates: ${current.label}`}
        onClick={() => onOpenChange(!open)}
        className="inline-flex h-9 min-w-40 items-center justify-between gap-2 rounded-[8px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel-strong))] px-3 font-mono text-xs text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-line-strong))] hover:text-[rgb(var(--hf-text))] active:translate-y-px"
      >
        <span className="inline-flex items-center gap-2">
          <Funnel size={14} />
          <span>Sort</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[rgb(var(--hf-text))]">
          {current.label}
          <CaretDown
            size={12}
            weight="bold"
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Sort candidates"
          className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-[10px] border border-[rgb(var(--hf-line-strong))] bg-[rgb(var(--hf-panel-strong))] p-1 shadow-[0_18px_60px_rgba(0,0,0,0.42)]"
        >
          {sortOptions.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  onOpenChange(false);
                }}
                className={`flex h-9 w-full items-center justify-between rounded-[8px] px-3 text-left font-mono text-xs transition active:translate-y-px ${
                  active
                    ? "bg-[rgb(var(--hf-accent))] text-[rgb(var(--hf-ink))]"
                    : "text-[rgb(var(--hf-muted))] hover:bg-[rgb(var(--hf-field))] hover:text-[rgb(var(--hf-text))]"
                }`}
              >
                {option.label}
                {active ? <CheckCircle size={14} weight="bold" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
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

function PaginationBar({
  totalCount,
  pageSize,
  currentPage,
  pageCount,
  onPageChange,
}: {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <nav
      aria-label="Candidate pagination"
      className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[rgb(var(--hf-muted))]">
        <span>
          Showing {start}-{end} of {totalCount}
        </span>
        <span className="rounded-[8px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-2 py-1 text-[rgb(var(--hf-text))]">
          {pageSize} per page
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-line-strong))] hover:text-[rgb(var(--hf-text))] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[rgb(var(--hf-line))] disabled:hover:text-[rgb(var(--hf-muted))]"
        >
          <ArrowLeft size={15} weight="bold" />
        </button>
        <span className="min-w-24 text-center font-mono text-xs text-[rgb(var(--hf-muted))]">
          Page {currentPage} of {pageCount}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage >= pageCount}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-line-strong))] hover:text-[rgb(var(--hf-text))] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[rgb(var(--hf-line))] disabled:hover:text-[rgb(var(--hf-muted))]"
        >
          <ArrowRight size={15} weight="bold" />
        </button>
      </div>
    </nav>
  );
}

function MatchesPanel({
  matches,
  selectedMarketIds,
  loading,
  onOpenDetails,
  onToggleMarket,
}: {
  matches: MatchResult[];
  selectedMarketIds: string[];
  loading: boolean;
  onOpenDetails: (match: MatchResult) => void;
  onToggleMarket: (marketId: string) => void;
}) {
  if (loading) {
    return (
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]"
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
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {matches.map((match, index) => {
        const selected = selectedMarketIds.includes(match.market.id);
        const toggleMarket = () => onToggleMarket(match.market.id);
        return (
          <Reveal key={match.market.id} delay={index * 0.03}>
            <div
              data-market-card
              data-selected={selected ? "true" : "false"}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`${selected ? "Unselect" : "Select"} ${match.market.title}`}
              onClick={toggleMarket}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleMarket();
                }
              }}
              className={`flex min-h-44 cursor-pointer flex-col rounded-[16px] border p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--hf-accent))] ${
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
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-accent))] hover:text-[rgb(var(--hf-accent))] active:translate-y-px"
                  >
                    <ArrowSquareOut size={15} weight="bold" />
                  </a>
                ) : null}
              </div>
              <div className="block flex-1 text-left">
                <h3
                  data-market-card-title
                  className="line-clamp-2 text-base font-semibold leading-snug tracking-[-0.015em]"
                >
                  {match.market.title}
                </h3>
                <div className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-2 py-1 font-mono text-xs text-[rgb(var(--hf-muted))]">
                  <span>Direction</span>
                  <span className="font-semibold text-[rgb(var(--hf-accent))]">
                    Buy Yes
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Metric label="Ask" value={`$${match.market.bestAsk.toFixed(2)}`} />
                  <Metric label="Liquidity" value={formatMoney(match.market.liquidity)} />
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenDetails(match);
                }}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line-strong))] px-3 text-sm font-semibold text-[rgb(var(--hf-text))] transition hover:border-[rgb(var(--hf-accent))] hover:bg-[rgb(var(--hf-field))] active:translate-y-px"
              >
                View details
              </button>
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}

function MarketDetailDialog({
  match,
  selected,
  onClose,
  onToggleMarket,
}: {
  match: MatchResult;
  selected: boolean;
  onClose: () => void;
  onToggleMarket: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="market-detail-title"
    >
      <div className="max-h-[88dvh] w-full max-w-4xl overflow-y-auto rounded-[16px] border border-[rgb(var(--hf-line-strong))] bg-[rgb(var(--hf-panel-strong))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{match.market.provider}</Badge>
              <Badge>{match.confidence} confidence</Badge>
              <Badge>{match.executionAllowed ? "demo ready" : "blocked"}</Badge>
            </div>
            <h2
              id="market-detail-title"
              className="inline-flex items-start gap-3 text-2xl font-semibold leading-tight tracking-[-0.03em]"
            >
              <span>{match.market.title}</span>
              {match.market.sourceUrl ? (
                <a
                  href={match.market.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open source market"
                  aria-label={`Open ${match.market.provider} market page for ${match.market.title}`}
                  className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-accent))] hover:text-[rgb(var(--hf-accent))] active:translate-y-px"
                >
                  <ArrowSquareOut size={15} weight="bold" />
                </a>
              ) : null}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close market details"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:text-[rgb(var(--hf-text))] active:translate-y-px"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <ProbabilityTrendChart market={match.market} />
            <RulesAndMarketContext match={match} />
          </div>
          <OrderTicket
            match={match}
            selected={selected}
            onConfirm={onToggleMarket}
          />
        </div>
      </div>
    </div>
  );
}

function RulesAndMarketContext({ match }: { match: MatchResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-[14px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Rules and market background</h3>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="rounded-[8px] border border-[rgb(var(--hf-line))] px-2 py-1 text-xs font-semibold text-[rgb(var(--hf-muted))] transition hover:text-[rgb(var(--hf-text))] active:translate-y-px"
        >
          {expanded ? "收起" : "展开"}
        </button>
      </div>
      <div
        className={`relative overflow-hidden text-sm leading-6 text-[rgb(var(--hf-muted))] ${
          expanded ? "max-h-none" : "max-h-44"
        }`}
      >
        <p>
          <span className="font-semibold text-[rgb(var(--hf-text))]">
            Settlement rule:
          </span>{" "}
          {match.market.rules}
        </p>
        <p className="mt-3">
          <span className="font-semibold text-[rgb(var(--hf-text))]">
            Market background:
          </span>{" "}
          This {match.market.provider} demo market is matched to the scenario by
          event type, location, time window, trigger language, liquidity, and
          basis risk. Current liquidity is {formatMoney(match.market.liquidity)},
          open interest is {formatMoney(match.market.openInterest)}, and the
          market closes on {new Date(match.market.closeTime).toLocaleDateString()}.
        </p>
        <p className="mt-3">
          This is not a loss contract. The market may settle differently from the
          event economics, so the position can leave residual exposure.
        </p>
        {!expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[rgb(var(--hf-field))] to-transparent" />
        ) : null}
      </div>
    </section>
  );
}

function OrderTicket({
  match,
  selected,
  onConfirm,
}: {
  match: MatchResult;
  selected: boolean;
  onConfirm: () => void;
}) {
  const [quantity, setQuantity] = useState(String(DEFAULT_DETAIL_QUANTITY));
  const side: MarketSide = "yes";
  const action = "buy";
  const parsedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  const price = getOrderPrice(match.market, side, action);
  const cashImpact = roundCurrency(parsedQuantity * price);
  const remainingBalance = roundCurrency(DETAIL_DEMO_BALANCE - cashImpact);
  const balanceExceeded = remainingBalance < 0;

  return (
    <aside>
      <section className="rounded-[14px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Order ticket</h3>
            <p className="mt-1 text-xs leading-5 text-[rgb(var(--hf-muted))]">
              Demo quote preview only.
            </p>
          </div>
          <Badge>{match.market.executionMode}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <ReadOnlyPill label="Action" value="Buy" />
          <ReadOnlyPill label="Outcome" value="Yes" />
        </div>

        <div className="mt-4 rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] text-[rgb(var(--hf-muted))]">
                Limit price
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold text-[rgb(var(--hf-accent))]">
                ${price.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] text-[rgb(var(--hf-muted))]">
                {action} {side}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold uppercase">
                demo only
              </div>
            </div>
          </div>
        </div>

        <label
          htmlFor={`quantity-${match.market.id}`}
          className="mt-4 block text-xs font-medium text-[rgb(var(--hf-muted))]"
        >
          Quantity
        </label>
        <input
          id={`quantity-${match.market.id}`}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          onBlur={() => {
            if (quantity.trim() === "") setQuantity("0");
          }}
          className="mt-2 h-11 w-full rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] px-3 font-mono text-sm text-[rgb(var(--hf-text))] outline-none transition focus:border-[rgb(var(--hf-accent))] focus:ring-2 focus:ring-[rgb(var(--hf-accent))]/25"
        />
        <div className="mt-2 grid grid-cols-4 gap-2">
          {DETAIL_QUANTITY_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setQuantity(String(preset))}
              className="h-8 rounded-[8px] border border-[rgb(var(--hf-line))] font-mono text-xs text-[rgb(var(--hf-muted))] transition hover:border-[rgb(var(--hf-accent))] hover:text-[rgb(var(--hf-accent))] active:translate-y-px"
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <PreviewRow
            label="Estimated cost"
            value={formatMoneyWithCents(cashImpact)}
          />
          <PreviewRow label="Potential payout" value={formatMoney(parsedQuantity)} />
          <PreviewRow label="Demo balance" value={formatMoney(DETAIL_DEMO_BALANCE)} />
          <PreviewRow
            label="Remaining"
            value={formatMoneyWithCents(Math.max(0, remainingBalance))}
            muted={balanceExceeded}
          />
        </div>
        {balanceExceeded ? (
          <p className="mt-3 rounded-[10px] border border-red-300/30 bg-red-950/30 p-2 text-xs leading-5 text-red-100/80">
            Quantity exceeds the demo balance. Reduce size before confirming.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            if (!selected) onConfirm();
          }}
          disabled={balanceExceeded}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[8px] bg-[rgb(var(--hf-accent))] px-3 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px disabled:cursor-not-allowed disabled:bg-[rgb(var(--hf-disabled))] disabled:text-[rgb(var(--hf-muted))]"
        >
          Confirm
        </button>
      </section>
    </aside>
  );
}

function ReadOnlyPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] px-3 py-2">
      <div className="font-mono text-[10px] text-[rgb(var(--hf-muted))]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[rgb(var(--hf-accent))]">
        {value}
      </div>
    </div>
  );
}

function PreviewRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[rgb(var(--hf-muted))]">{label}</span>
      <span
        className={`font-mono font-semibold ${
          muted ? "text-red-100" : "text-[rgb(var(--hf-text))]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ProbabilityTrendChart({ market }: { market: MarketCandidate }) {
  const history = getProbabilityHistory(market);
  const lastPoint = history[history.length - 1];
  const yesProbability = lastPoint?.probability ?? market.bestAsk;
  const noProbability = 1 - yesProbability;
  const low = Math.min(...history.map((point) => point.probability));
  const high = Math.max(...history.map((point) => point.probability));
  const trendDelta = yesProbability - history[0].probability;
  const chart = buildProbabilityChart(history);

  return (
    <section className="rounded-[14px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Probability</h3>
          <p className="mt-1 text-sm leading-6 text-[rgb(var(--hf-muted))]">
            YES and NO implied probability, with mock YES history for this demo.
          </p>
        </div>
        <div className="grid min-w-52 grid-cols-2 gap-2">
          <div className="rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] px-3 py-2">
            <div className="font-mono text-[11px] text-[rgb(var(--hf-muted))]">
              YES
            </div>
            <div className="mt-1 font-mono text-2xl font-semibold text-[rgb(var(--hf-accent))]">
              {formatPercent(yesProbability)}
            </div>
          </div>
          <div className="rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] px-3 py-2">
            <div className="font-mono text-[11px] text-[rgb(var(--hf-muted))]">
              NO
            </div>
            <div className="mt-1 font-mono text-2xl font-semibold">
              {formatPercent(noProbability)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))]">
        <svg
          role="img"
          aria-label={`Probability trend for ${market.title}`}
          viewBox="0 0 720 280"
          className="h-72 w-full"
          preserveAspectRatio="none"
        >
          <rect width="720" height="280" fill="rgb(var(--hf-panel))" />
          {chart.gridLines.map((line) => (
            <g key={line.label}>
              <line
                x1="48"
                x2="696"
                y1={line.y}
                y2={line.y}
                stroke="rgb(var(--hf-line))"
                strokeWidth="1"
              />
              <text
                x="18"
                y={line.y + 4}
                fill="rgb(var(--hf-muted))"
                fontSize="11"
                fontFamily="monospace"
              >
                {line.label}
              </text>
            </g>
          ))}
          <path d={chart.areaPath} fill="rgb(var(--hf-accent))" opacity="0.12" />
          <path
            d={chart.linePath}
            fill="none"
            stroke="rgb(var(--hf-accent))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {chart.points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}-${index}`}
              cx={point.x}
              cy={point.y}
              r={index === chart.points.length - 1 ? 5 : 3}
              fill={index === chart.points.length - 1 ? "rgb(var(--hf-accent))" : "rgb(var(--hf-panel))"}
              stroke="rgb(var(--hf-accent))"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <text
            x="48"
            y="262"
            fill="rgb(var(--hf-muted))"
            fontSize="11"
            fontFamily="monospace"
          >
            {formatShortDate(history[0].timestamp)}
          </text>
          <text
            x="648"
            y="262"
            fill="rgb(var(--hf-muted))"
            fontSize="11"
            fontFamily="monospace"
          >
            {formatShortDate(lastPoint.timestamp)}
          </text>
        </svg>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Metric label="Bid" value={formatPercent(market.bestBid)} />
        <Metric label="Ask" value={formatPercent(market.bestAsk)} />
        <Metric label="Range" value={`${formatPercent(low)}-${formatPercent(high)}`} />
        <Metric
          label="Move"
          value={`${trendDelta >= 0 ? "+" : ""}${formatPercent(trendDelta)}`}
        />
      </div>
    </section>
  );
}

function PlanDialog({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hedge-plan-title"
    >
      <div className="max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-[16px] border border-[rgb(var(--hf-line-strong))] bg-[rgb(var(--hf-panel-strong))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="hedge-plan-title" className="text-xl font-semibold">
            Hedge plan
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close hedge plan"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-muted))] transition hover:text-[rgb(var(--hf-text))] active:translate-y-px"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PlanPanel({
  plan,
  executableCount,
  isBusy,
  error,
  acknowledged,
  execution,
  onAcknowledge,
  onRunDemoOrder,
}: {
  plan: HedgePlan | null;
  executableCount: number;
  isBusy: boolean;
  error: string | null;
  acknowledged: boolean;
  execution: OrderExecution | null;
  onAcknowledge: (value: boolean) => void;
  onRunDemoOrder: () => void;
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold">Quote detail</span>
          <span className="font-mono text-xs text-[rgb(var(--hf-muted))]">
            {executableCount} demo eligible
          </span>
        </div>

        {isBusy && !plan ? (
          <div className="space-y-3">
            <div className="rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3">
              <DecryptedText
                text="building quote"
                className="font-mono text-xs text-[rgb(var(--hf-accent))]"
              />
              <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">
                Calculating cost, payout, remaining exposure, and execution checks.
              </p>
            </div>
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))]"
                />
              ))}
            </div>
          </div>
        ) : !plan ? (
          <div className="rounded-[12px] border border-red-300/30 bg-red-950/30 p-3">
            <h3 className="text-sm font-semibold text-red-100">
              Unable to build quote
            </h3>
            <p className="mt-2 text-sm leading-6 text-red-100/75">
              {error ?? "Select at least one demo-eligible market and continue again."}
            </p>
          </div>
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

function formatMoneyWithCents(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value > 0 && value < 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getOrderPrice(
  market: MarketCandidate,
  side: MarketSide,
  action: "buy" | "sell",
) {
  if (side === "yes" && action === "buy") return market.bestAsk;
  if (side === "yes" && action === "sell") return market.bestBid;
  if (side === "no" && action === "buy") return roundCurrency(1 - market.bestBid);
  return roundCurrency(1 - market.bestAsk);
}

function formatShortDate(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function getProbabilityHistory(market: MarketCandidate) {
  if (market.probabilityHistory && market.probabilityHistory.length >= 2) {
    return market.probabilityHistory;
  }

  const seed = Array.from(market.id).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  const closeTime = Date.parse(market.closeTime);
  const points = 8;

  return Array.from({ length: points }, (_, index) => {
    const progress = index / (points - 1);
    const wave = Math.sin(seed * 0.17 + index * 0.92) * 0.035;
    const drift = (market.bestAsk - market.bestBid) * (progress - 0.5);
    const probability =
      index === points - 1
        ? market.bestAsk
        : clampProbability(market.bestAsk - 0.035 + drift + wave);

    return {
      timestamp: new Date(
        closeTime - (points - index - 1) * 36 * 60 * 60 * 1000,
      ).toISOString(),
      probability,
    };
  });
}

function buildProbabilityChart(
  history: Array<{ timestamp: string; probability: number }>,
) {
  const width = 720;
  const height = 280;
  const padding = { top: 24, right: 24, bottom: 42, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const minValue = 0;
  const maxValue = 1;
  const bottom = padding.top + chartHeight;
  const points = history.map((point, index) => {
    const x =
      padding.left + (chartWidth * index) / Math.max(1, history.length - 1);
    const y =
      padding.top + chartHeight - ((point.probability - minValue) / (maxValue - minValue)) * chartHeight;

    return { x, y };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  const gridLines = [0.2, 0.4, 0.6, 0.8].map((value) => ({
    label: formatPercent(value),
    y: padding.top + chartHeight - value * chartHeight,
  }));

  return { points, linePath, areaPath, gridLines };
}

function clampProbability(value: number) {
  return Math.max(0.02, Math.min(0.98, Math.round(value * 1000) / 1000));
}
