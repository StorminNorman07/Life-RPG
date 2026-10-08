"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import CharacterCustomizer from "@/components/CharacterCustomizer";
import CharacterDisplay from "@/components/CharacterDisplay";
import { useAppDialog } from "@/components/ui/AppDialogProvider";
import { useCharacter } from "@/context/CharacterContext";
import { useGame } from "@/context/GameContext";
import { usePremium } from "@/context/PremiumContext";
import {
  ATTRIBUTE_XP_PER_LEVEL,
  getAttributeLevel,
  getAttributeProgress,
  MAX_ATTRIBUTES,
} from "@/data/categories";
import { getLevel, getProgress, MAX_LEVEL } from "@/data/levels";

const statIcons: Record<string, string> = {
  health: "💚",
  discipline: "🛡️",
  knowledge: "🧠",
  creativity: "🎨",
  faith: "✨",
  character: "⚔️",
  social: "🤝",
  wealth: "🌱",
};

const statAccents = [
  "from-emerald-400 to-cyan-300",
  "from-orange-400 to-amber-300",
  "from-blue-400 to-indigo-300",
  "from-fuchsia-400 to-pink-300",
  "from-violet-400 to-purple-300",
  "from-yellow-400 to-orange-300",
  "from-pink-400 to-rose-300",
  "from-lime-400 to-emerald-300",
];

const quickLinks = [
  { href: "/daily-tasks", icon: "✅", title: "Daily tasks", detail: "Turn today’s effort into XP." },
  { href: "/skill-tree", icon: "🌳", title: "Skill tree", detail: "Earn milestone XP for your stats." },
  { href: "/calendar", icon: "📅", title: "Calendar", detail: "Plan your next steps." },
  { href: "/achievements", icon: "🏆", title: "Achievement road", detail: "See what you’ve earned." },
];

