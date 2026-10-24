"use client";

import { useMemo, useState } from "react";
import CharacterDisplay from "@/components/CharacterDisplay";
import { useCharacter } from "@/context/CharacterContext";
import type { CharacterIdentity, CosmeticCategory, CosmeticItem } from "@/data/characterOptions";

type Props = { open: boolean; onClose: () => void };
type Tab = "look" | CosmeticCategory;
const tabs: { id: Tab; label: string; icon: string; group: "character" | "style" | "world" }[] = [
  { id: "look", label: "Your look", icon: "✦", group: "character" },
  { id: "outfit", label: "Outfits", icon: "◈", group: "style" },
  { id: "accessory", label: "Gear", icon: "⌑", group: "style" },
  { id: "heldItem", label: "Tools", icon: "⚔", group: "style" },
  { id: "pose", label: "Stance", icon: "↗", group: "style" },
  { id: "aura", label: "Auras", icon: "✧", group: "world" },
  { id: "background", label: "Worlds", icon: "▧", group: "world" },
  { id: "frame", label: "Frames", icon: "▣", group: "world" },
  { id: "sceneEffect", label: "Effects", icon: "☼", group: "world" },
];

const hairStyles: CharacterIdentity["hairStyle"][] = ["short", "medium", "long", "curly", "wavy", "ponytail", "buzz", "bald"];
const hairColors: CharacterIdentity["hairColor"][] = ["black", "brown", "blonde", "red", "gray", "white"];
const eyeColors: CharacterIdentity["eyeColor"][] = ["brown", "hazel", "blue", "green", "gray", "violet"];
const skinTones: { id: CharacterIdentity["skinTone"]; color: string }[] = [
  { id: "tone-1", color: "#f7d8bd" }, { id: "tone-2", color: "#efc3a0" }, { id: "tone-3", color: "#dfa47f" }, { id: "tone-4", color: "#c6865f" },
  { id: "tone-5", color: "#aa6948" }, { id: "tone-6", color: "#895338" }, { id: "tone-7", color: "#68402e" }, { id: "tone-8", color: "#493024" },
];
const colorFor: Record<string, string> = { black: "#241e29", brown: "#64412f", blonde: "#e7c26f", red: "#a94d3d", gray: "#9aa0aa", white: "#ece8e1", blue: "#5c9abb", green: "#5e9270", hazel: "#987548", violet: "#8972ad" };

