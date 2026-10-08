"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PremiumStatus = {
  isPremium: boolean;
  isLifetime: boolean;
  premiumUntil: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  source: string | null;
};

type PremiumContextValue = PremiumStatus & {
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  redeemCode: (code: string) => Promise<void>;
};

const emptyStatus: PremiumStatus = {
  isPremium: false,
  isLifetime: false,
  premiumUntil: null,
  trialStartedAt: null,
  trialEndsAt: null,
  source: null,
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PremiumStatus>(emptyStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/premium", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Premium status could not be loaded.");
      }

      setStatus({
        isPremium: Boolean(payload.isPremium),
        isLifetime: Boolean(payload.isLifetime),
        premiumUntil: payload.premiumUntil ?? null,
        trialStartedAt: payload.trialStartedAt ?? null,
        trialEndsAt: payload.trialEndsAt ?? null,
        source: payload.source ?? null,
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Premium status could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const redeemCode = useCallback(async (code: string) => {
    setError("");

    const response = await fetch("/api/premium/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "That code could not be redeemed.");
    }

    setStatus({
      isPremium: Boolean(payload.isPremium),
      isLifetime: Boolean(payload.isLifetime),
      premiumUntil: payload.premiumUntil ?? null,
      trialStartedAt: payload.trialStartedAt ?? null,
      trialEndsAt: payload.trialEndsAt ?? null,
      source: payload.source ?? null,
    });
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(request);
  }, [refresh]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const value = useMemo<PremiumContextValue>(() => {
    const active = status.isLifetime || Boolean(
      status.premiumUntil && Date.parse(status.premiumUntil) > now
    );

    return {
      ...status,
      isPremium: active,
      loading,
      error,
      refresh,
      redeemCode,
    };
  }, [status, loading, error, now, refresh, redeemCode]);

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const value = useContext(PremiumContext);
  if (!value) {
    throw new Error("usePremium must be used within PremiumProvider.");
  }
  return value;
}
