"use client";

import { Fingerprint, Wallet } from "@phosphor-icons/react";
import { useState } from "react";

import { loginDemoUser, type CurrentDemoUser } from "./demo-auth-client";

export type IdentityPanelMode = "login" | "wallet";

export function IdentityPanel({
  mode,
  onClose,
  onAuthenticated,
}: {
  mode: IdentityPanelMode;
  onClose: () => void;
  onAuthenticated?: (user: CurrentDemoUser) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueInDemoMode() {
    setBusy(true);
    setError(null);

    try {
      const user = await loginDemoUser();
      onAuthenticated?.(user);
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start demo session.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-panel-title"
      className="fixed inset-0 z-50 grid place-items-center bg-[rgb(var(--hf-bg))]/76 px-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] text-[rgb(var(--hf-accent))]">
            {mode === "wallet" ? <Wallet size={20} /> : <Fingerprint size={20} />}
          </div>
          <div>
            <h2 id="identity-panel-title" className="text-xl font-semibold">
              {mode === "wallet" ? "Connect wallet" : "Log in"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">
              Demo identity only. Real wallets, custody, deposits, and private keys are outside this prototype.
            </p>
          </div>
        </div>
        {error ? (
          <p className="mt-4 rounded-[10px] border border-red-300/30 bg-red-950/30 p-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={continueInDemoMode}
          disabled={busy}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-[rgb(var(--hf-accent))] text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? "Starting demo session" : "Continue in demo mode"}
        </button>
      </div>
    </div>
  );
}
