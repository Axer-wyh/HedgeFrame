"use client";

import {
  Check,
  GlobeHemisphereWest,
  Moon,
  Sun,
} from "@phosphor-icons/react";
import { useState } from "react";

import { AccountNav } from "./account-nav";

export type SiteTone = "dark" | "light";

export function SiteHeader({
  anchorPrefix = "/",
  tone,
  onToneToggle,
  onLogin,
}: {
  anchorPrefix?: "" | "/";
  tone: SiteTone;
  onToneToggle: () => void;
  onLogin: () => void;
}) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const homeHref = anchorPrefix === "" ? "#top" : "/";
  const sectionHref = (hash: string) => `${anchorPrefix}${hash}`;

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-bg))]/94 backdrop-blur-xl">
        <div className="grid h-14 grid-cols-[56px_190px_132px_116px_116px_1fr_170px_148px_56px_56px] border-r border-[rgb(var(--hf-line))] max-xl:grid-cols-[52px_170px_104px_96px_96px_1fr_150px_128px_52px_52px]">
          <a
            href={homeHref}
            aria-label="HedgeFrame home"
            className="flex items-center justify-center border-l border-[rgb(var(--hf-line))] transition hover:bg-[rgb(var(--hf-panel))]"
          >
            <BrandMark />
          </a>
          <a
            href={homeHref}
            className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 font-mono text-sm font-semibold tracking-[0.08em]"
          >
            HedgeFrame
          </a>
          <a
            href={sectionHref("#how-it-works")}
            className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
          >
            How it works
          </a>
          <a
            href={sectionHref("#use-cases")}
            className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
          >
            Use cases
          </a>
          <a
            href="/markets"
            className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
          >
            Markets
          </a>
          <a
            href={sectionHref("#about")}
            className="flex items-center border-l border-[rgb(var(--hf-line))] px-4 text-sm transition hover:bg-[rgb(var(--hf-panel))]"
          >
            About
          </a>
          <AccountNav surface="home" onLogin={onLogin} />
          <a
            href={sectionHref("#try-scenario")}
            className="flex items-center justify-center gap-2 border-l border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-accent))] text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px"
          >
            Try a scenario
          </a>
          <button
            type="button"
            aria-expanded={languageOpen}
            aria-label="Select language"
            onClick={() => setLanguageOpen((open) => !open)}
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

      {languageOpen ? (
        <LanguageMenu onClose={() => setLanguageOpen(false)} />
      ) : null}
    </>
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

export function BrandMark() {
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
