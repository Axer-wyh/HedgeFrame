"use client";

import {
  CheckCircle,
  Database,
  Fingerprint,
  Receipt,
  ShieldCheck,
  SquaresFour,
  UserCircle,
  Wallet,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { type CurrentDemoUser, useCurrentDemoUser } from "./demo-auth-client";
import { IdentityPanel } from "./identity-panel";
import { SiteHeader, type SiteTone } from "./site-header";

type AccountView = "dashboard" | "profile" | "security" | "orders";

type DashboardPayload = {
  user: CurrentDemoUser;
  metrics: {
    activeScenarios: number;
    demoOrders: number;
    estimatedExposure: number;
    auditEvents: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
  }>;
  nextActions: Array<{
    title: string;
    body: string;
    href: string;
  }>;
};

type OrderSummary = {
  id: string;
  planId: string;
  provider: string;
  status: string;
  demo: boolean;
  submittedAt: string;
  filledQuantity: number;
  averagePrice: number;
  scenarioRawText: string;
};

const views: Array<{
  value: AccountView;
  label: string;
  icon: ReactNode;
}> = [
  { value: "dashboard", label: "Dashboard", icon: <SquaresFour size={16} /> },
  { value: "profile", label: "My profile", icon: <UserCircle size={16} /> },
  { value: "security", label: "Security", icon: <ShieldCheck size={16} /> },
  { value: "orders", label: "My orders", icon: <Receipt size={16} /> },
];

export function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refresh } = useCurrentDemoUser();
  const [identityOpen, setIdentityOpen] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [tone, setTone] = useState<SiteTone>("dark");
  const view = parseView(searchParams.get("view"));
  const toggleTone = () =>
    setTone((value) => (value === "dark" ? "light" : "dark"));
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    async function loadAccountData() {
      const [dashboardResponse, ordersResponse] = await Promise.all([
        fetch("/api/account/dashboard", { cache: "no-store" }),
        fetch("/api/account/orders", { cache: "no-store" }),
      ]);

      if (!active) {
        return;
      }

      if (dashboardResponse.ok) {
        const payload = (await dashboardResponse.json()) as {
          dashboard: DashboardPayload;
        };
        setDashboard(payload.dashboard);
      }

      if (ordersResponse.ok) {
        const payload = (await ordersResponse.json()) as { orders: OrderSummary[] };
        setOrders(payload.orders);
      }
    }

    loadAccountData();

    return () => {
      active = false;
    };
  }, [user]);

  function setView(nextView: AccountView) {
    router.push(`/account?view=${nextView}`);
  }

  if (loading) {
    return (
      <AccountShell
        title="Account"
        view={view}
        tone={tone}
        onToneToggle={toggleTone}
        onLogin={() => setIdentityOpen(true)}
        onViewChange={setView}
      />
    );
  }

  if (!user) {
    return (
      <main
        data-tone={tone}
        className="min-h-[100dvh] bg-[rgb(var(--hf-bg))] pt-14 text-[rgb(var(--hf-text))]"
      >
        <SiteHeader
          tone={tone}
          onToneToggle={toggleTone}
          onLogin={() => setIdentityOpen(true)}
        />
        <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[1180px] items-center justify-center px-6">
          <section className="w-full max-w-lg rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-accent))]">
              <Fingerprint size={22} />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              Demo login required
            </h1>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--hf-muted))]">
              Start a demo session to review your dashboard, profile, security
              boundary, and demo order history.
            </p>
            <button
              type="button"
              onClick={() => setIdentityOpen(true)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-[10px] bg-[rgb(var(--hf-accent))] px-4 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px"
            >
              Log in
            </button>
          </section>
        </div>
        {identityOpen ? (
          <IdentityPanel
            mode="login"
            onClose={() => setIdentityOpen(false)}
            onAuthenticated={() => refresh()}
          />
        ) : null}
      </main>
    );
  }

  return (
    <AccountShell
      title={viewTitle(view)}
      view={view}
      tone={tone}
      onToneToggle={toggleTone}
      onLogin={() => setIdentityOpen(true)}
      onViewChange={setView}
    >
      {view === "dashboard" ? <DashboardView dashboard={dashboard} /> : null}
      {view === "profile" ? (
        <ProfileView
          key={user.id}
          user={user}
          onSaved={refresh}
        />
      ) : null}
      {view === "security" ? <SecurityView /> : null}
      {view === "orders" ? (
        <OrdersView
          orders={orders}
          selectedOrder={selectedOrder}
          onSelectOrder={setSelectedOrderId}
        />
      ) : null}
      {identityOpen ? (
        <IdentityPanel mode="login" onClose={() => setIdentityOpen(false)} />
      ) : null}
    </AccountShell>
  );
}

