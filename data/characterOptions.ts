export type CharacterGender =
  | "male"
  | "female";


export type SkinTone =
  | "tone-1"
  | "tone-2"
  | "tone-3"
  | "tone-4"
  | "tone-5"
  | "tone-6"
  | "tone-7"
  | "tone-8";


export type HairStyle =
  | "short"
  | "medium"
  | "long"
  | "curly"
  | "wavy"
  | "ponytail"
  | "buzz"
  | "bald";


export type HairColor =
  | "black"
  | "brown"
  | "blonde"
  | "red"
  | "gray"
  | "white";


export type GlassesStyle =
  | "none"
  | "round"
  | "square"
  | "aviator";


export type EarringStyle =
  | "none"
  | "stud"
  | "hoop";


export type CosmeticCategory =
  | "outfit"
  | "background"
  | "frame"
  | "accessory"
  | "pose"
  | "aura"
  | "heldItem"
  | "sceneEffect";


export type CosmeticTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Legendary";


export type HeldItemHand =
  | "left"
  | "right";


export type CosmeticAnimation =
  | "none"
  | "sparkles"
  | "flames"
  | "energy"
  | "rain"
  | "snow"
  | "petals"
  | "embers"
  | "stars"
  | "aurora"
  | "lightning"
  | "mist"
  | "frame-flow";


export interface CharacterIdentity {
  gender:
    CharacterGender;

  skinTone:
    SkinTone;

  hairStyle:
    HairStyle;

  hairColor:
    HairColor;

  glasses:
    GlassesStyle;

  earrings:
    EarringStyle;
}


export interface CosmeticItem {
  id:
    string;

  name:
    string;

  category:
    CosmeticCategory;

  tier:
    CosmeticTier;

  requiredLevel:
    number;

  icon:
    string;

  description:
    string;

  visualId:
    string;

  animation:
    CosmeticAnimation;

  animated:
    boolean;

  isDefault:
    boolean;
}


export interface CharacterLoadout {
  outfit:
    string;

  background:
    string;

  frame:
    string;

  accessory:
    string;

  pose:
    string;

  aura:
    string;

  heldItem:
    string;

  heldItemHand:
    HeldItemHand;

  sceneEffect:
    string;
}


export interface LevelReward {
  level:
    number;

  tier:
    CosmeticTier;

  tierStart:
    boolean;

  cosmetics:
    CosmeticItem[];
}


export const defaultIdentity:
  CharacterIdentity = {
  gender:
    "male",

  skinTone:
    "tone-4",

  hairStyle:
    "short",

  hairColor:
    "brown",

  glasses:
    "none",

  earrings:
    "none",
};


export const defaultLoadout:
  CharacterLoadout = {
  outfit:
    "default-outfit",

  background:
    "default-background",

  frame:
    "none",

  accessory:
    "none",

  pose:
    "default-pose",

  aura:
    "none",

  heldItem:
    "none",

  heldItemHand:
    "right",

  sceneEffect:
    "none",
};


