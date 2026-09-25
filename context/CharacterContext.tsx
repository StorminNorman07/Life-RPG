"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CharacterIdentity,
  CharacterLoadout,
  CosmeticCategory,
  HeldItemHand,
  CosmeticItem,
  defaultIdentity,
  defaultLoadout,
  getCosmeticById,
  getPrestigeDisplay,
  getTierForLevel,
  getUnlockedCosmetics,
} from "@/data/characterOptions";

import {
  getLevel,
} from "@/data/levels";

import {
  seasonalBackgrounds,
} from "@/data/seasonalBackgrounds";

import {
  useGame,
} from "@/context/GameContext";


import { useAppDialog } from "@/components/ui/AppDialogProvider";

interface CharacterContextType {
  identity:
    CharacterIdentity;

  loadout:
    CharacterLoadout;

  unlockedCosmetics:
    CosmeticItem[];

  seasonalCosmetics:
    CosmeticItem[];

  currentSeasonalMonth:
    number;

  isSeasonalCosmeticAvailable: (
    itemId: string
  ) => boolean;

  currentLevel:
    number;

  currentTier:
    ReturnType<
      typeof getTierForLevel
    >;

  prestigeStars:
    number;

  prestigeDisplay:
    string;

  hasCrown:
    boolean;

  updateHeldItemHand: (
    hand: HeldItemHand
  ) => void;

  updateIdentity: <
    Key extends keyof CharacterIdentity
  >(
    key: Key,
    value: CharacterIdentity[Key]
  ) => void;

  equipCosmetic: (
    itemId: string
  ) => void;

  toggleCosmetic: (
    itemId: string
  ) => void;

  clearCosmetic: (
    category: CosmeticCategory
  ) => void;

  resetCategoryToDefault: (
    category: CosmeticCategory
  ) => void;

  isCosmeticUnlocked: (
    itemId: string
  ) => boolean;

  isCosmeticEquipped: (
    itemId: string
  ) => boolean;

  getEquippedCosmetic: (
    category: CosmeticCategory
  ) => CosmeticItem | null;

  resetCharacter:
    () => Promise<void>;
}


interface SavedCharacterData {
  identity:
    CharacterIdentity;

  loadout:
    CharacterLoadout;
}


const STORAGE_KEY =
  "characterCustomization";


const optionalCategories:
  CosmeticCategory[] = [
  "frame",
  "accessory",
  "aura",
  "heldItem",
  "sceneEffect",
];


const CharacterContext =
  createContext<
    CharacterContextType | undefined
  >(undefined);


function getSeasonalMonthFromId(
  itemId:
    string
): number | null {
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];


  const monthIndex =
    monthNames.findIndex(
      (
        month:
          string
      ) =>
        itemId.includes(
          `seasonal-${month}-`
        )
    );


  return monthIndex >= 0
    ? monthIndex
    : null;
}


function getCharacterCosmeticById(
  itemId:
    string
): CosmeticItem | null {
  return (
    seasonalBackgrounds.find(
      (
        item:
          CosmeticItem
      ) =>
        item.id ===
        itemId
    ) ??
    getCosmeticById(
      itemId
    )
  );
}


function cloneDefaultIdentity():
  CharacterIdentity {
  return {
    ...defaultIdentity,
  };
}


function cloneDefaultLoadout():
  CharacterLoadout {
  return {
    ...defaultLoadout,
  };
}


function sanitizeIdentity(
  identity:
    Partial<CharacterIdentity> | undefined
): CharacterIdentity {
  return {
    ...cloneDefaultIdentity(),
    ...identity,
  };
}


function sanitizeLoadout(
  loadout:
    Partial<CharacterLoadout> | undefined
): CharacterLoadout {
  const merged:
    CharacterLoadout = {
    ...cloneDefaultLoadout(),
    ...loadout,
  };


  optionalCategories.forEach(
    (category) => {
      const value =
        merged[
          category
        ];

      if (
        !value ||
        value ===
          "default"
      ) {
        merged[
          category
        ] =
          "none";
      }
    }
  );


  if (
    !merged.outfit ||
    merged.outfit ===
      "none"
  ) {
    merged.outfit =
      defaultLoadout.outfit;
  }


  if (
    !merged.background ||
    merged.background ===
      "none"
  ) {
    merged.background =
      defaultLoadout.background;
  }


  if (
    !merged.pose ||
    merged.pose ===
      "none"
  ) {
    merged.pose =
      defaultLoadout.pose;
  }


  return merged;
}


function readSavedCharacter():
  SavedCharacterData {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      identity:
        cloneDefaultIdentity(),

      loadout:
        cloneDefaultLoadout(),
    };
  }


  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      return {
        identity:
          cloneDefaultIdentity(),

        loadout:
          cloneDefaultLoadout(),
      };
    }


    const parsed =
      JSON.parse(
        saved
      ) as
        Partial<SavedCharacterData>;


    return {
      identity:
        sanitizeIdentity(
          parsed.identity
        ),

      loadout:
        sanitizeLoadout(
          parsed.loadout
        ),
    };
  } catch {
    return {
      identity:
        cloneDefaultIdentity(),

      loadout:
        cloneDefaultLoadout(),
    };
  }
}


