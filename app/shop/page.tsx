"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { getCosmeticById } from "@/data/characterOptions";
import { coinPacks, shopCosmetics } from "@/data/shopCatalog";
import { usePremium } from "@/context/PremiumContext";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$1.99",
    cadence: "/ month",
    note: "Flexible, cancel anytime",
    icon: "🌙",
  },
  {
    id: "annual",
    name: "Yearly",
    price: "$19.99",
    cadence: "/ year",
    note: "Save compared with monthly",
    icon: "☀️",
    featured: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$99.99",
    cadence: " once",
    note: "One purchase, forever",
    icon: "♾️",
  },
];

const premiumFeatures = [
  { icon: "🧍", title: "Your character", detail: "See your progress represented by an upgradeable character." },
  { icon: "🎨", title: "More ways to customize", detail: "Make your character and its world your own." },
  { icon: "🌌", title: "Focus backgrounds", detail: "Bring your Pomodoro sessions into animated environments." },
  { icon: "🌧️", title: "Ambient sounds", detail: "Add rain, ocean, forest, fireplace, city, and river audio." },
];

const includedForEveryone = [
  "Customizable stats that level from your daily tasks",
  "Skill tree XP, calendar, achievement road, and focus music",
  "Friends, budget tools, and custom Pomodoro durations",
];

function getTimeRemaining(until: string | null, now: number) {
  if (!until) return "";
  const remaining = Math.max(0, Date.parse(until) - now);
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  return "Less than an hour left";
}

