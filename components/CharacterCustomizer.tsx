"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CharacterDisplay from "@/components/CharacterDisplay";

import {
  CosmeticCategory,
  CosmeticItem,
  HeldItemHand,
  defaultLoadout,
  identityOptions,
} from "@/data/characterOptions";

import {
  useCharacter,
} from "@/context/CharacterContext";

import {
  useGame,
} from "@/context/GameContext";


interface CharacterCustomizerProps {
  open: boolean;

  onClose: () => void;
}


type CustomizerTab =
  | "identity"
  | CosmeticCategory;


const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


const cosmeticCategories: {
  id: CosmeticCategory;

  name: string;

  icon: string;

  optional: boolean;
}[] = [
  {
    id: "outfit",
    name: "Outfits",
    icon: "👕",
    optional: false,
  },

  {
    id: "background",
    name: "Backgrounds",
    icon: "🌄",
    optional: false,
  },

  {
    id: "frame",
    name: "Frames",
    icon: "🖼️",
    optional: true,
  },

  {
    id: "accessory",
    name: "Accessories",
    icon: "🎒",
    optional: true,
  },

  {
    id: "pose",
    name: "Poses",
    icon: "🧍",
    optional: false,
  },

  {
    id: "aura",
    name: "Auras",
    icon: "✨",
    optional: true,
  },

  {
    id: "heldItem",
    name: "Held Items",
    icon: "⚔️",
    optional: true,
  },

  {
    id: "sceneEffect",
    name: "Scene Effects",
    icon: "🌧️",
    optional: true,
  },
];