export default function CharacterCustomizer({ open, onClose }: Props) {
  const { identity, loadout, unlockedCosmetics, seasonalCosmetics, currentLevel, updateIdentity, toggleCosmetic, clearCosmetic, isSeasonalCosmeticAvailable } = useCharacter();
  const [tab, setTab] = useState<Tab>("look");
  const [query, setQuery] = useState("");
  const seasonalAvailable = useMemo(() => seasonalCosmetics.filter((item) => isSeasonalCosmeticAvailable(item.id)), [seasonalCosmetics, isSeasonalCosmeticAvailable]);
  if (!open) return null;

  const equipped = (category: CosmeticCategory) => loadout[category];
  const optionsFor = (category: CosmeticCategory): CosmeticItem[] => {
    const list = category === "background" ? [...unlockedCosmetics, ...seasonalAvailable] : unlockedCosmetics;
    return list.filter((item, index) => item.category === category && list.findIndex((entry) => entry.id === item.id) === index && item.name.toLowerCase().includes(query.toLowerCase()));
  };
  const renderItems = (category: CosmeticCategory) => {
    const items = optionsFor(category);
    const active = equipped(category);
    return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {category !== "outfit" && category !== "background" && category !== "pose" && <button onClick={() => clearCosmetic(category)} className={`rounded-2xl border p-3 text-left transition ${active === "none" ? "border-amber-200/50 bg-amber-200/10" : "border-white/[.08] bg-white/[.025] hover:bg-white/[.06]"}`}><span className="text-xl">⊘</span><span className="mt-2 block text-xs font-bold">None</span><span className="mt-1 block text-[10px] text-white/40">Keep it simple</span></button>}
      {items.map((item) => <button key={item.id} onClick={() => toggleCosmetic(item.id)} className={`group rounded-2xl border p-3 text-left transition ${active === item.id ? "border-amber-200/55 bg-amber-200/[.09] shadow-[0_0_22px_rgba(246,205,115,.08)]" : "border-white/[.08] bg-white/[.025] hover:border-white/20 hover:bg-white/[.055]"}`}>
        <span className="flex items-center justify-between"><span className="text-xl">{item.icon}</span>{active === item.id && <span className="text-[9px] font-black uppercase tracking-wider text-amber-100">Equipped</span>}</span>
        <span className="mt-3 block truncate text-xs font-bold text-white">{item.name}</span><span className="mt-1 block text-[9px] font-black uppercase tracking-[.15em] text-white/40">{item.tier} · Lv {item.requiredLevel}</span>
      </button>)}
      {items.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40">No {category === "outfit" ? "looks" : category === "background" ? "worlds" : "items"} unlocked yet. Keep progressing to discover more.</p>}
    </div>;
  };

  const swatches = (values: string[], key: "hairColor" | "eyeColor") => <div className="flex flex-wrap gap-2">{values.map((value) => <button key={value} aria-label={value} title={value} onClick={() => updateIdentity(key, value as CharacterIdentity[typeof key])} className={`h-9 w-9 rounded-full border-2 transition ${identity[key] === value ? "scale-110 border-white ring-2 ring-amber-200/70" : "border-white/15 hover:scale-105"}`} style={{ backgroundColor: colorFor[value] }} />)}</div>;
  const section = (label: string, helper: string, child: React.ReactNode) => <section className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><div className="mb-3"><h3 className="text-sm font-black text-white">{label}</h3><p className="mt-1 text-[11px] text-white/40">{helper}</p></div>{child}</section>;

  return <div className="fixed inset-0 z-[120] flex items-stretch justify-center bg-[#070912]/90 backdrop-blur-xl sm:p-4" onClick={onClose}>
    <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden border border-white/10 bg-[#10131d] text-white shadow-2xl sm:my-auto sm:h-[min(850px,94vh)] sm:rounded-[2rem]" onClick={(event) => event.stopPropagation()}>
      <header className="flex items-center justify-between gap-4 border-b border-white/[.08] px-5 py-4 sm:px-7">
        <div><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.22em] text-amber-100/70"><span className="text-sm">✦</span> Hero Forge · Level {currentLevel}</div><h1 className="mt-1 text-xl font-black sm:text-2xl">Make this hero yours</h1></div>
        <button onClick={onClose} aria-label="Close character studio" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg text-white/70 hover:bg-white/10">×</button>
      </header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[270px_minmax(0,1fr)_320px]">
        <nav className="flex gap-2 overflow-x-auto border-b border-white/[.07] p-3 lg:block lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">{(["character", "style", "world"] as const).map((group) => <div key={group} className="contents lg:block"><p className="hidden px-2 pb-2 pt-4 text-[9px] font-black uppercase tracking-[.2em] text-white/30 lg:block">{group === "character" ? "Identity" : group === "style" ? "Wardrobe" : "Atmosphere"}</p>{tabs.filter((item) => item.group === group).map((item) => <button key={item.id} onClick={() => { setTab(item.id); setQuery(""); }} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition lg:mb-1 lg:w-full ${tab === item.id ? "bg-amber-100 text-[#28221b]" : "text-white/55 hover:bg-white/[.06] hover:text-white"}`}><span className="w-5 text-center text-base">{item.icon}</span>{item.label}</button>)}</div>)}</nav>
        <main className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <div className="sticky top-0 z-10 mb-4 flex items-center gap-3 rounded-2xl border border-white/[.08] bg-[#111520]/95 p-2 backdrop-blur lg:hidden"><CharacterDisplay compact showName={false} showTitle={false} showLevel={false} scale={0.29} /><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-amber-100/65">Live preview</p><p className="mt-1 text-xs font-bold">Your hero, your way</p><p className="mt-1 text-[10px] text-white/40">Edits appear as you style.</p></div></div>
          {tab === "look" ? <div className="mx-auto max-w-xl space-y-4">
            {section("Complexion", "Choose a skin tone that feels like you.", <div className="flex flex-wrap gap-3">{skinTones.map((tone) => <button key={tone.id} aria-label={`Skin tone ${tone.id}`} onClick={() => updateIdentity("skinTone", tone.id)} className={`h-10 w-10 rounded-full border-2 transition ${identity.skinTone === tone.id ? "scale-110 border-white ring-2 ring-amber-200/70" : "border-white/20 hover:scale-105"}`} style={{ backgroundColor: tone.color }} />)}</div>)}
            {section("Body shape", "Choose the silhouette that feels most like you.", <div className="flex flex-wrap gap-2">{(["compact", "balanced", "broad"] as const).map((shape) => <button key={shape} onClick={() => updateIdentity("bodyShape", shape)} className={`rounded-full border px-3 py-2 text-[10px] font-bold capitalize ${identity.bodyShape === shape ? "border-amber-100/50 bg-amber-100/10 text-amber-50" : "border-white/10 text-white/55"}`}>{shape}</button>)}</div>)}
            {section("Hair style", "A new cut changes the whole silhouette.", <div className="grid grid-cols-4 gap-2">{hairStyles.map((style) => <button key={style} onClick={() => updateIdentity("hairStyle", style)} className={`rounded-xl border px-2 py-3 text-[10px] font-bold capitalize ${identity.hairStyle === style ? "border-amber-100/50 bg-amber-100/10 text-amber-50" : "border-white/[.07] text-white/55 hover:bg-white/[.05]"}`}><span className="mb-1 block text-base">{style === "bald" ? "◯" : style === "curly" ? "〰" : style === "ponytail" ? "↗" : "⌁"}</span>{style}</button>)}</div>)}
            {section("Hair color", "Pick a natural shade or make it stand out.", swatches(hairColors, "hairColor"))}
            {section("Eyes", "Select the color that brings your hero to life.", swatches(eyeColors, "eyeColor"))}
            {section("Face & details", "Small touches make the avatar feel personal.", <div className="space-y-3"><div className="flex flex-wrap gap-2">{(["soft", "round", "square"] as const).map((shape) => <button key={shape} onClick={() => updateIdentity("faceShape", shape)} className={`rounded-full border px-3 py-2 text-[10px] font-bold capitalize ${identity.faceShape === shape ? "border-amber-100/50 bg-amber-100/10 text-amber-50" : "border-white/10 text-white/55"}`}>{shape} face</button>)}</div><div className="flex gap-2"><button onClick={() => updateIdentity("glasses", identity.glasses === "none" ? "round" : "none")} className="rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold">{identity.glasses === "none" ? "＋ Add glasses" : "✓ Glasses on"}</button><button onClick={() => updateIdentity("earrings", identity.earrings === "none" ? "stud" : "none")} className="rounded-xl border border-white/10 px-3 py-2 text-[10px] font-bold">{identity.earrings === "none" ? "＋ Add earrings" : "✓ Earrings on"}</button></div></div>)}
          </div> : <div className="mx-auto max-w-2xl"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-amber-100/65">{tabs.find((item) => item.id === tab)?.group}</p><h2 className="mt-1 text-xl font-black">{tabs.find((item) => item.id === tab)?.label}</h2><p className="mt-1 text-[11px] text-white/40">Every unlock on the journey is yours to equip.</p></div><input aria-label="Search items" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a look…" className="w-36 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs outline-none placeholder:text-white/25 focus:border-amber-100/40 sm:w-48" /></div>{renderItems(tab)}</div>}
        </main>
        <aside className="hidden flex-col items-center justify-center border-l border-white/[.07] bg-[radial-gradient(ellipse_at_50%_42%,rgba(121,139,191,.14),transparent_55%)] px-4 py-6 lg:flex"><div className="mb-4 self-start"><p className="text-[9px] font-black uppercase tracking-[.22em] text-white/35">Live preview</p><p className="mt-1 text-sm font-black">Your hero, your way</p></div><CharacterDisplay compact showName={false} showTitle={false} showLevel={false} scale={0.88} /><p className="mt-4 max-w-[220px] text-center text-[10px] leading-relaxed text-white/35">Unlocks from your level journey remain in your collection. Mix your favorite gear and surroundings.</p></aside>
      </div>
      <footer className="flex items-center justify-between border-t border-white/[.08] px-5 py-3 sm:px-7"><p className="text-[10px] text-white/35">Changes save automatically</p><button onClick={onClose} className="rounded-xl bg-amber-100 px-5 py-2.5 text-xs font-black text-[#28221b] hover:bg-amber-50">Done styling</button></footer>
    </div>
  </div>;
}