export const identityOptions = {
  genders: [
    {
      id:
        "male",

      name:
        "Male",
    },

    {
      id:
        "female",

      name:
        "Female",
    },
  ] as {
    id:
      CharacterGender;

    name:
      string;
  }[],


  skinTones: [
    {
      id:
        "tone-1",

      name:
        "Tone 1",

      color:
        "#f8d9c3",
    },

    {
      id:
        "tone-2",

      name:
        "Tone 2",

      color:
        "#efc3a4",
    },

    {
      id:
        "tone-3",

      name:
        "Tone 3",

      color:
        "#dca27f",
    },

    {
      id:
        "tone-4",

      name:
        "Tone 4",

      color:
        "#c6865f",
    },

    {
      id:
        "tone-5",

      name:
        "Tone 5",

      color:
        "#a96745",
    },

    {
      id:
        "tone-6",

      name:
        "Tone 6",

      color:
        "#875033",
    },

    {
      id:
        "tone-7",

      name:
        "Tone 7",

      color:
        "#633b27",
    },

    {
      id:
        "tone-8",

      name:
        "Tone 8",

      color:
        "#43291d",
    },
  ] as {
    id:
      SkinTone;

    name:
      string;

    color:
      string;
  }[],


  hairStyles: [
    {
      id:
        "short",

      name:
        "Short",
    },

    {
      id:
        "medium",

      name:
        "Medium",
    },

    {
      id:
        "long",

      name:
        "Long",
    },

    {
      id:
        "curly",

      name:
        "Curly",
    },

    {
      id:
        "wavy",

      name:
        "Wavy",
    },

    {
      id:
        "ponytail",

      name:
        "Ponytail",
    },

    {
      id:
        "buzz",

      name:
        "Buzz Cut",
    },

    {
      id:
        "bald",

      name:
        "Bald",
    },
  ] as {
    id:
      HairStyle;

    name:
      string;
  }[],


  hairColors: [
    {
      id:
        "black",

      name:
        "Black",

      color:
        "#18181b",
    },

    {
      id:
        "brown",

      name:
        "Brown",

      color:
        "#5f3a25",
    },

    {
      id:
        "blonde",

      name:
        "Blonde",

      color:
        "#e7c66b",
    },

    {
      id:
        "red",

      name:
        "Red",

      color:
        "#9f3b22",
    },

    {
      id:
        "gray",

      name:
        "Gray",

      color:
        "#a1a1aa",
    },

    {
      id:
        "white",

      name:
        "White",

      color:
        "#f4f4f5",
    },
  ] as {
    id:
      HairColor;

    name:
      string;

    color:
      string;
  }[],


  glasses: [
    {
      id:
        "none",

      name:
        "None",

      icon:
        "🚫",
    },

    {
      id:
        "round",

      name:
        "Round",

      icon:
        "👓",
    },

    {
      id:
        "square",

      name:
        "Square",

      icon:
        "👓",
    },

    {
      id:
        "aviator",

      name:
        "Aviator",

      icon:
        "🕶️",
    },
  ] as {
    id:
      GlassesStyle;

    name:
      string;

    icon:
      string;
  }[],


  earrings: [
    {
      id:
        "none",

      name:
        "None",

      icon:
        "🚫",
    },

    {
      id:
        "stud",

      name:
        "Stud",

      icon:
        "💎",
    },

    {
      id:
        "hoop",

      name:
        "Hoop",

      icon:
        "⭕",
    },
  ] as {
    id:
      EarringStyle;

    name:
      string;

    icon:
      string;
  }[],
};


export const tierStartLevels:
  Record<
    CosmeticTier,
    number
  > = {
  Bronze:
    1,

  Silver:
    10,

  Gold:
    21,

  Platinum:
    34,

  Diamond:
    49,

  Master:
    66,

  Legendary:
    83,
};


export const tierCategories:
  Record<
    CosmeticTier,
    CosmeticCategory[]
  > = {
  Bronze: [
    "outfit",
    "background",
    "frame",
    "accessory",
  ],

  Silver: [
    "outfit",
    "background",
    "frame",
    "accessory",
    "pose",
  ],

  Gold: [
    "outfit",
    "background",
    "frame",
    "accessory",
    "pose",
    "aura",
  ],

  Platinum: [
    "outfit",
    "background",
    "frame",
    "accessory",
    "pose",
    "aura",
    "heldItem",
  ],

  Diamond: [
    "outfit",
    "background",
    "frame",
    "accessory",
    "pose",
    "aura",
    "heldItem",
    "sceneEffect",
  ],

  Master: [
    "outfit",
    "background",
    "frame",
    "accessory",
    "pose",
    "aura",
    "heldItem",
    "sceneEffect",
  ],

  Legendary: [
    "outfit",
    "background",
    "frame",
    "accessory",
    "pose",
    "aura",
    "heldItem",
    "sceneEffect",
  ],
};


const categoryNames:
  Record<
    CosmeticCategory,
    string
  > = {
  outfit:
    "Outfit",

  background:
    "Background",

  frame:
    "Frame",

  accessory:
    "Accessory",

  pose:
    "Pose",

  aura:
    "Aura",

  heldItem:
    "Held Item",

  sceneEffect:
    "Scene Effect",
};


const categoryIcons:
  Record<
    CosmeticCategory,
    string[]
  > = {
  outfit: [
    "🥋",
    "🧥",
    "🛡️",
  ],

  background: [
    "🌄",
    "🏙️",
    "🌈",
  ],

  frame: [
    "🌿",
    "🚘",
    "💎",
  ],

  accessory: [
    "🎒",
    "🎧",
    "🪽",
  ],

  pose: [
    "🧍",
    "💪",
    "🧘",
  ],

  aura: [
    "⭕",
    "🪐",
    "🔥",
  ],

  heldItem: [
    "📖",
    "📷",
    "⚔️",
  ],

  sceneEffect: [
    "🌧️",
    "❄️",
    "🌸",
  ],
};


