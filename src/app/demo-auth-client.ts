"use client";

import { useCallback, useEffect, useState } from "react";

export const AUTH_CHANGED_EVENT = "hedgeframe-auth-changed";

export type CurrentDemoUser = {
  id: string;
  displayName: string;
  email: string;
  organization: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchCurrentDemoUser(): Promise<CurrentDemoUser | null> {
  const response = await fetch("/api/me", { cache: "no-store" });
  const payload = (await response.json()) as {
    authenticated: boolean;
    user: CurrentDemoUser | null;
  };

  return payload.authenticated ? payload.user : null;
}

export async function loginDemoUser(): Promise<CurrentDemoUser> {
  const response = await fetch("/api/auth/demo-login", { method: "POST" });

  if (!response.ok) {
    throw new Error("Unable to start demo session.");
  }

  const payload = (await response.json()) as { user: CurrentDemoUser };
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  return payload.user;
}

export async function logoutDemoUser(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function useCurrentDemoUser() {
  const [user, setUser] = useState<CurrentDemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await fetchCurrentDemoUser());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const nextUser = await fetchCurrentDemoUser();

        if (active) {
          setUser(nextUser);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);

    return () => {
      active = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  return { user, loading, refresh };
}