export default function StatsDashboard() {
  const { confirm } = useAppDialog();
  const {
    player,
    attributes,
    tasks,
    skillPathConfigs,
    addAttribute,
    renameAttribute,
    deleteAttribute,
  } = useGame();
  const { currentTier } = useCharacter();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [newName, setNewName] = useState("");
  const [showCustomizer, setShowCustomizer] = useState(false);

  const level = getLevel(player.totalXP);
  const progress = getProgress(player.totalXP);
  const sortedAttributes = useMemo(
    () => [...attributes].sort((a, b) => {
      const xpDifference = (player.attributes[b.id] ?? 0) - (player.attributes[a.id] ?? 0);
      return xpDifference || a.name.localeCompare(b.name);
    }),
    [attributes, player.attributes]
  );

  function createAttribute() {
    if (!newName.trim() || attributes.length >= MAX_ATTRIBUTES) return;
    addAttribute(newName);
    setNewName("");
  }

  async function removeAttribute(id: string, name: string) {
    const approved = await confirm({
      title: `Delete ${name}?`,
      description: "Its XP and all task and skill path assignments will be removed.",
      confirmLabel: "Delete stat",
      tone: "danger",
    });
    if (approved) deleteAttribute(id);
  }

  return (
    <main className="min-h-screen bg-[#070b0c] px-4 pb-20 pt-5 text-white sm:px-6 md:px-8 md:pt-8">
      <div className="mx-auto max-w-7xl">
        {isPremium && (
          <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-[#171b19] via-[#111618] to-[#101018] p-5 shadow-[0_28px_100px_rgba(0,0,0,.35)] sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,.8fr)]">
              <div className="order-2 md:order-1">
                <p className="text-xs font-black uppercase tracking-[.24em] text-amber-200/75">Premium character · {currentTier}</p>
                <h2 className="mt-2 text-3xl font-black sm:text-4xl">Your progress, brought to life.</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">Every level on this stats page builds your character. Keep growing your habits, then make the hero your own.</p>
                <button
                  type="button"
                  onClick={() => setShowCustomizer(true)}
                  className="mt-5 rounded-xl border border-amber-100/25 bg-amber-200 px-5 py-3 text-sm font-black text-[#231a08] transition hover:-translate-y-0.5 hover:bg-amber-100"
                >
                  🎨 Customize character
                </button>
              </div>
              <div className="order-1 flex justify-center md:order-2">
                <CharacterDisplay showName showTitle showLevel />
              </div>
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,.16),transparent_48%),linear-gradient(135deg,#111c1b,#101417_52%,#151322)] p-5 shadow-[0_30px_100px_rgba(0,0,0,.38)] sm:p-8">
          <div className="pointer-events-none absolute -bottom-28 right-8 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.8fr)] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-emerald-100/80 sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Life RPG · Your stats
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Build a life.<br /><span className="bg-gradient-to-r from-emerald-200 via-cyan-100 to-violet-200 bg-clip-text text-transparent">Watch yourself grow.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">Your daily tasks and skill-tree milestones feed the same XP system. Shape the stats that matter to you and watch every effort move the bar.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-zinc-500">Overall level</p>
                  <p className="mt-1 text-4xl font-black">{level}<span className="ml-2 text-sm font-bold text-zinc-500">/ {MAX_LEVEL}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-200">{progress}%</p>
                  <p className="text-xs text-zinc-500">to next level</p>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-200 to-violet-300 transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-xs text-zinc-500">{player.totalXP.toLocaleString()} total XP earned</p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard icon="🌞" label="Daily task XP" value={player.dailyTaskXP.toLocaleString()} detail="From completed tasks" />
          <SummaryCard icon="🌳" label="Skill tree XP" value={player.skillTreeXP.toLocaleString()} detail="From unlocked milestones" />
          <SummaryCard icon="📈" label="Stats growing" value={String(attributes.length)} detail="Personalized attributes" />
          <SummaryCard icon="🧭" label="Current tier" value={currentTier} detail={premiumLoading ? "Loading membership" : isPremium ? "Character progression active" : "Your journey keeps growing"} />
        </section>

        <section className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-200/70">Your personal skill profile</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">Stats that grow with you</h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">Each completed task gives XP to its selected stats. Completing a skill-tree challenge also rewards the stats assigned to that path.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs font-bold text-zinc-400">{attributes.length} / {MAX_ATTRIBUTES} stats</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0d1214] p-3 sm:p-4">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") createAttribute(); }}
              placeholder="Add a stat that matters to you…"
              aria-label="New stat name"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/50"
            />
            <button
              type="button"
              disabled={!newName.trim() || attributes.length >= MAX_ATTRIBUTES}
              onClick={createAttribute}
              className="rounded-xl bg-emerald-200 px-5 py-3 text-sm font-black text-[#07110d] transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Add stat
            </button>
          </div>

          {sortedAttributes.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-white/15 bg-white/[.025] p-10 text-center text-zinc-500">Add your first stat above to start shaping your profile.</div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sortedAttributes.map((attribute, index) => {
                const xp = player.attributes[attribute.id] ?? 0;
                const statLevel = getAttributeLevel(xp);
                const intoLevel = getAttributeProgress(xp);
                const assignedTasks = tasks.filter((task) => task.categories.includes(attribute.id)).length;
                const assignedPaths = Object.values(skillPathConfigs).filter((path) => path.attributeIds.includes(attribute.id)).length;

                return (
                  <StatCard
                    key={attribute.id}
                    name={attribute.name}
                    icon={statIcons[attribute.id] ?? "✦"}
                    level={statLevel}
                    xp={xp}
                    intoLevel={intoLevel}
                    accent={statAccents[index % statAccents.length]}
                    assignedTasks={assignedTasks}
                    assignedPaths={assignedPaths}
                    onRename={(name) => renameAttribute(attribute.id, name)}
                    onDelete={() => void removeAttribute(attribute.id, attribute.name)}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-zinc-600">Keep the momentum</p>
              <h2 className="mt-1 text-2xl font-black">Your next steps</h2>
            </div>
            {!isPremium && (
              <Link href="/shop" className="text-sm font-black text-amber-200 transition hover:text-amber-100">Explore Premium ↗</Link>
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/10 bg-[#0d1214] p-4 transition hover:-translate-y-0.5 hover:border-emerald-200/25 hover:bg-[#111a1b]">
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-3 font-black">{item.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.detail}</p>
                <p className="mt-3 text-xs font-bold text-emerald-200/70 transition group-hover:text-emerald-100">Open →</p>
              </Link>
            ))}
          </div>
        </section>

        {!isPremium && (
          <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-100/10 bg-gradient-to-r from-amber-300/[.09] via-white/[.025] to-violet-300/[.08] p-5 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-amber-100/70">Your free stats are the foundation</p>
              <h2 className="mt-1 text-xl font-black">Want to bring your progress to life?</h2>
              <p className="mt-1 text-sm text-zinc-400">Premium adds your upgradeable character, focus scenes, and ambient sounds.</p>
            </div>
            <Link href="/shop" className="rounded-xl bg-amber-200 px-5 py-3 text-sm font-black text-[#231a08] transition hover:bg-amber-100">Open item shop</Link>
          </section>
        )}
      </div>

      {isPremium && (
        <CharacterCustomizer open={showCustomizer} onClose={() => setShowCustomizer(false)} />
      )}
    </main>
  );
}

