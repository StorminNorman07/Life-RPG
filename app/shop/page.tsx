"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

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
    error: statusError,
    redeemCode,
    refresh,
  } = usePremium();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [codeError, setCodeError] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

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
            </div>
          </div>
        </section>

        {(statusError || message || codeError) && (
          <div className={`mt-4 rounded-xl border p-4 text-sm ${codeError || statusError ? "border-rose-300/15 bg-rose-300/[.06] text-rose-100" : "border-emerald-300/15 bg-emerald-300/[.06] text-emerald-100"}`}>
            {codeError || message || (statusError ? "Membership status could not be loaded. The shop database setup needs to be applied before Premium can be activated." : "")}
            {statusError && <button type="button" onClick={() => void refresh()} className="ml-3 font-black underline underline-offset-2">Try again</button>}
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
                <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm font-black text-zinc-500" title="Checkout will be enabled when a payment provider is connected">Checkout coming soon</button>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-600">Plan prices are configured here. Checkout is not connected yet, so no purchase will be submitted or charged.</p>
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