function getDefaultItemId(
  category:
    CosmeticCategory
): string {
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


export function CharacterProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const { confirm } = useAppDialog();

  const {
    player,
  } =
    useGame();


  const [
    initialCharacter,
  ] =
    useState<SavedCharacterData>(
      () =>
        readSavedCharacter()
    );


  const [
    identity,
    setIdentity
  ] =
    useState<CharacterIdentity>(
      initialCharacter.identity
    );


  const [
    loadout,
    setLoadout
  ] =
    useState<CharacterLoadout>(
      initialCharacter.loadout
    );


  const [
    hasLoaded,
    setHasLoaded
  ] =
    useState(false);


  const currentLevel =
    getLevel(
      player.totalXP
    );


  const currentTier =
    getTierForLevel(
      Math.min(
        currentLevel,
        99
      )
    );


  const currentSeasonalMonth =
    new Date().getMonth();


  const seasonalCosmetics =
    useMemo<
      CosmeticItem[]
    >(() => {
      return [
        ...seasonalBackgrounds,
      ];
    }, []);


  function isSeasonalCosmeticAvailable(
    itemId:
      string
  ) {
    return (
      getSeasonalMonthFromId(
        itemId
      ) ===
      currentSeasonalMonth
    );
  }


  const unlockedCosmetics =
    useMemo<
      CosmeticItem[]
    >(() => {
      const progressionCosmetics =
        getUnlockedCosmetics(
          currentLevel
        );


      const currentMonthSeasonalCosmetics =
        seasonalCosmetics.filter(
          (
            item:
              CosmeticItem
          ) =>
            isSeasonalCosmeticAvailable(
              item.id
            )
        );


      return [
        ...progressionCosmetics,
        ...currentMonthSeasonalCosmetics,
      ].filter(
        (
          item:
            CosmeticItem,
          index:
            number,
          allItems:
            CosmeticItem[]
        ) =>
          allItems.findIndex(
            (
              candidate:
                CosmeticItem
            ) =>
              candidate.id ===
              item.id
          ) ===
          index
      );
    }, [
      currentLevel,
      currentSeasonalMonth,
      seasonalCosmetics,
    ]);


  const unlockedCosmeticIds =
    useMemo<
      Set<string>
    >(() => {
      return new Set(
        unlockedCosmetics.map(
          (
            item:
              CosmeticItem
          ) =>
            item.id
        )
      );
    }, [
      unlockedCosmetics,
    ]);


  const prestige =
    useMemo(() => {
      return getPrestigeDisplay(
        currentLevel
      );
    }, [
      currentLevel,
    ]);


  useEffect(() => {
    const saved =
      readSavedCharacter();


    setIdentity(
      saved.identity
    );


    setLoadout(
      saved.loadout
    );


    setHasLoaded(
      true
    );
  }, []);


  useEffect(() => {
    if (!hasLoaded) {
      return;
    }


    const saved:
      SavedCharacterData = {
      identity,

      loadout,
    };


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        saved
      )
    );
  }, [
    identity,
    loadout,
    hasLoaded,
  ]);


  useEffect(() => {
    if (!hasLoaded) {
      return;
    }


    const equippedSeasonal =
      seasonalCosmetics.some(
        (
          item:
            CosmeticItem
        ) =>
          item.id ===
          loadout.background
      );


    if (
      equippedSeasonal &&
      !isSeasonalCosmeticAvailable(
        loadout.background
      )
    ) {
      setLoadout(
        (
          old:
            CharacterLoadout
        ) => ({
          ...old,

          background:
            defaultLoadout.background,
        })
      );
    }
  }, [
    currentSeasonalMonth,
    hasLoaded,
    loadout.background,
    seasonalCosmetics,
  ]);


  useEffect(() => {
    if (!hasLoaded) {
      return;
    }


    setLoadout(
      (
        old:
          CharacterLoadout
      ) => {
        let changed =
          false;


        const next:
          CharacterLoadout = {
          ...old,
        };


        (
          [
            "outfit",
            "background",
            "frame",
            "accessory",
            "pose",
            "aura",
            "heldItem",
            "sceneEffect",
          ] as
            CosmeticCategory[]
        ).forEach(
          (
            category:
              CosmeticCategory
          ) => {
            const itemId =
              next[
                category
              ];


            if (
              itemId ===
              "none"
            ) {
              return;
            }


            if (
              unlockedCosmeticIds.has(
                itemId
              )
            ) {
              return;
            }


            next[
              category
            ] =
              getDefaultItemId(
                category
              );


            changed =
              true;
          }
        );


        return changed
          ? next
          : old;
      }
    );
  }, [
    hasLoaded,
    unlockedCosmeticIds,
  ]);


  function updateHeldItemHand(
    hand:
      HeldItemHand
  ) {
    setLoadout(
      (
        old:
          CharacterLoadout
      ) => ({
        ...old,

        heldItemHand:
          hand,
      })
    );
  }


  function updateIdentity<
    Key extends keyof CharacterIdentity
  >(
    key: Key,
    value:
      CharacterIdentity[Key]
  ) {
    setIdentity(
      (
        old:
          CharacterIdentity
      ) => ({
        ...old,

        [key]:
          value,
      })
    );
  }


  function isCosmeticUnlocked(
    itemId:
      string
  ) {
    if (
      itemId ===
      "none"
    ) {
      return true;
    }


    const seasonalItem =
      seasonalCosmetics.some(
        (
          item:
            CosmeticItem
        ) =>
          item.id ===
          itemId
      );


    if (seasonalItem) {
      return isSeasonalCosmeticAvailable(
        itemId
      );
    }


    return unlockedCosmeticIds.has(
      itemId
    );
  }


  function isCosmeticEquipped(
    itemId:
      string
  ) {
    if (
      itemId ===
      "none"
    ) {
      return optionalCategories.some(
        (
          category:
            CosmeticCategory
        ) =>
          loadout[
            category
          ] ===
          "none"
      );
    }


    const item =
      getCharacterCosmeticById(
        itemId
      );


    if (!item) {
      return false;
    }


    return (
      loadout[
        item.category
      ] ===
      item.id
    );
  }


  function equipCosmetic(
    itemId:
      string
  ) {
    const item =
      getCharacterCosmeticById(
        itemId
      );


    if (!item) {
      return;
    }


    if (
      !isCosmeticUnlocked(
        item.id
      )
    ) {
      return;
    }


    setLoadout(
      (
        old:
          CharacterLoadout
      ) => ({
        ...old,

        [item.category]:
          item.id,
      })
    );
  }


  function toggleCosmetic(
    itemId:
      string
  ) {
    const item =
      getCharacterCosmeticById(
        itemId
      );


    if (!item) {
      return;
    }


    if (
      !isCosmeticUnlocked(
        item.id
      )
    ) {
      return;
    }


    setLoadout(
      (
        old:
          CharacterLoadout
      ) => {
        const currentlyEquipped =
          old[
            item.category
          ] ===
          item.id;


        if (
          currentlyEquipped
        ) {
          return {
            ...old,

            [item.category]:
              getDefaultItemId(
                item.category
              ),
          };
        }


        return {
          ...old,

          [item.category]:
            item.id,
        };
      }
    );
  }


  function clearCosmetic(
    category:
      CosmeticCategory
  ) {
    setLoadout(
      (
        old:
          CharacterLoadout
      ) => ({
        ...old,

        [category]:
          getDefaultItemId(
            category
          ),
      })
    );
  }


  function resetCategoryToDefault(
    category:
      CosmeticCategory
  ) {
    clearCosmetic(
      category
    );
  }


  function getEquippedCosmetic(
    category:
      CosmeticCategory
  ):
    CosmeticItem | null {
    const itemId =
      loadout[
        category
      ];


    if (
      itemId ===
      "none"
    ) {
      return null;
    }


    return (
      getCharacterCosmeticById(
        itemId
      ) ??
      null
    );
  }


  async function resetCharacter() {
    const confirmed =
      await confirm({
        title: "Reset character appearance?",
        description:
          "Your identity and equipped cosmetics will return to their defaults. Unlocks and progression will not be deleted.",
        confirmLabel: "Reset appearance",
        tone: "warning",
      });


    if (!confirmed) {
      return;
    }


    setIdentity(
      cloneDefaultIdentity()
    );


    setLoadout(
      cloneDefaultLoadout()
    );
  }


  return (
    <CharacterContext.Provider
      value={{
        identity,

        loadout,

        unlockedCosmetics,

        seasonalCosmetics,

        currentSeasonalMonth,

        isSeasonalCosmeticAvailable,

        currentLevel,

        currentTier,

        prestigeStars:
          prestige.stars,

        prestigeDisplay:
          prestige.starDisplay,

        hasCrown:
          prestige.crown,

        updateHeldItemHand,

        updateIdentity,

        equipCosmetic,

        toggleCosmetic,

        clearCosmetic,

        resetCategoryToDefault,

        isCosmeticUnlocked,

        isCosmeticEquipped,

        getEquippedCosmetic,

        resetCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}


export function useCharacter():
  CharacterContextType {
  const context =
    useContext(
      CharacterContext
    );


  if (!context) {
    throw new Error(
      "useCharacter must be used inside CharacterProvider"
    );
  }


  return context;
}
