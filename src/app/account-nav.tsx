"use client";

import {
  CaretDown,
  Receipt,
  ShieldCheck,
  SignOut,
  SquaresFour,
  UserCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { logoutDemoUser, useCurrentDemoUser } from "./demo-auth-client";

type AccountNavSurface = "home" | "workspace";

export function AccountNav({
  onLogin,
  surface = "workspace",
}: {
  onLogin: () => void;
  surface?: AccountNavSurface;
}) {
  const router = useRouter();
  const { user, loading, refresh } = useCurrentDemoUser();
  const [open, setOpen] = useState(false);
  const rootClass =
    surface === "home"
      ? "relative min-w-0 border-l border-[rgb(var(--hf-line))]"
      : "relative";
  const loginClass =
    surface === "home"
      ? "flex h-full w-full items-center justify-center gap-2 px-3 text-sm transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px"
      : "inline-flex h-10 items-center gap-2 rounded-[8px] border border-[rgb(var(--hf-line-strong))] px-3 text-sm text-[rgb(var(--hf-text))] transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px";
  const chipClass =
    surface === "home"
      ? "flex h-full w-full min-w-0 items-center justify-center gap-2 px-3 text-sm transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px"
      : "inline-flex h-10 items-center gap-2 rounded-[8px] border border-[rgb(var(--hf-line-strong))] px-3 text-sm text-[rgb(var(--hf-text))] transition hover:bg-[rgb(var(--hf-panel))] active:translate-y-px";

  async function handleLogout() {
    await logoutDemoUser();
    setOpen(false);
    await refresh();
    router.push("/");
  }

  if (!user) {
    return (
      <div className={rootClass}>
        <button
          type="button"
          onClick={onLogin}
          className={`${loginClass} ${loading ? "opacity-80" : ""}`}
        >
          <UserCircle size={16} />
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Open account menu for ${user.displayName}`}
        onClick={() => setOpen((value) => !value)}
        className={chipClass}
      >
        <UserCircle size={16} weight="bold" />
        <span className="min-w-0 truncate">{user.displayName}</span>
        <CaretDown size={13} weight="bold" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[12px] border border-[rgb(var(--hf-line-strong))] bg-[rgb(var(--hf-panel-strong))] p-1 shadow-[0_22px_80px_rgba(0,0,0,0.42)]">
          <AccountMenuLink href="/account?view=dashboard" icon={<SquaresFour size={15} />}>
            Dashboard
          </AccountMenuLink>
          <AccountMenuLink href="/account?view=orders" icon={<Receipt size={15} />}>
            Orders
          </AccountMenuLink>
          <AccountMenuLink href="/account?view=security" icon={<ShieldCheck size={15} />}>
            Security
          </AccountMenuLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-sm text-[rgb(var(--hf-muted))] transition hover:bg-[rgb(var(--hf-field))] hover:text-[rgb(var(--hf-text))]"
          >
            <SignOut size={15} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AccountMenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm text-[rgb(var(--hf-text))] transition hover:bg-[rgb(var(--hf-field))]"
    >
      {icon}
      {children}
    </Link>
  );
}