const defaultCosmetics:
  CosmeticItem[] = [
  {
    id:
      "default-outfit",

    name:
      "Default Outfit",

    category:
      "outfit",

    tier:
      "Bronze",

    requiredLevel:
      1,

    icon:
      "👕",

    description:
      "A simple neutral outfit available from the beginning.",

    visualId:
      "default-outfit",

    animation:
      "none",

    animated:
      false,

    isDefault:
      true,
  },

  {
    id:
      "default-background",

    name:
      "Default Studio",

    category:
      "background",

    tier:
      "Bronze",

    requiredLevel:
      1,

    icon:
      "⬛",

    description:
      "A clean neutral studio background.",

    visualId:
      "default-background",

    animation:
      "none",

    animated:
      false,

    isDefault:
      true,
  },

  {
    id:
      "default-pose",

    name:
      "Default Standing",

    category:
      "pose",

    tier:
      "Bronze",

    requiredLevel:
      1,

    icon:
      "🧍",

    description:
      "The standard standing pose.",

    visualId:
      "default-pose",

    animation:
      "none",

    animated:
      false,

    isDefault:
      true,
  },
];


const tierDescriptions:
  Record<
    CosmeticTier,
    string
  > = {
  Bronze:
    "Grounded starter cosmetics.",

  Silver:
    "Polished cosmetics with more personality.",

  Gold:
    "Prestigious cosmetics with stronger visual detail.",

  Platinum:
    "Premium cosmetics with advanced design.",

  Diamond:
    "Rare cosmetics with dramatic visual effects.",

  Master:
    "Master cosmetics with permanent animated clothing.",

  Legendary:
    "Legendary cosmetics with the highest-detail designs.",
};


const outfitVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-traveler",
    "bronze-denim-jacket",
    "bronze-scout-armor",
  ],

  Silver: [
    "silver-tailored-suit",
    "silver-winter-coat",
    "silver-royal-guard",
  ],

  Gold: [
    "gold-martial-robe",
    "gold-commander-coat",
    "gold-temple-armor",
  ],

  Platinum: [
    "platinum-techwear",
    "platinum-longcoat",
    "platinum-paladin",
  ],

  Diamond: [
    "diamond-crystal-robe",
    "diamond-frost-coat",
    "diamond-guardian-armor",
  ],

  Master: [
    "master-sparkle-robes",
    "master-flame-coat",
    "master-energy-armor",
  ],

  Legendary: [
    "legendary-celestial-robes",
    "legendary-inferno-king",
    "legendary-cosmic-armor",
  ],
};


const backgroundVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-country-road",
    "bronze-small-town",
    "bronze-pride",
  ],

  Silver: [
    "silver-snow-village",
    "silver-harbor",
    "silver-cathedral",
  ],

  Gold: [
    "gold-desert-temple",
    "gold-sunset-city",
    "gold-autumn-forest",
  ],

  Platinum: [
    "platinum-modern-city",
    "platinum-mountain-lodge",
    "platinum-neon-street",
  ],

  Diamond: [
    "diamond-crystal-cavern",
    "diamond-aurora-mountains",
    "diamond-floating-islands",
  ],

  Master: [
    "master-storm-citadel",
    "master-lava-palace",
    "master-magic-library",
  ],

  Legendary: [
    "legendary-cosmic-kingdom",
    "legendary-aurora-realm",
    "legendary-solar-sanctuary",
  ],
};


const frameVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-wood-branches",
    "bronze-license-plate",
    "bronze-rope-and-badges",
  ],

  Silver: [
    "silver-frosted-steel",
    "silver-cathedral-arches",
    "silver-wolf-crest",
  ],

  Gold: [
    "gold-laurel-frame",
    "gold-sun-emblem",
    "gold-royal-banner",
  ],

  Platinum: [
    "platinum-industrial-rivets",
    "platinum-neon-tubes",
    "platinum-winged-frame",
  ],

  Diamond: [
    "diamond-crystal-shards",
    "diamond-ice-crown",
    "diamond-prismatic-edge",
  ],

  Master: [
    "master-rune-frame",
    "master-flame-pillars",
    "master-orbit-frame",
  ],

  Legendary: [
    "legendary-celestial-gate",
    "legendary-dragon-frame",
    "legendary-crown-frame",
  ],
};


const accessoryVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-backpack",
    "bronze-bandana",
    "bronze-scout-badge",
  ],

  Silver: [
    "silver-headphones",
    "silver-scarf",
    "silver-shoulder-cape",
  ],

  Gold: [
    "gold-chain",
    "gold-commander-cape",
    "gold-halo-circlet",
  ],

  Platinum: [
    "platinum-tech-visor",
    "platinum-jetpack",
    "platinum-shoulder-drone",
  ],

  Diamond: [
    "diamond-crystal-wings",
    "diamond-floating-crown",
    "diamond-ice-mantle",
  ],

  Master: [
    "master-rune-wings",
    "master-fire-cape",
    "master-star-orbit",
  ],

  Legendary: [
    "legendary-angel-wings",
    "legendary-dragon-wings",
    "legendary-celestial-crown",
  ],
};


const poseVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-neutral-ready",
    "bronze-trail-lean",
    "bronze-explorer-point",
  ],

  Silver: [
    "silver-arms-crossed",
    "silver-thinking",
    "silver-victory-salute",
  ],

  Gold: [
    "gold-double-biceps",
    "gold-prayer-stance",
    "gold-swordmaster-guard",
  ],

  Platinum: [
    "platinum-photographer-crouch",
    "platinum-guitar-performance",
    "platinum-hero-landing",
  ],

  Diamond: [
    "diamond-levitation",
    "diamond-power-charge",
    "diamond-meditation-float",
  ],

  Master: [
    "master-pushup-loop",
    "master-pullup-loop",
    "master-jumping-jack-loop",
  ],

  Legendary: [
    "legendary-combat-combo",
    "legendary-power-leap",
    "legendary-champion-ascension",
  ],
};


const auraVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-soft-glow",
    "bronze-ring",
    "bronze-dust",
  ],

  Silver: [
    "silver-mist",
    "silver-wind-ring",
    "silver-moon-glow",
  ],

  Gold: [
    "gold-sunburst",
    "gold-orbit",
    "gold-flame-aura",
  ],

  Platinum: [
    "platinum-neon-field",
    "platinum-electric-ring",
    "platinum-hologram",
  ],

  Diamond: [
    "diamond-crystal-aura",
    "diamond-lightning",
    "diamond-ice-field",
  ],

  Master: [
    "master-rune-circle",
    "master-rising-fire",
    "master-star-field",
  ],

  Legendary: [
    "legendary-cosmic-aura",
    "legendary-solar-aura",
    "legendary-celestial-storm",
  ],
};


const heldItemVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-book",
    "bronze-lantern",
    "bronze-hatchet",
  ],

  Silver: [
    "silver-camera",
    "silver-banner",
    "silver-shield",
  ],

  Gold: [
    "gold-guitar",
    "gold-sword",
    "gold-staff",
  ],

  Platinum: [
    "platinum-tablet",
    "platinum-energy-blade",
    "platinum-drone-controller",
  ],

  Diamond: [
    "diamond-crystal-sword",
    "diamond-orb",
    "diamond-frost-bow",
  ],

  Master: [
    "master-flame-blade",
    "master-rune-book",
    "master-lightning-hammer",
  ],

  Legendary: [
    "legendary-celestial-sword",
    "legendary-crown-staff",
    "legendary-cosmic-orb",
  ],
};


const sceneEffectVisuals:
  Record<
    CosmeticTier,
    string[]
  > = {
  Bronze: [
    "bronze-leaves",
    "bronze-dust",
    "bronze-fireflies",
  ],

  Silver: [
    "silver-rain",
    "silver-snow",
    "silver-mist",
  ],

  Gold: [
    "gold-petals",
    "gold-embers",
    "gold-sun-particles",
  ],

  Platinum: [
    "platinum-neon-rain",
    "platinum-hologram-particles",
    "platinum-electric-arcs",
  ],

  Diamond: [
    "diamond-blizzard",
    "diamond-supercell-storm",
    "diamond-meteor-shower",
  ],

  Master: [
    "master-dragon-flight",
    "master-air-show",
    "master-orbital-battle",
  ],

  Legendary: [
    "legendary-celestial-eclipse",
    "legendary-ancient-titan",
    "legendary-reality-collapse",
  ],
};