function SummaryCard({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/[.08] bg-[#101517] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[.14em] text-zinc-500 sm:text-xs">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="mt-2 truncate text-2xl font-black sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">{detail}</p>
    </div>
  );
}

function StatCard({
  name,
  icon,
  level,
  xp,
  intoLevel,
  accent,
  assignedTasks,
  assignedPaths,
  onRename,
  onDelete,
}: {
  name: string;
  icon: string;
  level: number;
  xp: number;
  intoLevel: number;
  accent: string;
  assignedTasks: number;
  assignedPaths: number;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(name);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/[.09] bg-[#101517] p-4 transition hover:border-white/20 hover:bg-[#131a1b] sm:p-5">
      <div className={`pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-[.09] blur-2xl transition group-hover:opacity-[.16]`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${accent} bg-opacity-10 text-2xl shadow-lg shadow-black/20`}>{icon}</div>
          <div className="min-w-0 flex-1">
            <input
              aria-label={`Rename ${name}`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => onRename(draft)}
              onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
              className="w-full min-w-0 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-base font-black outline-none transition focus:border-white/15 focus:bg-black/25 sm:text-lg"
            />
            <p className="px-1 text-[10px] font-bold uppercase tracking-[.14em] text-zinc-600">Level {level}</p>
          </div>
        </div>
        <button type="button" onClick={onDelete} aria-label={`Delete ${name}`} className="rounded-lg px-2 py-1 text-xs font-bold text-zinc-600 transition hover:bg-red-400/10 hover:text-red-300">×</button>
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-black">{xp.toLocaleString()}<span className="ml-1 text-xs font-bold text-zinc-600">XP total</span></p>
          <p className="mt-1 text-xs text-zinc-500">{intoLevel.toLocaleString()} / {ATTRIBUTE_XP_PER_LEVEL.toLocaleString()} XP to next level</p>
        </div>
        <span className="rounded-full border border-white/[.08] bg-black/20 px-2.5 py-1 text-xs font-black text-white/75">Lv {level}</span>
      </div>
      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/[.07]">
        <div className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-500`} style={{ width: `${(intoLevel / ATTRIBUTE_XP_PER_LEVEL) * 100}%` }} />
      </div>
      <div className="relative mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-zinc-600">
        <span>🗒 {assignedTasks} task{assignedTasks === 1 ? "" : "s"}</span>
        <span>🌿 {assignedPaths} skill path{assignedPaths === 1 ? "" : "s"}</span>
      </div>
    </article>
  );
}