export default function ShopPage() {
  const {
    isPremium,
    isLifetime,
    premiumUntil,
    trialEndsAt,
    source,
    loading,
    canManageBilling,
    error: statusError,
    redeemCode,
    refresh,
  } = usePremium();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [codeError, setCodeError] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [coinBalance, setCoinBalance] = useState(0);
  const [walletLevel, setWalletLevel] = useState(1);
  const [ownedCosmeticIds, setOwnedCosmeticIds] = useState<string[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [shopFeedback, setShopFeedback] = useState("");
  const [shopError, setShopError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);
  const [purchasingCosmetic, setPurchasingCosmetic] = useState("");

  const refreshWallet = useCallback(async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const response = await fetch("/api/shop/wallet", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Your coin balance could not be loaded.");
      setCoinBalance(Number(payload.coinBalance) || 0);
      setWalletLevel(Number(payload.level) || 1);
      setOwnedCosmeticIds(Array.isArray(payload.ownedCosmeticIds) ? payload.ownedCosmeticIds : []);
      window.dispatchEvent(new Event("shop-inventory-updated"));
    } catch (cause) {
      setWalletError(cause instanceof Error ? cause.message : "Your coin balance could not be loaded.");
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    void refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    const purchaseStatus = new URLSearchParams(window.location.search).get("purchase");
    if (purchaseStatus === "success") {
      setShopFeedback("Checkout complete. Your purchase is being confirmed; refresh your coin balance in a moment.");
    } else if (purchaseStatus === "cancelled") {
      setShopFeedback("Checkout was canceled. Nothing was charged.");
    }
  }, []);

  async function startCheckout(productKey: string) {
    setShopError("");
    setShopFeedback("");
    setCheckoutLoading(productKey);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });
      const payload = await response.json();
      if (!response.ok || typeof payload.url !== "string") {
        throw new Error(payload.error ?? "Checkout could not be opened.");
      }
      window.location.assign(payload.url);
    } catch (cause) {
      setShopError(cause instanceof Error ? cause.message : "Checkout could not be opened.");
      setCheckoutLoading("");
    }
  }

  async function openBillingPortal() {
    setShopError("");
    setBillingPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const payload = await response.json();
      if (!response.ok || typeof payload.url !== "string") {
        throw new Error(payload.error ?? "Billing management could not be opened.");
      }
      window.location.assign(payload.url);
    } catch (cause) {
      setShopError(cause instanceof Error ? cause.message : "Billing management could not be opened.");
      setBillingPortalLoading(false);
    }
  }

  async function purchaseCosmetic(cosmeticId: string) {
    setShopError("");
    setShopFeedback("");
    setPurchasingCosmetic(cosmeticId);
    try {
      const response = await fetch("/api/shop/cosmetics/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cosmeticId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "That item could not be purchased.");
      setCoinBalance(Number(payload.coinBalance) || 0);
      setOwnedCosmeticIds((current) => current.includes(cosmeticId) ? current : [...current, cosmeticId]);
      setShopFeedback("Item unlocked. It is now available in your character customizer.");
      window.dispatchEvent(new Event("shop-inventory-updated"));
    } catch (cause) {
      setShopError(cause instanceof Error ? cause.message : "That item could not be purchased.");
    } finally {
      setPurchasingCosmetic("");
    }
  }

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setCodeError("");
    setRedeeming(true);
    try {
      await redeemCode(code);
      setCode("");
      setMessage("Code redeemed. Premium is now active on your account.");
    } catch (cause) {
      setCodeError(cause instanceof Error ? cause.message : "That code could not be redeemed.");
    } finally {
      setRedeeming(false);
    }
  }

  const activeUntilText = isLifetime
    ? "Premium access never expires"
    : source === "trial" && trialEndsAt
      ? `Your free trial · ${getTimeRemaining(trialEndsAt, now)}`
      : premiumUntil
        ? `Premium active · ${getTimeRemaining(premiumUntil, now)}`
        : "Your account includes a free 7-day Premium trial";

  return (
    <main className="min-h-screen bg-[#08090b] px-4 pb-20 pt-5 text-white sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-amber-100/10 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,.15),transparent_48%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,.12),transparent_45%),linear-gradient(135deg,#171713,#111316_60%,#12101a)] p-6 shadow-[0_30px_100px_rgba(0,0,0,.42)] sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amber-200/[.08] blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-100/[.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.24em] text-amber-100/80 sm:text-xs">
                <span>✦</span> Life RPG · Item shop
              </p>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">Make your progress<br /><span className="bg-gradient-to-r from-amber-100 via-yellow-200 to-violet-200 bg-clip-text text-transparent">feel legendary.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">Your stats, tasks, skill tree, calendar, friends, budget, achievement road, and focus music are free. Premium adds the character and a few extra ways to shape your world.</p>
            </div>

            <div className="min-w-[220px] rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[.16em] text-zinc-500">Your membership</p>
              {loading ? (
                <p className="mt-3 animate-pulse text-sm text-zinc-500">Checking status…</p>
              ) : isPremium ? (
                <>
                  <p className="mt-3 text-xl font-black text-amber-100">✦ Premium active</p>
                  <p className="mt-1 text-xs text-zinc-400">{activeUntilText}</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-xl font-black">Free member</p>
                  <p className="mt-1 text-xs text-zinc-400">{activeUntilText}</p>
                </>
              )}
              <Link href="/" className="mt-4 inline-flex text-xs font-black text-emerald-200 hover:text-emerald-100">Back to your stats →</Link>
              {canManageBilling && (
                <button type="button" onClick={() => void openBillingPortal()} disabled={billingPortalLoading} className="mt-3 block text-left text-xs font-black text-amber-100/80 underline decoration-amber-100/20 underline-offset-2 hover:text-amber-50 disabled:opacity-50">
                  {billingPortalLoading ? "Opening billing…" : "Manage billing"}
                </button>
              )}
            </div>
          </div>
        </section>

        {(statusError || message || codeError || shopFeedback || shopError) && (
          <div className={`mt-4 rounded-xl border p-4 text-sm ${shopError || codeError || statusError ? "border-rose-300/15 bg-rose-300/[.06] text-rose-100" : "border-emerald-300/15 bg-emerald-300/[.06] text-emerald-100"}`}>
            {shopError || codeError || statusError || shopFeedback || message || ""}
            {statusError && <button type="button" onClick={() => void refresh()} className="ml-3 font-black underline underline-offset-2">Try again</button>}
            {walletError && <button type="button" onClick={() => void refreshWallet()} className="ml-3 font-black underline underline-offset-2">Refresh coins</button>}
          </div>
        )}

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-3xl border border-white/[.08] bg-[#111417] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-100/70">Premium membership</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">A little more life in your RPG</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {premiumFeatures.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-white/[.07] bg-black/20 p-4">
                  <span className="text-2xl">{feature.icon}</span>
                  <p className="mt-3 font-black">{feature.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{feature.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[.08] bg-[#111417] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-100/65">Free for every player</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Your core journey stays yours</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">The systems that help you build real momentum remain open, whether you choose Premium or stay free.</p>
            <div className="mt-5 space-y-3">
              {includedForEveryone.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-white/[.06] bg-black/20 p-3 text-sm text-zinc-300">
                  <span className="text-emerald-200">✓</span><span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-zinc-600">Choose your membership</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Simple plans</h2>
            </div>
            <p className="text-xs text-zinc-600">USD · Prices shown before checkout</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className={`relative rounded-3xl border p-5 sm:p-6 ${plan.featured ? "border-amber-100/25 bg-[linear-gradient(145deg,rgba(251,191,36,.1),#111417_58%)] shadow-[0_18px_60px_rgba(251,191,36,.07)]" : "border-white/[.08] bg-[#111417]"}`}>
                {plan.featured && <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#211808]">Best value</span>}
                <span className="text-2xl">{plan.icon}</span>
                <p className="mt-4 text-sm font-black text-zinc-400">{plan.name}</p>
                <p className="mt-1 text-4xl font-black">{plan.price}<span className="ml-1 text-sm font-bold text-zinc-500">{plan.cadence}</span></p>
                <p className="mt-2 min-h-5 text-xs text-zinc-500">{plan.note}</p>
                <button
                  type="button"
                  disabled={Boolean(checkoutLoading)}
                  onClick={() => void startCheckout(plan.id === "monthly" ? "premium_monthly" : plan.id === "annual" ? "premium_yearly" : "premium_lifetime")}
                  className="mt-5 w-full rounded-xl bg-amber-100 px-4 py-3 text-sm font-black text-[#211808] transition hover:bg-yellow-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {checkoutLoading === `premium_${plan.id === "annual" ? "yearly" : plan.id}` ? "Opening checkout…" : "Continue to secure checkout"}
                </button>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-600">Monthly and yearly plans renew through Stripe; checkout starts billing immediately. Lifetime is a one-time purchase. Your seven-day trial is separate and does not require a payment method.</p>
        </section>

        <section className="mt-9 rounded-3xl border border-amber-100/10 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,.08),transparent_48%),#111417] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-amber-100/70">Coins & character items</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Build your look with your progress</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">Reach cosmetic milestones to earn coins, then use them to unlock featured looks early. Every newly unlocked cosmetic also grants coins, with extra coins at tier milestones. Character items can be equipped while Premium is active.</p>
            </div>
            <div className="rounded-2xl border border-amber-100/15 bg-black/30 px-5 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-zinc-500">Your balance</p>
              <p className="mt-1 text-2xl font-black text-amber-100">{walletLoading ? "…" : `◈ ${coinBalance.toLocaleString()}`}</p>
              <button type="button" onClick={() => void refreshWallet()} disabled={walletLoading} className="mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500 underline decoration-white/20 underline-offset-2 hover:text-zinc-300 disabled:opacity-50">Refresh balance</button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-zinc-600">Coin bundles</p>
                <h3 className="mt-1 text-xl font-black">Optional top-ups</h3>
              </div>
              <p className="text-xs text-zinc-600">One-time purchases · USD</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {coinPacks.map((pack) => (
                <article key={pack.id} className="rounded-2xl border border-white/[.08] bg-black/20 p-4">
                  <p className="text-2xl font-black text-amber-100">◈ {pack.coins.toLocaleString()}</p>
                  <p className="mt-1 text-sm font-bold text-zinc-400">{pack.price} one time</p>
                  <button
                    type="button"
                    disabled={Boolean(checkoutLoading)}
                    onClick={() => void startCheckout(pack.id)}
                    className="mt-4 w-full rounded-xl border border-amber-100/15 bg-amber-100/[.08] px-4 py-2.5 text-sm font-black text-amber-50 transition hover:bg-amber-100/[.14] disabled:cursor-wait disabled:opacity-50"
                  >
                    {checkoutLoading === pack.id ? "Opening checkout…" : "Buy coin bundle"}
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-zinc-600">Featured cosmetics</p>
                <h3 className="mt-1 text-xl font-black">Unlock a look early</h3>
              </div>
              <p className="text-xs text-zinc-600">Level {walletLevel} · {shopCosmetics.length} featured items</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shopCosmetics.map((shopItem) => {
                const item = getCosmeticById(shopItem.id);
                if (!item) return null;
                const owned = ownedCosmeticIds.includes(item.id);
                const levelUnlocked = walletLevel >= item.requiredLevel;
                const canAfford = coinBalance >= shopItem.coinCost;
                return (
                  <article key={item.id} className="flex min-h-52 flex-col rounded-2xl border border-white/[.08] bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-2xl">{item.icon}</span>
                      <span className="rounded-full border border-amber-100/10 bg-amber-100/[.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-100/75">{item.tier}</span>
                    </div>
                    <p className="mt-4 font-black">{item.name}</p>
                    <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">{item.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-amber-100">◈ {shopItem.coinCost}</span>
                      {owned ? (
                        <span className="text-xs font-black text-emerald-200">Owned</span>
                      ) : levelUnlocked ? (
                        <span className="text-right text-[10px] font-bold text-zinc-500">Unlocked at level {item.requiredLevel}</span>
                      ) : (
                        <button
                          type="button"
                          disabled={walletLoading || !canAfford || Boolean(purchasingCosmetic)}
                          onClick={() => void purchaseCosmetic(item.id)}
                          className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-black text-[#211808] transition hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {purchasingCosmetic === item.id ? "Unlocking…" : canAfford ? "Unlock item" : "Earn more coins"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          {walletError && <p className="mt-4 text-sm text-rose-200">{walletError}</p>}
        </section>

        <section className="mt-9 grid gap-4 lg:grid-cols-[1fr_.85fr]">
          <div className="rounded-3xl border border-white/[.08] bg-[#111417] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[.2em] text-violet-200/70">Got a gift code?</p>
            <h2 className="mt-2 text-2xl font-black">Redeem Premium</h2>
            <p className="mt-2 text-sm text-zinc-500">Enter your code to apply its membership reward to this account. Codes can be shared and redeemed without a use limit.</p>
            <form onSubmit={(event) => void handleRedeem(event)} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                maxLength={64}
                placeholder="Enter your code"
                aria-label="Premium gift code"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-200/40"
              />
              <button type="submit" disabled={!code.trim() || redeeming || loading} className="rounded-xl bg-violet-200 px-5 py-3 text-sm font-black text-[#160f24] transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40">
                {redeeming ? "Applying…" : "Redeem code"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-amber-100/10 bg-gradient-to-br from-amber-200/[.07] via-[#111417] to-violet-300/[.06] p-5 sm:p-7">
            <span className="text-3xl">🎁</span>
            <h2 className="mt-3 text-xl font-black">A free week for every player</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">Every account gets one 7-day Premium trial. It starts the first time your account opens the app, and your trial status follows your account.</p>
            {isPremium && !isLifetime && trialEndsAt && source === "trial" && (
              <p className="mt-4 rounded-xl border border-amber-100/10 bg-black/20 p-3 text-sm font-black text-amber-100">Trial active · {getTimeRemaining(trialEndsAt, now)}</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