export default function CharacterCustomizer({
  open,
  onClose,
}: CharacterCustomizerProps) {
  const {
    player,
  } =
    useGame();

  const {
    identity,

    loadout,

    unlockedCosmetics,

    seasonalCosmetics,

    currentSeasonalMonth,

    currentLevel,

    currentTier,

    updateIdentity,

    updateHeldItemHand,

    toggleCosmetic,

    clearCosmetic,

    getEquippedCosmetic,

    isSeasonalCosmeticAvailable,
  } =
    useCharacter();


  const [
    selectedTab,
    setSelectedTab,
  ] =
    useState<CustomizerTab>(
      "identity"
    );


  const controlsScrollerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const previewSectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const previewContentRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const previewRestoreButtonRef =
    useRef<HTMLButtonElement | null>(
      null
    );

  const scrollFrameRef =
    useRef<number | null>(
      null
    );

  const restoreTransitionTimeoutRef =
    useRef<number | null>(
      null
    );

  const previewCollapseProgressRef =
    useRef(
      0
    );


  const syncPreviewToScroll =
    useCallback(() => {
      scrollFrameRef.current =
        null;

      const scroller =
        controlsScrollerRef.current;

      const previewSection =
        previewSectionRef.current;

      const previewContent =
        previewContentRef.current;

      const restoreButton =
        previewRestoreButtonRef.current;

      if (
        !scroller ||
        !previewSection ||
        !previewContent
      ) {
        return;
      }

      const sideBySideLayout =
        window.innerWidth >=
        1280;

      if (
        sideBySideLayout
      ) {
        previewSection.style.removeProperty(
          "height"
        );

        previewSection.style.removeProperty(
          "min-height"
        );

        previewSection.style.removeProperty(
          "max-height"
        );

        previewContent.style.removeProperty(
          "transform"
        );

        if (
          restoreButton
        ) {
          restoreButton.style.opacity =
            "0";

          restoreButton.style.pointerEvents =
            "none";

          restoreButton.tabIndex =
            -1;
        }

        return;
      }

      const collapseDistance =
        110;

      const requestedProgress =
        Math.min(
          1,
          Math.max(
            0,
            scroller.scrollTop /
              collapseDistance
          )
        );

      const progress =
        Math.max(
          previewCollapseProgressRef.current,
          requestedProgress
        );

      previewCollapseProgressRef.current =
        progress;

      const tabletLayout =
        window.innerWidth >=
        640;

      const expandedHeight =
        tabletLayout
          ? Math.min(
              350,
              Math.max(
                300,
                window.innerHeight *
                  0.42
              )
            )
          : Math.min(
              315,
              Math.max(
                235,
                window.innerHeight *
                  0.34
              )
            );

      const collapsedHeight =
        tabletLayout
          ? 116
          : 104;

      const nextHeight =
        expandedHeight -
        (expandedHeight -
          collapsedHeight) *
          progress;

      const nextScale =
        1 -
        progress *
          0.38;

      const heightValue =
        `${nextHeight}px`;

      previewSection.style.height =
        heightValue;

      previewSection.style.minHeight =
        heightValue;

      previewSection.style.maxHeight =
        heightValue;

      previewContent.style.transform =
        `scale(${nextScale})`;

      if (
        restoreButton
      ) {
        const showRestoreButton =
          progress >
          0.1;

        restoreButton.style.opacity =
          showRestoreButton
            ? "1"
            : "0";

        restoreButton.style.pointerEvents =
          showRestoreButton
            ? "auto"
            : "none";

        restoreButton.tabIndex =
          showRestoreButton
            ? 0
            : -1;
      }
    }, []);


  const handleControlsScroll =
    useCallback(() => {
      if (
        scrollFrameRef.current !==
        null
      ) {
        return;
      }

      scrollFrameRef.current =
        window.requestAnimationFrame(
          syncPreviewToScroll
        );
    }, [
      syncPreviewToScroll,
    ]);


  const restoreExpandedPreview =
    useCallback(() => {
      const scroller =
        controlsScrollerRef.current;

      const previewSection =
        previewSectionRef.current;

      const previewContent =
        previewContentRef.current;

      previewCollapseProgressRef.current =
        0;

      if (
        scroller
      ) {
        scroller.scrollTop =
          0;
      }

      if (
        previewSection
      ) {
        previewSection.style.transition =
          "height 240ms ease-out, min-height 240ms ease-out, max-height 240ms ease-out";
      }

      if (
        previewContent
      ) {
        previewContent.style.transition =
          "transform 240ms ease-out";
      }

      syncPreviewToScroll();

      if (
        restoreTransitionTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          restoreTransitionTimeoutRef.current
        );
      }

      restoreTransitionTimeoutRef.current =
        window.setTimeout(
          () => {
            previewSectionRef.current?.style.removeProperty(
              "transition"
            );

            previewContentRef.current?.style.removeProperty(
              "transition"
            );

            restoreTransitionTimeoutRef.current =
              null;
          },
          260
        );
    }, [
      syncPreviewToScroll,
    ]);


  const selectedCategory =
    selectedTab ===
    "identity"
      ? null
      : cosmeticCategories.find(
          (category) =>
            category.id ===
            selectedTab
        ) ??
        null;


  const equippedItemCount =
    cosmeticCategories.filter(
      (category) => {
        const itemId =
          loadout[category.id];

        return Boolean(
          itemId &&
            itemId !== "none" &&
            itemId !==
              getRequiredDefaultId(
                category.id
              )
        );
      }
    ).length;


  useEffect(() => {
    if (!open) {
      return;
    }

    const bodyOverflow =
      document.body.style.overflow;

    const htmlOverflow =
      document.documentElement.style.overflow;

    const bodyOverscroll =
      document.body.style.overscrollBehavior;

    const htmlOverscroll =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overscrollBehavior =
      "none";

    document.documentElement.style.overscrollBehavior =
      "none";

    return () => {
      document.body.style.overflow =
        bodyOverflow;

      document.documentElement.style.overflow =
        htmlOverflow;

      document.body.style.overscrollBehavior =
        bodyOverscroll;

      document.documentElement.style.overscrollBehavior =
        htmlOverscroll;
    };
  }, [
    open,
  ]);


  useEffect(() => {
    if (
      !open
    ) {
      previewCollapseProgressRef.current =
        0;

      return;
    }

    const scroller =
      controlsScrollerRef.current;

    if (
      scroller
    ) {
      scroller.scrollTop =
        0;
    }

    scrollFrameRef.current =
      window.requestAnimationFrame(
        syncPreviewToScroll
      );

    window.addEventListener(
      "resize",
      handleControlsScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleControlsScroll
      );

      if (
        scrollFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          scrollFrameRef.current
        );

        scrollFrameRef.current =
          null;
      }

      if (
        restoreTransitionTimeoutRef.current !==
        null
      ) {
        window.clearTimeout(
          restoreTransitionTimeoutRef.current
        );

        previewSectionRef.current?.style.removeProperty(
          "transition"
        );

        previewContentRef.current?.style.removeProperty(
          "transition"
        );

        restoreTransitionTimeoutRef.current =
          null;
      }
    };
  }, [
    handleControlsScroll,
    open,
    selectedTab,
    syncPreviewToScroll,
  ]);


  const availableCosmetics =
    useMemo<CosmeticItem[]>(() => {
      if (
        selectedTab ===
        "identity"
      ) {
        return [];
      }


      return unlockedCosmetics
        .filter(
          (
            item:
              CosmeticItem
          ) =>
            item.category ===
              selectedTab &&
            !item.id.startsWith(
              "seasonal-"
            )
        )
        .sort(
          (
            first:
              CosmeticItem,

            second:
              CosmeticItem
          ) => {
            if (
              first.isDefault !==
              second.isDefault
            ) {
              return first.isDefault
                ? -1
                : 1;
            }


            if (
              first.requiredLevel !==
              second.requiredLevel
            ) {
              return (
                first.requiredLevel -
                second.requiredLevel
              );
            }


            return first.name.localeCompare(
              second.name
            );
          }
        );
    }, [
      selectedTab,
      unlockedCosmetics,
    ]);


  if (!open) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-hidden bg-[#080910]/90 p-0 backdrop-blur-xl sm:p-3 xl:p-5" onMouseDown={onClose}>
      <div className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[1600px] flex-col overflow-hidden border border-white/10 bg-[#11131c] text-white shadow-[0_30px_120px_rgba(0,0,0,.8)] sm:h-[96dvh] sm:max-h-[980px] sm:rounded-[2rem]" onMouseDown={(event) => event.stopPropagation()}>
        <header className="relative z-30 flex min-h-[68px] shrink-0 items-center justify-between gap-4 border-b border-white/[0.08] bg-[#11131c]/95 px-4 py-3 sm:min-h-[82px] sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4"><div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-300/20 via-indigo-400/10 to-cyan-300/10 text-xl text-violet-100">✦</div><div className="min-w-0"><p className="truncate text-[9px] font-black uppercase tracking-[0.24em] text-violet-200/70">Crescera · Character Studio</p><h2 className="mt-0.5 truncate text-lg font-black sm:text-2xl">Shape your character</h2></div></div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3"><div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-right sm:block"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Current journey</p><p className="mt-0.5 text-sm font-black">Level {currentLevel}<span className="mx-2 text-zinc-600">·</span><span className="text-amber-200">{currentTier}</span></p></div><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg text-zinc-300 transition hover:border-white/25 hover:bg-white/10 hover:text-white" aria-label="Close character studio">✕</button></div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col xl:grid xl:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">
          <section ref={previewSectionRef} className="relative flex h-[34dvh] min-h-[235px] max-h-[315px] shrink-0 items-center justify-center overflow-hidden border-b border-white/[0.08] bg-[#0b0d15] px-3 py-2 sm:h-[42vh] sm:min-h-[300px] sm:max-h-[350px] sm:px-5 sm:py-5 xl:h-full xl:min-h-0 xl:max-h-none xl:border-b-0 xl:border-r xl:px-8 xl:py-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute left-1/2 top-[12%] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-violet-500/[0.12] blur-[90px]" /><div className="absolute -bottom-24 left-[5%] h-56 w-56 rounded-full bg-cyan-400/[0.08] blur-[80px]" /><div className="absolute -bottom-20 right-[-5%] h-64 w-64 rounded-full bg-amber-300/[0.07] blur-[85px]" /><div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" /><div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#080910] via-[#080910]/50 to-transparent" /></div>
            <div className="pointer-events-none absolute left-4 top-3 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#0c0e17]/75 px-3 py-1.5 backdrop-blur-md sm:left-6 sm:top-5"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" /></span><span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-200">Live preview</span></div>
            <div ref={previewContentRef} className="relative z-10 flex h-full w-full items-center justify-center overflow-visible origin-center will-change-transform"><div className="xl:hidden"><CharacterDisplay compact scale={0.5} showName={false} showTitle={false} showLevel={false} /></div><div className="hidden xl:block"><CharacterDisplay compact scale={0.84} showName={false} showTitle={false} showLevel={false} /></div></div>
            <div className="pointer-events-none absolute bottom-5 left-6 right-6 z-20 hidden items-end justify-between gap-4 xl:flex"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-200/70">Your character</p><p className="mt-1 truncate text-xl font-black">{player.name || "Your Crescera"}</p><p className="mt-1 text-xs text-zinc-400">{equippedItemCount} style detail{equippedItemCount === 1 ? "" : "s"} equipped</p></div><div className="rounded-2xl border border-white/10 bg-[#11131c]/75 px-4 py-3 text-right"><p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">Editing</p><p className="mt-1 max-w-32 truncate text-sm font-black">{selectedCategory?.name ?? "Identity"}</p></div></div>
            <button ref={previewRestoreButtonRef} type="button" tabIndex={-1} onClick={restoreExpandedPreview} className="pointer-events-none absolute bottom-2 left-1/2 z-30 flex h-8 min-w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-[#10121b]/90 px-3 text-lg font-black opacity-0 transition-opacity duration-150 xl:hidden" aria-label="Expand character preview">⌄</button>
          </section>
          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#11131c]">
            <div className="shrink-0 overflow-x-auto border-b border-white/[0.08] bg-[#0d0f17] xl:hidden"><nav aria-label="Character categories" className="flex min-w-max gap-1.5 px-3 py-2.5 sm:px-5"><TabButton active={selectedTab === "identity"} icon="✦" label="Identity" onClick={() => setSelectedTab("identity")} />{cosmeticCategories.map((category) => { const id = loadout[category.id]; const equipped = Boolean(id) && id !== "none" && id !== getRequiredDefaultId(category.id); return <TabButton key={category.id} active={selectedTab === category.id} icon={category.icon} label={category.name} equipped={equipped} onClick={() => setSelectedTab(category.id)} />; })}</nav></div>
            <div className="flex min-h-0 min-w-0 flex-1">
              <aside className="hidden w-[205px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0d0f17] p-3 xl:flex"><div className="px-2 pb-3 pt-2"><p className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">Wardrobe</p><div className="mt-2 flex items-center justify-between"><span className="text-sm font-black">Your look</span><span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2 py-0.5 text-[10px] text-violet-100">{equippedItemCount}</span></div></div><nav aria-label="Character categories" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"><TabButton active={selectedTab === "identity"} icon="✦" label="Identity" detail="Base look" vertical onClick={() => setSelectedTab("identity")} />{cosmeticCategories.map((category) => { const id = loadout[category.id]; const equipped = Boolean(id) && id !== "none" && id !== getRequiredDefaultId(category.id); const label = category.id === "background" ? "Backdrops" : category.id === "accessory" ? "Gear" : category.name; return <TabButton key={category.id} active={selectedTab === category.id} icon={category.icon} label={label} detail={equipped ? "Equipped" : "Personalize"} equipped={equipped} vertical onClick={() => setSelectedTab(category.id)} />; })}</nav><div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">Live changes</p><p className="mt-1 text-xs text-zinc-400">Every choice appears on your character instantly.</p></div></aside>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.07] px-4 py-3 sm:px-6 sm:py-4"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-200/65">{selectedCategory ? "Style collection" : "Character details"}</p><h3 className="mt-0.5 text-lg font-black sm:text-xl">{selectedCategory?.name ?? "Identity"}</h3></div><div className="flex items-center gap-2">{selectedCategory && <button type="button" onClick={() => clearCosmetic(selectedTab as CosmeticCategory)} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-black text-zinc-300 hover:bg-white/[0.08] sm:px-4 sm:text-xs">Reset slot</button>}<span className="hidden rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-zinc-400 sm:block">{selectedTab === "identity" ? "Always available" : <>{availableCosmetics.length} available</>}</span></div></div>
                <div ref={controlsScrollerRef} onScroll={handleControlsScroll} className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y p-4 [-webkit-overflow-scrolling:touch] sm:p-6 xl:p-7"><div className="mx-auto max-w-[1000px]">{selectedTab === "identity" ? <IdentityCustomizer identity={identity} updateIdentity={updateIdentity} /> : <CosmeticCustomizer category={selectedTab} categoryName={selectedCategory?.name ?? selectedTab} categoryIcon={selectedCategory?.icon ?? "🎨"} optional={selectedCategory?.optional ?? true} items={availableCosmetics} seasonalItems={selectedTab === "background" ? seasonalCosmetics : []} currentSeasonalMonth={currentSeasonalMonth} equippedItemId={loadout[selectedTab]} equippedItem={getEquippedCosmetic(selectedTab) ?? undefined} heldItemHand={loadout.heldItemHand} onHeldItemHandChange={updateHeldItemHand} isSeasonalAvailable={isSeasonalCosmeticAvailable} onToggle={toggleCosmetic} onClear={() => clearCosmetic(selectedTab)} />}</div></div>
                <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0e1018] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4"><p className="flex items-center gap-2 text-[11px] text-zinc-500 sm:text-xs"><span className="text-emerald-300">●</span>Your style saves automatically</p><button type="button" onClick={onClose} className="rounded-xl bg-gradient-to-r from-violet-200 to-cyan-100 px-5 py-2.5 text-sm font-black text-[#171723] transition hover:-translate-y-0.5 sm:px-7">Done styling</button></footer>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


function IdentityCustomizer({
  identity,
  updateIdentity,
}: {
  identity:
    ReturnType<
      typeof useCharacter
    >["identity"];

  updateIdentity:
    ReturnType<
      typeof useCharacter
    >["updateIdentity"];
}) {
  return (
    <div
      className="
        space-y-9
      "
    >
      <CustomizerSection
        title="Body"
        description="Choose the base body style used by your character."
      >
        <div
          className="
            grid
            grid-cols-2
            gap-3

            sm:grid-cols-3
          "
        >
          {identityOptions.genders.map(
            (option) => (
              <ChoiceButton
                key={
                  option.id
                }
                selected={
                  identity.gender ===
                  option.id
                }
                title={
                  option.name
                }
                icon={
                  option.id ===
                  "male"
                    ? "🧍‍♂️"
                    : "🧍‍♀️"
                }
                onClick={() =>
                  updateIdentity(
                    "gender",
                    option.id
                  )
                }
              />
            )
          )}
        </div>
      </CustomizerSection>


      <CustomizerSection
        title="Skin Tone"
        description="Skin tone options are always available."
      >
        <div
          className="
            grid
            grid-cols-4
            gap-3

            sm:grid-cols-6
          "
        >
          {identityOptions.skinTones.map(
            (option) => (
              <button
                key={
                  option.id
                }
                type="button"
                onClick={() =>
                  updateIdentity(
                    "skinTone",
                    option.id
                  )
                }
                className={`
                  flex
                  aspect-square

                  items-center
                  justify-center

                  rounded-xl

                  border-4

                  transition

                  ${
                    identity.skinTone ===
                    option.id
                      ? `
                        scale-105
                        border-white
                        shadow-[0_0_22px_rgba(255,255,255,.4)]
                      `
                      : `
                        border-zinc-700
                        bg-black
                        hover:border-zinc-400
                      `
                  }
                `}
                aria-label={
                  option.name
                }
              >
                <span
                  className="
                    h-10
                    w-10

                    rounded-full

                    border
                    border-black/20
                  "
                  style={{
                    backgroundColor:
                      option.color,
                  }}
                />
              </button>
            )
          )}
        </div>
      </CustomizerSection>


      <CustomizerSection
        title="Hair Style"
        description="Choose your character's hairstyle."
      >
        <div
          className="
            grid
            grid-cols-2
            gap-3

            sm:grid-cols-4
          "
        >
          {identityOptions.hairStyles.map(
            (option) => (
              <ChoiceButton
                key={
                  option.id
                }
                selected={
                  identity.hairStyle ===
                  option.id
                }
                title={
                  option.name
                }
                icon={
                  getHairIcon(
                    option.id
                  )
                }
                onClick={() =>
                  updateIdentity(
                    "hairStyle",
                    option.id
                  )
                }
              />
            )
          )}
        </div>
      </CustomizerSection>


      <CustomizerSection
        title="Hair Color"
        description="Hair color is independent from hairstyle."
      >
        <div
          className="
            grid
            grid-cols-3
            gap-3

            sm:grid-cols-4

            2xl:grid-cols-6
          "
        >
          {identityOptions.hairColors.map(
            (option) => (
              <button
                key={
                  option.id
                }
                type="button"
                onClick={() =>
                  updateIdentity(
                    "hairColor",
                    option.id
                  )
                }
                className={`
                  rounded-xl

                  border

                  p-3

                  text-center

                  transition

                  ${
                    identity.hairColor ===
                    option.id
                      ? `
                        border-white
                        bg-zinc-800
                      `
                      : `
                        border-zinc-700
                        bg-black
                        hover:border-zinc-400
                      `
                  }
                `}
              >
                <span
                  className="
                    mx-auto
                    block

                    h-9
                    w-9

                    rounded-full

                    border
                    border-white/20
                  "
                  style={{
                    backgroundColor:
                      option.color,
                  }}
                />

                <span
                  className="
                    mt-2
                    block

                    text-xs
                    font-bold
                  "
                >
                  {option.name}
                </span>
              </button>
            )
          )}
        </div>
      </CustomizerSection>


      <CustomizerSection
        title="Glasses"
        description="Glasses are identity options and never require unlocking."
      >
        <div
          className="
            grid
            grid-cols-2
            gap-3

            sm:grid-cols-4
          "
        >
          {identityOptions.glasses.map(
            (option) => (
              <ChoiceButton
                key={
                  option.id
                }
                selected={
                  identity.glasses ===
                  option.id
                }
                title={
                  option.name
                }
                icon={
                  option.icon
                }
                onClick={() =>
                  updateIdentity(
                    "glasses",
                    option.id
                  )
                }
              />
            )
          )}
        </div>
      </CustomizerSection>


      <CustomizerSection
        title="Earrings"
        description="Choose no earrings, studs, or hoops."
      >
        <div
          className="
            grid
            grid-cols-2
            gap-3

            sm:grid-cols-3
          "
        >
          {identityOptions.earrings.map(
            (option) => (
              <ChoiceButton
                key={
                  option.id
                }
                selected={
                  identity.earrings ===
                  option.id
                }
                title={
                  option.name
                }
                icon={
                  option.icon
                }
                onClick={() =>
                  updateIdentity(
                    "earrings",
                    option.id
                  )
                }
              />
            )
          )}
        </div>
      </CustomizerSection>
    </div>
  );
}


function CosmeticCustomizer({
  category,
  categoryName,
  categoryIcon,
  optional,
  items,
  seasonalItems,
  currentSeasonalMonth,
  equippedItemId,
  equippedItem,
  heldItemHand,
  onHeldItemHandChange,
  isSeasonalAvailable,
  onToggle,
  onClear,
}: {
  category:
    CosmeticCategory;

  categoryName:
    string;

  categoryIcon:
    string;

  optional:
    boolean;

  items:
    CosmeticItem[];

  seasonalItems:
    CosmeticItem[];

  currentSeasonalMonth:
    number;

  equippedItemId:
    string;

  equippedItem?:
    CosmeticItem;

  heldItemHand:
    HeldItemHand;

  onHeldItemHandChange:
    (
      hand:
        HeldItemHand
    ) => void;

  isSeasonalAvailable:
    (
      itemId:
        string
    ) => boolean;

  onToggle:
    (
      itemId:
        string
    ) => void;

  onClear:
    () => void;
}) {
  const defaultLabel =
    optional
      ? getNoneLabel(
          category
        )
      : getDefaultLabel(
          category
        );


  const defaultIcon =
    optional
      ? getNoneIcon(
          category
        )
      : getDefaultIcon(
          category
        );


  const defaultSelected =
    optional
      ? equippedItemId ===
        "none"
      : equippedItemId ===
        getRequiredDefaultId(
          category
        );


  return (
    <div
      className="
        min-w-0
      "
    >
      <div
        className="
          flex
          flex-wrap

          items-start
          justify-between

          gap-4
        "
      >
        <div>
          <h3
            className="
              text-2xl
              font-black
            "
          >
            {categoryIcon}{" "}
            {categoryName}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-zinc-400
            "
          >
            {items.length} unlocked option
            {items.length ===
            1
              ? ""
              : "s"}
          </p>
        </div>


        {equippedItem && (
          <div
            className="
              max-w-full

              rounded-xl

              border
              border-zinc-700

              bg-black

              px-4
              py-3
            "
          >
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-zinc-500
              "
            >
              Equipped
            </p>

            <p
              className="
                mt-1
                truncate
                font-bold
              "
            >
              {equippedItem.icon}{" "}
              {equippedItem.name}
            </p>
          </div>
        )}
      </div>


      {category ===
        "heldItem" && (
        <section
          className="
            mt-6

            rounded-2xl

            border
            border-zinc-700

            bg-black/55

            p-4
          "
        >
          <div
            className="
              flex
              flex-wrap

              items-center
              justify-between

              gap-3
            "
          >
            <div>
              <p
                className="
                  font-black
                "
              >
                Item Hand
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-500
                "
              >
                Two-handed items automatically use both hands.
              </p>
            </div>

            <div
              className="
                flex
                gap-2
              "
            >
              {(
                [
                  "left",
                  "right",
                ] as
                  HeldItemHand[]
              ).map(
                (
                  hand:
                    HeldItemHand
                ) => (
                  <button
                    key={
                      hand
                    }
                    type="button"
                    onClick={() =>
                      onHeldItemHandChange(
                        hand
                      )
                    }
                    className={`
                      rounded-xl

                      border

                      px-4
                      py-2

                      text-sm
                      font-black
                      capitalize

                      transition

                      ${
                        heldItemHand ===
                        hand
                          ? `
                            border-white
                            bg-white
                            text-black
                          `
                          : `
                            border-zinc-700
                            bg-zinc-950
                            text-white
                            hover:border-zinc-400
                          `
                      }
                    `}
                  >
                    {hand ===
                    "left"
                      ? "🤚 Left"
                      : "Right ✋"}
                  </button>
                )
              )}
            </div>
          </div>
        </section>
      )}


      <div
        className="
          mt-6

          grid
          min-w-0

          grid-cols-1
          gap-4

          sm:grid-cols-2
          2xl:grid-cols-3
        "
      >
        <DefaultCosmeticCard
          title={
            defaultLabel
          }
          icon={
            defaultIcon
          }
          description={
            optional
              ? "Remove the currently equipped item from this category."
              : "Return to the original starting option."
          }
          selected={
            defaultSelected
          }
          onClick={
            onClear
          }
        />


        {items
          .filter(
            (
              item:
                CosmeticItem
            ) =>
              !item.isDefault
          )
          .map(
            (
              item:
                CosmeticItem
            ) => (
              <CosmeticCard
                key={
                  item.id
                }
                item={
                  item
                }
                equipped={
                  equippedItemId ===
                  item.id
                }
                locked={
                  false
                }
                onClick={() =>
                  onToggle(
                    item.id
                  )
                }
              />
            )
          )}
      </div>


      {category ===
        "background" &&
        seasonalItems.length >
          0 && (
        <section
          className="
            mt-10

            border-t
            border-zinc-800

            pt-8
          "
        >
          <div
            className="
              flex
              flex-wrap

              items-end
              justify-between

              gap-3
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-yellow-300
                "
              >
                Seasonal This Month
              </p>

              <h4
                className="
                  mt-1
                  text-2xl
                  font-black
                "
              >
                {monthNames[
                  currentSeasonalMonth
                ]} Collection
              </h4>

              <p
                className="
                  mt-1
                  text-sm
                  text-zinc-400
                "
              >
                Only this month’s two backgrounds can be equipped. Other months remain visible but locked.
              </p>
            </div>

            <span
              className="
                rounded-full

                border
                border-yellow-400/40

                bg-yellow-400/10

                px-4
                py-2

                text-xs
                font-black
                uppercase
                tracking-wider
                text-yellow-200
              "
            >
              {monthNames[
                currentSeasonalMonth
              ]}
            </span>
          </div>


          <div
            className="
              mt-6

              grid
              min-w-0

              grid-cols-1
              gap-4

              sm:grid-cols-2
              2xl:grid-cols-3
            "
          >
            {seasonalItems.map(
              (
                item:
                  CosmeticItem
              ) => {
                const available =
                  isSeasonalAvailable(
                    item.id
                  );


                return (
                  <CosmeticCard
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    equipped={
                      equippedItemId ===
                      item.id
                    }
                    locked={
                      !available
                    }
                    lockedLabel={
                      getSeasonalMonthLabel(
                        item.id
                      )
                    }
                    onClick={() => {
                      if (
                        available
                      ) {
                        onToggle(
                          item.id
                        );
                      }
                    }}
                  />
                );
              }
            )}
          </div>
        </section>
      )}
    </div>
  );
}


function DefaultCosmeticCard({
  title,
  icon,
  description,
  selected,
  onClick,
}: {
  title:
    string;

  icon:
    string;

  description:
    string;

  selected:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        group
        relative

        min-h-[218px]
        min-w-0

        overflow-hidden

        rounded-[1.5rem]

        border

        p-4

        text-left

        transition-all
        duration-200
        hover:-translate-y-1

        ${
          selected
            ? `
              border-violet-200/45
              bg-gradient-to-br
              from-violet-300/[0.12]
              via-indigo-300/[0.06]
              to-[#12141d]
              shadow-[0_12px_34px_rgba(139,92,246,.12)]
            `
            : `
              border-white/[0.09]
              bg-gradient-to-br
              from-white/[0.045]
              to-[#11131c]
              hover:border-white/20
              hover:shadow-[0_14px_36px_rgba(0,0,0,.24)]
            `
        }
      `}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_50%_0%,rgba(196,181,253,.13),transparent_72%)] opacity-80 transition-opacity group-hover:opacity-100" />

      {selected && (
        <span
          className="
            absolute
            right-4
            top-4
            z-10

            rounded-full

            border
            border-violet-200/25
            bg-[#28223a]

            px-2.5
            py-1.5

            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-violet-100
          "
        >
          Selected
        </span>
      )}


      <div
        className="
          relative
          mt-5

          flex
          h-24

          items-center
          justify-center

          overflow-hidden
          rounded-2xl
          border
          border-white/[0.06]
          bg-black/20
          text-5xl
          shadow-inner
        "
      >
        <span className="absolute h-16 w-16 rounded-full bg-violet-300/[0.10] blur-xl" />
        {icon}
      </div>


      <p
        className="
          mt-4
          truncate

          font-black
          tracking-tight
        "
      >
        {title}
      </p>


      <p
        className="
          mt-1.5
          line-clamp-2

          text-xs
          leading-relaxed
          text-zinc-400
        "
      >
        {description}
      </p>
    </button>
  );
}


function CosmeticCard({
  item,
  equipped,
  locked,
  lockedLabel,
  onClick,
}: {
  item:
    CosmeticItem;

  equipped:
    boolean;

  locked:
    boolean;

  lockedLabel?:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        locked
      }
      onClick={
        onClick
      }
      className={`
        group
        relative

        min-h-[232px]
        min-w-0

        overflow-hidden

        rounded-[1.5rem]

        border

        p-4

        text-left

        transition-all
        duration-200

        ${
          locked
            ? `
              cursor-not-allowed
              border-white/[0.07]
              bg-[#10121a]
            `
            : equipped
            ? `
              -translate-y-0.5
              border-amber-200/55
              bg-gradient-to-br
              from-amber-200/[0.12]
              via-violet-200/[0.06]
              to-[#11131c]
              shadow-[0_12px_34px_rgba(251,191,36,.12)]
            `
            : `
              border-white/[0.09]
              bg-gradient-to-br
              from-white/[0.045]
              to-[#11131c]
              hover:-translate-y-1
              hover:border-white/20
              hover:shadow-[0_14px_36px_rgba(0,0,0,.24)]
            `
        }
      `}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_50%_0%,rgba(167,139,250,.14),transparent_70%)] transition-opacity group-hover:opacity-100" />

      {locked && (
        <div
          className="
            absolute
            inset-0
            z-20

            flex
            flex-col

            items-center
            justify-center

            bg-[#0a0b11]/78

            text-center
          "
        >
          <span
            className="
              text-4xl
            "
          >
            🔒
          </span>

          <span
            className="
              mt-2
              text-xs
              font-black
              uppercase
              tracking-wider
              text-zinc-300
            "
          >
            Available in{" "}
            {lockedLabel ??
              "its month"}
          </span>
        </div>
      )}


      {equipped &&
        !locked && (
        <span
          className="
            absolute
            right-3
            top-3
            z-10

            rounded-full

            border
            border-amber-200/30
            bg-[#382f20]

            px-2
            py-1.5

            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-amber-100
          "
        >
          Equipped
        </span>
      )}


      {item.animated && (
        <span
          className="
            absolute
            left-3
            top-3
            z-10

            rounded-full

            border
            border-purple-400/40

            bg-purple-950/80

            px-2
            py-1

            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-purple-200
          "
        >
          Animated
        </span>
      )}


      <div
        className="
          relative
          mt-5

          flex
          h-24

          items-center
          justify-center

          overflow-hidden
          rounded-2xl
          border
          border-white/[0.06]
          bg-black/20
          text-5xl
          shadow-inner
        "
      >
        <span className="absolute h-16 w-16 rounded-full bg-violet-300/[0.11] blur-xl" />
        {item.icon}
      </div>


      <p
        className="
          mt-4
          truncate

          font-black
          tracking-tight
        "
        title={
          item.name
        }
      >
        {item.name}
      </p>


      <p
        className="
          mt-1.5
          line-clamp-2

          text-xs
          leading-relaxed
          text-zinc-400
        "
      >
        {item.description}
      </p>


      {!item.id.startsWith(
        "seasonal-"
      ) && (
        <div
          className="
            mt-3

            flex
            items-center
            justify-between

            gap-3

            text-xs
            text-zinc-500
          "
        >
          <span>
            {item.tier}
          </span>

          <span>
            Level{" "}
            {item.requiredLevel}
          </span>
        </div>
      )}


      {equipped &&
        !locked && (
        <p
          className="
            mt-3

            text-xs
            font-bold
            text-yellow-300
          "
        >
          Click again to unequip
        </p>
      )}
    </button>
  );
}


function CustomizerSection({
  title,
  description,
  children,
}: {
  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[1.4rem] border border-white/[0.075] bg-white/[0.025] p-4 shadow-[0_10px_32px_rgba(0,0,0,.12)] sm:p-6">
      <h3
        className="
          text-lg
          font-black
          tracking-tight
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1

          text-sm
          leading-relaxed
          text-zinc-500
        "
      >
        {description}
      </p>

      <div
        className="
          mt-5
        "
      >
        {children}
      </div>
    </section>
  );
}


function ChoiceButton({
  selected,
  title,
  icon,
  onClick,
}: {
  selected:
    boolean;

  title:
    string;

  icon:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        group
        relative
        rounded-xl

        border

        px-3
        py-4

        text-center

        transition-all
        duration-200
        hover:-translate-y-0.5

        ${
          selected
            ? `
              border-violet-200/40
              bg-violet-200/[0.09]
              shadow-[0_8px_24px_rgba(139,92,246,.12)]
            `
            : `
              border-white/[0.08]
              bg-black/20
              hover:border-white/20
              hover:bg-white/[0.045]
            `
        }
      `}
    >
      <span
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-white/[0.06]
          bg-white/[0.035]

          text-2xl
        "
      >
        {icon}
      </span>

      <span
        className="
          mt-2
          block

          text-xs
          font-bold
          text-zinc-200
        "
      >
        {title}
      </span>
    </button>
  );
}


function TabButton({
  active,
  icon,
  label,
  detail,
  vertical = false,
  equipped = false,
  onClick,
}: {
  active:
    boolean;

  icon:
    string;

  label:
    string;

  detail?:
    string;

  vertical?:
    boolean;

  equipped?:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={
        onClick
      }
      className={`
        group
        relative
        flex
        shrink-0
        items-center
        border
        transition
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-violet-300
        ${vertical
          ? "w-full gap-2 rounded-2xl px-2.5 py-2.5 text-left text-[11px]"
          : "gap-2 rounded-xl px-3 py-2 text-xs font-bold sm:px-4 sm:py-2.5 sm:text-sm"}
        ${
          active
            ? `
              border-violet-200/25
              bg-violet-200/[0.12]
              text-white
              shadow-[inset_0_0_0_1px_rgba(196,181,253,.08)]
            `
            : `
              border-white/[0.07]
              bg-white/[0.025]
              text-zinc-400
              hover:border-white/15
              hover:bg-white/[0.06]
              hover:text-white
            `
        }
      `}
    >
      <span className={`relative flex ${vertical ? "h-7 w-7" : "h-8 w-8"} shrink-0 items-center justify-center rounded-xl text-base transition ${vertical ? "bg-black/20" : ""} ${active ? "bg-violet-200/10 text-violet-100" : "text-zinc-300 group-hover:text-white"}`} aria-hidden="true">
        {icon}
        {equipped && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#11131c] bg-emerald-300" />}
      </span>
      <span className={`min-w-0 ${vertical ? "flex-1" : "whitespace-nowrap"}`}>
        <span className="block truncate font-black">{label}</span>
        {vertical && detail && <span className={`mt-0.5 block truncate text-[9px] font-bold uppercase tracking-[0.12em] ${equipped ? "text-emerald-200/70" : "text-zinc-600"}`}>{detail}</span>}
      </span>
      {vertical && active && <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-gradient-to-b from-violet-200 to-cyan-200" />}
    </button>
  );
}


function getSeasonalMonthLabel(
  itemId:
    string
) {
  const month =
    monthNames.find(
      (
        monthName:
          string
      ) =>
        itemId.includes(
          `seasonal-${monthName.toLowerCase()}-`
        )
    );


  return month ??
    "its month";
}


function getRequiredDefaultId(
  category:
    CosmeticCategory
) {
  switch (category) {
    case "outfit":
      return defaultLoadout.outfit;

    case "background":
      return defaultLoadout.background;

    case "pose":
      return defaultLoadout.pose;

    default:
      return "none";
  }
}


function getDefaultLabel(
  category:
    CosmeticCategory
) {
  switch (category) {
    case "outfit":
      return "Default Outfit";

    case "background":
      return "Default Studio";

    case "pose":
      return "Default Standing";

    default:
      return "Default";
  }
}


function getDefaultIcon(
  category:
    CosmeticCategory
) {
  switch (category) {
    case "outfit":
      return "👕";

    case "background":
      return "⬛";

    case "pose":
      return "🧍";

    default:
      return "↩️";
  }
}


function getNoneLabel(
  category:
    CosmeticCategory
) {
  switch (category) {
    case "frame":
      return "No Frame";

    case "accessory":
      return "No Accessory";

    case "aura":
      return "No Aura";

    case "heldItem":
      return "Empty Hands";

    case "sceneEffect":
      return "Clear Weather";

    default:
      return "None";
  }
}


function getNoneIcon(
  category:
    CosmeticCategory
) {
  switch (category) {
    case "frame":
      return "◻️";

    case "accessory":
      return "🚫";

    case "aura":
      return "⭕";

    case "heldItem":
      return "👐";

    case "sceneEffect":
      return "☀️";

    default:
      return "🚫";
  }
}


function getHairIcon(
  style:
    string
) {
  switch (style) {
    case "bald":
      return "👨‍🦲";

    case "buzz":
      return "💇";

    case "curly":
      return "🧑‍🦱";

    case "long":
      return "👩";

    case "ponytail":
      return "👱‍♀️";

    case "wavy":
      return "🌊";

    case "medium":
      return "🧑";

    default:
      return "👤";
  }
}
