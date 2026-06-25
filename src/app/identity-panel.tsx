"use client";

import { Fingerprint, Wallet } from "@phosphor-icons/react";

export type IdentityPanelMode = "login" | "wallet";

export function IdentityPanel({
  mode,
  onClose,
}: {
  mode: IdentityPanelMode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgb(var(--hf-bg))]/76 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] text-[rgb(var(--hf-accent))]">
            {mode === "wallet" ? <Wallet size={20} /> : <Fingerprint size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {mode === "wallet" ? "Connect wallet" : "Log in"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">
              Demo identity only. Real wallets, custody, deposits, and private keys are outside this prototype.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[8px] bg-[rgb(var(--hf-accent))] text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px"
        >
          Continue in demo mode
        </button>
      </div>
    </div>
  );
}
