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
              440,
              Math.max(
                410,
                window.innerHeight *
                  0.44
              )
            )
          : Math.min(
              410,
              Math.max(
                380,
                window.innerHeight *
                  0.44
              )
            );

      const collapsedHeight =
        tabletLayout
          ? 150
          : 138;

      const nextHeight =
        expandedHeight -
        (expandedHeight -
          collapsedHeight) *
          progress;

      const nextScale =
        1 -
        progress *
          0.58;

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
    <div
      className="
        fixed
        inset-0
        z-[1200]

        flex
        items-stretch
        justify-center

        overflow-hidden

        bg-black/90

        p-0

        sm:items-center
        sm:p-3

        xl:p-5
      "
      onMouseDown={
        onClose
      }
    >
      <div
        className="
          relative

          flex

          h-[100dvh]
          max-h-[100dvh]

          w-full
          max-w-[1450px]

          flex-col

          overflow-hidden

          rounded-none

          border-0
          border-zinc-700

          bg-zinc-950

          text-white

          shadow-[0_0_100px_rgba(0,0,0,.95)]

          sm:h-[96dvh]
          sm:max-h-[940px]
          sm:rounded-3xl
          sm:border

          xl:flex-row
        "
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={
            onClose
          }
          className="
            absolute
            right-4
            top-4
            z-[1230]

            flex
            h-11
            w-11

            items-center
            justify-center

            rounded-full

            border
            border-zinc-600

            bg-black/90

            text-xl
            font-black

            shadow-lg

            backdrop-blur

            transition

            hover:border-white
            hover:bg-zinc-900
          "
          aria-label="Close character customizer"
        >
          ✕
        </button>


        <section
          ref={
            previewSectionRef
          }
          className="
            relative

            flex
            h-[44dvh]
            min-h-[380px]
            max-h-[410px]

            shrink-0

            items-center
            justify-center

            overflow-hidden

            border-b
            border-zinc-800

            bg-black

            px-3
            py-3

            sm:h-[44vh]
            sm:min-h-[410px]
            sm:max-h-[440px]
            sm:px-5
            sm:py-6

            xl:h-full
            xl:min-h-0
            xl:max-h-none
            xl:w-[470px]
            xl:border-b-0
            xl:border-r
          "
        >
          <div
            className="
              pointer-events-none

              absolute
              inset-0

              bg-[radial-gradient(circle_at_center,rgba(255,255,255,.08),transparent_68%)]
            "
          />


          <div
            ref={
              previewContentRef
            }
            className="
              relative
              z-10

              flex
              h-full
              w-full

              items-center
              justify-center

              overflow-visible

              origin-center
              will-change-transform
            "
          >
            <div
              className="
                xl:hidden
              "
            >
              <CharacterDisplay
                compact
                scale={
                  0.66
                }
                showName={
                  false
                }
                showTitle={
                  false
                }
                showLevel={
                  false
                }
              />
            </div>

            <div
              className="
                hidden
                xl:block
              "
            >
              <CharacterDisplay
                compact
                showName
                showTitle
                showLevel
              />
            </div>
          </div>

          <button
            ref={
              previewRestoreButtonRef
            }
            type="button"
            tabIndex={
              -1
            }
            onClick={
              restoreExpandedPreview
            }
            className="
              pointer-events-none
              absolute
              bottom-2
              left-1/2
              z-20

              flex
              h-8
              min-w-10
              -translate-x-1/2
              items-center
              justify-center

              rounded-full
              border
              border-white/20
              bg-black/80

              px-3

              text-lg
              font-black
              leading-none
              text-white

              opacity-0
              shadow-lg
              backdrop-blur

              transition-opacity
              duration-150

              hover:border-white/50
              hover:bg-zinc-900

              xl:hidden
            "
            aria-label="Expand character preview"
            title="Expand character preview"
          >
            ⌄
          </button>
        </section>


        <section
          className="
            flex
            min-h-0
            min-w-0
            flex-1
            flex-col
          "
        >
          <header
            className="
              shrink-0

              border-b
              border-zinc-800

              px-4
              py-3

              pr-16

              sm:px-5
              sm:py-5
              sm:pr-20
            "
          >
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.22em]
                text-zinc-500
              "
            >
              Level {currentLevel}
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black

                sm:text-3xl
              "
            >
              Customize Character
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-zinc-400
              "
            >
              Current tier:{" "}
              <strong
                className="
                  text-white
                "
              >
                {currentTier}
              </strong>
            </p>
          </header>


          <div
            className="
              shrink-0

              overflow-x-auto

              border-b
              border-zinc-800

              bg-black/40
            "
          >
            <div
              className="
                flex
                min-w-max
                gap-2
                p-2.5

                sm:p-4
              "
            >
              <TabButton
                active={
                  selectedTab ===
                  "identity"
                }
                icon="🧑"
                label="Identity"
                onClick={() =>
                  setSelectedTab(
                    "identity"
                  )
                }
              />


              {cosmeticCategories.map(
                (category) => (
                  <TabButton
                    key={
                      category.id
                    }
                    active={
                      selectedTab ===
                      category.id
                    }
                    icon={
                      category.icon
                    }
                    label={
                      category.name
                    }
                    onClick={() =>
                      setSelectedTab(
                        category.id
                      )
                    }
                  />
                )
              )}
            </div>
          </div>


          <div
            ref={
              controlsScrollerRef
            }
            onScroll={
              handleControlsScroll
            }
            className="
              min-h-0
              min-w-0
              flex-1

              overflow-y-auto
              overflow-x-hidden
              overscroll-contain
              touch-pan-y

              p-4

              [-webkit-overflow-scrolling:touch]

              sm:p-6
            "
          >
            {selectedTab ===
            "identity" ? (
              <IdentityCustomizer
                identity={
                  identity
                }
                updateIdentity={
                  updateIdentity
                }
              />
            ) : (
              <CosmeticCustomizer
                category={
                  selectedTab
                }
                categoryName={
                  selectedCategory?.name ??
                  selectedTab
                }
                categoryIcon={
                  selectedCategory?.icon ??
                  "🎨"
                }
                optional={
                  selectedCategory?.optional ??
                  true
                }
                items={
                  availableCosmetics
                }
                seasonalItems={
                  selectedTab ===
                  "background"
                    ? seasonalCosmetics
                    : []
                }
                currentSeasonalMonth={
                  currentSeasonalMonth
                }
                equippedItemId={
                  loadout[
                    selectedTab
                  ]
                }
                equippedItem={
                  getEquippedCosmetic(
                    selectedTab
                  ) ??
                  undefined
                }
                heldItemHand={
                  loadout.heldItemHand
                }
                onHeldItemHandChange={
                  updateHeldItemHand
                }
                isSeasonalAvailable={
                  isSeasonalCosmeticAvailable
                }
                onToggle={
                  toggleCosmetic
                }
                onClear={() =>
                  clearCosmetic(
                    selectedTab
                  )
                }
              />
            )}
          </div>


          <footer
            className="
              flex
              shrink-0

              flex-wrap

              items-center
              justify-between

              gap-4

              border-t
              border-zinc-800

              bg-black/45

              px-4
              py-3

              pb-[max(0.75rem,env(safe-area-inset-bottom))]

              sm:px-5
              sm:py-4
            "
          >
            <p
              className="
                text-sm
                text-zinc-500
              "
            >
              Changes save automatically.
            </p>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                rounded-xl

                bg-white

                px-6
                py-3

                font-black
                text-black

                transition

                hover:bg-zinc-200
              "
            >
              Done
            </button>
          </footer>
        </section>
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

            sm:grid-cols-8
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

            sm:grid-cols-6
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
          lg:grid-cols-3
          2xl:grid-cols-4
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
              lg:grid-cols-3
              2xl:grid-cols-4
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
        relative

        min-h-[190px]
        min-w-0

        overflow-hidden

        rounded-2xl

        border-2

        p-4

        text-left

        transition

        hover:-translate-y-1

        ${
          selected
            ? `
              border-white
              bg-zinc-800
              shadow-[0_0_24px_rgba(255,255,255,.18)]
            `
            : `
              border-zinc-700
              bg-black
              hover:border-zinc-400
            `
        }
      `}
    >
      {selected && (
        <span
          className="
            absolute
            right-3
            top-3

            rounded-full

            bg-white

            px-2
            py-1

            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-black
          "
        >
          Selected
        </span>
      )}


      <div
        className="
          mt-7

          flex
          h-20

          items-center
          justify-center

          text-6xl
        "
      >
        {icon}
      </div>


      <p
        className="
          mt-3
          truncate

          font-black
        "
      >
        {title}
      </p>


      <p
        className="
          mt-2
          line-clamp-2

          text-xs
          text-zinc-500
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
        relative

        min-h-[210px]
        min-w-0

        overflow-hidden

        rounded-2xl

        border-2

        p-4

        text-left

        transition

        ${
          locked
            ? `
              cursor-not-allowed
              border-zinc-800
              bg-zinc-950
              opacity-45
            `
            : equipped
            ? `
              border-yellow-300
              bg-yellow-950/30
              shadow-[0_0_26px_rgba(250,204,21,.35)]
            `
            : `
              border-zinc-700
              bg-black
              hover:-translate-y-1
              hover:border-zinc-400
            `
        }
      `}
    >
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

            bg-black/65

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

            rounded-full

            bg-yellow-300

            px-2
            py-1

            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-black
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
          mt-7

          flex
          h-20

          items-center
          justify-center

          text-6xl
        "
      >
        {item.icon}
      </div>


      <p
        className="
          mt-3
          truncate

          font-black
        "
        title={
          item.name
        }
      >
        {item.name}
      </p>


      <p
        className="
          mt-2
          line-clamp-2

          text-xs
          text-zinc-500
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
    <section>
      <h3
        className="
          text-xl
          font-black
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1

          text-sm
          text-zinc-400
        "
      >
        {description}
      </p>

      <div
        className="
          mt-4
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
        rounded-xl

        border

        p-4

        text-center

        transition

        ${
          selected
            ? `
              border-white
              bg-zinc-800
              shadow-[0_0_18px_rgba(255,255,255,.18)]
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
          block

          text-3xl
        "
      >
        {icon}
      </span>

      <span
        className="
          mt-2
          block

          text-sm
          font-bold
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
  onClick,
}: {
  active:
    boolean;

  icon:
    string;

  label:
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
        rounded-lg

        border

        px-4
        py-3

        text-sm
        font-bold

        transition

        ${
          active
            ? `
              border-white
              bg-white
              text-black
            `
            : `
              border-zinc-700
              bg-black
              text-white
              hover:border-zinc-400
            `
        }
      `}
    >
      {icon} {label}
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