function AccountShell({
  title,
  view,
  tone,
  onToneToggle,
  onLogin,
  onViewChange,
  children,
}: {
  title: string;
  view: AccountView;
  tone: SiteTone;
  onToneToggle: () => void;
  onLogin: () => void;
  onViewChange: (view: AccountView) => void;
  children?: ReactNode;
}) {
  return (
    <main
      data-tone={tone}
      className="min-h-[100dvh] bg-[rgb(var(--hf-bg))] pt-14 text-[rgb(var(--hf-text))]"
    >
      <SiteHeader tone={tone} onToneToggle={onToneToggle} onLogin={onLogin} />
      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="border-b border-[rgb(var(--hf-line))] pb-4">
          <p className="font-mono text-xs text-[rgb(var(--hf-accent))]">
            Account workspace
          </p>
          <h1 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            {title}
          </h1>
        </div>
        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-2">
            {views.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onViewChange(item.value)}
                className={`mb-1 flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-sm transition ${
                  view === item.value
                    ? "bg-[rgb(var(--hf-accent))] font-semibold text-[rgb(var(--hf-ink))]"
                    : "text-[rgb(var(--hf-muted))] hover:bg-[rgb(var(--hf-field))] hover:text-[rgb(var(--hf-text))]"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </aside>
          <section className="min-w-0">{children}</section>
        </section>
      </div>
    </main>
  );
}

function DashboardView({
  dashboard,
}: {
  dashboard: DashboardPayload | null;
}) {
  if (!dashboard) {
    return <LoadingPanel label="Loading dashboard" />;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Active scenarios" value={dashboard.metrics.activeScenarios} />
        <MetricCard label="Demo orders" value={dashboard.metrics.demoOrders} />
        <MetricCard
          label="Estimated exposure"
          value={formatCurrency(dashboard.metrics.estimatedExposure)}
        />
        <MetricCard label="Audit events" value={dashboard.metrics.auditEvents} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Panel title="Recent activity">
          {dashboard.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recentActivity.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3"
                >
                  <p className="text-sm font-semibold">{event.action}</p>
                  <p className="mt-1 font-mono text-xs text-[rgb(var(--hf-muted))]">
                    {event.entityType} / {event.entityId}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyText>No account activity yet.</EmptyText>
          )}
        </Panel>
        <Panel title="Next actions">
          <div className="space-y-2">
            {dashboard.nextActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="block rounded-[12px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3 transition hover:border-[rgb(var(--hf-accent))]"
              >
                <p className="text-sm font-semibold">{action.title}</p>
                <p className="mt-1 text-xs leading-5 text-[rgb(var(--hf-muted))]">
                  {action.body}
                </p>
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function ProfileView({
  user,
  onSaved,
}: {
  user: CurrentDemoUser;
  onSaved: () => Promise<void>;
}) {
  const [profile, setProfile] = useState<ProfileViewProps>({
    displayName: user.displayName,
    email: user.email,
    organization: user.organization,
    role: user.role,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function saveProfile() {
    setSaveStatus("saving");

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      setSaveStatus("error");
      return;
    }

    await onSaved();
    setSaveStatus("saved");
  }

  function updateProfile(key: keyof ProfileViewProps, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <Panel title="Profile details">
      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField
          label="Display name"
          value={profile.displayName}
          onChange={(value) => updateProfile("displayName", value)}
        />
        <ProfileField
          label="Email"
          value={profile.email}
          onChange={(value) => updateProfile("email", value)}
        />
        <ProfileField
          label="Organization"
          value={profile.organization}
          onChange={(value) => updateProfile("organization", value)}
        />
        <ProfileField
          label="Role"
          value={profile.role}
          onChange={(value) => updateProfile("role", value)}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={saveProfile}
          disabled={saveStatus === "saving"}
          className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[rgb(var(--hf-accent))] px-4 text-sm font-semibold text-[rgb(var(--hf-ink))] transition hover:bg-[rgb(var(--hf-accent-soft))] active:translate-y-px disabled:cursor-wait disabled:opacity-70"
        >
          {saveStatus === "saving" ? "Saving" : "Save profile"}
        </button>
        {saveStatus === "saved" ? (
          <span className="inline-flex items-center gap-2 text-sm text-[rgb(var(--hf-accent))]">
            <CheckCircle size={16} weight="bold" />
            Profile saved
          </span>
        ) : null}
        {saveStatus === "error" ? (
          <span className="text-sm text-red-200">Profile could not be saved.</span>
        ) : null}
      </div>
    </Panel>
  );
}

type ProfileViewProps = {
  displayName: string;
  email: string;
  organization: string;
  role: string;
};

function SecurityView() {
  return (
    <div className="space-y-4">
      <Panel title="Session boundary">
        <div className="grid gap-3 md:grid-cols-2">
          <SecurityCard
            icon={<Fingerprint size={20} />}
            title="Demo session"
            body="Browser session cookie only. No password, OTP, or third-party auth is enabled in this prototype."
          />
          <SecurityCard
            icon={<Database size={20} />}
            title="Platform Kalshi demo account"
            body="Demo execution is signed server-side with platform credentials when configured."
          />
          <SecurityCard
            icon={<Wallet size={20} />}
            title="Wallet not connected"
            body="Wallet connection is a future payment path. This prototype does not request deposits."
            action={
              <button
                type="button"
                disabled
                className="mt-4 inline-flex h-9 items-center justify-center rounded-[8px] border border-[rgb(var(--hf-line))] px-3 text-sm text-[rgb(var(--hf-muted))]"
              >
                Connect wallet
              </button>
            }
          />
          <SecurityCard
            icon={<ShieldCheck size={20} />}
            title="No private keys stored"
            body="HedgeFrame does not collect seed phrases, private keys, or custody credentials."
          />
        </div>
      </Panel>
      <Panel title="Execution boundary">
        <p className="max-w-3xl text-sm leading-6 text-[rgb(var(--hf-muted))]">
          This account area is demo-only. Orders shown here are execution records
          for prediction-market hedge discovery and do not create an insurance
          contract.
        </p>
      </Panel>
    </div>
  );
}

function OrdersView({
  orders,
  selectedOrder,
  onSelectOrder,
}: {
  orders: OrderSummary[];
  selectedOrder: OrderSummary | null;
  onSelectOrder: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel title="Order history">
        {orders.length > 0 ? (
          <div className="overflow-hidden rounded-[12px] border border-[rgb(var(--hf-line))]">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                aria-label={`Order ${order.id}`}
                onClick={() => onSelectOrder(order.id)}
                className="grid w-full grid-cols-[1fr_110px_110px] gap-3 border-b border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3 text-left last:border-b-0 hover:bg-[rgb(var(--hf-panel))]"
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {order.scenarioRawText}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-[rgb(var(--hf-muted))]">
                    {order.id}
                  </span>
                </span>
                <span className="font-mono text-xs text-[rgb(var(--hf-muted))]">
                  {order.provider}
                </span>
                <span className="font-mono text-xs text-[rgb(var(--hf-accent))]">
                  {order.status}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyText>No demo orders yet.</EmptyText>
        )}
      </Panel>
      <Panel title="Order detail">
        {selectedOrder ? (
          <div className="space-y-3">
            <DetailRow label="Execution id" value={selectedOrder.id} />
            <DetailRow label="Associated hedge plan" value={selectedOrder.planId} />
            <DetailRow label="Quantity" value={String(selectedOrder.filledQuantity)} />
            <DetailRow label="Average price" value={`$${selectedOrder.averagePrice.toFixed(2)}`} />
            <DetailRow
              label="Submitted"
              value={new Date(selectedOrder.submittedAt).toLocaleString()}
            />
          </div>
        ) : (
          <EmptyText>Select an order to inspect execution details.</EmptyText>
        )}
      </Panel>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
      <p className="font-mono text-xs text-[rgb(var(--hf-muted))]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ProfileField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `profile-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <label className="block text-sm font-medium" htmlFor={id}>
      {label}
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] px-3 text-sm text-[rgb(var(--hf-text))] outline-none transition focus:border-[rgb(var(--hf-accent))] focus:ring-2 focus:ring-[rgb(var(--hf-accent))]/25"
      />
    </label>
  );
}

function SecurityCard({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgb(var(--hf-line))] text-[rgb(var(--hf-accent))]">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[rgb(var(--hf-muted))]">{body}</p>
      {action}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-field))] p-3">
      <p className="font-mono text-xs text-[rgb(var(--hf-muted))]">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold">{value}</p>
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <section className="rounded-[16px] border border-[rgb(var(--hf-line))] bg-[rgb(var(--hf-panel))] p-4">
      <div className="h-5 w-44 animate-pulse rounded-[6px] bg-[rgb(var(--hf-field))]" />
      <p className="mt-4 text-sm text-[rgb(var(--hf-muted))]">{label}</p>
    </section>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-[rgb(var(--hf-muted))]">{children}</p>;
}

function parseView(value: string | null): AccountView {
  if (
    value === "profile" ||
    value === "security" ||
    value === "orders" ||
    value === "dashboard"
  ) {
    return value;
  }

  return "dashboard";
}

function viewTitle(view: AccountView) {
  if (view === "profile") return "My profile";
  if (view === "security") return "Security center";
  if (view === "orders") return "My orders";
  return "Dashboard";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