function getVisualId(
  tier:
    CosmeticTier,

  category:
    CosmeticCategory,

  itemNumber:
    number
) {
  const index =
    itemNumber - 1;


  switch (category) {
    case "outfit":
      return outfitVisuals[
        tier
      ][index];


    case "background":
      return backgroundVisuals[
        tier
      ][index];


    case "frame":
      return frameVisuals[
        tier
      ][index];


    case "accessory":
      return accessoryVisuals[
        tier
      ][index];


    case "pose":
      return poseVisuals[
        tier
      ][index];


    case "aura":
      return auraVisuals[
        tier
      ][index];


    case "heldItem":
      return heldItemVisuals[
        tier
      ][index];


    case "sceneEffect":
      return sceneEffectVisuals[
        tier
      ][index];


    default:
      return `${tier.toLowerCase()}-${category}-${itemNumber}`;
  }
}


function getAnimation(
  tier:
    CosmeticTier,

  category:
    CosmeticCategory,

  itemNumber:
    number
): CosmeticAnimation {
  if (
    category ===
    "outfit"
  ) {
    if (
      tier ===
      "Master"
    ) {
      if (
        itemNumber ===
        1
      ) {
        return "sparkles";
      }

      if (
        itemNumber ===
        2
      ) {
        return "flames";
      }

      return "energy";
    }


    if (
      tier ===
      "Legendary"
    ) {
      if (
        itemNumber ===
        1
      ) {
        return "stars";
      }

      if (
        itemNumber ===
        2
      ) {
        return "flames";
      }

      return "energy";
    }
  }


  if (
    category ===
    "background"
  ) {
    if (
      tier ===
      "Master"
    ) {
      if (
        itemNumber ===
        1
      ) {
        return "lightning";
      }

      if (
        itemNumber ===
        2
      ) {
        return "embers";
      }

      return "sparkles";
    }


    if (
      tier ===
      "Legendary"
    ) {
      if (
        itemNumber ===
        1
      ) {
        return "stars";
      }

      if (
        itemNumber ===
        2
      ) {
        return "aurora";
      }

      return "energy";
    }
  }


  if (
    category ===
    "sceneEffect" &&
    (
      tier ===
        "Diamond" ||
      tier ===
        "Master" ||
      tier ===
        "Legendary"
    )
  ) {
    return "energy";
  }


  if (
    category ===
    "heldItem" &&
    (
      tier ===
        "Master" ||
      tier ===
        "Legendary"
    )
  ) {
    return "energy";
  }


  if (
    category ===
    "aura" &&
    (
      tier ===
        "Master" ||
      tier ===
        "Legendary"
    )
  ) {
    return "energy";
  }


  if (
    category ===
    "pose" &&
    (
      tier ===
        "Master" ||
      tier ===
        "Legendary"
    )
  ) {
    return "energy";
  }


  if (
    category ===
    "frame" &&
    (
      tier ===
        "Master" ||
      tier ===
        "Legendary"
    )
  ) {
    return "frame-flow";
  }


  if (
    category ===
    "sceneEffect"
  ) {
    const visualId =
      getVisualId(
        tier,
        category,
        itemNumber
      );


    if (
      visualId.includes(
        "rain"
      )
    ) {
      return "rain";
    }


    if (
      visualId.includes(
        "snow"
      )
    ) {
      return "snow";
    }


    if (
      visualId.includes(
        "petal"
      )
    ) {
      return "petals";
    }


    if (
      visualId.includes(
        "ember"
      )
    ) {
      return "embers";
    }


    if (
      visualId.includes(
        "lightning"
      )
    ) {
      return "lightning";
    }


    if (
      visualId.includes(
        "mist"
      )
    ) {
      return "mist";
    }


    return "sparkles";
  }


  return "none";
}


function createCosmetic(
  tier:
    CosmeticTier,

  category:
    CosmeticCategory,

  itemNumber:
    number,

  requiredLevel:
    number
): CosmeticItem {
  const visualId =
    getVisualId(
      tier,
      category,
      itemNumber
    );


  const animation =
    getAnimation(
      tier,
      category,
      itemNumber
    );


  const specialName =
    visualId
      .split("-")
      .slice(1)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");


  return {
    id:
      `${tier.toLowerCase()}-${category}-${itemNumber}`,

    name:
      specialName ||
      `${tier} ${categoryNames[category]} ${itemNumber}`,

    category,

    tier,

    requiredLevel,

    icon:
      categoryIcons[
        category
      ][
        itemNumber - 1
      ],

    description:
      tierDescriptions[
        tier
      ],

    visualId,

    animation,

    animated:
      animation !==
      "none",

    isDefault:
      false,
  };
}


const tierOrder:
  CosmeticTier[] = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Legendary",
];


function buildEarnedCosmetics() {
  const items:
    CosmeticItem[] = [];


  tierOrder.forEach(
    (
      tier,
      tierIndex
    ) => {
      const tierStart =
        tierStartLevels[
          tier
        ];


      const categories =
        tierCategories[
          tier
        ];


      categories.forEach(
        (category) => {
          items.push(
            createCosmetic(
              tier,
              category,
              1,
              tierStart
            )
          );
        }
      );


      let rewardLevel =
        tierStart + 1;


      for (
        let itemNumber = 2;
        itemNumber <= 3;
        itemNumber++
      ) {
        categories.forEach(
          (category) => {
            items.push(
              createCosmetic(
                tier,
                category,
                itemNumber,
                rewardLevel
              )
            );

            rewardLevel +=
              1;
          }
        );
      }


      const nextTier =
        tierOrder[
          tierIndex + 1
        ];


      if (nextTier) {
        const expectedNextLevel =
          tierStartLevels[
            nextTier
          ];


        if (
          rewardLevel !==
          expectedNextLevel
        ) {
          throw new Error(
            `${tier} progression does not end immediately before ${nextTier}.`
          );
        }
      } else if (
        rewardLevel !==
        100
      ) {
        throw new Error(
          "Legendary progression must finish at Level 99."
        );
      }
    }
  );


  return items;
}


export const cosmeticItems:
  CosmeticItem[] = [
  ...defaultCosmetics,

  ...buildEarnedCosmetics(),
];


export const levelRewards:
  LevelReward[] =
  Array.from(
    {
      length:
        99,
    },

    (
      _,
      index
    ) => {
      const level =
        index + 1;


      const tier =
        getTierForLevel(
          level
        );


      return {
        level,

        tier,

        tierStart:
          tierStartLevels[
            tier
          ] ===
          level,

        cosmetics:
          cosmeticItems.filter(
            (item) =>
              !item.isDefault &&
              item.requiredLevel ===
                level
          ),
      };
    }
  );


export function getTierForLevel(
  level:
    number
): CosmeticTier {
  if (
    level >=
    83
  ) {
    return "Legendary";
  }


  if (
    level >=
    66
  ) {
    return "Master";
  }


  if (
    level >=
    49
  ) {
    return "Diamond";
  }


  if (
    level >=
    34
  ) {
    return "Platinum";
  }


  if (
    level >=
    21
  ) {
    return "Gold";
  }


  if (
    level >=
    10
  ) {
    return "Silver";
  }


  return "Bronze";
}


export function getCosmeticsUnlockedAtLevel(
  level:
    number
) {
  return cosmeticItems.filter(
    (item) =>
      !item.isDefault &&
      item.requiredLevel ===
        level
  );
}


export function getUnlockedCosmetics(
  level:
    number
) {
  return cosmeticItems.filter(
    (item) =>
      item.isDefault ||
      item.requiredLevel <=
        level
  );
}


export function getUnlockedCosmeticsByCategory(
  level:
    number,

  category:
    CosmeticCategory
) {
  return cosmeticItems.filter(
    (item) =>
      item.category ===
        category &&
      (
        item.isDefault ||
        item.requiredLevel <=
          level
      )
  );
}


export function getCosmeticById(
  itemId:
    string
) {
  return (
    cosmeticItems.find(
      (item) =>
        item.id ===
        itemId
    ) ??
    null
  );
}


export function getDefaultCosmeticForCategory(
  category:
    CosmeticCategory
) {
  return (
    defaultCosmetics.find(
      (item) =>
        item.category ===
        category
    ) ??
    null
  );
}


export function getPrestigeStars(
  level:
    number
) {
  if (
    level >=
    900
  ) {
    return 5;
  }


  if (
    level >=
    700
  ) {
    return 4;
  }


  if (
    level >=
    500
  ) {
    return 3;
  }


  if (
    level >=
    300
  ) {
    return 2;
  }


  if (
    level >=
    100
  ) {
    return 1;
  }


  return 0;
}


export function hasCrown(
  level:
    number
) {
  return level >=
    1000;
}


export function getPrestigeDisplay(
  level:
    number
) {
  const stars =
    getPrestigeStars(
      level
    );


  return {
    stars,

    starDisplay:
      `${"★".repeat(
        stars
      )}${"☆".repeat(
        5 - stars
      )}`,

    crown:
      hasCrown(
        level
      ),
  };
}