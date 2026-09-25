"use client";

import {
  ReactNode,
} from "react";

import {
  useAchievements,
} from "@/context/AchievementContext";

import {
  useCharacter,
} from "@/context/CharacterContext";

import {
  useGame,
} from "@/context/GameContext";

import {
  CharacterIdentity,
  CharacterLoadout,
  CosmeticAnimation,
  CosmeticCategory,
  CosmeticItem,
  CosmeticTier,
  HeldItemHand,
  defaultIdentity,
  defaultLoadout,
  getCosmeticById,
  getPrestigeDisplay,
  getTierForLevel,
} from "@/data/characterOptions";

import SeasonalBackground from "@/components/SeasonalBackground";

import {
  seasonalBackgrounds,
} from "@/data/seasonalBackgrounds";


export interface CharacterDisplaySnapshot {
  name:
    string;

  title:
    string;

  level:
    number;

  identity:
    CharacterIdentity;

  loadout:
    CharacterLoadout;
}


interface CharacterDisplayProps {
  compact?: boolean;

  scale?: number;

  showName?: boolean;

  showTitle?: boolean;

  showLevel?: boolean;

  snapshot?:
    CharacterDisplaySnapshot;
}


type CharacterPose = {
  torsoX: number;

  torsoY: number;

  torsoRotation: number;

  leftArm:
    | "down"
    | "hip"
    | "cross"
    | "up"
    | "forward"
    | "prayer";

  rightArm:
    | "down"
    | "hip"
    | "cross"
    | "up"
    | "forward"
    | "prayer";

  legs:
    | "standing"
    | "wide"
    | "kneeling"
    | "crossed"
    | "floating";

  characterScale: number;
};


const skinToneColors = {
  "tone-1": "#f8d9c3",
  "tone-2": "#efc3a4",
  "tone-3": "#dca27f",
  "tone-4": "#c6865f",
  "tone-5": "#a96745",
  "tone-6": "#875033",
  "tone-7": "#633b27",
  "tone-8": "#43291d",
};


const hairColors = {
  black: "#18181b",
  brown: "#5f3a25",
  blonde: "#e7c66b",
  red: "#9f3b22",
  gray: "#a1a1aa",
  white: "#f4f4f5",
};


const tierColors:
  Record<
    CosmeticTier,
    {
      primary: string;
      secondary: string;
      highlight: string;
      dark: string;
    }
  > = {
  Bronze: {
    primary: "#b45309",
    secondary: "#78350f",
    highlight: "#fb923c",
    dark: "#431407",
  },

  Silver: {
    primary: "#cbd5e1",
    secondary: "#64748b",
    highlight: "#f8fafc",
    dark: "#1e293b",
  },

  Gold: {
    primary: "#facc15",
    secondary: "#a16207",
    highlight: "#fef08a",
    dark: "#422006",
  },

  Platinum: {
    primary: "#e2e8f0",
    secondary: "#64748b",
    highlight: "#ffffff",
    dark: "#1e293b",
  },

  Diamond: {
    primary: "#67e8f9",
    secondary: "#0891b2",
    highlight: "#cffafe",
    dark: "#164e63",
  },

  Master: {
    primary: "#c084fc",
    secondary: "#7e22ce",
    highlight: "#f3e8ff",
    dark: "#3b0764",
  },

  Legendary: {
    primary: "#fbbf24",
    secondary: "#dc2626",
    highlight: "#fef3c7",
    dark: "#450a0a",
  },
};


const heldItemEmoji:
  Record<string, string> = {
  "bronze-book": "📖",
  "bronze-lantern": "🏮",
  "bronze-hatchet": "🪓",

  "silver-camera": "📷",
  "silver-banner": "🚩",
  "silver-shield": "🛡️",

  "gold-guitar": "🎸",
  "gold-sword": "⚔️",
  "gold-staff": "🪄",

  "platinum-tablet": "📱",
  "platinum-energy-blade": "🗡️",
  "platinum-drone-controller": "🎮",

  "diamond-crystal-sword": "💎",
  "diamond-orb": "🔮",
  "diamond-frost-bow": "🏹",

  "master-flame-blade": "🔥",
  "master-rune-book": "📕",
  "master-lightning-hammer": "🔨",

  "legendary-celestial-sword": "🗡️",
  "legendary-crown-staff": "♕",
  "legendary-cosmic-orb": "🌌",
};


const accessoryEmoji:
  Record<string, string> = {
  "bronze-backpack": "🎒",
  "bronze-bandana": "🧣",
  "bronze-scout-badge": "🎖️",

  "silver-headphones": "🎧",
  "silver-scarf": "🧣",
  "silver-shoulder-cape": "🦸",

  "gold-chain": "⛓️",
  "gold-commander-cape": "🧥",
  "gold-halo-circlet": "😇",

  "platinum-tech-visor": "🥽",
  "platinum-jetpack": "🚀",
  "platinum-shoulder-drone": "🛸",

  "diamond-crystal-wings": "🪽",
  "diamond-floating-crown": "👑",
  "diamond-ice-mantle": "❄️",

  "master-rune-wings": "🪽",
  "master-fire-cape": "🔥",
  "master-star-orbit": "🌟",

  "legendary-angel-wings": "🪽",
  "legendary-dragon-wings": "🐉",
  "legendary-celestial-crown": "👑",
};


function getSnapshotCosmetic(
  loadout:
    CharacterLoadout,

  category:
    CosmeticCategory
):
  CosmeticItem | null {
  const itemId =
    loadout[
      category
    ];

  if (
    !itemId ||
    itemId ===
      "none"
  ) {
    return null;
  }

  return (
    seasonalBackgrounds.find(
      (
        item
      ) =>
        item.id ===
        itemId
    ) ??
    getCosmeticById(
      itemId
    ) ??
    null
  );
}


export default function CharacterDisplay({
  compact = false,

  scale,

  showName = true,

  showTitle = true,

  showLevel = true,

  snapshot,
}: CharacterDisplayProps) {
  const {
    player,
  } =
    useGame();


  const {
    selectedTitle,
  } =
    useAchievements();


  const {
    identity:
      ownIdentity,

    currentLevel:
      ownLevel,

    currentTier:
      ownTier,

    prestigeDisplay:
      ownPrestigeDisplay,

    hasCrown:
      ownHasCrown,

    loadout:
      ownLoadout,

    getEquippedCosmetic,
  } =
    useCharacter();


  const effectiveIdentity =
    snapshot?.identity ??
    ownIdentity ??
    defaultIdentity;


  const effectiveLoadout =
    snapshot?.loadout ??
    ownLoadout ??
    defaultLoadout;


  const effectiveLevel =
    snapshot?.level ??
    ownLevel;


  const effectiveTier =
    snapshot
      ? getTierForLevel(
          Math.min(
            effectiveLevel,
            99
          )
        )
      : ownTier;


  const effectivePrestige =
    snapshot
      ? getPrestigeDisplay(
          effectiveLevel
        ).starDisplay
      : ownPrestigeDisplay;


  const effectiveHasCrown =
    snapshot
      ? effectiveLevel >=
        1000
      : ownHasCrown;


  const effectiveName =
    snapshot?.name ??
    player.name;


  const effectiveTitle =
    snapshot?.title ??
    selectedTitle;


  function getCosmetic(
    category:
      CosmeticCategory
  ) {
    return snapshot
      ? getSnapshotCosmetic(
          effectiveLoadout,
          category
        )
      : getEquippedCosmetic(
          category
        );
  }


  const outfit =
    getCosmetic(
      "outfit"
    );


  const background =
    getCosmetic(
      "background"
    );


  const frame =
    getCosmetic(
      "frame"
    );


  const accessory =
    getCosmetic(
      "accessory"
    );


  const pose =
    getCosmetic(
      "pose"
    );


  const aura =
    getCosmetic(
      "aura"
    );


  const heldItem =
    getCosmetic(
      "heldItem"
    );


  const sceneEffect =
    getCosmetic(
      "sceneEffect"
    );


  const sceneWidth =
    420;


  const sceneHeight =
    540;


  const sceneScale =
    scale ??
    (
      compact
        ? 0.68
        : 1
    );


  const displayedWidth =
    sceneWidth *
    sceneScale;


  const displayedHeight =
    sceneHeight *
    sceneScale;


  return (
    <div
      className="
        flex
        flex-col
        items-center
        text-center
      "
      style={{
        width:
          `${displayedWidth}px`,
      }}
    >
      <CharacterAnimationStyles />


      <div
        className="
          relative
          shrink-0
        "
        style={{
          width:
            `${displayedWidth}px`,

          height:
            `${displayedHeight}px`,
        }}
      >
        <div
          className="
            absolute
            left-0
            top-0

            isolate

            overflow-hidden
            rounded-[2.5rem]
            bg-black

            origin-top-left
          "
          style={{
            width:
              `${sceneWidth}px`,

            height:
              `${sceneHeight}px`,

            transform:
              `scale(${sceneScale})`,
          }}
        >
          <BackgroundLayer
            item={
              background
            }
          />


          <BackgroundAnimation
            item={
              background
            }
          />


          <AuraLayer
            item={
              aura
            }
          />


          <div
            className="
              absolute
              bottom-[58px]
              left-1/2
              z-10

              h-9
              w-48

              -translate-x-1/2

              rounded-full
              bg-black/55
              blur-lg
            "
          />


          <div
            className="
              absolute
              bottom-[60px]
              left-1/2
              z-20

              -translate-x-1/2
            "
          >
            <CharacterFigure
              gender={
                effectiveIdentity.gender
              }
              skinColor={
                skinToneColors[
                  effectiveIdentity.skinTone
                ]
              }
              hairColor={
                hairColors[
                  effectiveIdentity.hairColor
                ]
              }
              hairStyle={
                effectiveIdentity.hairStyle
              }
              glasses={
                effectiveIdentity.glasses
              }
              earrings={
                effectiveIdentity.earrings
              }
              outfit={
                outfit
              }
              accessory={
                accessory
              }
              heldItem={
                heldItem
              }
              heldItemHand={
                effectiveLoadout.heldItemHand
              }
              pose={
                pose
              }
            />
          </div>


          <SceneEffectLayer
            item={
              sceneEffect
            }
          />


          {effectiveLevel >=
            100 && (
            <div
              className="
                absolute
                left-1/2
                top-4
                z-[80]

                -translate-x-1/2

                whitespace-nowrap

                text-2xl
                font-black
                tracking-[0.18em]
                text-yellow-300

                drop-shadow-[0_0_12px_rgba(250,204,21,.95)]
              "
            >
              {effectivePrestige}
            </div>
          )}


          {effectiveHasCrown && (
            <div
              className="
                absolute
                left-1/2
                top-10
                z-[80]

                -translate-x-1/2

                text-5xl

                drop-shadow-[0_0_18px_rgba(250,204,21,.95)]
              "
            >
              👑
            </div>
          )}


          {frame && (
            <>
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  z-[74]

                  rounded-[2.5rem]
                "
                style={{
                  boxShadow:
                    `inset 0 0 0 8px ${tierColors[frame.tier].dark}`,
                }}
              />

              <FrameLayer
                item={
                  frame
                }
              />
            </>
          )}


          <div
            className="
              absolute
              bottom-4
              left-1/2
              z-[90]

              -translate-x-1/2

              whitespace-nowrap

              rounded-full
              border
              border-white/15

              bg-black/80

              px-4
              py-2

              text-[11px]
              font-black
              uppercase
              tracking-[0.18em]
            "
          >
            {effectiveTier} Tier
          </div>
        </div>
      </div>


      {showName && (
        <h1
          className={`
            font-black

            ${
              compact
                ? "mt-5 text-3xl"
                : "mt-7 text-5xl"
            }
          `}
        >
          {effectiveName}
        </h1>
      )}


      {showTitle && (
        <p
          className={`
            min-h-7

            font-semibold
            text-yellow-300

            ${
              compact
                ? "mt-1 text-base"
                : "mt-2 text-lg"
            }
          `}
        >
          {effectiveTitle
            ? `“${effectiveTitle}”`
            : "No title equipped"}
        </p>
      )}


      {showLevel && (
        <p
          className="
            mt-2

            text-sm
            font-bold
            uppercase
            tracking-[0.2em]
            text-zinc-500
          "
        >
          Level {effectiveLevel}
        </p>
      )}
    </div>
  );
}


function BackgroundLayer({
  item,
}: {
  item:
    CosmeticItem | null;
}) {
  if (
    item?.visualId.startsWith(
      "seasonal-"
    )
  ) {
    return (
      <SeasonalBackground
        visualId={
          item.visualId
        }
      />
    );
  }


  if (
    !item ||
    item.visualId ===
      "default-background"
  ) {
    return (
      <div
        className="
          absolute
          inset-0
          z-0

          overflow-hidden
          rounded-[2.5rem]

          bg-gradient-to-b
          from-zinc-800
          via-zinc-950
          to-black
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-[18%]

            h-64
            w-64

            -translate-x-1/2

            rounded-full
            bg-white/5
            blur-3xl
          "
        />
      </div>
    );
  }


  if (
    item.visualId ===
      "default-pride"
  ) {
    return (
      <div
        className="
          absolute
          inset-0
          z-0

          overflow-hidden
          rounded-[2.5rem]
        "
        style={{
          background:
            "linear-gradient(180deg, #e40303 0%, #e40303 16.66%, #ff8c00 16.66%, #ff8c00 33.33%, #ffed00 33.33%, #ffed00 50%, #008026 50%, #008026 66.66%, #004dff 66.66%, #004dff 83.33%, #750787 83.33%, #750787 100%)",
        }}
      >
        <div
          className="
            absolute
            inset-0

            bg-gradient-to-b
            from-white/10
            via-transparent
            to-black/35
          "
        />
      </div>
    );
  }


  return (
    <svg
      className="
        absolute
        inset-0
        z-0

        h-full
        w-full

        rounded-[2.5rem]
      "
      viewBox="0 0 420 540"
      preserveAspectRatio="none"
    >
      <BackgroundArtwork
        visualId={
          item.visualId
        }
        tier={
          item.tier
        }
      />
    </svg>
  );
}


function BackgroundArtwork({
  visualId,
  tier,
}: {
  visualId:
    string;

  tier:
    CosmeticTier;
}) {
  const colors =
    tierColors[
      tier
    ];


  switch (
    visualId
  ) {
    case "bronze-country-road":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#a9d8ff"
            middle="#f4d39a"
            bottom="#6f9f55"
          />

          <circle
            cx="333"
            cy="92"
            r="42"
            fill="#fff1ad"
          />

          <path
            d="M0 295 C80 248 145 290 214 244 C282 201 349 245 420 211 L420 540 L0 540 Z"
            fill="#638c4d"
          />

          <path
            d="M0 362 C86 311 163 363 238 320 C307 280 365 327 420 302 L420 540 L0 540 Z"
            fill="#315f36"
          />

          <path
            d="M167 540 C176 445 190 373 210 307 C231 374 251 446 270 540 Z"
            fill="#c5a477"
          />

          <path
            d="M210 540 L210 335"
            stroke="#f5e5b9"
            strokeWidth="4"
            strokeDasharray="22 18"
          />

          <Tree
            x={49}
            y={279}
            scale={0.95}
          />

          <Tree
            x={365}
            y={296}
            scale={0.72}
          />

          <rect
            x="49"
            y="345"
            width="72"
            height="48"
            fill="#9a5e35"
          />

          <polygon
            points="39,346 85,313 132,346"
            fill="#6b3422"
          />
        </>
      );

    case "bronze-small-town":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#8ec5ff"
            middle="#ffc98e"
            bottom="#6f874d"
          />

          <circle
            cx="335"
            cy="91"
            r="36"
            fill="#fff0a5"
          />

          <path
            d="M0 324 C92 286 154 311 229 285 C308 257 367 286 420 266 L420 540 L0 540 Z"
            fill="#476b42"
          />

          {[
            [18, 302, 88, "#b45309", "#713f12"],
            [114, 280, 91, "#d6b07a", "#7c2d12"],
            [215, 311, 78, "#94a3b8", "#334155"],
            [304, 270, 102, "#e7c8a0", "#7f1d1d"],
          ].map(
            (
              house,
              index
            ) => (
              <TownHouse
                key={index}
                x={house[0] as number}
                y={house[1] as number}
                width={house[2] as number}
                body={house[3] as string}
                roof={house[4] as string}
              />
            )
          )}

          <rect
            y="420"
            width="420"
            height="120"
            fill="#35373b"
          />

          <path
            d="M0 474 L420 474"
            stroke="#f8fafc"
            strokeWidth="4"
            strokeDasharray="28 20"
            opacity=".8"
          />

          <StreetLamp
            x={55}
            y={323}
          />

          <StreetLamp
            x={365}
            y={322}
          />
        </>
      );

    case "default-holiday-village":
    case "holiday-village":
      return (
        <>
          <defs>
            <linearGradient id={`holiday-sky-${visualId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#07152f" />
              <stop offset="58%" stopColor="#17365d" />
              <stop offset="100%" stopColor="#d8efff" />
            </linearGradient>

            <linearGradient id={`holiday-snow-${visualId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#b9d8ef" />
            </linearGradient>
          </defs>

          <rect width="420" height="540" fill={`url(#holiday-sky-${visualId})`} />

          <circle cx="326" cy="82" r="34" fill="#fff7cf" opacity=".92" />

          {Array.from({ length: 22 }).map((_, index) => (
            <circle
              key={index}
              cx={(index * 73) % 420}
              cy={35 + ((index * 47) % 230)}
              r={1 + (index % 3)}
              fill="#ffffff"
              opacity={0.55 + (index % 4) * 0.1}
            />
          ))}

          <path
            d="M0 306 L78 224 L145 287 L220 192 L303 279 L368 218 L420 270 L420 397 L0 397 Z"
            fill="#294861"
          />

          <path
            d="M48 256 L78 224 L109 260 L90 250 L78 266 L65 249 Z M183 232 L220 192 L258 238 L237 226 L220 249 L204 226 Z M340 247 L368 218 L397 252 L380 244 L368 259 L357 243 Z"
            fill="#eef8ff"
          />

          <path
            d="M0 373 C79 337 145 382 216 350 C292 315 351 359 420 331 L420 540 L0 540 Z"
            fill={`url(#holiday-snow-${visualId})`}
          />

          <g transform="translate(54 326)">
            <rect x="0" y="25" width="96" height="72" rx="4" fill="#9a3412" stroke="#4a1d0c" strokeWidth="4" />
            <path d="M-10 27 L48 -16 L106 27 Z" fill="#7f1d1d" stroke="#fee2e2" strokeWidth="5" />
            <rect x="38" y="58" width="23" height="39" fill="#422006" />
            <rect x="13" y="46" width="18" height="18" fill="#fde68a" />
            <rect x="67" y="46" width="18" height="18" fill="#fde68a" />
            <path d="M0 25 Q24 10 48 25 Q72 10 96 25" fill="none" stroke="#ffffff" strokeWidth="7" />
            {[12, 30, 49, 68, 86].map((x, index) => (
              <circle key={index} cx={x} cy="27" r="4" fill={index % 2 === 0 ? "#ef4444" : "#22c55e"} />
            ))}
          </g>

          <g transform="translate(286 318)">
            <rect x="0" y="30" width="88" height="78" rx="4" fill="#166534" stroke="#052e16" strokeWidth="4" />
            <path d="M-10 31 L44 -12 L98 31 Z" fill="#14532d" stroke="#f0fdf4" strokeWidth="5" />
            <rect x="34" y="68" width="22" height="40" fill="#3f2a1c" />
            <rect x="12" y="49" width="17" height="17" fill="#fde68a" />
            <rect x="61" y="49" width="17" height="17" fill="#fde68a" />
            <path d="M0 30 Q22 16 44 30 Q66 16 88 30" fill="none" stroke="#ffffff" strokeWidth="7" />
          </g>

          <g transform="translate(211 333)">
            <rect x="-7" y="47" width="14" height="54" fill="#5b3827" />
            <polygon points="0,-47 -45,39 45,39" fill="#14532d" />
            <polygon points="0,-22 -38,55 38,55" fill="#166534" />
            <polygon points="0,4 -31,70 31,70" fill="#15803d" />
            <circle cx="0" cy="-48" r="8" fill="#facc15" />
            {[-28, -14, 0, 14, 28].map((x, index) => (
              <circle key={index} cx={x} cy={18 + (index % 2) * 19} r="5" fill={index % 2 === 0 ? "#ef4444" : "#facc15"} />
            ))}
            <path d="M-34 8 Q0 34 34 8 M-29 34 Q0 55 29 34" fill="none" stroke="#fbbf24" strokeWidth="3" />
          </g>

          <path d="M0 476 C86 451 145 493 221 466 C298 438 352 476 420 452 L420 540 L0 540 Z" fill="#eaf7ff" />

          <g transform="translate(132 455)">
            <rect x="-32" y="-8" width="64" height="23" rx="9" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="3" />
            <path d="M-24 -8 L-15 -25 M24 -8 L15 -25" stroke="#facc15" strokeWidth="4" />
            <circle cx="-20" cy="17" r="7" fill="#334155" />
            <circle cx="20" cy="17" r="7" fill="#334155" />
          </g>
        </>
      );

    case "bronze-pride":
    case "default-pride":
    case "bronze-campfire-clearing":
    case "bronze-waterfall-trail":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#9bd4ff"
            middle="#d8f0d2"
            bottom="#486b42"
          />

          <circle
            cx="330"
            cy="87"
            r="35"
            fill="#fff4b8"
            opacity=".9"
          />

          <MountainRange
            back="#78918a"
            front="#496b58"
            snow="#e8f4ef"
          />

          <path
            d="M0 354 C74 318 130 350 195 315 C260 279 326 329 420 288 L420 540 L0 540 Z"
            fill="#315d3d"
          />

          <path
            d="M242 214 C224 264 225 323 214 382 C207 423 191 462 178 540 L254 540 C244 469 238 422 244 378 C252 320 271 265 282 214 Z"
            fill="#dff8ff"
            opacity=".96"
          />

          <path
            d="M247 215 C240 279 239 342 231 403 C226 446 218 489 210 540"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="13"
            opacity=".8"
          />

          <path
            d="M0 452 C80 416 137 453 199 422 C262 390 334 429 420 396 L420 540 L0 540 Z"
            fill="#1f4d34"
          />

          <path
            d="M54 540 C94 465 126 421 173 389 C148 438 139 487 136 540 Z"
            fill="#ad8a61"
          />

          <path
            d="M64 540 C99 480 127 438 164 410"
            fill="none"
            stroke="#e1c49b"
            strokeWidth="9"
            strokeLinecap="round"
          />

          <Tree x={48} y={306} scale={1.06} />
          <Tree x={356} y={319} scale={0.92} />
          <Tree x={103} y={343} scale={0.68} />

          <g transform="translate(299 360)">
            <rect x="-3" y="-26" width="6" height="29" fill="#6b4c2e" />
            <path d="M-19 -25 L0 -39 L19 -25 Z" fill="#b45309" />
            <rect x="-18" y="-24" width="36" height="22" rx="3" fill="#d6a66f" />
            <path d="M-12 -15 L12 -15" stroke="#6b4c2e" strokeWidth="3" />
          </g>
        </>
      );

    case "silver-snow-village":
    case "silver-ice-cave":
    case "silver-frozen-lighthouse":
      return (
        <>
          <defs>
            <linearGradient
              id={`frozen-coast-${visualId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#071a33" />
              <stop offset="48%" stopColor="#315d7d" />
              <stop offset="100%" stopColor="#dff7ff" />
            </linearGradient>

            <linearGradient id={`ice-water-${visualId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bff3ff" />
              <stop offset="55%" stopColor="#4bb7d1" />
              <stop offset="100%" stopColor="#155e75" />
            </linearGradient>
          </defs>

          <rect width="420" height="540" fill={`url(#frozen-coast-${visualId})`} />

          <circle cx="316" cy="86" r="31" fill="#e6fbff" opacity=".82" />

          <path
            d="M0 289 L72 214 L131 276 L205 181 L282 273 L351 203 L420 272 L420 386 L0 386 Z"
            fill="#355b70"
          />

          <path
            d="M46 241 L72 214 L99 243 L83 236 L72 251 L61 235 Z M170 220 L205 181 L240 225 L220 214 L205 236 L190 213 Z M323 233 L351 203 L381 239 L363 230 L351 246 L340 229 Z"
            fill="#e8f8ff"
          />

          <path
            d="M0 365 C73 341 137 374 204 348 C278 319 347 360 420 334 L420 540 L0 540 Z"
            fill={`url(#ice-water-${visualId})`}
          />

          <path
            d="M0 419 C79 402 148 430 218 407 C292 382 354 412 420 393"
            fill="none"
            stroke="#e6fbff"
            strokeWidth="7"
            opacity=".58"
          />

          <path
            d="M0 481 C76 456 135 487 210 463 C287 438 352 468 420 447"
            fill="none"
            stroke="#cffafe"
            strokeWidth="5"
            opacity=".52"
          />

          <g transform="translate(116 221)">
            <path d="M-52 148 L-38 38 L38 38 L52 148 Z" fill="#e5e7eb" stroke="#94a3b8" strokeWidth="4" />
            <rect x="-43" y="72" width="86" height="24" fill="#c2413b" />
            <path d="M-48 38 L0 1 L48 38 Z" fill="#9f2735" stroke="#f1f5f9" strokeWidth="4" />
            <rect x="-20" y="-18" width="40" height="29" rx="4" fill="#1f2937" stroke="#cbd5e1" strokeWidth="4" />
            <circle cx="0" cy="-3" r="10" fill="#fff7b2" opacity=".95" />
            <rect x="-12" y="113" width="24" height="35" fill="#334155" />
            <rect x="-31" y="48" width="18" height="20" fill="#9bdfff" />
            <rect x="13" y="48" width="18" height="20" fill="#9bdfff" />
          </g>

          <path
            d="M50 385 L177 385 L159 408 L70 410 Z"
            fill="#d9f7ff"
            stroke="#f8fdff"
            strokeWidth="4"
          />

          <path
            d="M265 404 L324 378 L381 401 L352 425 L289 427 Z"
            fill="#e6fbff"
            opacity=".9"
          />

          <g transform="translate(285 323)">
            <path d="M0 0 C29 -10 54 -9 82 2 C59 13 30 14 0 0 Z" fill="#283d55" />
            <rect x="28" y="-16" width="27" height="16" rx="4" fill="#334155" />
            <path d="M18 1 L7 18 M67 3 L78 20" stroke="#9ca3af" strokeWidth="3" />
          </g>

          {[
            [24, 477, 18, 58],
            [185, 471, 15, 66],
            [222, 490, 20, 46],
            [386, 478, 17, 60],
          ].map((ice, index) => (
            <polygon
              key={index}
              points={`${ice[0]},${ice[1] + ice[3]} ${ice[0] + ice[2] / 2},${ice[1]} ${ice[0] + ice[2]},${ice[1] + ice[3]}`}
              fill={index % 2 === 0 ? "#ecfeff" : "#a5f3fc"}
              opacity=".9"
            />
          ))}
        </>
      );

    case "silver-harbor":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#7fb7db"
            middle="#c3d9e8"
            bottom="#346b83"
          />

          <circle
            cx="326"
            cy="89"
            r="35"
            fill="#f8fafc"
            opacity=".75"
          />

          <path
            d="M0 251 C87 223 143 252 224 220 C302 190 364 219 420 203 L420 343 L0 343 Z"
            fill="#536b75"
          />

          <rect
            y="326"
            width="420"
            height="214"
            fill="#23617c"
          />

          {Array.from({
            length: 7,
          }).map(
            (
              _,
              index
            ) => (
              <path
                key={index}
                d={`M${index * 70 - 25} ${382 + (index % 2) * 28} Q${index * 70 + 5} ${368 + (index % 2) * 28} ${index * 70 + 40} ${382 + (index % 2) * 28}`}
                fill="none"
                stroke="#9bd5e8"
                strokeWidth="4"
                opacity=".55"
              />
            )
          )}

          <HarborCrane
            x={35}
            y={189}
          />

          <HarborCrane
            x={292}
            y={207}
            scale={0.85}
          />

          <CargoShip
            x={112}
            y={328}
          />

          <Lighthouse
            x={337}
            y={254}
          />
        </>
      );

    case "silver-cathedral":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#7f8fa8"
            middle="#cbd5e1"
            bottom="#525f73"
          />

          <circle
            cx="326"
            cy="84"
            r="34"
            fill="#f8fafc"
            opacity=".72"
          />

          <path
            d="M0 360 C88 325 167 360 246 330 C317 304 370 329 420 313 L420 540 L0 540 Z"
            fill="#394657"
          />

          <CathedralBuilding
            primary="#66758b"
            trim="#e2e8f0"
            glass="#60a5fa"
          />

          <path
            d="M155 540 L188 392 L232 392 L268 540 Z"
            fill="#6b7280"
          />

          {[
            [62, 402],
            [348, 402],
            [39, 442],
            [375, 450],
          ].map(
            (
              point,
              index
            ) => (
              <Tree
                key={index}
                x={point[0]}
                y={point[1]}
                scale={0.55}
              />
            )
          )}
        </>
      );

    case "gold-desert-temple":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#ffb56b"
            middle="#f8d59a"
            bottom="#a4572b"
          />

          <circle
            cx="324"
            cy="94"
            r="58"
            fill="#fde68a"
          />

          <path
            d="M0 352 C99 308 177 360 266 316 C330 285 375 313 420 295 L420 540 L0 540 Z"
            fill="#c58042"
          />

          <path
            d="M0 407 C109 361 187 414 277 371 C340 341 383 367 420 352 L420 540 L0 540 Z"
            fill="#9a552b"
          />

          <DesertTemple />

          <path
            d="M176 540 L193 355 L229 355 L249 540 Z"
            fill="#d5a469"
          />

          <path
            d="M211 520 L211 370"
            stroke="#f5deb6"
            strokeWidth="3"
            strokeDasharray="12 12"
          />

          <PalmTree
            x={44}
            y={380}
          />

          <PalmTree
            x={365}
            y={397}
            scale={0.75}
          />
        </>
      );

    case "gold-sunset-city":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#5b3f8c"
            middle="#f97374"
            bottom="#ffbd6f"
          />

          <circle
            cx="210"
            cy="191"
            r="66"
            fill="#fde68a"
            opacity=".88"
          />

          <CitySkyline
            neon={false}
            dense
            primary="#261b3e"
            window="#ffd98a"
          />

          <rect
            y="422"
            width="420"
            height="118"
            fill="#17131f"
          />

          <path
            d="M0 471 L420 471"
            stroke="#fbbf24"
            strokeWidth="4"
            strokeDasharray="26 18"
          />

          <Overpass
            y={378}
          />
        </>
      );

    case "gold-autumn-forest":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#9ec5dc"
            middle="#f4c889"
            bottom="#6f4b2b"
          />

          <circle
            cx="325"
            cy="91"
            r="40"
            fill="#fff2b2"
          />

          <path
            d="M0 310 C100 265 170 317 252 274 C325 236 376 273 420 255 L420 540 L0 540 Z"
            fill="#6f4328"
          />

          <AutumnForest />

          <path
            d="M141 540 C159 448 188 389 212 345 C237 393 265 454 288 540 Z"
            fill="#9a7758"
          />

          <Bridge
            x={109}
            y={358}
          />
        </>
      );

    case "platinum-modern-city":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#19233a"
            middle="#31577b"
            bottom="#172033"
          />

          <circle
            cx="331"
            cy="84"
            r="31"
            fill="#dbeafe"
            opacity=".8"
          />

          <CitySkyline
            neon
            dense
            primary="#0f172a"
            window="#67e8f9"
          />

          <Overpass
            y={349}
            futuristic
          />

          <rect
            y="430"
            width="420"
            height="110"
            fill="#0b1220"
          />

          <path
            d="M0 485 L420 485"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="24 16"
          />

          <TransitStation
            x={273}
            y={319}
          />
        </>
      );

    case "platinum-mountain-lodge":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#7fa0bd"
            middle="#dce6ef"
            bottom="#42546a"
          />

          <MountainRange
            back="#52677c"
            front="#27394d"
            snow="#f8fafc"
          />

          <path
            d="M0 391 C101 347 177 405 265 361 C333 328 376 358 420 342 L420 540 L0 540 Z"
            fill="#e7edf3"
          />

          <LuxuryLodge />

          <PineCluster
            x={35}
            y={379}
          />

          <PineCluster
            x={346}
            y={395}
          />

          <path
            d="M170 540 C181 469 193 430 211 397 C231 433 250 477 266 540 Z"
            fill="#cfd8e1"
          />
        </>
      );

    case "platinum-neon-street":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#11082b"
            middle="#25124a"
            bottom="#070617"
          />

          <NeonStreet />

          <path
            d="M137 540 L181 318 L239 318 L286 540 Z"
            fill="#111827"
          />

          <path
            d="M211 540 L211 338"
            stroke="#f472b6"
            strokeWidth="4"
            strokeDasharray="18 15"
          />

          <NeonSign
            x={23}
            y={166}
            color="#22d3ee"
            text="NOVA"
          />

          <NeonSign
            x={309}
            y={214}
            color="#f472b6"
            text="XR"
          />

          <TransitStation
            x={260}
            y={311}
          />
        </>
      );

    case "diamond-crystal-cavern":
      return (
        <>
          <defs>
            <radialGradient
              id={`cavern-${visualId}`}
            >
              <stop
                offset="0%"
                stopColor="#164e63"
              />

              <stop
                offset="52%"
                stopColor="#082f49"
              />

              <stop
                offset="100%"
                stopColor="#020617"
              />
            </radialGradient>
          </defs>

          <rect
            width="420"
            height="540"
            fill={`url(#cavern-${visualId})`}
          />

          <CavernWalls />

          <CrystalCluster
            x={36}
            y={95}
            scale={1.1}
          />

          <CrystalCluster
            x={334}
            y={69}
            scale={0.85}
          />

          <CrystalCluster
            x={58}
            y={421}
            scale={1.35}
          />

          <CrystalCluster
            x={347}
            y={407}
            scale={1.2}
          />

          <ellipse
            cx="210"
            cy="481"
            rx="164"
            ry="42"
            fill="#22d3ee"
            opacity=".25"
          />

          <path
            d="M111 463 Q210 420 309 463 Q210 501 111 463 Z"
            fill="#0e7490"
            opacity=".55"
          />

          <CrystalBridge />
        </>
      );

    case "diamond-aurora-mountains":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#111044"
            middle="#164e63"
            bottom="#0f172a"
          />

          <StarField
            count={30}
          />

          <path
            d="M-20 123 C75 62 135 166 228 92 C307 28 370 117 451 55"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="33"
            opacity=".22"
          />

          <path
            d="M-24 163 C68 106 145 207 235 130 C316 61 372 146 449 88"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="27"
            opacity=".22"
          />

          <MountainRange
            back="#334155"
            front="#101827"
            snow="#cffafe"
          />

          <path
            d="M0 428 C104 380 178 443 270 395 C335 361 379 389 420 374 L420 540 L0 540 Z"
            fill="#102d36"
          />

          <FrozenLake />

          <Observatory
            x={301}
            y={344}
          />
        </>
      );

    case "diamond-floating-islands":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#264a85"
            middle="#7ec8e3"
            bottom="#d6f2f4"
          />

          <circle
            cx="333"
            cy="87"
            r="44"
            fill="#f8fafc"
            opacity=".9"
          />

          <CloudLayer />

          <FloatingIsland
            x={24}
            y={230}
            width={158}
            height={62}
            castle
          />

          <FloatingIsland
            x={251}
            y={150}
            width={131}
            height={50}
            waterfall
          />

          <FloatingIsland
            x={270}
            y={366}
            width={107}
            height={42}
          />

          <FloatingIsland
            x={58}
            y={402}
            width={92}
            height={38}
          />

          <SkyBridge />

          <Airship
            x={228}
            y={270}
            scale={0.72}
          />
        </>
      );

    case "master-storm-citadel":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#111827"
            middle="#334155"
            bottom="#0b1120"
          />

          <StormClouds />

          <MountainRange
            back="#263244"
            front="#111827"
            snow="#94a3b8"
          />

          <StormCitadel />

          <path
            d="M155 540 L186 372 L236 372 L269 540 Z"
            fill="#374151"
          />

          <path
            d="M211 540 L211 388"
            stroke="#94a3b8"
            strokeWidth="4"
            strokeDasharray="11 12"
          />
        </>
      );

    case "master-lava-palace":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#3b0a0a"
            middle="#7c2d12"
            bottom="#160707"
          />

          <circle
            cx="324"
            cy="91"
            r="45"
            fill="#fb923c"
            opacity=".68"
          />

          <VolcanoRange />

          <LavaPalace />

          <path
            d="M0 471 C70 432 122 489 194 445 C267 400 320 474 420 421 L420 540 L0 540 Z"
            fill="#7c2d12"
          />

          <path
            d="M0 500 C76 457 136 520 211 475 C286 430 347 496 420 449 L420 540 L0 540 Z"
            fill="#f97316"
            opacity=".85"
          />

          <ObsidianBridge />
        </>
      );

    case "master-magic-library":
      return (
        <>
          <rect
            width="420"
            height="540"
            fill="#130d2b"
          />

          <MagicLibraryHall />

          <circle
            cx="210"
            cy="164"
            r="62"
            fill="#7c3aed"
            opacity=".28"
          />

          <path
            d="M210 103 L224 146 L269 146 L233 172 L247 215 L210 189 L173 215 L187 172 L151 146 L196 146 Z"
            fill="#e9d5ff"
            opacity=".72"
          />

          <MagicDesk />

          <RuneFloor />
        </>
      );

    case "legendary-cosmic-kingdom":
      return (
        <>
          <defs>
            <radialGradient
              id={`cosmos-${visualId}`}
            >
              <stop
                offset="0%"
                stopColor="#312e81"
              />

              <stop
                offset="50%"
                stopColor="#172554"
              />

              <stop
                offset="100%"
                stopColor="#020617"
              />
            </radialGradient>
          </defs>

          <rect
            width="420"
            height="540"
            fill={`url(#cosmos-${visualId})`}
          />

          <StarField
            count={52}
          />

          <circle
            cx="335"
            cy="102"
            r="54"
            fill="#a78bfa"
            opacity=".62"
          />

          <ellipse
            cx="335"
            cy="102"
            rx="82"
            ry="18"
            fill="none"
            stroke="#fde68a"
            strokeWidth="6"
            transform="rotate(-18 335 102)"
          />

          <CosmicKingdom />

          <FloatingIsland
            x={18}
            y={362}
            width={105}
            height={35}
          />

          <FloatingIsland
            x={300}
            y={330}
            width={98}
            height={33}
          />

          <GalaxyGate />
        </>
      );

    case "legendary-aurora-realm":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#071b35"
            middle="#123c55"
            bottom="#0c1f2a"
          />

          <StarField
            count={38}
          />

          <AuroraRealmLandscape />

          <CrystalCity />

          <SkyRail
            y={318}
          />

          <FrozenLake />
        </>
      );

    case "legendary-solar-sanctuary":
      return (
        <>
          <SkyGradient
            id={visualId}
            top="#4d1d5f"
            middle="#f97316"
            bottom="#ffcf70"
          />

          <circle
            cx="210"
            cy="118"
            r="83"
            fill="#fff7c2"
            opacity=".88"
          />

          <SolarRays />

          <CloudLayer />

          <SolarSanctuary />

          <Airfield />

          <Airship
            x={39}
            y={178}
            scale={0.78}
          />

          <Airship
            x={302}
            y={226}
            scale={0.52}
          />
        </>
      );

    default:
      return (
        <>
          <SkyGradient
            id={visualId}
            top={colors.highlight}
            middle={colors.primary}
            bottom={colors.dark}
          />

          <path
            d="M0 341 C99 286 171 350 249 307 C323 265 373 302 420 283 L420 540 L0 540 Z"
            fill={colors.secondary}
          />

          <path
            d="M158 540 L190 347 L232 347 L265 540 Z"
            fill="#7c6f65"
          />
        </>
      );
  }
}


function SkyGradient({
  id,
  top,
  middle,
  bottom,
}: {
  id:
    string;

  top:
    string;

  middle:
    string;

  bottom:
    string;
}) {
  return (
    <>
      <defs>
        <linearGradient
          id={`sky-${id}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={top}
          />

          <stop
            offset="52%"
            stopColor={middle}
          />

          <stop
            offset="100%"
            stopColor={bottom}
          />
        </linearGradient>
      </defs>

      <rect
        width="420"
        height="540"
        fill={`url(#sky-${id})`}
      />
    </>
  );
}


function TownHouse({
  x,
  y,
  width,
  body,
  roof,
}: {
  x:
    number;

  y:
    number;

  width:
    number;

  body:
    string;

  roof:
    string;
}) {
  const height =
    width * 0.72;


  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={body}
      />

      <polygon
        points={`${x - 8},${y} ${x + width / 2},${y - width * 0.38} ${x + width + 8},${y}`}
        fill={roof}
      />

      <rect
        x={x + width * 0.41}
        y={y + height * 0.48}
        width={width * 0.19}
        height={height * 0.52}
        fill="#3f2c24"
      />

      <rect
        x={x + width * 0.13}
        y={y + height * 0.28}
        width={width * 0.18}
        height={height * 0.2}
        fill="#fde68a"
      />

      <rect
        x={x + width * 0.69}
        y={y + height * 0.28}
        width={width * 0.18}
        height={height * 0.2}
        fill="#fde68a"
      />
    </g>
  );
}


function StreetLamp({
  x,
  y,
}: {
  x:
    number;

  y:
    number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="6"
        height="118"
        fill="#262626"
      />

      <path
        d={`M${x + 3} ${y} Q${x + 3} ${y - 23} ${x + 25} ${y - 23}`}
        fill="none"
        stroke="#262626"
        strokeWidth="6"
      />

      <circle
        cx={x + 26}
        cy={y - 21}
        r="10"
        fill="#fde68a"
      />
    </g>
  );
}


function MountainRange({
  back,
  front,
  snow,
}: {
  back:
    string;

  front:
    string;

  snow:
    string;
}) {
  return (
    <>
      <path
        d="M0 351 L82 190 L155 311 L253 116 L344 284 L420 164 L420 540 L0 540 Z"
        fill={back}
      />

      <path
        d="M0 395 L111 237 L205 369 L309 199 L420 358 L420 540 L0 540 Z"
        fill={front}
      />

      <path
        d="M53 246 L82 190 L117 248 L94 235 L81 261 L69 236 Z"
        fill={snow}
      />

      <path
        d="M216 174 L253 116 L296 189 L270 174 L252 207 L236 175 Z"
        fill={snow}
      />

      <path
        d="M280 243 L309 199 L346 253 L323 241 L309 270 L296 241 Z"
        fill={snow}
      />
    </>
  );
}


function SnowCabin({
  x,
  y,
  scale = 1,
}: {
  x:
    number;

  y:
    number;

  scale?:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <rect
        width="92"
        height="68"
        fill="#713f12"
      />

      <polygon
        points="-12,4 46,-39 104,4"
        fill="#431407"
      />

      <path
        d="M-7 -1 Q46 -23 99 -1"
        fill="none"
        stroke="#f8fafc"
        strokeWidth="12"
      />

      <rect
        x="35"
        y="33"
        width="22"
        height="35"
        fill="#292524"
      />

      <rect
        x="11"
        y="20"
        width="17"
        height="16"
        fill="#fde68a"
      />

      <rect
        x="64"
        y="20"
        width="17"
        height="16"
        fill="#fde68a"
      />
    </g>
  );
}


function PineCluster({
  x,
  y,
}: {
  x:
    number;

  y:
    number;
}) {
  return (
    <g>
      <Tree
        x={x}
        y={y}
        scale={0.72}
      />

      <Tree
        x={x + 38}
        y={y + 13}
        scale={0.56}
      />

      <Tree
        x={x - 31}
        y={y + 23}
        scale={0.48}
      />
    </g>
  );
}


function HarborCrane({
  x,
  y,
  scale = 1,
}: {
  x:
    number;

  y:
    number;

  scale?:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      stroke="#1f2937"
      strokeWidth="8"
      fill="none"
    >
      <path
        d="M0 136 L0 0 L98 0"
      />

      <path
        d="M0 38 L78 0"
      />

      <path
        d="M69 0 L69 76"
        strokeWidth="3"
      />

      <rect
        x="57"
        y="76"
        width="25"
        height="28"
        fill="#d97706"
        stroke="none"
      />
    </g>
  );
}


function CargoShip({
  x,
  y,
}: {
  x:
    number;

  y:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
    >
      <path
        d="M0 35 L170 35 L145 71 L25 71 Z"
        fill="#273548"
      />

      <rect
        x="25"
        y="9"
        width="31"
        height="26"
        fill="#f8fafc"
      />

      {[
        [61, 12, "#dc2626"],
        [96, 12, "#2563eb"],
        [131, 12, "#d97706"],
        [77, -12, "#16a34a"],
        [112, -12, "#7c3aed"],
      ].map(
        (
          box,
          index
        ) => (
          <rect
            key={index}
            x={box[0] as number}
            y={box[1] as number}
            width="31"
            height="23"
            fill={box[2] as string}
          />
        )
      )}
    </g>
  );
}


function Lighthouse({
  x,
  y,
}: {
  x:
    number;

  y:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
    >
      <path
        d="M12 96 L24 0 L48 0 L60 96 Z"
        fill="#f8fafc"
      />

      <path
        d="M18 46 L54 46 L57 66 L15 66 Z"
        fill="#dc2626"
      />

      <rect
        x="17"
        y="-19"
        width="38"
        height="20"
        fill="#1f2937"
      />

      <circle
        cx="36"
        cy="-9"
        r="8"
        fill="#fde68a"
      />

      <polygon
        points="8,-18 36,-38 64,-18"
        fill="#7f1d1d"
      />
    </g>
  );
}


function CathedralBuilding({
  primary,
  trim,
  glass,
}: {
  primary:
    string;

  trim:
    string;

  glass:
    string;
}) {
  return (
    <g>
      <path
        d="M76 425 L76 188 L132 188 L132 116 L169 116 L169 213 Q210 151 251 213 L251 116 L288 116 L288 188 L344 188 L344 425 Z"
        fill={primary}
        stroke={trim}
        strokeWidth="5"
      />

      <polygon
        points="111,188 132,135 153,188"
        fill={trim}
      />

      <polygon
        points="267,188 288,135 309,188"
        fill={trim}
      />

      <circle
        cx="210"
        cy="242"
        r="39"
        fill={glass}
        opacity=".72"
        stroke={trim}
        strokeWidth="5"
      />

      <path
        d="M210 203 L210 281 M171 242 L249 242"
        stroke={trim}
        strokeWidth="4"
      />

      <path
        d="M181 425 L181 337 Q210 295 239 337 L239 425 Z"
        fill="#252b35"
      />
    </g>
  );
}


function DesertTemple() {
  return (
    <g>
      <path
        d="M86 391 L86 259 L145 259 L145 211 L181 211 L210 159 L239 211 L275 211 L275 259 L334 259 L334 391 Z"
        fill="#b8793f"
        stroke="#f5d08a"
        strokeWidth="5"
      />

      <path
        d="M178 391 L178 307 Q210 269 242 307 L242 391 Z"
        fill="#5e341f"
      />

      <path
        d="M108 294 L143 294 L143 350 L108 350 Z M277 294 L312 294 L312 350 L277 350 Z"
        fill="#6b3c24"
      />

      <circle
        cx="210"
        cy="231"
        r="19"
        fill="#fde68a"
      />
    </g>
  );
}


function PalmTree({
  x,
  y,
  scale = 1,
}: {
  x:
    number;

  y:
    number;

  scale?:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <path
        d="M0 75 Q12 30 4 -10"
        fill="none"
        stroke="#7c4a2f"
        strokeWidth="11"
      />

      {[-58, -30, 0, 30, 58].map(
        (
          rotation,
          index
        ) => (
          <path
            key={index}
            d="M4 -10 Q37 -42 67 -22 Q36 -18 4 -10"
            fill="#315c36"
            transform={`rotate(${rotation} 4 -10)`}
          />
        )
      )}
    </g>
  );
}


function CitySkyline({
  neon,
  dense,
  primary,
  window,
}: {
  neon:
    boolean;

  dense:
    boolean;

  primary:
    string;

  window:
    string;
}) {
  const buildings =
    dense
      ? [
          [0, 236, 62, 202],
          [51, 173, 69, 265],
          [108, 263, 53, 175],
          [149, 112, 83, 326],
          [219, 201, 62, 237],
          [270, 146, 80, 292],
          [337, 223, 83, 215],
        ]
      : [
          [0, 251, 88, 187],
          [78, 204, 94, 234],
          [162, 237, 77, 201],
          [228, 175, 108, 263],
          [326, 244, 94, 194],
        ];


  return (
    <g>
      {buildings.map(
        (
          building,
          index
        ) => (
          <Building
            key={index}
            x={building[0]}
            y={building[1]}
            width={building[2]}
            height={building[3]}
            neon={neon}
          />
        )
      )}

      <rect
        y="425"
        width="420"
        height="19"
        fill={primary}
      />

      <path
        d="M0 420 L420 420"
        stroke={window}
        strokeWidth="3"
        opacity=".7"
      />
    </g>
  );
}


function Overpass({
  y,
  futuristic = false,
}: {
  y:
    number;

  futuristic?:
    boolean;
}) {
  return (
    <g>
      <path
        d={`M-10 ${y} Q210 ${y - 48} 430 ${y} L430 ${y + 32} Q210 ${y - 16} -10 ${y + 32} Z`}
        fill={futuristic ? "#18263a" : "#2b2b34"}
        stroke={futuristic ? "#22d3ee" : "#555564"}
        strokeWidth="4"
      />

      {Array.from({
        length: 8,
      }).map(
        (
          _,
          index
        ) => (
          <rect
            key={index}
            x={16 + index * 55}
            y={y + 9 - Math.abs(3 - index) * 2}
            width="29"
            height="8"
            rx="4"
            fill={futuristic ? "#67e8f9" : "#facc15"}
          />
        )
      )}
    </g>
  );
}


function AutumnForest() {
  const trees = [
    [23, 275, "#b45309", 0.95],
    [79, 249, "#dc2626", 1.15],
    [138, 292, "#d97706", 0.82],
    [196, 238, "#92400e", 1.24],
    [259, 286, "#ea580c", 0.88],
    [321, 247, "#b91c1c", 1.13],
    [381, 292, "#d97706", 0.78],
  ] as const;


  return (
    <g>
      {trees.map(
        (
          tree,
          index
        ) => (
          <g
            key={index}
            transform={`translate(${tree[0]} ${tree[1]}) scale(${tree[3]})`}
          >
            <rect
              x="-7"
              y="20"
              width="14"
              height="87"
              fill="#5b3827"
            />

            <circle
              cx="0"
              cy="0"
              r="38"
              fill={tree[2]}
            />

            <circle
              cx="-24"
              cy="16"
              r="25"
              fill={tree[2]}
            />

            <circle
              cx="25"
              cy="18"
              r="27"
              fill={tree[2]}
            />
          </g>
        )
      )}
    </g>
  );
}


function Bridge({
  x,
  y,
}: {
  x:
    number;

  y:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
    >
      <path
        d="M0 45 Q101 -21 202 45 L202 63 Q101 1 0 63 Z"
        fill="#6b442d"
      />

      {Array.from({
        length: 8,
      }).map(
        (
          _,
          index
        ) => (
          <rect
            key={index}
            x={index * 27}
            y={31 - Math.abs(3.5 - index) * 5}
            width="6"
            height="56"
            fill="#4a2f20"
          />
        )
      )}
    </g>
  );
}


function TransitStation({
  x,
  y,
}: {
  x:
    number;

  y:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
    >
      <path
        d="M0 72 L18 0 L112 0 L130 72 Z"
        fill="#172033"
        stroke="#67e8f9"
        strokeWidth="4"
      />

      <rect
        x="24"
        y="15"
        width="82"
        height="34"
        rx="12"
        fill="#0f172a"
        stroke="#f472b6"
        strokeWidth="3"
      />

      <rect
        x="35"
        y="25"
        width="61"
        height="13"
        fill="#22d3ee"
        opacity=".8"
      />
    </g>
  );
}


function LuxuryLodge() {
  return (
    <g>
      <rect
        x="83"
        y="320"
        width="255"
        height="118"
        rx="4"
        fill="#563722"
        stroke="#d6b27d"
        strokeWidth="5"
      />

      <polygon
        points="64,323 210,232 358,323"
        fill="#39261c"
        stroke="#d6b27d"
        strokeWidth="5"
      />

      <rect
        x="178"
        y="362"
        width="64"
        height="76"
        fill="#211914"
      />

      {[
        [104, 345],
        [269, 345],
        [106, 392],
        [271, 392],
      ].map(
        (
          point,
          index
        ) => (
          <rect
            key={index}
            x={point[0]}
            y={point[1]}
            width="39"
            height="28"
            fill="#fde68a"
            stroke="#3f2b20"
            strokeWidth="4"
          />
        )
      )}

      <rect
        x="303"
        y="233"
        width="24"
        height="66"
        fill="#4b3225"
      />
    </g>
  );
}


function NeonStreet() {
  const buildings = [
    [0, 121, 90, 342],
    [74, 204, 72, 259],
    [287, 168, 72, 295],
    [342, 104, 78, 359],
  ];


  return (
    <g>
      {buildings.map(
        (
          building,
          index
        ) => (
          <Building
            key={index}
            x={building[0]}
            y={building[1]}
            width={building[2]}
            height={building[3]}
            neon
          />
        )
      )}

      <path
        d="M113 276 L167 219 L253 219 L307 276"
        fill="none"
        stroke="#67e8f9"
        strokeWidth="5"
      />

      <path
        d="M131 307 L172 258 L248 258 L289 307"
        fill="none"
        stroke="#f472b6"
        strokeWidth="4"
      />
    </g>
  );
}


function NeonSign({
  x,
  y,
  color,
  text,
}: {
  x:
    number;

  y:
    number;

  color:
    string;

  text:
    string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="87"
        height="45"
        rx="7"
        fill="#090817"
        stroke={color}
        strokeWidth="4"
      />

      <text
        x={x + 43.5}
        y={y + 29}
        textAnchor="middle"
        fontSize="17"
        fontWeight="900"
        fill={color}
      >
        {text}
      </text>
    </g>
  );
}


function CavernWalls() {
  return (
    <>
      <path
        d="M0 0 L91 0 L75 79 L103 125 L61 172 L82 232 L48 286 L65 351 L0 389 Z"
        fill="#081f2d"
      />

      <path
        d="M420 0 L327 0 L349 76 L320 130 L361 173 L337 234 L374 289 L350 350 L420 399 Z"
        fill="#081f2d"
      />

      <path
        d="M0 0 L420 0 L365 47 L307 33 L251 72 L191 35 L125 62 L63 42 Z"
        fill="#061822"
      />
    </>
  );
}


function CrystalCluster({
  x,
  y,
  scale = 1,
}: {
  x:
    number;

  y:
    number;

  scale?:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <polygon
        points="0,69 18,0 38,69"
        fill="#67e8f9"
        opacity=".82"
      />

      <polygon
        points="27,73 48,19 68,73"
        fill="#c084fc"
        opacity=".8"
      />

      <polygon
        points="-23,73 -6,29 11,73"
        fill="#a5f3fc"
        opacity=".72"
      />
    </g>
  );
}


function CrystalBridge() {
  return (
    <g>
      <path
        d="M108 444 Q210 363 312 444 L292 465 Q210 402 128 465 Z"
        fill="#0e7490"
        stroke="#cffafe"
        strokeWidth="5"
        opacity=".8"
      />

      {Array.from({
        length: 9,
      }).map(
        (
          _,
          index
        ) => (
          <polygon
            key={index}
            points={`${127 + index * 20},${447 - Math.abs(4 - index) * 8} ${137 + index * 20},${426 - Math.abs(4 - index) * 9} ${147 + index * 20},${447 - Math.abs(4 - index) * 8}`}
            fill="#67e8f9"
            opacity=".7"
          />
        )
      )}
    </g>
  );
}


function StarField({
  count,
}: {
  count:
    number;
}) {
  return (
    <g>
      {Array.from({
        length: count,
      }).map(
        (
          _,
          index
        ) => (
          <circle
            key={index}
            cx={(index * 67) % 420}
            cy={(index * 97) % 340}
            r={1 + index % 3}
            fill="#ffffff"
            opacity={0.42 + (index % 5) * 0.1}
          />
        )
      )}
    </g>
  );
}


function FrozenLake() {
  return (
    <g>
      <path
        d="M0 420 C89 386 159 431 238 398 C311 367 367 401 420 380 L420 540 L0 540 Z"
        fill="#18495a"
      />

      <path
        d="M37 464 Q134 429 231 460 M176 505 Q288 462 399 492 M43 519 Q89 493 135 508"
        fill="none"
        stroke="#a5f3fc"
        strokeWidth="3"
        opacity=".58"
      />
    </g>
  );
}


function Observatory({
  x,
  y,
}: {
  x:
    number;

  y:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y})`}
    >
      <rect
        x="0"
        y="28"
        width="77"
        height="58"
        fill="#dbeafe"
      />

      <path
        d="M0 28 A38 38 0 0 1 77 28 Z"
        fill="#94a3b8"
      />

      <path
        d="M37 1 L68 -29"
        stroke="#334155"
        strokeWidth="12"
      />

      <ellipse
        cx="72"
        cy="-32"
        rx="21"
        ry="8"
        fill="#cbd5e1"
        transform="rotate(-42 72 -32)"
      />
    </g>
  );
}


function CloudLayer() {
  return (
    <g
      opacity=".72"
    >
      {[
        [31, 157, 1],
        [295, 255, 0.72],
        [139, 381, 0.9],
      ].map(
        (
          cloud,
          index
        ) => (
          <g
            key={index}
            transform={`translate(${cloud[0]} ${cloud[1]}) scale(${cloud[2]})`}
          >
            <ellipse
              cx="54"
              cy="30"
              rx="54"
              ry="22"
              fill="#f8fafc"
            />

            <circle
              cx="31"
              cy="19"
              r="24"
              fill="#f8fafc"
            />

            <circle
              cx="68"
              cy="12"
              r="31"
              fill="#f8fafc"
            />

            <circle
              cx="99"
              cy="25"
              r="21"
              fill="#f8fafc"
            />
          </g>
        )
      )}
    </g>
  );
}


function FloatingIsland({
  x,
  y,
  width,
  height,
  castle = false,
  waterfall = false,
}: {
  x:
    number;

  y:
    number;

  width:
    number;

  height:
    number;

  castle?:
    boolean;

  waterfall?:
    boolean;
}) {
  return (
    <g>
      <ellipse
        cx={x + width / 2}
        cy={y}
        rx={width / 2}
        ry={height / 2}
        fill="#3f7a4a"
      />

      <path
        d={`M${x} ${y} L${x + width * 0.25} ${y + height * 1.65} L${x + width * 0.53} ${y + height * 1.18} L${x + width * 0.72} ${y + height * 1.52} L${x + width} ${y} Z`}
        fill="#5b3a26"
      />

      {castle && (
        <g>
          <rect
            x={x + width * 0.27}
            y={y - 70}
            width={width * 0.46}
            height="67"
            fill="#dbeafe"
          />

          <rect
            x={x + width * 0.17}
            y={y - 52}
            width={width * 0.16}
            height="49"
            fill="#cbd5e1"
          />

          <rect
            x={x + width * 0.68}
            y={y - 52}
            width={width * 0.16}
            height="49"
            fill="#cbd5e1"
          />

          <polygon
            points={`${x + width * 0.17},${y - 52} ${x + width * 0.25},${y - 80} ${x + width * 0.33},${y - 52}`}
            fill="#7c3aed"
          />

          <polygon
            points={`${x + width * 0.68},${y - 52} ${x + width * 0.76},${y - 80} ${x + width * 0.84},${y - 52}`}
            fill="#7c3aed"
          />
        </g>
      )}

      {waterfall && (
        <path
          d={`M${x + width * 0.41} ${y + 3} L${x + width * 0.56} ${y + 3} L${x + width * 0.53} ${y + height * 2.18} Q${x + width * 0.47} ${y + height * 2.4} ${x + width * 0.42} ${y + height * 2.18} Z`}
          fill="#a5f3fc"
          opacity=".74"
        />
      )}
    </g>
  );
}


function SkyBridge() {
  return (
    <g>
      <path
        d="M176 245 Q222 220 264 185"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="9"
      />

      <path
        d="M176 245 Q222 220 264 185"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="3"
      />
    </g>
  );
}


function Airship({
  x,
  y,
  scale = 1,
}: {
  x:
    number;

  y:
    number;

  scale?:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <ellipse
        cx="60"
        cy="22"
        rx="58"
        ry="22"
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth="4"
      />

      <path
        d="M36 43 L47 66 L78 66 L89 43"
        fill="#7c3aed"
      />

      <path
        d="M8 22 L-13 8 L-8 30 Z M112 22 L133 8 L128 30 Z"
        fill="#cbd5e1"
      />
    </g>
  );
}


function StormClouds() {
  return (
    <g>
      {[
        [-35, 69, 1.05],
        [142, 31, 1.2],
        [292, 91, 0.88],
      ].map(
        (
          cloud,
          index
        ) => (
          <g
            key={index}
            transform={`translate(${cloud[0]} ${cloud[1]}) scale(${cloud[2]})`}
          >
            <ellipse
              cx="70"
              cy="40"
              rx="69"
              ry="29"
              fill="#273244"
            />

            <circle
              cx="42"
              cy="26"
              r="31"
              fill="#334155"
            />

            <circle
              cx="83"
              cy="17"
              r="40"
              fill="#334155"
            />

            <circle
              cx="119"
              cy="34"
              r="28"
              fill="#273244"
            />
          </g>
        )
      )}
    </g>
  );
}


function StormCitadel() {
  return (
    <g>
      <path
        d="M86 408 L86 270 L128 270 L128 198 L168 198 L168 250 L191 250 L210 179 L229 250 L252 250 L252 198 L292 198 L292 270 L334 270 L334 408 Z"
        fill="#182131"
        stroke="#94a3b8"
        strokeWidth="5"
      />

      <path
        d="M175 408 L175 321 Q210 278 245 321 L245 408 Z"
        fill="#080d15"
      />

      <circle
        cx="210"
        cy="266"
        r="17"
        fill="#67e8f9"
      />

      <path
        d="M104 303 L133 303 L133 348 L104 348 Z M287 303 L316 303 L316 348 L287 348 Z"
        fill="#f8fafc"
        opacity=".45"
      />
    </g>
  );
}


function VolcanoRange() {
  return (
    <g>
      <path
        d="M0 361 L89 210 L148 329 L236 155 L319 324 L420 222 L420 540 L0 540 Z"
        fill="#3f1712"
      />

      <path
        d="M206 204 L236 155 L269 213 L248 201 L235 226 L223 201 Z"
        fill="#f97316"
      />

      <path
        d="M69 243 L89 210 L111 249 L97 240 L88 258 L80 240 Z"
        fill="#f97316"
      />
    </g>
  );
}


function LavaPalace() {
  return (
    <g>
      <path
        d="M77 425 L77 291 L125 291 L125 229 L165 229 L165 271 L190 271 L210 194 L230 271 L255 271 L255 229 L295 229 L295 291 L343 291 L343 425 Z"
        fill="#2b1010"
        stroke="#fb923c"
        strokeWidth="6"
      />

      <path
        d="M173 425 L173 337 Q210 285 247 337 L247 425 Z"
        fill="#0f0505"
      />

      <path
        d="M205 239 L215 239 L222 315 L198 315 Z"
        fill="#f97316"
      />

      <circle
        cx="210"
        cy="310"
        r="18"
        fill="#facc15"
      />
    </g>
  );
}


function ObsidianBridge() {
  return (
    <g>
      <path
        d="M142 540 L177 385 L243 385 L280 540 Z"
        fill="#170d0d"
        stroke="#f97316"
        strokeWidth="4"
      />

      {Array.from({
        length: 7,
      }).map(
        (
          _,
          index
        ) => (
          <path
            key={index}
            d={`M${165 + index * 16} ${518 - index * 19} L${177 + index * 12} ${478 - index * 13}`}
            stroke="#facc15"
            strokeWidth="3"
            opacity=".55"
          />
        )
      )}
    </g>
  );
}


function MagicLibraryHall() {
  return (
    <g>
      <path
        d="M0 540 L0 72 Q66 5 132 72 L132 540 Z"
        fill="#281849"
      />

      <path
        d="M288 540 L288 72 Q354 5 420 72 L420 540 Z"
        fill="#281849"
      />

      <path
        d="M132 540 L132 115 Q210 21 288 115 L288 540 Z"
        fill="#160d2c"
        stroke="#a78bfa"
        strokeWidth="5"
      />

      {[0, 1, 2, 3].map(
        (
          shelf,
          index
        ) => (
          <g
            key={index}
          >
            <rect
              x="19"
              y={201 + shelf * 68}
              width="94"
              height="9"
              fill="#8b5e34"
            />

            <rect
              x="307"
              y={201 + shelf * 68}
              width="94"
              height="9"
              fill="#8b5e34"
            />

            {Array.from({
              length: 5,
            }).map(
              (
                _,
                book
              ) => (
                <g
                  key={book}
                >
                  <rect
                    x={25 + book * 17}
                    y={165 + shelf * 68 + (book % 2) * 4}
                    width="12"
                    height={36 - (book % 2) * 4}
                    fill={book % 3 === 0 ? "#dc2626" : book % 3 === 1 ? "#2563eb" : "#d97706"}
                  />

                  <rect
                    x={313 + book * 17}
                    y={165 + shelf * 68 + ((book + 1) % 2) * 4}
                    width="12"
                    height={36 - ((book + 1) % 2) * 4}
                    fill={book % 3 === 0 ? "#16a34a" : book % 3 === 1 ? "#7c3aed" : "#ca8a04"}
                  />
                </g>
              )
            )}
          </g>
        )
      )}
    </g>
  );
}


function MagicDesk() {
  return (
    <g>
      <path
        d="M139 397 Q210 365 281 397 L264 443 L156 443 Z"
        fill="#654321"
        stroke="#d6a86a"
        strokeWidth="5"
      />

      <path
        d="M169 394 Q210 355 251 394 Q210 418 169 394 Z"
        fill="#f8fafc"
      />

      <path
        d="M210 367 L210 408"
        stroke="#7c3aed"
        strokeWidth="4"
      />
    </g>
  );
}


function RuneFloor() {
  return (
    <g>
      <ellipse
        cx="210"
        cy="491"
        rx="159"
        ry="41"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="5"
        opacity=".72"
      />

      <ellipse
        cx="210"
        cy="491"
        rx="112"
        ry="28"
        fill="none"
        stroke="#67e8f9"
        strokeWidth="3"
        opacity=".66"
      />

      <path
        d="M210 453 L226 480 L257 483 L234 503 L241 532 L210 516 L179 532 L186 503 L163 483 L194 480 Z"
        fill="none"
        stroke="#e9d5ff"
        strokeWidth="3"
      />
    </g>
  );
}


function CosmicKingdom() {
  return (
    <g>
      <FloatingIsland
        x={94}
        y={299}
        width={232}
        height={72}
        castle
      />

      <path
        d="M142 298 L142 206 L171 206 L171 153 L199 153 L210 97 L221 153 L249 153 L249 206 L278 206 L278 298 Z"
        fill="#dbeafe"
        stroke="#fbbf24"
        strokeWidth="5"
      />

      <circle
        cx="210"
        cy="196"
        r="25"
        fill="#7c3aed"
        stroke="#fef3c7"
        strokeWidth="4"
      />
    </g>
  );
}


function GalaxyGate() {
  return (
    <g>
      <ellipse
        cx="210"
        cy="430"
        rx="91"
        ry="59"
        fill="#312e81"
        stroke="#fbbf24"
        strokeWidth="8"
      />

      <ellipse
        cx="210"
        cy="430"
        rx="67"
        ry="41"
        fill="#0f172a"
        stroke="#a78bfa"
        strokeWidth="5"
      />

      <path
        d="M160 433 Q210 387 260 433 Q210 463 160 433 Z"
        fill="#67e8f9"
        opacity=".45"
      />
    </g>
  );
}


function AuroraRealmLandscape() {
  return (
    <g>
      <path
        d="M-30 118 C62 41 130 178 224 84 C307 1 370 131 457 49"
        fill="none"
        stroke="#5eead4"
        strokeWidth="38"
        opacity=".24"
      />

      <path
        d="M-34 165 C64 91 145 214 237 122 C318 41 380 172 457 89"
        fill="none"
        stroke="#c084fc"
        strokeWidth="31"
        opacity=".22"
      />

      <path
        d="M0 373 L78 227 L157 349 L247 162 L341 340 L420 216 L420 540 L0 540 Z"
        fill="#183243"
      />

      <path
        d="M0 421 C94 378 166 432 250 392 C321 358 373 387 420 370 L420 540 L0 540 Z"
        fill="#164e63"
      />
    </g>
  );
}


function CrystalCity() {
  return (
    <g>
      {[
        [62, 311, 50, 116],
        [121, 270, 58, 157],
        [188, 223, 67, 204],
        [264, 284, 57, 143],
        [329, 324, 43, 103],
      ].map(
        (
          tower,
          index
        ) => (
          <g
            key={index}
          >
            <polygon
              points={`${tower[0]},${tower[1] + tower[3]} ${tower[0] + tower[2] / 2},${tower[1]} ${tower[0] + tower[2]},${tower[1] + tower[3]}`}
              fill={index % 2 === 0 ? "#67e8f9" : "#c084fc"}
              opacity=".65"
              stroke="#e0f2fe"
              strokeWidth="3"
            />

            <path
              d={`M${tower[0] + tower[2] / 2} ${tower[1] + 18} L${tower[0] + tower[2] / 2} ${tower[1] + tower[3] - 13}`}
              stroke="#f8fafc"
              strokeWidth="2"
              opacity=".7"
            />
          </g>
        )
      )}
    </g>
  );
}


function SkyRail({
  y,
}: {
  y:
    number;
}) {
  return (
    <g>
      <path
        d={`M-20 ${y} Q210 ${y - 68} 440 ${y}`}
        fill="none"
        stroke="#dbeafe"
        strokeWidth="12"
      />

      <path
        d={`M-20 ${y} Q210 ${y - 68} 440 ${y}`}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="4"
      />
    </g>
  );
}


function SolarRays() {
  return (
    <g
      opacity=".28"
    >
      {Array.from({
        length: 16,
      }).map(
        (
          _,
          index
        ) => (
          <path
            key={index}
            d="M210 118 L210 -85"
            stroke="#fff7c2"
            strokeWidth="16"
            transform={`rotate(${index * 22.5} 210 118)`}
          />
        )
      )}
    </g>
  );
}


function SolarSanctuary() {
  return (
    <g>
      <path
        d="M54 408 L54 293 L112 293 L112 239 L161 239 L161 197 Q210 128 259 197 L259 239 L308 239 L308 293 L366 293 L366 408 Z"
        fill="#fff2d5"
        stroke="#fbbf24"
        strokeWidth="6"
      />

      <path
        d="M176 408 L176 321 Q210 275 244 321 L244 408 Z"
        fill="#7c2d12"
      />

      <circle
        cx="210"
        cy="221"
        r="29"
        fill="#fde68a"
        stroke="#f59e0b"
        strokeWidth="5"
      />

      <path
        d="M92 293 L92 245 M328 293 L328 245"
        stroke="#fbbf24"
        strokeWidth="10"
      />
    </g>
  );
}


function Airfield() {
  return (
    <g>
      <path
        d="M103 540 L165 398 L255 398 L322 540 Z"
        fill="#374151"
      />

      <path
        d="M211 540 L211 414"
        stroke="#f8fafc"
        strokeWidth="5"
        strokeDasharray="19 14"
      />

      <path
        d="M160 520 L262 520 M173 485 L249 485 M187 450 L236 450"
        stroke="#fbbf24"
        strokeWidth="4"
      />
    </g>
  );
}

function Building({
  x,
  y,
  width,
  height,
  neon,
}: {
  x:
    number;

  y:
    number;

  width:
    number;

  height:
    number;

  neon:
    boolean;
}) {
  const rows =
    Math.floor(
      height /
      35
    );


  const columns =
    Math.max(
      2,
      Math.floor(
        width /
        22
      )
    );


  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#111827"
        stroke={
          neon
            ? "#22d3ee"
            : "#334155"
        }
        strokeWidth="2"
      />


      {Array.from({
        length:
          rows,
      }).flatMap(
        (
          _,
          row
        ) =>
          Array.from({
            length:
              columns,
          }).map(
            (
              __,
              column
            ) => (
              <rect
                key={`${row}-${column}`}
                x={
                  x +
                  8 +
                  column *
                    19
                }
                y={
                  y +
                  12 +
                  row *
                    31
                }
                width="8"
                height="12"
                rx="2"
                fill={
                  neon
                    ? (
                        row +
                        column
                      ) %
                        2 ===
                      0
                      ? "#22d3ee"
                      : "#f472b6"
                    : (
                        row +
                        column
                      ) %
                        3 ===
                      0
                    ? "#fde68a"
                    : "#1e3a5f"
                }
              />
            )
          )
      )}
    </g>
  );
}


function Tree({
  x,
  y,
  scale,
}: {
  x:
    number;

  y:
    number;

  scale:
    number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <rect
        x="-6"
        y="22"
        width="12"
        height="45"
        fill="#5b3827"
      />

      <polygon
        points="0,-35 -35,35 35,35"
        fill="#184d2b"
      />

      <polygon
        points="0,-10 -30,50 30,50"
        fill="#236b38"
      />
    </g>
  );
}


function BackgroundAnimation({
  item,
}: {
  item:
    CosmeticItem | null;
}) {
  if (
    !item ||
    item.animation ===
      "none"
  ) {
    return null;
  }


  switch (
    item.visualId
  ) {
    case "master-storm-citadel":
      return (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]

            overflow-hidden
            rounded-[2.5rem]
          "
        >
          <div
            className="
              storm-cloud-bank-one
              absolute
              left-[-35%]
              top-[3%]

              h-28
              w-[170%]

              rounded-full
              bg-slate-700/55
              blur-2xl
            "
          />

          <div
            className="
              storm-cloud-bank-two
              absolute
              left-[-45%]
              top-[17%]

              h-24
              w-[180%]

              rounded-full
              bg-slate-900/55
              blur-xl
            "
          />

          <div
            className="
              cloud-lightning-glow-one
              absolute
              left-[3%]
              top-[2%]

              h-40
              w-64

              rounded-[50%]
              bg-cyan-100/70
              blur-3xl
            "
          />

          <div
            className="
              cloud-lightning-glow-two
              absolute
              right-[-4%]
              top-[11%]

              h-36
              w-56

              rounded-[50%]
              bg-violet-100/60
              blur-3xl
            "
          />

          <div
            className="
              cloud-lightning-glow-three
              absolute
              left-[31%]
              top-[18%]

              h-28
              w-52

              rounded-[50%]
              bg-white/45
              blur-3xl
            "
          />
        </div>
      );

    case "master-lava-palace":
      return (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]

            overflow-hidden
            rounded-[2.5rem]
          "
        >
          <svg
            className="
              absolute
              inset-0
              h-full
              w-full
            "
            viewBox="0 0 420 540"
          >
            <path
              className="lava-flow-one"
              d="M0 487 C68 452 127 511 199 463 C272 415 330 486 420 438 L420 540 L0 540 Z"
              fill="#f97316"
              opacity=".72"
            />

            <path
              className="lava-flow-two"
              d="M0 516 C80 470 141 536 214 489 C290 440 350 509 420 469 L420 540 L0 540 Z"
              fill="#facc15"
              opacity=".5"
            />
          </svg>

          {Array.from({
            length: 26,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={index}
                className="
                  palace-ember
                  absolute
                  bottom-[5%]

                  h-2
                  w-2

                  rounded-full
                  bg-orange-300
                  shadow-[0_0_12px_rgba(251,146,60,1)]
                "
                style={{
                  left:
                    `${8 + (index * 37) % 86}%`,

                  animationDelay:
                    `${(index % 11) * 0.19}s`,
                }}
              />
            )
          )}
        </div>
      );

    case "master-magic-library":
      return (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]

            overflow-hidden
            rounded-[2.5rem]
          "
        >
          {[
            [54, 130, "📕", 0],
            [316, 184, "📘", 0.5],
            [92, 292, "📗", 1],
            [289, 338, "📙", 1.5],
            [188, 238, "📖", 2],
          ].map(
            (
              book,
              index
            ) => (
              <span
                key={index}
                className="floating-book absolute text-4xl"
                style={{
                  left:
                    `${book[0]}px`,

                  top:
                    `${book[1]}px`,

                  animationDelay:
                    `${book[3]}s`,
                }}
              >
                {book[2]}
              </span>
            )
          )}

          <div
            className="
              library-page-one
              absolute
              left-[18%]
              top-[39%]

              h-4
              w-3

              rotate-12
              bg-amber-100
            "
          />

          <div
            className="
              library-page-two
              absolute
              right-[18%]
              top-[31%]

              h-4
              w-3

              -rotate-12
              bg-purple-100
            "
          />

          <div
            className="
              library-rune-pulse
              absolute
              bottom-[2%]
              left-1/2

              h-20
              w-[72%]

              -translate-x-1/2

              rounded-[50%]
              border-4
              border-purple-300/70
            "
          />
        </div>
      );

    case "legendary-cosmic-kingdom":
      return (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]

            overflow-hidden
            rounded-[2.5rem]
          "
        >
          {Array.from({
            length: 5,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={index}
                className="cosmic-comet absolute"
                style={{
                  top:
                    `${8 + index * 16}%`,

                  animationDelay:
                    `${index * 1.1}s`,
                }}
              >
                <span
                  className="
                    block
                    h-2.5
                    w-2.5

                    rounded-full
                    bg-white
                    shadow-[0_0_18px_rgba(255,255,255,1)]
                  "
                />
              </span>
            )
          )}

          <div
            className="cosmic-ship-one absolute left-[-25%] top-[28%] text-4xl"
          >
            🚀
          </div>

          <div
            className="cosmic-ship-two absolute right-[-24%] top-[56%] text-3xl"
          >
            🛸
          </div>

          <div
            className="
              cosmic-orbit-line
              absolute
              left-1/2
              top-[14%]

              h-24
              w-52

              -translate-x-1/2

              rounded-[50%]
              border-2
              border-yellow-200/45
            "
          />
        </div>
      );

    case "legendary-aurora-realm":
      return (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]

            overflow-hidden
            rounded-[2.5rem]
          "
        >
          <div
            className="
              realm-aurora-one
              absolute
              left-[-25%]
              top-[5%]

              h-36
              w-[155%]

              -rotate-6

              bg-gradient-to-r
              from-transparent
              via-emerald-300/45
              to-cyan-300/20

              blur-2xl
            "
          />

          <div
            className="
              realm-aurora-two
              absolute
              left-[-20%]
              top-[19%]

              h-32
              w-[150%]

              rotate-6

              bg-gradient-to-r
              from-purple-400/15
              via-violet-300/45
              to-transparent

              blur-2xl
            "
          />

          <div
            className="
              sky-train
              absolute
              left-[-55%]
              top-[54%]

              flex
              h-9
              w-52

              items-center
              gap-1

              rounded-xl
              border-2
              border-cyan-200

              bg-slate-900/95

              px-3

              shadow-[0_0_18px_rgba(34,211,238,.9)]
            "
          >
            {Array.from({
              length: 6,
            }).map(
              (
                _,
                index
              ) => (
                <span
                  key={index}
                  className="h-3 flex-1 rounded-sm bg-cyan-300"
                />
              )
            )}
          </div>
        </div>
      );

    case "legendary-solar-sanctuary":
      return (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[4]

            overflow-hidden
            rounded-[2.5rem]
          "
        >
          <div
            className="
              solar-ray-wheel
              absolute
              left-1/2
              top-[6%]

              h-44
              w-44

              -translate-x-1/2

              rounded-full
              border-[18px]
              border-dashed
              border-yellow-100/25
            "
          />

          <div
            className="launch-plane-one absolute bottom-[10%] left-[41%] text-4xl"
          >
            ✈️
          </div>

          <div
            className="launch-plane-two absolute bottom-[19%] left-[51%] text-3xl"
          >
            🛩️
          </div>

          <div
            className="solar-airship absolute right-[-35%] top-[30%] text-5xl"
          >
            🚀
          </div>

          <div
            className="
              runway-glow
              absolute
              bottom-[3%]
              left-1/2

              h-24
              w-[48%]

              -translate-x-1/2

              bg-gradient-to-t
              from-yellow-200/35
              to-transparent

              blur-xl
            "
          />
        </div>
      );

    default:
      return null;
  }
}

function ParticleField({
  count,
  className,
  particleClassName,
}: {
  count:
    number;

  className:
    string;

  particleClassName:
    string;
}) {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-[3]

        overflow-hidden
        rounded-[2.5rem]
      "
    >
      {Array.from({
        length:
          count,
      }).map(
        (
          _,
          index
        ) => (
          <span
            key={
              index
            }
            className={`
              absolute
              block

              ${className}
              ${particleClassName}
            `}
            style={{
              left:
                `${(
                  index *
                  37
                ) %
                  100}%`,

              top:
                `${(
                  index *
                  53
                ) %
                  84}%`,

              animationDelay:
                `${(
                  index %
                  9
                ) *
                  0.24}s`,
            }}
          />
        )
      )}
    </div>
  );
}


function SceneEffectLayer({
  item,
}: {
  item:
    CosmeticItem | null;
}) {
  if (!item) {
    return null;
  }


  const id =
    item.visualId;


  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-[35]

        overflow-hidden
        rounded-[2.5rem]
      "
    >
      {id ===
        "diamond-blizzard" && (
        <>
          <div
            className="
              scene-blizzard-haze
              absolute
              inset-0

              bg-gradient-to-b
              from-slate-200/10
              via-white/8
              to-slate-100/20
            "
          />

          {Array.from({
            length: 58,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className={`
                  absolute
                  rounded-full
                  bg-white

                  ${
                    index %
                      3 ===
                    0
                      ? "scene-blizzard-flake-near"
                      : index %
                          3 ===
                        1
                      ? "scene-blizzard-flake-mid"
                      : "scene-blizzard-flake-far"
                  }
                `}
                style={{
                  left:
                    `${(
                      index *
                      17
                    ) %
                    100}%`,

                  top:
                    `${-20 -
                      (
                        index %
                        9
                      ) *
                        12}px`,

                  width:
                    `${3 +
                      (
                        index %
                        4
                      ) *
                        2}px`,

                  height:
                    `${3 +
                      (
                        index %
                        4
                      ) *
                        2}px`,

                  animationDelay:
                    `${index * -0.18}s`,
                }}
              />
            )
          )}

          <div
            className="
              scene-blizzard-gust
              absolute
              left-[-30%]
              top-[18%]

              h-28
              w-[160%]

              rotate-[-12deg]

              bg-white/18
              blur-xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0

              h-16

              bg-gradient-to-t
              from-white/45
              to-transparent
            "
          />
        </>
      )}


      {id ===
        "diamond-supercell-storm" && (
        <>
          <div
            className="
              scene-supercell-darken
              absolute
              inset-0

              bg-slate-950/22
            "
          />

          <div
            className="
              scene-supercell-cloud
              absolute
              left-[-10%]
              top-[-6%]

              h-40
              w-[120%]

              rounded-[50%]

              bg-slate-300/26
              blur-2xl
            "
          />

          <div
            className="
              scene-supercell-flash
              absolute
              inset-0

              bg-cyan-100/0
            "
          />

          {Array.from({
            length: 34,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-supercell-rain
                  absolute

                  h-16
                  w-[2px]

                  -rotate-[14deg]

                  bg-cyan-100/70
                "
                style={{
                  left:
                    `${(
                      index *
                      13
                    ) %
                    100}%`,

                  top:
                    `${-80 -
                      (
                        index %
                        7
                      ) *
                        40}px`,

                  animationDelay:
                    `${index * -0.13}s`,
                }}
              />
            )
          )}

          <svg
            className="
              absolute
              inset-0

              h-full
              w-full
            "
            viewBox="0 0 420 540"
          >
            <path
              className="
                scene-supercell-bolt-one
              "
              d="
                M288 78
                L250 171
                L275 165
                L224 276
                L246 263
                L212 340
              "
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              className="
                scene-supercell-bolt-two
              "
              d="
                M128 103
                L161 183
                L143 178
                L184 259
              "
              fill="none"
              stroke="#bae6fd"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}


      {id ===
        "diamond-meteor-shower" && (
        <>
          <div
            className="
              absolute
              inset-0

              bg-[radial-gradient(circle_at_50%_12%,rgba(59,130,246,.12),transparent_52%)]
            "
          />

          {Array.from({
            length: 42,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-meteor-star
                  absolute

                  h-1
                  w-1

                  rounded-full

                  bg-white
                "
                style={{
                  left:
                    `${(
                      index *
                      23
                    ) %
                    100}%`,

                  top:
                    `${(
                      index *
                      11
                    ) %
                    70}%`,

                  animationDelay:
                    `${index * -0.21}s`,
                }}
              />
            )
          )}

          {Array.from({
            length: 7,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className={`
                  absolute

                  h-[3px]
                  w-24

                  -rotate-[32deg]

                  rounded-full

                  bg-gradient-to-r
                  from-transparent
                  via-cyan-100
                  to-white

                  ${
                    index ===
                    0
                      ? "scene-meteor-large"
                      : "scene-meteor-small"
                  }
                `}
                style={{
                  left:
                    `${-30 -
                      index *
                        16}%`,

                  top:
                    `${8 +
                      (
                        index *
                        9
                      ) %
                        54}%`,

                  animationDelay:
                    `${index * -1.4}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "master-dragon-flight" && (
        <>
          <div
            className="
              scene-dragon-smoke
              absolute
              bottom-[12%]
              left-[-10%]

              h-24
              w-[120%]

              bg-slate-500/18
              blur-2xl
            "
          />

          <div
            className="
              scene-dragon-flight
              absolute
              left-[-35%]
              top-[16%]

              text-[92px]

              opacity-80

              drop-shadow-[0_0_16px_rgba(0,0,0,.8)]
            "
          >
            🐉
          </div>

          <div
            className="
              scene-dragon-fire
              absolute
              left-[-20%]
              top-[38%]

              h-12
              w-[45%]

              rotate-[-8deg]

              rounded-full

              bg-gradient-to-r
              from-transparent
              via-orange-500
              to-yellow-200

              blur-md
            "
          />
        </>
      )}


      {id ===
        "master-air-show" && (
        <>
          {Array.from({
            length: 5,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={
                  index
                }
                className={`
                  scene-airshow-jet
                  absolute

                  text-4xl

                  ${
                    index ===
                    4
                      ? "scene-airshow-breakaway"
                      : ""
                  }
                `}
                style={{
                  left:
                    `${-20 -
                      index *
                        8}%`,

                  top:
                    `${16 +
                      index *
                        8}%`,

                  animationDelay:
                    `${index * -0.45}s`,
                }}
              >
                ✈️
              </div>
            )
          )}

          {Array.from({
            length: 5,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-airshow-contrail
                  absolute

                  h-1
                  w-[48%]

                  bg-white/45
                  blur-[1px]
                "
                style={{
                  left:
                    `${-34 -
                      index *
                        8}%`,

                  top:
                    `${21 +
                      index *
                        8}%`,

                  animationDelay:
                    `${index * -0.45}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "master-orbital-battle" && (
        <>
          <div
            className="
              scene-orbital-capital
              absolute
              right-[-28%]
              top-[10%]

              h-20
              w-52

              rotate-[-8deg]

              rounded-[50%_20%_20%_50%]

              border-2
              border-cyan-200/60

              bg-slate-700/65

              shadow-[0_0_22px_rgba(103,232,249,.4)]
            "
          />

          {Array.from({
            length: 7,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-orbital-fighter
                  absolute

                  text-2xl
                "
                style={{
                  left:
                    `${-20 -
                      index *
                        11}%`,

                  top:
                    `${18 +
                      (
                        index *
                        9
                      ) %
                        60}%`,

                  animationDelay:
                    `${index * -0.55}s`,
                }}
              >
                🚀
              </span>
            )
          )}

          {Array.from({
            length: 10,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-orbital-laser
                  absolute

                  h-[3px]
                  w-20

                  rotate-[-12deg]

                  rounded-full

                  bg-cyan-200
                  shadow-[0_0_10px_rgba(103,232,249,.9)]
                "
                style={{
                  left:
                    `${10 +
                      (
                        index *
                        13
                      ) %
                        80}%`,

                  top:
                    `${16 +
                      (
                        index *
                        17
                      ) %
                        66}%`,

                  animationDelay:
                    `${index * -0.28}s`,
                }}
              />
            )
          )}

          {Array.from({
            length: 5,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-orbital-explosion
                  absolute

                  h-8
                  w-8

                  rounded-full

                  bg-orange-300
                  shadow-[0_0_22px_rgba(251,146,60,.9)]
                "
                style={{
                  left:
                    `${18 +
                      index *
                        16}%`,

                  top:
                    `${20 +
                      (
                        index %
                        3
                      ) *
                        22}%`,

                  animationDelay:
                    `${index * -0.7}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "legendary-celestial-eclipse" && (
        <>
          <div
            className="
              scene-eclipse-dim
              absolute
              inset-0

              bg-slate-950/0
            "
          />

          <div
            className="
              scene-eclipse-sun
              absolute
              left-1/2
              top-[12%]

              h-44
              w-44

              -translate-x-1/2

              rounded-full

              bg-yellow-100

              shadow-[0_0_44px_rgba(253,224,71,.9)]
            "
          />

          <div
            className="
              scene-eclipse-moon
              absolute
              left-[18%]
              top-[12%]

              h-44
              w-44

              rounded-full

              bg-slate-950
            "
          />

          {Array.from({
            length: 24,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-eclipse-star
                  absolute

                  h-1
                  w-1

                  rounded-full

                  bg-white
                "
                style={{
                  left:
                    `${(
                      index *
                      19
                    ) %
                    100}%`,

                  top:
                    `${(
                      index *
                      13
                    ) %
                    68}%`,

                  animationDelay:
                    `${index * -0.17}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "legendary-ancient-titan" && (
        <>
          <div
            className="
              scene-titan-clouds
              absolute
              left-[-15%]
              top-[12%]

              h-28
              w-[130%]

              bg-slate-300/18
              blur-2xl
            "
          />

          <div
            className="
              scene-titan-body
              absolute
              bottom-[-10%]
              left-[50%]

              h-[75%]
              w-[34%]

              -translate-x-1/2

              rounded-[45%_45%_18%_18%]

              bg-slate-950/78

              shadow-[0_0_30px_rgba(0,0,0,.9)]
            "
          >
            <div
              className="
                scene-titan-eye-left
                absolute
                left-[34%]
                top-[16%]

                h-2
                w-3

                rounded-full

                bg-amber-300

                shadow-[0_0_12px_rgba(252,211,77,.95)]
              "
            />

            <div
              className="
                scene-titan-eye-right
                absolute
                right-[34%]
                top-[16%]

                h-2
                w-3

                rounded-full

                bg-amber-300

                shadow-[0_0_12px_rgba(252,211,77,.95)]
              "
            />
          </div>

          <div
            className="
              scene-titan-dust
              absolute
              bottom-[4%]
              left-[-10%]

              h-24
              w-[120%]

              bg-amber-200/16
              blur-2xl
            "
          />
        </>
      )}


      {id ===
        "legendary-reality-collapse" && (
        <>
          <div
            className="
              scene-reality-aurora
              absolute
              left-[-20%]
              top-[4%]

              h-40
              w-[140%]

              rotate-[-8deg]

              bg-gradient-to-r
              from-transparent
              via-cyan-300/30
              to-fuchsia-400/30

              blur-2xl
            "
          />

          <div
            className="
              scene-reality-rift
              absolute
              left-1/2
              top-[24%]

              h-56
              w-24

              -translate-x-1/2
              rotate-[16deg]

              rounded-[50%]

              border-[5px]
              border-violet-200/80

              bg-slate-950/65

              shadow-[0_0_34px_rgba(192,132,252,.9)]
            "
          />

          {Array.from({
            length: 9,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-reality-debris
                  absolute
                  left-1/2
                  top-1/2

                  h-4
                  w-7

                  rounded-md

                  bg-slate-200/70
                "
                style={{
                  animationDelay:
                    `${index * -0.32}s`,
                }}
              />
            )
          )}

          {Array.from({
            length: 5,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  scene-reality-comet
                  absolute

                  h-[3px]
                  w-28

                  -rotate-[28deg]

                  rounded-full

                  bg-gradient-to-r
                  from-transparent
                  via-white
                  to-cyan-200
                "
                style={{
                  left:
                    `${-30 -
                      index *
                        20}%`,

                  top:
                    `${12 +
                      index *
                        13}%`,

                  animationDelay:
                    `${index * -1.3}s`,
                }}
              />
            )
          )}

          <div
            className="
              scene-reality-light
              absolute
              inset-0

              bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.28),transparent_44%)]
            "
          />
        </>
      )}
    </div>
  );
}


function AuraLayer({
  item,
}: {
  item:
    CosmeticItem | null;
}) {
  if (!item) {
    return null;
  }


  const colors =
    tierColors[
      item.tier
    ];


  const id =
    item.visualId;


  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-[8]

        overflow-hidden
        rounded-[2.5rem]
      "
    >
      <div
        className="
          absolute
          bottom-[58px]
          left-1/2

          h-[350px]
          w-[270px]

          -translate-x-1/2

          rounded-[48%]

          bg-black/25
          blur-xl
        "
      />


      {id ===
        "bronze-soft-glow" && (
        <div
          className="
            aura-soft-halo
            absolute
            bottom-[82px]
            left-1/2

            h-[302px]
            w-[208px]

            -translate-x-1/2

            rounded-[48%]

            border-2
          "
          style={{
            borderColor:
              colors.highlight,

            boxShadow:
              `0 0 28px ${colors.primary}, inset 0 0 26px ${colors.primary}`,
          }}
        />
      )}


      {id ===
        "bronze-ring" && (
        <>
          <div
            className="
              aura-ground-ring
              absolute
              bottom-[58px]
              left-1/2

              h-16
              w-56

              -translate-x-1/2

              rounded-[50%]

              border-[5px]
            "
            style={{
              borderColor:
                colors.highlight,

              boxShadow:
                `0 0 22px ${colors.primary}, inset 0 0 18px ${colors.primary}`,
            }}
          />

          <div
            className="
              absolute
              bottom-[70px]
              left-1/2

              h-[270px]
              w-40

              -translate-x-1/2

              bg-gradient-to-t
              from-white/20
              via-white/5
              to-transparent

              blur-xl
            "
          />
        </>
      )}


      {id ===
        "bronze-dust" && (
        <>
          <div
            className="
              aura-ember-outline
              absolute
              bottom-[80px]
              left-1/2

              h-[300px]
              w-[205px]

              -translate-x-1/2

              rounded-[48%]

              border-[3px]
            "
            style={{
              borderColor:
                colors.highlight,

              filter:
                `drop-shadow(0 0 10px ${colors.primary})`,
            }}
          />

          {Array.from({
            length:
              12,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  aura-warm-speck
                  absolute

                  h-1.5
                  w-1.5

                  rounded-full
                "
                style={{
                  left:
                    `${30 +
                      (
                        index *
                        7
                      ) %
                        42}%`,

                  bottom:
                    `${82 +
                      (
                        index %
                        5
                      ) *
                        52}px`,

                  backgroundColor:
                    colors.highlight,

                  boxShadow:
                    `0 0 8px ${colors.primary}`,

                  animationDelay:
                    `${index * 0.16}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "silver-mist" && (
        <>
          <div
            className="
              absolute
              bottom-[110px]
              left-1/2

              h-[240px]
              w-[205px]

              -translate-x-1/2

              rounded-[48%]

              border-2
              border-slate-100/75

              shadow-[0_0_24px_rgba(226,232,240,.8)]
            "
          />

          <div
            className="
              aura-moon-mist-one
              absolute
              bottom-[65px]
              left-[-22%]

              h-20
              w-[145%]

              rounded-full

              bg-slate-100/28
              blur-xl
            "
          />

          <div
            className="
              aura-moon-mist-two
              absolute
              bottom-[112px]
              left-[-18%]

              h-16
              w-[138%]

              rounded-full

              bg-cyan-100/20
              blur-xl
            "
          />
        </>
      )}


      {id ===
        "silver-wind-ring" && (
        <svg
          className="
            absolute
            inset-0

            h-full
            w-full
          "
          viewBox="0 0 420 540"
        >
          <ellipse
            className="
              aura-wind-ribbon-one
            "
            cx="210"
            cy="325"
            rx="112"
            ry="50"
            fill="none"
            stroke={
              colors.highlight
            }
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="140 52"
            opacity=".9"
          />

          <ellipse
            className="
              aura-wind-ribbon-two
            "
            cx="210"
            cy="258"
            rx="93"
            ry="42"
            fill="none"
            stroke={
              colors.primary
            }
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="110 64"
            opacity=".85"
          />
        </svg>
      )}


      {id ===
        "silver-moon-glow" && (
        <>
          <div
            className="
              aura-lunar-disc
              absolute
              bottom-[148px]
              left-1/2

              h-48
              w-48

              -translate-x-1/2

              rounded-full

              border-4
              border-slate-100/80

              bg-slate-200/20

              shadow-[0_0_34px_rgba(226,232,240,.85)]
            "
          />

          <div
            className="
              aura-lunar-crescent
              absolute
              bottom-[183px]
              left-[47%]

              h-28
              w-20

              rounded-[50%]

              border-r-[8px]
              border-cyan-100
            "
          />
        </>
      )}


      {id ===
        "gold-sunburst" && (
        <>
          <div
            className="
              absolute
              bottom-[144px]
              left-1/2

              h-52
              w-52

              -translate-x-1/2

              rounded-full

              bg-black/45

              ring-4
              ring-yellow-100/80
            "
          />

          <div
            className="
              aura-solar-rays
              absolute
              bottom-[115px]
              left-1/2

              h-64
              w-64

              -translate-x-1/2

              rounded-full
            "
            style={{
              background:
                `repeating-conic-gradient(from 0deg, ${colors.highlight} 0deg 8deg, transparent 8deg 20deg)`,
            }}
          />
        </>
      )}


      {id ===
        "gold-orbit" && (
        <div
          className="
            absolute
            inset-0
          "
        >
          <div
            className="
              aura-gold-orbit-one
              absolute
              bottom-[145px]
              left-1/2

              h-[190px]
              w-[255px]

              -translate-x-1/2

              rounded-[50%]

              border-[5px]
            "
            style={{
              borderColor:
                colors.highlight,

              boxShadow:
                `0 0 18px ${colors.primary}`,
            }}
          />

          <div
            className="
              aura-gold-orbit-two
              absolute
              bottom-[122px]
              left-1/2

              h-[240px]
              w-[165px]

              -translate-x-1/2

              rounded-[50%]

              border-[4px]
            "
            style={{
              borderColor:
                colors.primary,
            }}
          />
        </div>
      )}


      {id ===
        "gold-flame-aura" && (
        <>
          <div
            className="
              aura-flame-backdrop
              absolute
              bottom-[70px]
              left-1/2

              h-[330px]
              w-[230px]

              -translate-x-1/2

              rounded-[45%_45%_28%_28%]
            "
            style={{
              background:
                `radial-gradient(ellipse at center, transparent 42%, ${colors.primary}75 63%, transparent 76%)`,

              filter:
                `drop-shadow(0 0 16px ${colors.primary})`,
            }}
          />

          {Array.from({
            length:
              9,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  aura-back-flame
                  absolute
                  bottom-[72px]

                  block

                  h-20
                  w-8

                  rounded-[60%_40%_70%_30%]
                "
                style={{
                  left:
                    `${26 +
                      index *
                        6}%`,

                  background:
                    `linear-gradient(to top, ${colors.secondary}, ${colors.highlight}, transparent)`,

                  animationDelay:
                    `${index * 0.11}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "platinum-neon-field" && (
        <>
          <div
            className="
              aura-neon-grid
              absolute
              bottom-[78px]
              left-1/2

              h-[310px]
              w-[220px]

              -translate-x-1/2

              rounded-[42%]

              border-2
            "
            style={{
              borderColor:
                colors.highlight,

              backgroundImage:
                `linear-gradient(${colors.primary}33 1px, transparent 1px), linear-gradient(90deg, ${colors.primary}33 1px, transparent 1px)`,

              backgroundSize:
                "20px 20px",

              boxShadow:
                `0 0 26px ${colors.primary}`,
            }}
          />

          <div
            className="
              aura-neon-scan
              absolute
              bottom-[80px]
              left-1/2

              h-2
              w-[214px]

              -translate-x-1/2
            "
            style={{
              backgroundColor:
                colors.highlight,

              boxShadow:
                `0 0 16px ${colors.highlight}`,
            }}
          />
        </>
      )}


      {id ===
        "platinum-electric-ring" && (
        <>
          <div
            className="
              aura-electric-cage
              absolute
              bottom-[90px]
              left-1/2

              h-[300px]
              w-[220px]

              -translate-x-1/2

              rounded-[48%]

              border-[5px]
            "
            style={{
              borderColor:
                colors.primary,

              boxShadow:
                `0 0 28px ${colors.primary}, inset 0 0 22px ${colors.primary}`,
            }}
          />

          <svg
            className="
              absolute
              inset-0

              h-full
              w-full
            "
            viewBox="0 0 420 540"
          >
            {[
              "M117 360 L139 328 L129 328 L150 292",
              "M305 352 L281 322 L292 322 L270 287",
              "M132 213 L151 187 L143 187 L161 158",
              "M287 215 L269 187 L278 187 L260 157",
            ].map(
              (
                path,
                index
              ) => (
                <path
                  key={
                    index
                  }
                  className="
                    aura-cage-arc
                  "
                  d={
                    path
                  }
                  fill="none"
                  stroke={
                    index %
                      2 ===
                    0
                      ? colors.highlight
                      : colors.primary
                  }
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animationDelay:
                      `${index * 0.23}s`,
                  }}
                />
              )
            )}
          </svg>
        </>
      )}


      {id ===
        "platinum-hologram" && (
        <>
          <div
            className="
              aura-holo-echo-left
              absolute
              bottom-[92px]
              left-[38%]

              h-[290px]
              w-28

              rounded-[48%]

              border-2
              border-cyan-200/60

              bg-cyan-300/10
              blur-[1px]
            "
          />

          <div
            className="
              aura-holo-echo-right
              absolute
              bottom-[92px]
              right-[38%]

              h-[290px]
              w-28

              rounded-[48%]

              border-2
              border-fuchsia-200/55

              bg-fuchsia-300/10
              blur-[1px]
            "
          />

          <div
            className="
              absolute
              bottom-[91px]
              left-1/2

              h-[292px]
              w-[205px]

              -translate-x-1/2

              rounded-[48%]

              border-2
              border-white/80
            "
          />
        </>
      )}


      {id ===
        "diamond-crystal-aura" && (
        <>
          <div
            className="
              aura-crystal-halo
              absolute
              bottom-[125px]
              left-1/2

              h-[245px]
              w-[245px]

              -translate-x-1/2

              rounded-full

              border-[8px]
              border-cyan-100/80

              shadow-[0_0_30px_rgba(103,232,249,.9)]
            "
          />

          {Array.from({
            length:
              10,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  aura-crystal-segment
                  absolute

                  h-14
                  w-5

                  rotate-45

                  rounded-sm
                "
                style={{
                  left:
                    `${20 +
                      (
                        index *
                        7
                      ) %
                        60}%`,

                  bottom:
                    `${102 +
                      (
                        index %
                        4
                      ) *
                        62}px`,

                  background:
                    index %
                      2 ===
                    0
                      ? "linear-gradient(135deg,#cffafe,#67e8f9,#0e7490)"
                      : "linear-gradient(135deg,#f3e8ff,#c084fc,#7e22ce)",

                  animationDelay:
                    `${index * 0.14}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "diamond-lightning" && (
        <>
          <div
            className="
              aura-lightning-crown
              absolute
              bottom-[146px]
              left-1/2

              h-52
              w-52

              -translate-x-1/2

              rounded-full

              border-4
              border-cyan-100/80

              bg-black/35

              shadow-[0_0_30px_rgba(103,232,249,.85)]
            "
          />

          <svg
            className="
              absolute
              inset-0

              h-full
              w-full
            "
            viewBox="0 0 420 540"
          >
            {[
              "M118 310 L147 248 L131 248 L166 183",
              "M302 310 L271 249 L288 249 L254 181",
              "M150 174 L172 128 L160 128 L187 88",
              "M270 174 L248 128 L260 128 L234 88",
            ].map(
              (
                path,
                index
              ) => (
                <path
                  key={
                    index
                  }
                  className="
                    aura-diamond-bolt
                  "
                  d={
                    path
                  }
                  fill="none"
                  stroke={
                    index %
                      2 ===
                    0
                      ? "#e0f2fe"
                      : "#67e8f9"
                  }
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animationDelay:
                      `${index * 0.19}s`,
                  }}
                />
              )
            )}
          </svg>
        </>
      )}


      {id ===
        "diamond-ice-field" && (
        <>
          <div
            className="
              absolute
              bottom-[92px]
              left-1/2

              h-[292px]
              w-[210px]

              -translate-x-1/2

              rounded-[48%]

              border-[3px]
              border-cyan-50/90

              shadow-[0_0_28px_rgba(165,243,252,.9)]
            "
          />

          {[
            [85, 276, 64],
            [113, 231, 92],
            [294, 274, 66],
            [266, 226, 96],
          ].map(
            (
              pillar,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  aura-ice-pillar
                  absolute

                  w-10

                  rounded-t-[50%]
                "
                style={{
                  left:
                    `${pillar[0]}px`,

                  bottom:
                    `${540 -
                      pillar[1] -
                      pillar[2]}px`,

                  height:
                    `${pillar[2]}px`,

                  background:
                    "linear-gradient(to top,#0891b2,#cffafe,transparent)",

                  filter:
                    "drop-shadow(0 0 10px rgba(103,232,249,.8))",

                  animationDelay:
                    `${index * 0.2}s`,
                }}
              />
            )
          )}

          <div
            className="
              aura-cold-vapor
              absolute
              bottom-[65px]
              left-[-15%]

              h-20
              w-[130%]

              rounded-full

              bg-cyan-100/28
              blur-xl
            "
          />
        </>
      )}


      {id ===
        "master-rune-circle" && (
        <>
          <div
            className="
              aura-master-rune-outer
              absolute
              bottom-[105px]
              left-1/2

              h-[280px]
              w-[280px]

              -translate-x-1/2

              rounded-full

              border-[5px]
            "
            style={{
              borderColor:
                colors.primary,

              boxShadow:
                `0 0 28px ${colors.primary}`,
            }}
          />

          <div
            className="
              aura-master-rune-inner
              absolute
              bottom-[137px]
              left-1/2

              h-[216px]
              w-[216px]

              -translate-x-1/2

              rounded-full

              border-[3px]
            "
            style={{
              borderColor:
                colors.highlight,
            }}
          />

          <div
            className="
              aura-master-rune-symbols
              absolute
              bottom-[80px]
              left-1/2

              -translate-x-1/2

              whitespace-nowrap

              text-4xl
              tracking-[0.55em]
            "
            style={{
              color:
                colors.highlight,

              textShadow:
                `0 0 12px ${colors.primary}`,
            }}
          >
            ✦ ᚱ ✧ ᛟ ✦
          </div>
        </>
      )}


      {id ===
        "master-rising-fire" && (
        <>
          <div
            className="
              aura-inferno-core
              absolute
              bottom-[78px]
              left-1/2

              h-[315px]
              w-[220px]

              -translate-x-1/2

              rounded-[48%]

              bg-black/50

              ring-4
              ring-orange-300/80
            "
          />

          {Array.from({
            length:
              13,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  aura-inferno-vortex
                  absolute
                  bottom-[76px]
                  left-1/2

                  h-4
                  w-4

                  rounded-full
                "
                style={{
                  background:
                    index %
                      2 ===
                    0
                      ? colors.highlight
                      : colors.primary,

                  boxShadow:
                    `0 0 14px ${colors.primary}`,

                  animationDelay:
                    `${index * -0.18}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "master-star-field" && (
        <>
          <div
            className="
              aura-astral-halo
              absolute
              bottom-[105px]
              left-1/2

              h-[275px]
              w-[275px]

              -translate-x-1/2

              rounded-full

              border-[5px]
              border-violet-200/85

              bg-[radial-gradient(circle,rgba(76,29,149,.32),rgba(15,23,42,.55),transparent_72%)]

              shadow-[0_0_30px_rgba(192,132,252,.85)]
            "
          />

          <svg
            className="
              aura-constellation
              absolute
              inset-0

              h-full
              w-full
            "
            viewBox="0 0 420 540"
          >
            <path
              d="
                M121 315
                L161 247
                L212 275
                L264 206
                L310 267
                L278 334
                L207 359
                L145 340
                Z
              "
              fill="none"
              stroke="#f3e8ff"
              strokeWidth="3"
              strokeDasharray="8 8"
            />

            {[
              [121,315],
              [161,247],
              [212,275],
              [264,206],
              [310,267],
              [278,334],
              [207,359],
              [145,340],
            ].map(
              (
                point,
                index
              ) => (
                <circle
                  key={
                    index
                  }
                  cx={
                    point[0]
                  }
                  cy={
                    point[1]
                  }
                  r="6"
                  fill="#ffffff"
                  style={{
                    filter:
                      "drop-shadow(0 0 8px #c084fc)",
                  }}
                />
              )
            )}
          </svg>
        </>
      )}


      {id ===
        "legendary-cosmic-aura" && (
        <>
          <div
            className="
              aura-singularity
              absolute
              bottom-[108px]
              left-1/2

              h-[275px]
              w-[275px]

              -translate-x-1/2

              rounded-full

              border-[13px]
              border-violet-300/90

              bg-black

              shadow-[0_0_36px_rgba(168,85,247,.95),inset_0_0_40px_rgba(59,130,246,.65)]
            "
          />

          {Array.from({
            length:
              14,
          }).map(
            (
              _,
              index
            ) => (
              <span
                key={
                  index
                }
                className="
                  aura-singularity-debris
                  absolute
                  left-1/2
                  top-1/2

                  h-3
                  w-5

                  rounded-full
                "
                style={{
                  background:
                    index %
                      2 ===
                    0
                      ? "#f5d0fe"
                      : "#93c5fd",

                  boxShadow:
                    "0 0 12px rgba(192,132,252,.9)",

                  animationDelay:
                    `${index * -0.2}s`,
                }}
              />
            )
          )}
        </>
      )}


      {id ===
        "legendary-solar-aura" && (
        <>
          <div
            className="
              aura-solar-deity-disc
              absolute
              bottom-[112px]
              left-1/2

              h-[270px]
              w-[270px]

              -translate-x-1/2

              rounded-full

              border-[10px]
              border-yellow-100

              bg-[radial-gradient(circle,#fff7c2_0%,#facc15_28%,#ea580c_58%,transparent_72%)]

              shadow-[0_0_40px_rgba(250,204,21,.95)]
            "
          />

          <div
            className="
              aura-solar-deity-rays
              absolute
              bottom-[78px]
              left-1/2

              h-[338px]
              w-[338px]

              -translate-x-1/2

              rounded-full
            "
            style={{
              background:
                "repeating-conic-gradient(from 0deg,#fef3c7 0deg 5deg,transparent 5deg 14deg)",
            }}
          />

          <div
            className="
              aura-plasma-arc
              absolute
              bottom-[105px]
              left-1/2

              h-[280px]
              w-[280px]

              -translate-x-1/2

              rounded-full

              border-[4px]
              border-orange-300/80
            "
          />
        </>
      )}


      {id ===
        "legendary-celestial-storm" && (
        <>
          <div
            className="
              aura-tempest-shell
              absolute
              bottom-[88px]
              left-1/2

              h-[305px]
              w-[255px]

              -translate-x-1/2

              rounded-[48%]

              border-[7px]
              border-cyan-100/90

              bg-[radial-gradient(circle,rgba(15,23,42,.2),rgba(30,64,175,.28),rgba(2,6,23,.55))]

              shadow-[0_0_38px_rgba(125,211,252,.9)]
            "
          />

          <div
            className="
              aura-tempest-cloud-one
              absolute
              bottom-[305px]
              left-[23%]

              h-20
              w-40

              rounded-full

              bg-slate-200/40
              blur-lg
            "
          />

          <div
            className="
              aura-tempest-cloud-two
              absolute
              bottom-[255px]
              right-[20%]

              h-16
              w-36

              rounded-full

              bg-cyan-100/30
              blur-lg
            "
          />

          <div
            className="
              aura-tempest-ring
              absolute
              bottom-[116px]
              left-1/2

              h-[250px]
              w-[285px]

              -translate-x-1/2

              rounded-[50%]

              border-[4px]
              border-violet-200/80
            "
          />
        </>
      )}
    </div>
  );
}


function CharacterFigure({
  gender,
  skinColor,
  hairColor,
  hairStyle,
  glasses,
  earrings,
  outfit,
  accessory,
  heldItem,
  heldItemHand,
  pose,
}: {
  gender:
    "male" | "female";

  skinColor:
    string;

  hairColor:
    string;

  hairStyle:
    string;

  glasses:
    string;

  earrings:
    string;

  outfit:
    CosmeticItem | null;

  accessory:
    CosmeticItem | null;

  heldItem:
    CosmeticItem | null;

  heldItemHand:
    HeldItemHand;

  pose:
    CosmeticItem | null;
}) {
  const poseData =
    getPoseData(
      pose?.visualId
    );


  return (
    <svg
      width="270"
      height="365"
      viewBox="0 0 270 365"
      className="
        overflow-visible

        drop-shadow-[0_18px_18px_rgba(0,0,0,.65)]
      "
    >
      <PoseEquipment
        visualId={
          pose?.visualId
        }
      />


      <g
        className={
          getPoseAnimationClass(
            pose?.visualId
          )
        }
      >
        <g
          transform={`
            translate(
              ${poseData.torsoX}
              ${poseData.torsoY}
            )
            rotate(
              ${poseData.torsoRotation}
              135
              185
            )
            scale(
              ${poseData.characterScale}
            )
          `}
          style={{
            transformOrigin:
              "135px 185px",
          }}
        >
        <HairBack
          style={
            hairStyle
          }
          color={
            hairColor
          }
        />


        <AccessoryBack
          item={
            accessory
          }
        />


        <Legs
          style={
            poseData.legs
          }
          outfit={
            outfit
          }
          skinColor={
            skinColor
          }
        />


        <BodyAndOutfit
          gender={
            gender
          }
          skinColor={
            skinColor
          }
          outfit={
            outfit
          }
        />


        <Arms
          skinColor={
            skinColor
          }
          outfit={
            outfit
          }
          leftArm={
            poseData.leftArm
          }
          rightArm={
            poseData.rightArm
          }
        />


        <rect
          x="118"
          y="106"
          width="34"
          height="36"
          rx="12"
          fill={
            skinColor
          }
        />


        <ellipse
          cx="135"
          cy="74"
          rx="44"
          ry="53"
          fill={
            skinColor
          }
          stroke="rgba(0,0,0,.12)"
          strokeWidth="2"
        />


        <ellipse
          cx="91"
          cy="76"
          rx="7"
          ry="12"
          fill={
            skinColor
          }
        />

        <ellipse
          cx="179"
          cy="76"
          rx="7"
          ry="12"
          fill={
            skinColor
          }
        />


        <Face
          glasses={
            glasses
          }
          earrings={
            earrings
          }
        />


        <HairFront
          style={
            hairStyle
          }
          color={
            hairColor
          }
        />


        <AccessoryFront
          item={
            accessory
          }
        />


        <HeldItem
          item={
            heldItem
          }
          selectedHand={
            heldItemHand
          }
          pose={
            poseData
          }
          poseVisualId={
            pose?.visualId
          }
        />
        </g>
      </g>
    </svg>
  );
}


function getPoseAnimationClass(
  visualId?:
    string
): string {
  if (!visualId) {
    return "";
  }


  if (
    visualId.includes(
      "pushup-loop"
    )
  ) {
    return "pose-pushup-loop";
  }


  if (
    visualId.includes(
      "pullup-loop"
    )
  ) {
    return "pose-pullup-loop";
  }


  if (
    visualId.includes(
      "jumping-jack-loop"
    )
  ) {
    return "pose-jumping-jack-loop";
  }


  if (
    visualId.includes(
      "combat-combo"
    )
  ) {
    return "pose-combat-combo";
  }


  if (
    visualId.includes(
      "power-leap"
    )
  ) {
    return "pose-power-leap";
  }


  if (
    visualId.includes(
      "champion-ascension"
    )
  ) {
    return "pose-champion-ascension";
  }


  return "";
}


function PoseEquipment({
  visualId,
}: {
  visualId?:
    string;
}) {
  if (
    visualId?.includes(
      "pullup-loop"
    )
  ) {
    return (
      <g>
        <rect
          x="48"
          y="11"
          width="174"
          height="9"
          rx="4"
          fill="#52525b"
          stroke="#d4d4d8"
          strokeWidth="3"
        />

        <rect
          x="58"
          y="18"
          width="8"
          height="42"
          rx="4"
          fill="#3f3f46"
        />

        <rect
          x="204"
          y="18"
          width="8"
          height="42"
          rx="4"
          fill="#3f3f46"
        />
      </g>
    );
  }


  if (
    visualId?.includes(
      "pushup-loop"
    ) ||
    visualId?.includes(
      "hero-landing"
    )
  ) {
    return (
      <path
        d="
          M24 334
          Q135 326 246 334
        "
        fill="none"
        stroke="rgba(255,255,255,.28)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  }


  if (
    visualId?.includes(
      "photographer-crouch"
    )
  ) {
    return (
      <g
        transform="
          translate(172 118)
        "
      >
        <rect
          x="0"
          y="0"
          width="43"
          height="29"
          rx="6"
          fill="#18181b"
          stroke="#a1a1aa"
          strokeWidth="3"
        />

        <circle
          cx="22"
          cy="15"
          r="9"
          fill="#38bdf8"
          stroke="#e0f2fe"
          strokeWidth="3"
        />
      </g>
    );
  }


  return null;
}


function getPoseData(
  visualId?:
    string
): CharacterPose {
  switch (
    visualId
  ) {
    case undefined:
    case "default-pose":
    case "bronze-neutral-ready":
      return {
        torsoX: 0,
        torsoY: 0,
        torsoRotation: 0,
        leftArm: "down",
        rightArm: "down",
        legs: "standing",
        characterScale: 1,
      };

    case "bronze-trail-lean":
      return {
        torsoX: -8,
        torsoY: 13,
        torsoRotation: -9,
        leftArm: "forward",
        rightArm: "hip",
        legs: "kneeling",
        characterScale: 0.98,
      };

    case "bronze-explorer-point":
      return {
        torsoX: 5,
        torsoY: 1,
        torsoRotation: 3,
        leftArm: "down",
        rightArm: "forward",
        legs: "wide",
        characterScale: 1,
      };

    case "silver-arms-crossed":
      return {
        torsoX: 0,
        torsoY: 0,
        torsoRotation: 0,
        leftArm: "cross",
        rightArm: "cross",
        legs: "wide",
        characterScale: 1.01,
      };

    case "silver-thinking":
      return {
        torsoX: -1,
        torsoY: 1,
        torsoRotation: 2,
        leftArm: "cross",
        rightArm: "forward",
        legs: "crossed",
        characterScale: 1,
      };

    case "silver-victory-salute":
      return {
        torsoX: 0,
        torsoY: 0,
        torsoRotation: -2,
        leftArm: "hip",
        rightArm: "up",
        legs: "wide",
        characterScale: 1,
      };

    case "gold-double-biceps":
      return {
        torsoX: 0,
        torsoY: 0,
        torsoRotation: 0,
        leftArm: "up",
        rightArm: "up",
        legs: "wide",
        characterScale: 1.03,
      };

    case "gold-prayer-stance":
      return {
        torsoX: 0,
        torsoY: 1,
        torsoRotation: 0,
        leftArm: "prayer",
        rightArm: "prayer",
        legs: "standing",
        characterScale: 1,
      };

    case "gold-swordmaster-guard":
      return {
        torsoX: 7,
        torsoY: 2,
        torsoRotation: 8,
        leftArm: "forward",
        rightArm: "hip",
        legs: "wide",
        characterScale: 1,
      };

    case "platinum-photographer-crouch":
      return {
        torsoX: -12,
        torsoY: 34,
        torsoRotation: -8,
        leftArm: "forward",
        rightArm: "forward",
        legs: "kneeling",
        characterScale: 0.92,
      };

    case "platinum-guitar-performance":
      return {
        torsoX: 3,
        torsoY: 4,
        torsoRotation: -10,
        leftArm: "forward",
        rightArm: "forward",
        legs: "wide",
        characterScale: 1,
      };

    case "platinum-hero-landing":
      return {
        torsoX: -5,
        torsoY: 38,
        torsoRotation: -12,
        leftArm: "forward",
        rightArm: "hip",
        legs: "kneeling",
        characterScale: 0.94,
      };

    case "diamond-levitation":
      return {
        torsoX: 0,
        torsoY: -26,
        torsoRotation: 0,
        leftArm: "forward",
        rightArm: "forward",
        legs: "floating",
        characterScale: 0.97,
      };

    case "diamond-power-charge":
      return {
        torsoX: 0,
        torsoY: 22,
        torsoRotation: 0,
        leftArm: "down",
        rightArm: "down",
        legs: "wide",
        characterScale: 1.05,
      };

    case "diamond-meditation-float":
      return {
        torsoX: 0,
        torsoY: -8,
        torsoRotation: 0,
        leftArm: "prayer",
        rightArm: "prayer",
        legs: "crossed",
        characterScale: 0.93,
      };

    case "master-pushup-loop":
      return {
        torsoX: 0,
        torsoY: 0,
        torsoRotation: 0,
        leftArm: "forward",
        rightArm: "forward",
        legs: "standing",
        characterScale: 0.82,
      };

    case "master-pullup-loop":
      return {
        torsoX: 0,
        torsoY: 28,
        torsoRotation: 0,
        leftArm: "up",
        rightArm: "up",
        legs: "floating",
        characterScale: 0.9,
      };

    case "master-jumping-jack-loop":
      return {
        torsoX: 0,
        torsoY: 0,
        torsoRotation: 0,
        leftArm: "up",
        rightArm: "up",
        legs: "wide",
        characterScale: 0.98,
      };

    case "legendary-combat-combo":
      return {
        torsoX: 0,
        torsoY: 2,
        torsoRotation: -4,
        leftArm: "hip",
        rightArm: "forward",
        legs: "wide",
        characterScale: 1,
      };

    case "legendary-power-leap":
      return {
        torsoX: 0,
        torsoY: 24,
        torsoRotation: -5,
        leftArm: "up",
        rightArm: "forward",
        legs: "kneeling",
        characterScale: 0.98,
      };

    case "legendary-champion-ascension":
      return {
        torsoX: 0,
        torsoY: -18,
        torsoRotation: 0,
        leftArm: "up",
        rightArm: "up",
        legs: "floating",
        characterScale: 1.02,
      };

    default:
      return {
        torsoX: 0,
        torsoY: 0,
        torsoRotation: 0,
        leftArm: "down",
        rightArm: "forward",
        legs: "wide",
        characterScale: 1,
      };
  }
}


function HairBack({
  style,
  color,
}: {
  style:
    string;

  color:
    string;
}) {
  if (
    style ===
    "long"
  ) {
    return (
      <path
        d="
          M84 57
          C85 10 113 -5 136 -5
          C167 -5 187 19 188 61
          L186 158
          C173 178 160 180 153 171
          L150 96
          L118 96
          L114 173
          C101 179 90 168 84 154
          Z
        "
        fill={
          color
        }
      />
    );
  }


  if (
    style ===
    "ponytail"
  ) {
    return (
      <>
        <path
          d="
            M92 56
            C93 19 111 1 136 1
            C161 1 179 20 179 57
            L168 78
            L102 78
            Z
          "
          fill={
            color
          }
        />

        <path
          d="
            M172 35
            C211 45 213 116 184 151
            C193 108 172 86 161 72
            Z
          "
          fill={
            color
          }
        />
      </>
    );
  }


  if (
    style ===
      "curly" ||
    style ===
      "wavy"
  ) {
    return (
      <ellipse
        cx="135"
        cy="61"
        rx="57"
        ry="65"
        fill={
          color
        }
      />
    );
  }


  return null;
}


function HairFront({
  style,
  color,
}: {
  style:
    string;

  color:
    string;
}) {
  if (
    style ===
    "bald"
  ) {
    return null;
  }


  if (
    style ===
    "buzz"
  ) {
    return (
      <path
        d="
          M94 58
          C98 21 114 11 135 11
          C159 11 174 24 177 58
          C154 43 117 42 94 58
          Z
        "
        fill={
          color
        }
      />
    );
  }


  if (
    style ===
    "curly"
  ) {
    return (
      <>
        {[
          [99, 39],
          [114, 27],
          [132, 23],
          [151, 27],
          [168, 40],
          [106, 54],
          [126, 47],
          [147, 49],
          [164, 57],
        ].map(
          (
            point,
            index
          ) => (
            <circle
              key={
                index
              }
              cx={
                point[0]
              }
              cy={
                point[1]
              }
              r="17"
              fill={
                color
              }
            />
          )
        )}
      </>
    );
  }


  if (
    style ===
    "wavy"
  ) {
    return (
      <path
        d="
          M89 61
          C92 25 112 4 138 6
          C164 7 180 27 181 61
          C164 49 162 30 146 39
          C130 50 122 31 108 42
          C100 48 96 57 89 61
          Z
        "
        fill={
          color
        }
      />
    );
  }


  if (
    style ===
      "long" ||
    style ===
      "ponytail"
  ) {
    return (
      <path
        d="
          M90 62
          C92 21 112 1 137 2
          C163 3 181 25 181 63
          C166 53 161 35 146 42
          C128 51 118 33 105 45
          C98 51 94 58 90 62
          Z
        "
        fill={
          color
        }
      />
    );
  }


  if (
    style ===
    "medium"
  ) {
    return (
      <path
        d="
          M90 62
          C93 20 114 5 137 5
          C163 5 181 28 179 66
          L167 57
          C158 42 148 52 137 47
          C122 41 110 53 99 61
          Z
        "
        fill={
          color
        }
      />
    );
  }


  return (
    <path
      d="
        M93 57
        C97 22 114 9 136 9
        C160 9 175 25 177 57
        C160 48 150 38 136 45
        C120 53 110 42 93 57
        Z
      "
      fill={
        color
      }
    />
  );
}


function Face({
  glasses,
  earrings,
}: {
  glasses:
    string;

  earrings:
    string;
}) {
  return (
    <>
      <ellipse
        cx="118"
        cy="72"
        rx="4"
        ry="5"
        fill="#111827"
      />

      <ellipse
        cx="152"
        cy="72"
        rx="4"
        ry="5"
        fill="#111827"
      />


      <path
        d="
          M135 75
          Q131 88 136 89
        "
        fill="none"
        stroke="rgba(0,0,0,.22)"
        strokeWidth="2"
        strokeLinecap="round"
      />


      <path
        d="
          M122 98
          Q135 108 149 98
        "
        fill="none"
        stroke="rgba(70,20,20,.65)"
        strokeWidth="3"
        strokeLinecap="round"
      />


      {glasses !==
        "none" && (
        <Glasses
          style={
            glasses
          }
        />
      )}


      {earrings !==
        "none" && (
        <Earrings
          style={
            earrings
          }
        />
      )}
    </>
  );
}


function Glasses({
  style,
}: {
  style:
    string;
}) {
  if (
    style ===
    "aviator"
  ) {
    return (
      <g>
        <path
          d="
            M102 61
            L129 63
            L125 82
            Q114 90 106 80
            Z
          "
          fill="rgba(15,23,42,.72)"
          stroke="#111827"
          strokeWidth="3"
        />

        <path
          d="
            M141 63
            L168 61
            L164 80
            Q156 90 145 82
            Z
          "
          fill="rgba(15,23,42,.72)"
          stroke="#111827"
          strokeWidth="3"
        />

        <path
          d="
            M127 68
            Q135 63 143 68
          "
          fill="none"
          stroke="#111827"
          strokeWidth="3"
        />
      </g>
    );
  }


  const round =
    style ===
    "round";


  return (
    <g>
      {round ? (
        <>
          <circle
            cx="116"
            cy="72"
            r="15"
            fill="rgba(255,255,255,.08)"
            stroke="#111827"
            strokeWidth="3"
          />

          <circle
            cx="154"
            cy="72"
            r="15"
            fill="rgba(255,255,255,.08)"
            stroke="#111827"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <rect
            x="101"
            y="58"
            width="30"
            height="26"
            rx="5"
            fill="rgba(255,255,255,.08)"
            stroke="#111827"
            strokeWidth="3"
          />

          <rect
            x="139"
            y="58"
            width="30"
            height="26"
            rx="5"
            fill="rgba(255,255,255,.08)"
            stroke="#111827"
            strokeWidth="3"
          />
        </>
      )}

      <path
        d="
          M131 69
          L139 69
        "
        stroke="#111827"
        strokeWidth="3"
      />
    </g>
  );
}


function Earrings({
  style,
}: {
  style:
    string;
}) {
  if (
    style ===
    "hoop"
  ) {
    return (
      <>
        <circle
          cx="88"
          cy="86"
          r="8"
          fill="none"
          stroke="#facc15"
          strokeWidth="3"
        />

        <circle
          cx="182"
          cy="86"
          r="8"
          fill="none"
          stroke="#facc15"
          strokeWidth="3"
        />
      </>
    );
  }


  return (
    <>
      <circle
        cx="89"
        cy="82"
        r="4"
        fill="#67e8f9"
      />

      <circle
        cx="181"
        cy="82"
        r="4"
        fill="#67e8f9"
      />
    </>
  );
}


function BodyAndOutfit({
  gender,
  skinColor,
  outfit,
}: {
  gender:
    "male" | "female";

  skinColor:
    string;

  outfit:
    CosmeticItem | null;
}) {
  const item =
    outfit;


  const tier =
    item?.tier ??
    "Bronze";


  const colors =
    tierColors[
      tier
    ];


  const visualId =
    item?.visualId ??
    "default-outfit";


  return (
    <g>
      {gender ===
      "female" ? (
        <path
          d="
            M104 123
            Q135 106 166 123
            Q172 151 168 180
            Q164 215 153 236
            Q135 248 117 236
            Q106 215 102 180
            Q98 151 104 123
            Z
          "
          fill={
            skinColor
          }
        />
      ) : (
        <path
          d="
            M98 122
            Q135 105 172 122
            L177 209
            Q158 236 135 238
            Q111 236 93 209
            Z
          "
          fill={
            skinColor
          }
        />
      )}


      <OutfitArtwork
        visualId={
          visualId
        }
        gender={
          gender
        }
        colors={
          colors
        }
      />


      {gender ===
        "female" && (
        <FemaleBustContour
          visualId={
            visualId
          }
          colors={
            colors
          }
        />
      )}


      <OutfitAnimation
        visualId={
          visualId
        }
        animation={
          item?.animation ??
          "none"
        }
        colors={
          colors
        }
      />
    </g>
  );
}


function FemaleBustContour({
  visualId,
  colors,
}: {
  visualId:
    string;

  colors: {
    primary: string;
    secondary: string;
    highlight: string;
    dark: string;
  };
}) {
  const isArmor =
    visualId.includes(
      "armor"
    ) ||
    visualId.includes(
      "paladin"
    ) ||
    visualId.includes(
      "guard"
    ) ||
    visualId.includes(
      "guardian"
    ) ||
    visualId.includes(
      "king"
    );


  const isHeavy =
    visualId.includes(
      "coat"
    ) ||
    visualId.includes(
      "jacket"
    ) ||
    visualId.includes(
      "techwear"
    ) ||
    visualId.includes(
      "robe"
    );


  const upperStroke =
    isArmor
      ? colors.highlight
      : "rgba(255,255,255,.48)";


  const lowerStroke =
    isArmor
      ? colors.dark
      : isHeavy
      ? "rgba(0,0,0,.38)"
      : "rgba(0,0,0,.52)";


  return (
    <g
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
    >
      <path
        d="
          M106 151
          Q116 141 128 146
          Q135 149 135 158
          Q135 149 142 146
          Q154 141 164 151
        "
        stroke={
          upperStroke
        }
        strokeWidth={
          isArmor
            ? 4
            : 3
        }
        opacity={
          isArmor
            ? 0.95
            : 0.78
        }
      />

      <path
        d="
          M106 151
          Q109 169 124 177
          Q131 181 135 176
          Q139 181 146 177
          Q161 169 164 151
        "
        stroke={
          lowerStroke
        }
        strokeWidth={
          isArmor
            ? 3.5
            : 3
        }
        opacity="0.9"
      />

      <path
        d="
          M135 155
          Q133 165 135 176
        "
        stroke={
          lowerStroke
        }
        strokeWidth="2.4"
        opacity="0.8"
      />
    </g>
  );
}

function OutfitArtwork({
  visualId,
  gender,
  colors,
}: {
  visualId: string;
  gender: "male" | "female";
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
    dark: string;
  };
}) {
  const fittedTorso =
    gender === "female"
      ? `
          M102 122
          Q135 107 168 122
          Q174 156 169 190
          Q164 224 151 241
          Q135 250 119 241
          Q106 224 101 190
          Q96 156 102 122
          Z
        `
      : `
          M96 122
          Q135 106 174 122
          L178 214
          Q158 239 135 241
          Q112 239 92 214
          Z
        `;

  const longTorso =
    gender === "female"
      ? `
          M101 121
          Q135 106 169 121
          L178 258
          L151 246
          L135 268
          L119 246
          L92 258
          Z
        `
      : `
          M96 121
          Q135 105 174 121
          L183 258
          L149 245
          L135 266
          L121 245
          L87 258
          Z
        `;

  if (visualId === "default-outfit") {
    return (
      <g>
        <path d={fittedTorso} fill="#6b4f37" stroke="#2f241d" strokeWidth="3" />
        <path d="M103 128 L119 124 L126 148 L111 156 Z" fill="#8a6848" />
        <path d="M143 128 L165 124 L159 158 L145 151 Z" fill="#76543a" />
        <path d="M101 177 Q135 163 170 180 L166 217 Q135 236 99 216 Z" fill="#7c5d40" />
        <path d="M96 203 L174 203" stroke="#3f2b1d" strokeWidth="11" />
        <path d="M118 202 L136 220 L151 202" fill="#c49a6c" stroke="#3f2b1d" strokeWidth="3" />
        <path d="M113 132 L124 143 M153 132 L145 145 M109 187 L121 194 M154 189 L164 196" stroke="#d7b58a" strokeWidth="3" />
      </g>
    );
  }

  if (visualId === "bronze-traveler") {
    return (
      <g>
        <path d={fittedTorso} fill="#8b5e34" stroke="#3f2b1d" strokeWidth="3" />
        <path d="M106 124 L163 209" stroke="#3b2518" strokeWidth="12" />
        <rect x="96" y="198" width="78" height="17" rx="6" fill="#332116" />
        <rect x="125" y="198" width="20" height="18" rx="3" fill="#d69a4a" />
        <path d="M154 161 Q176 169 169 199 L151 196 Z" fill="#5b3b24" stroke="#d69a4a" strokeWidth="2" />
        <path d="M104 151 L119 145 L124 169 L108 174 Z" fill="#a97645" />
      </g>
    );
  }

  if (visualId === "bronze-denim-jacket") {
    return (
      <g>
        <path d={fittedTorso} fill="#2f5f83" stroke="#173247" strokeWidth="3" />
        <path d="M107 123 L135 159 L163 123 L153 213 L117 213 Z" fill="#d8d0bd" />
        <path d="M107 123 L126 163 L113 177 L96 132 Z" fill="#376f98" />
        <path d="M163 123 L144 163 L157 177 L174 132 Z" fill="#376f98" />
        <path d="M135 158 L135 216" stroke="#d7e3ea" strokeWidth="4" />
        <rect x="104" y="176" width="23" height="18" rx="3" fill="#244e6c" stroke="#d7e3ea" strokeWidth="2" />
        <rect x="143" y="176" width="23" height="18" rx="3" fill="#244e6c" stroke="#d7e3ea" strokeWidth="2" />
        <path d="M101 211 Q135 222 169 211" fill="none" stroke="#173247" strokeWidth="8" />
      </g>
    );
  }

  if (visualId === "bronze-scout-armor") {
    return (
      <g>
        <path d={fittedTorso} fill="#57402a" stroke="#2a1c12" strokeWidth="3" />
        <path d="M108 128 L135 145 L162 128 L158 203 L135 222 L112 203 Z" fill="#8b633c" stroke="#d09a56" strokeWidth="3" />
        <path d="M112 143 L158 143 M116 165 L154 165 M119 188 L151 188" stroke="#4b321f" strokeWidth="5" />
        <path d="M101 126 L80 143 L93 168 L116 151 Z" fill="#6e4a2d" stroke="#d09a56" strokeWidth="3" />
        <path d="M169 126 L190 143 L177 168 L154 151 Z" fill="#6e4a2d" stroke="#d09a56" strokeWidth="3" />
        <rect x="97" y="205" width="76" height="14" rx="5" fill="#2a1c12" />
        <circle cx="135" cy="178" r="10" fill="#d09a56" />
      </g>
    );
  }

  if (visualId === "silver-tailored-suit") {
    return (
      <g>
        <path d={fittedTorso} fill="#161d2b" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M108 122 L135 164 L162 122 L151 214 L119 214 Z" fill="#f8fafc" />
        <path d="M135 151 L146 171 L136 210 L125 171 Z" fill="#64748b" />
        <path d="M108 122 L126 171 L114 184 L94 130 Z" fill="#273449" />
        <path d="M162 122 L144 171 L156 184 L176 130 Z" fill="#273449" />
        <rect x="98" y="207" width="74" height="12" rx="5" fill="#0f172a" />
        <circle cx="135" cy="187" r="3" fill="#e2e8f0" />
        <circle cx="135" cy="201" r="3" fill="#e2e8f0" />
      </g>
    );
  }

  if (visualId === "silver-winter-coat") {
    return (
      <g>
        <path d={longTorso} fill="#45556c" stroke="#e2e8f0" strokeWidth="3" />
        <path d="M101 123 Q135 96 169 123" fill="none" stroke="#f8fafc" strokeWidth="15" />
        <path d="M112 124 L135 162 L158 124" fill="#dbe3eb" />
        <path d="M135 160 L135 248" stroke="#f8fafc" strokeWidth="4" />
        <rect x="101" y="201" width="68" height="15" rx="6" fill="#273449" />
        <rect x="115" y="184" width="20" height="18" rx="4" fill="#36475e" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="136" y="184" width="20" height="18" rx="4" fill="#36475e" stroke="#e2e8f0" strokeWidth="2" />
        <path d="M91 248 Q135 264 179 248" fill="none" stroke="#f8fafc" strokeWidth="10" />
      </g>
    );
  }

  if (visualId === "silver-royal-guard") {
    return (
      <g>
        <path d={fittedTorso} fill="#8f1d2c" stroke="#f8fafc" strokeWidth="3" />
        <path d="M107 124 L135 146 L163 124 L156 213 L114 213 Z" fill="#b91c2f" />
        <path d="M135 145 L135 215" stroke="#e2e8f0" strokeWidth="5" />
        <path d="M98 126 L79 141 L92 166 L116 150 Z" fill="#64748b" stroke="#f8fafc" strokeWidth="3" />
        <path d="M172 126 L191 141 L178 166 L154 150 Z" fill="#64748b" stroke="#f8fafc" strokeWidth="3" />
        <path d="M107 132 L163 132" stroke="#f8fafc" strokeWidth="6" />
        <rect x="98" y="202" width="74" height="17" rx="5" fill="#263244" />
        <path d="M122 164 L135 153 L148 164 L135 181 Z" fill="#e2e8f0" />
      </g>
    );
  }

  if (visualId === "gold-martial-robe") {
    return (
      <g>
        <path d={longTorso} fill="#7c2d12" stroke="#facc15" strokeWidth="3" />
        <path d="M104 123 L135 164 L166 123" fill="none" stroke="#fef08a" strokeWidth="9" />
        <path d="M96 164 L174 164 L158 216 L112 216 Z" fill="#9a3412" />
        <path d="M112 164 L135 191 L158 164" fill="#facc15" opacity=".7" />
        <path d="M93 211 L177 211" stroke="#fef08a" strokeWidth="12" />
        <path d="M128 211 L136 260 L145 211" fill="#facc15" />
        <path d="M108 134 L99 190 M162 134 L171 190" stroke="#facc15" strokeWidth="4" />
      </g>
    );
  }

  if (visualId === "gold-commander-coat") {
    return (
      <g>
        <path d={longTorso} fill="#1e3a5f" stroke="#facc15" strokeWidth="4" />
        <path d="M106 122 L135 161 L164 122" fill="#f8fafc" />
        <path d="M106 122 L124 165 L113 181 L94 130 Z" fill="#274c77" />
        <path d="M164 122 L146 165 L157 181 L176 130 Z" fill="#274c77" />
        <path d="M135 160 L135 251" stroke="#facc15" strokeWidth="5" />
        <path d="M98 128 L77 143 L92 164 L116 150 Z" fill="#eab308" stroke="#fef08a" strokeWidth="3" />
        <path d="M172 128 L193 143 L178 164 L154 150 Z" fill="#eab308" stroke="#fef08a" strokeWidth="3" />
        <rect x="99" y="202" width="72" height="16" rx="5" fill="#0f2742" stroke="#facc15" strokeWidth="2" />
        <circle cx="122" cy="176" r="5" fill="#facc15" />
        <circle cx="137" cy="176" r="5" fill="#fef08a" />
        <circle cx="152" cy="176" r="5" fill="#facc15" />
      </g>
    );
  }

  if (visualId === "gold-temple-armor") {
    return (
      <g>
        <path d={fittedTorso} fill="#7c4a03" stroke="#fef08a" strokeWidth="4" />
        <path d="M103 126 L135 143 L167 126 L162 205 L135 228 L108 205 Z" fill="#d6a90b" stroke="#fef3c7" strokeWidth="3" />
        <path d="M135 143 L135 225" stroke="#fff7ae" strokeWidth="4" />
        <path d="M109 154 L161 154 M113 177 L157 177 M118 199 L152 199" stroke="#8a5a06" strokeWidth="5" />
        <path d="M101 125 L73 143 L91 174 L119 151 Z" fill="#b88708" stroke="#fef08a" strokeWidth="4" />
        <path d="M169 125 L197 143 L179 174 L151 151 Z" fill="#b88708" stroke="#fef08a" strokeWidth="4" />
        <path d="M135 161 L149 181 L135 201 L121 181 Z" fill="#fff7ae" />
      </g>
    );
  }

  if (visualId === "platinum-techwear") {
    return (
      <g>
        <path d={fittedTorso} fill="#101827" stroke="#94a3b8" strokeWidth="3" />
        <path d="M101 136 L169 136 L158 196 L112 196 Z" fill="#334155" />
        <path d="M107 125 L164 212" stroke="#67e8f9" strokeWidth="8" />
        <path d="M164 128 L145 160 L168 177" fill="none" stroke="#cbd5e1" strokeWidth="4" />
        <rect x="101" y="198" width="68" height="20" rx="5" fill="#020617" stroke="#67e8f9" strokeWidth="3" />
        <rect x="108" y="169" width="24" height="19" rx="4" fill="#172554" stroke="#67e8f9" strokeWidth="2" />
        <path d="M145 174 L160 174 L164 191 L147 191 Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="135" cy="208" r="6" fill="#67e8f9" />
      </g>
    );
  }

  if (visualId === "platinum-longcoat") {
    return (
      <g>
        <path d={longTorso} fill="#29364a" stroke="#f8fafc" strokeWidth="4" />
        <path d="M106 122 L135 161 L164 122" fill="#f8fafc" />
        <path d="M105 122 L124 166 L112 181 L93 129 Z" fill="#485b74" />
        <path d="M165 122 L146 166 L158 181 L177 129 Z" fill="#485b74" />
        <path d="M135 160 L135 252" stroke="#e2e8f0" strokeWidth="4" />
        <path d="M111 188 L123 188 M147 188 L159 188" stroke="#f8fafc" strokeWidth="4" />
        <rect x="96" y="202" width="78" height="15" rx="5" fill="#111827" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M91 252 L119 239 L135 264 L151 239 L179 252" fill="none" stroke="#94a3b8" strokeWidth="5" />
      </g>
    );
  }

  if (visualId === "platinum-paladin") {
    return (
      <g>
        <path d={fittedTorso} fill="#64748b" stroke="#ffffff" strokeWidth="4" />
        <path d="M101 128 L114 114 L135 128 L156 114 L169 128 L162 207 L135 231 L108 207 Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="3" />
        <path d="M111 132 L135 151 L159 132 L154 202 L135 220 L116 202 Z" fill="#94a3b8" />
        <path d="M98 126 L68 140 L88 180 L119 153 Z" fill="#aebdcc" stroke="#ffffff" strokeWidth="4" />
        <path d="M172 126 L202 140 L182 180 L151 153 Z" fill="#aebdcc" stroke="#ffffff" strokeWidth="4" />
        <path d="M135 148 L135 220" stroke="#ffffff" strokeWidth="5" />
        <path d="M135 165 L150 182 L135 205 L120 182 Z" fill="#67e8f9" stroke="#ffffff" strokeWidth="3" />
      </g>
    );
  }

  if (visualId === "diamond-crystal-robe") {
    return (
      <g>
        <path d={longTorso} fill="#164e63" stroke="#cffafe" strokeWidth="4" />
        <path d="M101 124 L118 105 L135 126 L152 105 L169 124 L160 214 L135 239 L110 214 Z" fill="#0891b2" opacity=".8" />
        <path d="M105 123 L135 164 L165 123" fill="none" stroke="#cffafe" strokeWidth="9" />
        <polygon points="135,158 151,183 135,211 119,183" fill="#67e8f9" stroke="#ecfeff" strokeWidth="4" />
        <polygon points="99,134 114,119 119,151 103,166" fill="#67e8f9" opacity=".8" />
        <polygon points="171,134 156,119 151,151 167,166" fill="#67e8f9" opacity=".8" />
        <path d="M92 252 L112 227 L135 267 L158 227 L178 252" fill="none" stroke="#67e8f9" strokeWidth="6" />
      </g>
    );
  }

  if (visualId === "diamond-frost-coat") {
    return (
      <g>
        <path d={longTorso} fill="#dbeafe" stroke="#ffffff" strokeWidth="4" />
        <path d="M98 124 Q135 90 172 124" fill="none" stroke="#f8fafc" strokeWidth="20" />
        <path d="M108 123 L135 164 L162 123" fill="#93c5fd" />
        <path d="M135 161 L135 250" stroke="#60a5fa" strokeWidth="5" />
        <rect x="98" y="201" width="74" height="17" rx="6" fill="#1e3a8a" stroke="#bfdbfe" strokeWidth="3" />
        <path d="M91 249 Q135 270 179 249" fill="none" stroke="#ffffff" strokeWidth="12" />
        <path d="M105 173 L120 187 L108 199 M165 173 L150 187 L162 199" fill="none" stroke="#60a5fa" strokeWidth="4" />
        <polygon points="135,174 144,188 135,205 126,188" fill="#e0f2fe" stroke="#60a5fa" strokeWidth="3" />
      </g>
    );
  }

  if (visualId === "diamond-guardian-armor") {
    return (
      <g>
        <path d={fittedTorso} fill="#0e7490" stroke="#ecfeff" strokeWidth="4" />
        <path d="M98 130 L112 111 L135 127 L158 111 L172 130 L164 208 L135 234 L106 208 Z" fill="#22d3ee" opacity=".85" stroke="#cffafe" strokeWidth="4" />
        <path d="M111 132 L135 151 L159 132 L154 204 L135 224 L116 204 Z" fill="#0891b2" />
        <path d="M99 123 L64 140 L86 183 L121 151 Z" fill="#67e8f9" stroke="#ecfeff" strokeWidth="4" />
        <path d="M171 123 L206 140 L184 183 L149 151 Z" fill="#67e8f9" stroke="#ecfeff" strokeWidth="4" />
        <polygon points="135,151 153,179 135,214 117,179" fill="#cffafe" stroke="#ffffff" strokeWidth="4" />
        <path d="M105 200 L135 226 L165 200" fill="none" stroke="#ecfeff" strokeWidth="5" />
      </g>
    );
  }

  if (visualId === "master-sparkle-robes") {
    return (
      <g>
        <path d={longTorso} fill="#4c1d95" stroke="#f5d0fe" strokeWidth="4" />
        <path d="M99 122 Q135 91 171 122 L161 150 Q135 132 109 150 Z" fill="#7e22ce" stroke="#f0abfc" strokeWidth="3" />
        <path d="M105 126 L135 166 L165 126" fill="none" stroke="#f5d0fe" strokeWidth="10" />
        <path d="M95 181 Q135 157 175 181 L163 226 Q135 247 107 226 Z" fill="#6b21a8" opacity=".86" />
        <path d="M92 249 L113 224 L135 270 L157 224 L178 249" fill="none" stroke="#e879f9" strokeWidth="7" />
        <polygon points="135,158 149,180 135,204 121,180" fill="#ffffff" stroke="#e879f9" strokeWidth="4" />
        <path d="M103 144 L91 181 M167 144 L179 181" stroke="#f0abfc" strokeWidth="5" />
      </g>
    );
  }

  if (visualId === "master-flame-coat") {
    return (
      <g>
        <path d={longTorso} fill="#3f0d12" stroke="#fb923c" strokeWidth="4" />
        <path d="M105 121 L135 161 L165 121" fill="#111827" />
        <path d="M104 121 L123 165 L111 181 L91 128 Z" fill="#7f1d1d" stroke="#f97316" strokeWidth="3" />
        <path d="M166 121 L147 165 L159 181 L179 128 Z" fill="#7f1d1d" stroke="#f97316" strokeWidth="3" />
        <path d="M135 159 L135 252" stroke="#fbbf24" strokeWidth="5" />
        <path d="M93 245 Q108 226 119 245 Q132 220 143 247 Q157 223 178 246" fill="#b91c1c" stroke="#fb923c" strokeWidth="5" />
        <rect x="96" y="200" width="78" height="17" rx="6" fill="#1f0a0a" stroke="#f97316" strokeWidth="3" />
        <path d="M112 177 L125 190 L112 204 M158 177 L145 190 L158 204" fill="none" stroke="#fb923c" strokeWidth="4" />
      </g>
    );
  }

  if (visualId === "master-energy-armor") {
    return (
      <g>
        <path d={fittedTorso} fill="#111827" stroke="#c4b5fd" strokeWidth="4" />
        <path d="M98 128 L113 111 L135 127 L157 111 L172 128 L164 209 L135 234 L106 209 Z" fill="#312e81" stroke="#a78bfa" strokeWidth="4" />
        <path d="M111 132 L135 151 L159 132 L154 204 L135 224 L116 204 Z" fill="#4c1d95" />
        <path d="M99 124 L67 141 L87 181 L120 151 Z" fill="#1e1b4b" stroke="#c4b5fd" strokeWidth="4" />
        <path d="M171 124 L203 141 L183 181 L150 151 Z" fill="#1e1b4b" stroke="#c4b5fd" strokeWidth="4" />
        <polygon points="135,150 153,178 135,214 117,178" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="4" />
        <path d="M108 198 L135 226 L162 198" fill="none" stroke="#a78bfa" strokeWidth="5" />
        <circle cx="135" cy="181" r="7" fill="#ffffff" />
      </g>
    );
  }

  if (visualId === "legendary-celestial-robes") {
    return (
      <g>
        <path d={longTorso} fill="#0f172a" stroke="#fef3c7" strokeWidth="5" />
        <path d="M97 122 Q135 84 173 122 L160 151 Q135 128 110 151 Z" fill="#1e3a8a" stroke="#fde68a" strokeWidth="4" />
        <path d="M104 124 L135 168 L166 124" fill="none" stroke="#fef3c7" strokeWidth="11" />
        <path d="M91 180 Q135 151 179 180 L164 231 Q135 253 106 231 Z" fill="#172554" />
        <path d="M89 251 L111 222 L135 274 L159 222 L181 251" fill="none" stroke="#fbbf24" strokeWidth="8" />
        <circle cx="135" cy="183" r="25" fill="#1d4ed8" stroke="#fde68a" strokeWidth="4" />
        <path d="M135 160 L142 177 L161 180 L146 192 L151 211 L135 201 L119 211 L124 192 L109 180 L128 177 Z" fill="#fef3c7" />
        <path d="M103 147 L83 178 M167 147 L187 178" stroke="#fde68a" strokeWidth="6" />
      </g>
    );
  }

  if (visualId === "legendary-inferno-king") {
    return (
      <g>
        <path d={longTorso} fill="#250505" stroke="#fef08a" strokeWidth="5" />
        <path d="M95 128 L112 106 L135 126 L158 106 L175 128 L165 211 L135 239 L105 211 Z" fill="#991b1b" stroke="#f97316" strokeWidth="4" />
        <path d="M109 131 L135 151 L161 131 L155 205 L135 227 L115 205 Z" fill="#450a0a" />
        <path d="M96 121 L58 139 L84 187 L122 151 Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="5" />
        <path d="M174 121 L212 139 L186 187 L148 151 Z" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="5" />
        <path d="M135 149 L156 178 L135 217 L114 178 Z" fill="#f97316" stroke="#fef08a" strokeWidth="4" />
        <path d="M94 246 Q109 219 122 245 Q135 211 148 246 Q162 218 181 246" fill="#991b1b" stroke="#fbbf24" strokeWidth="6" />
        <path d="M111 111 L121 91 L135 108 L149 91 L159 111" fill="none" stroke="#fef08a" strokeWidth="6" />
      </g>
    );
  }

  if (visualId === "legendary-cosmic-armor") {
    return (
      <g>
        <path d={fittedTorso} fill="#020617" stroke="#e0e7ff" strokeWidth="5" />
        <path d="M96 129 L112 108 L135 126 L158 108 L174 129 L165 211 L135 237 L105 211 Z" fill="#312e81" stroke="#818cf8" strokeWidth="4" />
        <path d="M110 132 L135 152 L160 132 L154 204 L135 226 L116 204 Z" fill="#1e1b4b" />
        <path d="M98 120 L60 141 L85 185 L122 150 Z" fill="#4c1d95" stroke="#c4b5fd" strokeWidth="5" />
        <path d="M172 120 L210 141 L185 185 L148 150 Z" fill="#4c1d95" stroke="#c4b5fd" strokeWidth="5" />
        <ellipse cx="135" cy="181" rx="24" ry="31" fill="#0f172a" stroke="#a5b4fc" strokeWidth="4" />
        <circle cx="135" cy="181" r="12" fill="#ffffff" />
        <path d="M105 199 L135 229 L165 199" fill="none" stroke="#c4b5fd" strokeWidth="6" />
        <circle cx="110" cy="144" r="4" fill="#ffffff" />
        <circle cx="160" cy="150" r="3" fill="#f0abfc" />
        <circle cx="122" cy="211" r="3" fill="#67e8f9" />
      </g>
    );
  }


  return (
    <g>
      <path d={fittedTorso} fill={colors.primary} stroke={colors.highlight} strokeWidth="3" />
      <path d="M109 124 L135 166 L161 124" fill="none" stroke={colors.highlight} strokeWidth="8" />
      <rect x="98" y="204" width="74" height="14" rx="6" fill={colors.dark} />
    </g>
  );
}


function OutfitAnimation({
  visualId,
  animation,
  colors,
}: {
  visualId: string;
  animation: CosmeticAnimation;
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
    dark: string;
  };
}) {
  if (animation === "none") {
    return null;
  }

  if (visualId === "master-sparkle-robes") {
    return (
      <g>
        {[[108,143],[154,148],[119,182],[152,204],[108,226],[139,241]].map((p,i)=>(
          <path key={i} d={`M${p[0]} ${p[1]-8} L${p[0]+3} ${p[1]-2} L${p[0]+9} ${p[1]} L${p[0]+3} ${p[1]+2} L${p[0]} ${p[1]+8} L${p[0]-3} ${p[1]+2} L${p[0]-9} ${p[1]} L${p[0]-3} ${p[1]-2} Z`} fill={i%2===0 ? "#ffffff" : "#f0abfc"}>
            <animateTransform attributeName="transform" type="scale" values="0.25;1.35;0.25" dur={`${1.3+i*0.12}s`} begin={`${i*0.16}s`} repeatCount="indefinite" additive="sum" />
            <animate attributeName="opacity" values="0;1;0" dur={`${1.3+i*0.12}s`} begin={`${i*0.16}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
    );
  }

  if (visualId === "master-flame-coat") {
    return (
      <g>
        {[102,119,137,155,172].map((x,i)=>(
          <path key={x} d={`M${x} 253 C${x-10} 235 ${x+2} 216 ${x} 199 C${x+19} 220 ${x+16} 243 ${x} 253 Z`} fill={i%2===0 ? "#f97316" : "#facc15"}>
            <animate attributeName="d" values={`M${x} 253 C${x-10} 235 ${x+2} 216 ${x} 199 C${x+19} 220 ${x+16} 243 ${x} 253 Z;M${x} 253 C${x-14} 232 ${x+6} 208 ${x+2} 188 C${x+22} 217 ${x+12} 241 ${x} 253 Z;M${x} 253 C${x-10} 235 ${x+2} 216 ${x} 199 C${x+19} 220 ${x+16} 243 ${x} 253 Z`} dur={`${0.8+i*0.08}s`} begin={`${i*0.11}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
    );
  }

  if (visualId === "master-energy-armor") {
    return (
      <g fill="none" strokeLinecap="round">
        <path d="M105 143 L135 162 L165 143 L156 202 L135 222 L114 202 Z" stroke="#c4b5fd" strokeWidth="4" strokeDasharray="12 8">
          <animate attributeName="stroke-dashoffset" values="0;-80" dur="1.4s" repeatCount="indefinite" />
        </path>
        <circle cx="135" cy="181" r="11" stroke="#ffffff" strokeWidth="4">
          <animate attributeName="r" values="7;15;7" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;.3;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <path d="M80 153 L105 165 M190 153 L165 165" stroke="#8b5cf6" strokeWidth="5">
          <animate attributeName="opacity" values=".2;1;.2" dur=".7s" repeatCount="indefinite" />
        </path>
      </g>
    );
  }

  if (visualId === "legendary-celestial-robes") {
    return (
      <g>
        <g transform="translate(135 183)">
          <ellipse cx="0" cy="0" rx="42" ry="15" fill="none" stroke="#fde68a" strokeWidth="3" strokeDasharray="8 7">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="42" cy="0" r="5" fill="#ffffff">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>
        {[112,128,145,160].map((x,i)=>(
          <circle key={x} cx={x} cy={145+i*23} r="3" fill={i%2 ? "#93c5fd" : "#ffffff"}>
            <animate attributeName="opacity" values=".15;1;.15" dur={`${1.1+i*.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    );
  }

  if (visualId === "legendary-inferno-king") {
    return (
      <g>
        {[92,112,135,158,178].map((x,i)=>(
          <path key={x} d={`M${x} 247 C${x-8} 226 ${x+1} 205 ${x} 186 C${x+18} 211 ${x+13} 237 ${x} 247 Z`} fill={i%2===0 ? "#dc2626" : "#fbbf24"} opacity=".9">
            <animateTransform attributeName="transform" type="skewX" values="-5;8;-5" dur={`${.65+i*.07}s`} begin={`${i*.08}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values=".55;1;.55" dur={`${.65+i*.07}s`} repeatCount="indefinite" />
          </path>
        ))}
        <path d="M105 128 L135 151 L165 128" fill="none" stroke="#fff7ae" strokeWidth="5">
          <animate attributeName="stroke-width" values="3;7;3" dur="1s" repeatCount="indefinite" />
        </path>
      </g>
    );
  }

  if (visualId === "legendary-cosmic-armor") {
    return (
      <g>
        <ellipse cx="135" cy="181" rx="37" ry="13" fill="none" stroke="#a5b4fc" strokeWidth="3">
          <animateTransform attributeName="transform" type="rotate" from="0 135 181" to="360 135 181" dur="3s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="135" cy="181" rx="17" ry="43" fill="none" stroke="#67e8f9" strokeWidth="2">
          <animateTransform attributeName="transform" type="rotate" from="0 135 181" to="-360 135 181" dur="4.2s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="135" cy="181" r="9" fill="#ffffff">
          <animate attributeName="r" values="7;12;7" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="fill" values="#ffffff;#c4b5fd;#67e8f9;#ffffff" dur="2.4s" repeatCount="indefinite" />
        </circle>
        {[104,118,151,166].map((x,i)=>(
          <circle key={x} cx={x} cy={142+i*19} r="3" fill={i%2 ? "#f0abfc" : "#ffffff"}>
            <animate attributeName="cy" values={`${142+i*19};${128+i*19};${142+i*19}`} dur={`${1.8+i*.25}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    );
  }

  return (
    <g>
      <path d="M103 143 Q135 119 167 143 Q144 166 168 190 Q135 217 102 190 Q126 166 103 143" fill="none" stroke={colors.highlight} strokeWidth="5" strokeDasharray="10 8">
        <animate attributeName="stroke-dashoffset" values="0;-80" dur="2s" repeatCount="indefinite" />
      </path>
    </g>
  );
}


function Arms({
  skinColor,
  outfit,
  leftArm,
  rightArm,
}: {
  skinColor:
    string;

  outfit:
    CosmeticItem | null;

  leftArm:
    CharacterPose["leftArm"];

  rightArm:
    CharacterPose["rightArm"];
}) {
  const tier =
    outfit?.tier ??
    "Bronze";


  const colors =
    tierColors[
      tier
    ];


  return (
    <g>
      <Arm
        side="left"
        style={
          leftArm
        }
        skinColor={
          skinColor
        }
        sleeveColor={
          colors.secondary
        }
      />

      <Arm
        side="right"
        style={
          rightArm
        }
        skinColor={
          skinColor
        }
        sleeveColor={
          colors.secondary
        }
      />
    </g>
  );
}


function Arm({
  side,
  style,
  skinColor,
  sleeveColor,
}: {
  side:
    "left" | "right";

  style:
    CharacterPose["leftArm"];

  skinColor:
    string;

  sleeveColor:
    string;
}) {
  const mirror =
    side ===
    "right"
      ? -1
      : 1;


  const center =
    side ===
    "right"
      ? 135
      : 0;


  if (
    style ===
    "cross"
  ) {
    return (
      <g
        transform={
          side ===
          "right"
            ? "translate(270 0) scale(-1 1)"
            : undefined
        }
      >
        <path
          d="
            M97 145
            Q87 157 99 171
            L151 201
            Q161 207 168 195
            Q174 184 162 177
            L117 151
            Q107 139 97 145
            Z
          "
          fill={
            skinColor
          }
          stroke={
            sleeveColor
          }
          strokeWidth="9"
        />
      </g>
    );
  }


  if (
    style ===
    "hip"
  ) {
    return (
      <g
        transform={
          side ===
          "right"
            ? "translate(270 0) scale(-1 1)"
            : undefined
        }
      >
        <path
          d="
            M98 145
            Q76 171 88 206
            L111 226
            Q120 232 127 223
            Q134 214 124 207
            L104 192
            Q103 170 113 153
            Z
          "
          fill={
            skinColor
          }
          stroke={
            sleeveColor
          }
          strokeWidth="8"
        />
      </g>
    );
  }


  if (
    style ===
    "up"
  ) {
    return (
      <g
        transform={
          side ===
          "right"
            ? "translate(270 0) scale(-1 1)"
            : undefined
        }
      >
        <path
          d="
            M102 151
            Q82 123 74 83
            Q70 67 83 63
            Q96 60 101 75
            L121 139
            Z
          "
          fill={
            skinColor
          }
          stroke={
            sleeveColor
          }
          strokeWidth="8"
        />

        <circle
          cx="81"
          cy="61"
          r="12"
          fill={
            skinColor
          }
        />
      </g>
    );
  }


  if (
    style ===
    "forward"
  ) {
    return (
      <g
        transform={
          side ===
          "right"
            ? "translate(270 0) scale(-1 1)"
            : undefined
        }
      >
        <path
          d="
            M103 148
            Q79 153 52 169
            Q39 176 46 188
            Q53 199 67 192
            L119 170
            Z
          "
          fill={
            skinColor
          }
          stroke={
            sleeveColor
          }
          strokeWidth="8"
        />

        <circle
          cx="46"
          cy="183"
          r="12"
          fill={
            skinColor
          }
        />
      </g>
    );
  }


  if (
    style ===
    "prayer"
  ) {
    return (
      <g
        transform={
          side ===
          "right"
            ? "translate(270 0) scale(-1 1)"
            : undefined
        }
      >
        <path
          d="
            M101 149
            Q93 169 112 197
            L129 215
            Q135 220 141 214
            Q147 208 141 201
            L123 181
            Q115 162 117 151
            Z
          "
          fill={
            skinColor
          }
          stroke={
            sleeveColor
          }
          strokeWidth="8"
        />
      </g>
    );
  }


  return (
    <g
      transform={
        side ===
        "right"
          ? "translate(270 0) scale(-1 1)"
          : undefined
      }
    >
      <path
        d="
          M98 142
          Q79 172 88 224
          Q91 238 103 236
          Q114 234 111 220
          L115 159
          Z
        "
        fill={
          skinColor
        }
        stroke={
          sleeveColor
        }
        strokeWidth="8"
      />
    </g>
  );
}


function Legs({
  style,
  outfit,
  skinColor,
}: {
  style:
    CharacterPose["legs"];

  outfit:
    CosmeticItem | null;

  skinColor:
    string;
}) {
  const tier =
    outfit?.tier ??
    "Bronze";


  const colors =
    tierColors[
      tier
    ];


  if (
    style ===
    "crossed"
  ) {
    return (
      <g>
        <path
          d="
            M122 241
            C105 267 83 282 56 287
            C86 309 111 305 135 282
            C158 305 184 309 214 287
            C186 282 165 267 148 241
            Z
          "
          fill="#1f2937"
        />

        <ellipse
          cx="84"
          cy="296"
          rx="36"
          ry="14"
          fill="#111827"
        />

        <ellipse
          cx="186"
          cy="296"
          rx="36"
          ry="14"
          fill="#111827"
        />
      </g>
    );
  }


  if (
    style ===
    "kneeling"
  ) {
    return (
      <g>
        <path
          d="
            M109 237
            L137 237
            L126 299
            Q115 312 100 300
            Z
          "
          fill="#1f2937"
        />

        <path
          d="
            M141 238
            Q171 248 185 283
            L156 300
            Q140 277 126 259
            Z
          "
          fill="#1f2937"
        />

        <ellipse
          cx="173"
          cy="298"
          rx="31"
          ry="12"
          fill="#111827"
        />

        <ellipse
          cx="109"
          cy="306"
          rx="27"
          ry="11"
          fill="#111827"
        />
      </g>
    );
  }


  if (
    style ===
    "floating"
  ) {
    return (
      <g>
        <path
          d="
            M104 236
            L133 236
            Q127 283 104 307
            Q93 315 87 302
            Q99 274 104 236
            Z
          "
          fill="#1f2937"
        />

        <path
          d="
            M137 236
            L166 236
            Q171 274 183 302
            Q177 315 166 307
            Q143 283 137 236
            Z
          "
          fill="#1f2937"
        />

        <ellipse
          cx="94"
          cy="310"
          rx="25"
          ry="10"
          fill="#111827"
        />

        <ellipse
          cx="176"
          cy="310"
          rx="25"
          ry="10"
          fill="#111827"
        />
      </g>
    );
  }


  const wide =
    style ===
    "wide";


  return (
    <g>
      <g
        transform={
          wide
            ? "rotate(-7 116 248)"
            : undefined
        }
      >
        <path
          d="
            M101 230
            L130 230
            L126 316
            Q116 327 105 316
            Z
          "
          fill="#1f2937"
        />

        <path
          d="
            M100 314
            Q116 307 130 315
            L134 332
            L94 332
            Z
          "
          fill="#09090b"
        />
      </g>


      <g
        transform={
          wide
            ? "rotate(7 154 248)"
            : undefined
        }
      >
        <path
          d="
            M140 230
            L169 230
            L165 316
            Q154 327 144 315
            Z
          "
          fill="#1f2937"
        />

        <path
          d="
            M140 315
            Q154 307 170 315
            L176 332
            L136 332
            Z
          "
          fill="#09090b"
        />
      </g>


      <rect
        x="105"
        y="226"
        width="60"
        height="15"
        rx="7"
        fill={
          colors.dark
        }
      />
    </g>
  );
}


function AccessoryBack({
  item,
}: {
  item:
    CosmeticItem | null;
}) {
  if (!item) {
    return null;
  }


  const id =
    item.visualId;


  switch (id) {
    case "bronze-backpack":
      return (
        <g>
          <path
            d="M99 135 Q135 112 171 135"
            fill="none"
            stroke="#4a2c20"
            strokeWidth="7"
          />
          <path
            d="M78 145 Q92 129 108 144 L108 221 Q90 235 72 218 L72 161 Q72 151 78 145 Z"
            fill="#6b442b"
            stroke="#d0a06d"
            strokeWidth="3"
          />
          <path
            d="M76 169 L105 169 M77 194 L104 194"
            stroke="#3f2418"
            strokeWidth="3"
          />
          <rect x="79" y="178" width="22" height="24" rx="5" fill="#8b5e3c" stroke="#d0a06d" strokeWidth="2" />
          <path d="M82 145 L97 135" stroke="#c69a68" strokeWidth="3" />
          <path d="M77 212 Q89 222 104 212" fill="none" stroke="#d0a06d" strokeWidth="2" />
        </g>
      );

    case "bronze-bandana":
      return (
        <g className="accessory-bandana-tail">
          <path d="M151 123 Q181 129 204 151 L176 163 Q162 149 150 143 Z" fill="#8b1e2d" stroke="#f87171" strokeWidth="3" />
          <path d="M164 144 L207 169 L174 181 Z" fill="#6f1421" />
        </g>
      );

    case "bronze-scout-badge":
      return (
        <g>
          <path d="M90 132 Q135 108 180 132" fill="none" stroke="#5b4636" strokeWidth="7" />
          <path d="M94 136 L128 207" stroke="#4b372b" strokeWidth="10" />
          <rect x="75" y="168" width="32" height="48" rx="8" fill="#5b4636" stroke="#d6a46f" strokeWidth="3" />
          <circle cx="91" cy="184" r="7" fill="#d4af37" />
          <path d="M82 205 L100 205" stroke="#d6a46f" strokeWidth="3" />
        </g>
      );

    case "silver-scarf":
      return (
        <g className="accessory-scarf-flow">
          <path d="M146 122 Q177 129 203 160 L186 171 Q166 148 145 142 Z" fill="#64748b" stroke="#e2e8f0" strokeWidth="3" />
          <path d="M184 164 Q220 191 213 233 Q197 217 178 207 Q190 188 184 164 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="3" />
          <path d="M188 181 L211 197 M184 193 L207 211" stroke="#94a3b8" strokeWidth="2" />
        </g>
      );

    case "silver-shoulder-cape":
      return (
        <g className="accessory-mantle-flow">
          <path d="M129 121 Q166 111 190 137 L197 247 Q167 276 137 244 L132 165 Z" fill="#334155" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M131 124 Q163 111 185 136 L174 153 Q153 139 132 145 Z" fill="#d6d3d1" stroke="#f8fafc" strokeWidth="3" />
          <path d="M187 143 L198 247" stroke="#94a3b8" strokeWidth="3" />
        </g>
      );

    case "gold-commander-cape":
      return (
        <g className="accessory-commander-cape">
          <path d="M92 124 Q135 93 178 124 L203 288 Q136 321 68 286 Z" fill="#7f1d1d" stroke="#facc15" strokeWidth="5" />
          <path d="M89 131 Q135 108 181 131" fill="none" stroke="#fef3c7" strokeWidth="9" />
          <path d="M79 269 Q135 292 193 269" fill="none" stroke="#facc15" strokeWidth="5" />
          <path d="M135 132 L135 286" stroke="#b45309" strokeWidth="3" opacity=".65" />
        </g>
      );

    case "platinum-jetpack":
      return (
        <g>
          <path d="M88 139 Q135 114 182 139 L176 226 Q135 244 94 226 Z" fill="#111827" stroke="#67e8f9" strokeWidth="4" />
          <rect x="77" y="153" width="30" height="83" rx="12" fill="#334155" stroke="#94a3b8" strokeWidth="3" />
          <rect x="163" y="153" width="30" height="83" rx="12" fill="#334155" stroke="#94a3b8" strokeWidth="3" />
          <path d="M82 236 L91 272 L101 236 Z" fill="#22d3ee" className="accessory-jet-pulse" />
          <path d="M169 236 L179 272 L188 236 Z" fill="#22d3ee" className="accessory-jet-pulse accessory-delay" />
          <path d="M112 165 L158 165" stroke="#67e8f9" strokeWidth="4" />
        </g>
      );

    case "platinum-shoulder-drone":
      return (
        <g className="accessory-drone-hover">
          <ellipse cx="203" cy="111" rx="28" ry="13" fill="#1e293b" stroke="#67e8f9" strokeWidth="3" />
          <circle cx="203" cy="111" r="7" fill="#22d3ee" className="accessory-drone-eye" />
          <path d="M177 103 L158 92 M229 103 L246 90" stroke="#94a3b8" strokeWidth="4" />
          <ellipse cx="154" cy="89" rx="14" ry="4" fill="#64748b" className="accessory-drone-rotor" />
          <ellipse cx="250" cy="87" rx="14" ry="4" fill="#64748b" className="accessory-drone-rotor accessory-delay" />
          <path d="M203 124 L198 144 L208 144 Z" fill="rgba(34,211,238,.35)" />
        </g>
      );

    case "diamond-crystal-wings":
      return (
        <g className="accessory-crystal-wings">
          <polygon points="111,139 47,91 67,175 26,195 105,236 121,159" fill="rgba(103,232,249,.44)" stroke="#cffafe" strokeWidth="4" />
          <polygon points="159,139 223,91 203,175 244,195 165,236 149,159" fill="rgba(192,132,252,.42)" stroke="#f3e8ff" strokeWidth="4" />
          <path d="M106 149 L54 112 M102 179 L48 192 M164 149 L216 112 M168 179 L222 192" stroke="#ffffff" strokeWidth="2" opacity=".8" />
        </g>
      );

    case "diamond-ice-mantle":
      return (
        <g>
          <path d="M88 128 Q135 96 182 128 L170 169 Q135 151 100 169 Z" fill="#e0f2fe" stroke="#67e8f9" strokeWidth="4" />
          <polygon points="92,132 72,105 106,123" fill="#cffafe" stroke="#67e8f9" strokeWidth="3" />
          <polygon points="178,132 198,103 164,123" fill="#cffafe" stroke="#67e8f9" strokeWidth="3" />
          <polygon points="105,161 91,195 119,170" fill="#a5f3fc" />
          <polygon points="165,161 180,195 151,170" fill="#a5f3fc" />
        </g>
      );

    case "master-rune-wings":
      return (
        <g className="accessory-rune-wings">
          <path d="M112 142 C72 94 25 112 30 185 C36 233 73 258 111 221 L121 159 Z" fill="#241036" stroke="#c084fc" strokeWidth="4" />
          <path d="M158 142 C198 94 245 112 240 185 C234 233 197 258 159 221 L149 159 Z" fill="#241036" stroke="#c084fc" strokeWidth="4" />
          <path className="accessory-rune-line" d="M47 168 Q78 142 106 180 M223 168 Q192 142 164 180" fill="none" stroke="#f3e8ff" strokeWidth="4" strokeDasharray="10 8" />
          <text x="61" y="205" fontSize="22" fill="#e9d5ff">✦</text>
          <text x="193" y="205" fontSize="22" fill="#e9d5ff">✧</text>
        </g>
      );

    case "master-fire-cape":
      return (
        <g className="accessory-fire-cape">
          <path d="M91 124 Q135 94 179 124 L201 278 Q136 312 69 278 Z" fill="#7f1d1d" stroke="#fb923c" strokeWidth="4" />
          <path d="M72 276 Q84 241 97 278 Q111 235 126 281 Q143 231 158 280 Q175 239 198 276 Q184 309 136 315 Q89 309 72 276 Z" fill="#f97316" className="accessory-cape-flame" />
          <path d="M83 284 Q99 256 112 287 Q129 250 143 289 Q160 255 189 284" fill="none" stroke="#fef08a" strokeWidth="6" className="accessory-cape-flame accessory-delay" />
        </g>
      );

    case "master-star-orbit":
      return (
        <g className="accessory-star-orbit">
          <ellipse cx="135" cy="167" rx="103" ry="54" fill="none" stroke="rgba(196,181,253,.55)" strokeWidth="3" strokeDasharray="8 10" />
          <circle cx="35" cy="167" r="10" fill="#fef3c7" />
          <circle cx="224" cy="143" r="8" fill="#67e8f9" />
          <circle cx="162" cy="219" r="7" fill="#c084fc" />
          <text x="77" y="112" fontSize="21" fill="#ffffff">✦</text>
        </g>
      );

    case "legendary-angel-wings":
      return (
        <g className="accessory-seraph-wings">
          <path d="M112 145 C77 82 19 76 16 151 C13 224 61 285 116 228 L123 159 Z" fill="#fffdf2" stroke="#facc15" strokeWidth="5" />
          <path d="M158 145 C193 82 251 76 254 151 C257 224 209 285 154 228 L147 159 Z" fill="#fffdf2" stroke="#facc15" strokeWidth="5" />
          <path d="M102 151 Q54 119 35 177 M105 183 Q55 166 48 223 M168 151 Q216 119 235 177 M165 183 Q215 166 222 223" fill="none" stroke="#fde68a" strokeWidth="8" strokeLinecap="round" className="accessory-feather-wave" />
        </g>
      );

    case "legendary-dragon-wings":
      return (
        <g className="accessory-dragon-breathe">
          <path d="M112 144 C75 89 12 94 26 181 L11 155 L20 226 L57 211 L92 263 L117 220 L124 159 Z" fill="#2b0b0b" stroke="#f97316" strokeWidth="5" />
          <path d="M158 144 C195 89 258 94 244 181 L259 155 L250 226 L213 211 L178 263 L153 220 L146 159 Z" fill="#2b0b0b" stroke="#f97316" strokeWidth="5" />
          <path d="M43 151 L101 190 M227 151 L169 190" stroke="#ef4444" strokeWidth="4" className="accessory-dragon-vein" />
          <circle cx="34" cy="146" r="4" fill="#fef08a" className="accessory-dragon-eye" />
          <circle cx="236" cy="146" r="4" fill="#fef08a" className="accessory-dragon-eye accessory-delay" />
        </g>
      );

    default:
      return null;
  }
}



function AccessoryFront({
  item,
}: {
  item:
    CosmeticItem | null;
}) {
  if (!item) {
    return null;
  }


  const id =
    item.visualId;


  switch (id) {
    case "bronze-backpack":
      return (
        <g>
          <path d="M103 136 L147 215" stroke="#4a2c20" strokeWidth="9" />
          <rect x="133" y="184" width="30" height="34" rx="7" fill="#7c4a2d" stroke="#d6a46f" strokeWidth="3" />
          <path d="M137 191 L159 191" stroke="#3f2418" strokeWidth="3" />
          <rect x="143" y="198" width="10" height="8" rx="2" fill="#d4af37" />
        </g>
      );

    case "bronze-bandana":
      return (
        <g>
          <path d="M105 116 Q135 133 165 116 L158 142 Q135 153 112 142 Z" fill="#9f1239" stroke="#fda4af" strokeWidth="3" />
          <path d="M113 128 Q135 139 157 128" fill="none" stroke="#fecdd3" strokeWidth="2" />
        </g>
      );

    case "bronze-scout-badge":
      return (
        <g>
          <path d="M104 132 L159 217" stroke="#5b4636" strokeWidth="9" />
          <circle cx="153" cy="183" r="13" fill="#d4af37" stroke="#fef3c7" strokeWidth="3" />
          <path d="M153 175 L156 182 L164 183 L158 188 L160 196 L153 192 L146 196 L148 188 L142 183 L150 182 Z" fill="#7c2d12" />
          <rect x="119" y="170" width="26" height="18" rx="5" fill="#6b4f3a" stroke="#d6a46f" strokeWidth="2" />
        </g>
      );

    case "silver-headphones":
      return (
        <g>
          <path d="M94 65 Q135 31 176 65" fill="none" stroke="#0f172a" strokeWidth="9" />
          <path d="M100 63 Q135 39 170 63" fill="none" stroke="#67e8f9" strokeWidth="3" />
          <rect x="78" y="62" width="21" height="48" rx="9" fill="#111827" stroke="#cbd5e1" strokeWidth="3" />
          <rect x="171" y="62" width="21" height="48" rx="9" fill="#111827" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="88" cy="84" r="6" fill="#22d3ee" />
          <circle cx="182" cy="84" r="6" fill="#22d3ee" />
        </g>
      );

    case "silver-scarf":
      return (
        <g>
          <path d="M106 116 Q135 135 164 116 L158 148 Q135 158 112 148 Z" fill="#64748b" stroke="#f8fafc" strokeWidth="3" />
          <path d="M115 129 L156 129" stroke="#cbd5e1" strokeWidth="3" />
        </g>
      );

    case "silver-shoulder-cape":
      return (
        <g>
          <path d="M128 119 Q161 110 184 131 L171 153 Q151 140 129 145 Z" fill="#d6d3d1" stroke="#ffffff" strokeWidth="3" />
          <circle cx="170" cy="134" r="9" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="3" />
        </g>
      );

    case "gold-chain":
      return (
        <g>
          <path d="M107 124 Q135 163 163 124" fill="none" stroke="#facc15" strokeWidth="6" strokeDasharray="5 4" />
          <path d="M103 132 Q135 181 167 132" fill="none" stroke="#d4af37" strokeWidth="4" strokeDasharray="4 3" />
          <circle cx="135" cy="176" r="15" fill="#a16207" stroke="#fef3c7" strokeWidth="4" />
          <path d="M135 166 L139 174 L148 175 L141 181 L143 190 L135 186 L127 190 L129 181 L122 175 L131 174 Z" fill="#fef08a" />
        </g>
      );

    case "gold-commander-cape":
      return (
        <g>
          <path d="M96 120 Q135 104 174 120" fill="none" stroke="#fef3c7" strokeWidth="10" />
          <circle cx="100" cy="123" r="10" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
          <circle cx="170" cy="123" r="10" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
          <path d="M108 128 L135 151 L162 128" fill="none" stroke="#facc15" strokeWidth="4" />
        </g>
      );

    case "gold-halo-circlet":
      return (
        <g>
          <path d="M102 44 Q135 22 168 44 L163 57 Q135 45 107 57 Z" fill="#facc15" stroke="#fff7c2" strokeWidth="3" />
          <circle cx="135" cy="39" r="8" fill="#fef08a" className="accessory-sun-gem" />
          <path d="M135 17 L135 5 M113 25 L104 15 M157 25 L166 15" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case "platinum-tech-visor":
      return (
        <g>
          <path d="M98 58 Q135 42 172 58 L165 84 Q135 94 105 84 Z" fill="rgba(34,211,238,.32)" stroke="#67e8f9" strokeWidth="4" />
          <path d="M109 66 L160 66 M113 74 L147 74" stroke="#cffafe" strokeWidth="2" className="accessory-hud-scan" />
          <circle cx="157" cy="70" r="4" fill="#ffffff" />
          <path d="M170 62 L185 55" stroke="#94a3b8" strokeWidth="4" />
        </g>
      );

    case "platinum-jetpack":
      return (
        <g>
          <path d="M107 133 L94 202 M163 133 L176 202" stroke="#64748b" strokeWidth="7" />
          <rect x="119" y="132" width="32" height="18" rx="7" fill="#1e293b" stroke="#67e8f9" strokeWidth="3" />
        </g>
      );

    case "platinum-shoulder-drone":
      return null;

    case "diamond-crystal-wings":
      return (
        <g>
          <polygon points="112,127 135,143 158,127 151,151 135,160 119,151" fill="rgba(207,250,254,.8)" stroke="#67e8f9" strokeWidth="3" />
          <circle cx="135" cy="143" r="6" fill="#ffffff" className="accessory-crystal-core" />
        </g>
      );

    case "diamond-floating-crown":
      return (
        <g className="accessory-floating-crown">
          <path d="M105 28 L117 7 L132 24 L146 2 L159 24 L175 7 L167 39 L108 39 Z" fill="rgba(103,232,249,.62)" stroke="#cffafe" strokeWidth="4" />
          <polygon points="96,40 102,34 108,40 102,46" fill="#c084fc" />
          <polygon points="177,40 183,34 189,40 183,46" fill="#67e8f9" />
          <circle cx="146" cy="20" r="6" fill="#ffffff" />
        </g>
      );

    case "diamond-ice-mantle":
      return (
        <g>
          <path d="M96 122 Q135 98 174 122 L164 153 Q135 140 106 153 Z" fill="#dbeafe" stroke="#67e8f9" strokeWidth="4" />
          <path d="M110 121 L97 99 M160 121 L173 99" stroke="#ffffff" strokeWidth="5" />
          <circle cx="135" cy="135" r="9" fill="#67e8f9" />
        </g>
      );

    case "master-rune-wings":
      return (
        <g>
          <circle cx="135" cy="142" r="17" fill="#3b0764" stroke="#e9d5ff" strokeWidth="4" className="accessory-rune-core" />
          <text x="135" y="149" textAnchor="middle" fontSize="19" fill="#ffffff">✦</text>
        </g>
      );

    case "master-fire-cape":
      return (
        <g>
          <path d="M96 119 Q135 101 174 119" fill="none" stroke="#fed7aa" strokeWidth="10" />
          <circle cx="101" cy="122" r="10" fill="#f97316" stroke="#fef3c7" strokeWidth="3" />
          <circle cx="169" cy="122" r="10" fill="#f97316" stroke="#fef3c7" strokeWidth="3" />
        </g>
      );

    case "master-star-orbit":
      return (
        <g>
          <circle cx="135" cy="141" r="11" fill="#fef3c7" stroke="#ffffff" strokeWidth="3" className="accessory-star-core" />
        </g>
      );

    case "legendary-angel-wings":
      return (
        <g>
          <path d="M102 119 Q135 95 168 119" fill="none" stroke="#ffffff" strokeWidth="10" />
          <circle cx="105" cy="121" r="10" fill="#facc15" stroke="#fff" strokeWidth="3" />
          <circle cx="165" cy="121" r="10" fill="#facc15" stroke="#fff" strokeWidth="3" />
        </g>
      );

    case "legendary-dragon-wings":
      return (
        <g>
          <path d="M105 120 Q135 103 165 120" fill="none" stroke="#7f1d1d" strokeWidth="11" />
          <circle cx="108" cy="122" r="9" fill="#f97316" />
          <circle cx="162" cy="122" r="9" fill="#f97316" />
        </g>
      );

    case "legendary-celestial-crown":
      return (
        <g className="accessory-celestial-crown">
          <ellipse cx="135" cy="31" rx="49" ry="16" fill="none" stroke="#facc15" strokeWidth="4" />
          <ellipse cx="135" cy="31" rx="34" ry="10" fill="none" stroke="#67e8f9" strokeWidth="3" className="accessory-crown-orbit" />
          <path d="M102 34 L114 8 L131 25 L146 1 L160 25 L178 8 L168 43 L106 43 Z" fill="rgba(250,204,21,.72)" stroke="#fff7c2" strokeWidth="4" />
          <circle cx="146" cy="19" r="7" fill="#ffffff" className="accessory-crown-core" />
          <polygon points="91,31 97,25 103,31 97,37" fill="#c084fc" />
          <polygon points="173,31 179,25 185,31 179,37" fill="#67e8f9" />
        </g>
      );

    default:
      return null;
  }
}



function getHandAnchor(
  hand:
    HeldItemHand,

  armStyle:
    CharacterPose["leftArm"]
) {
  const leftAnchors:
    Record<
      CharacterPose["leftArm"],
      {
        x: number;
        y: number;
        rotation: number;
      }
    > = {
    down: {
      x: 99,
      y: 231,
      rotation: -4,
    },

    hip: {
      x: 118,
      y: 222,
      rotation: -32,
    },

    cross: {
      x: 164,
      y: 192,
      rotation: 28,
    },

    up: {
      x: 81,
      y: 61,
      rotation: -18,
    },

    forward: {
      x: 46,
      y: 183,
      rotation: -72,
    },

    prayer: {
      x: 135,
      y: 211,
      rotation: 0,
    },
  };


  const anchor =
    leftAnchors[
      armStyle
    ];


  if (
    hand ===
    "left"
  ) {
    return anchor;
  }


  return {
    x:
      270 -
      anchor.x,

    y:
      anchor.y,

    rotation:
      -anchor.rotation,
  };
}


function isTwoHandedHeldItem(
  visualId:
    string
) {
  return (
    visualId.includes(
      "camera"
    ) ||
    visualId.includes(
      "guitar"
    ) ||
    visualId.includes(
      "bow"
    ) ||
    visualId.includes(
      "banner"
    )
  );
}


function shouldHideHeldItemForPose(
  poseVisualId?:
    string
) {
  return (
    poseVisualId?.includes(
      "pushup-loop"
    ) ||
    poseVisualId?.includes(
      "pullup-loop"
    )
  );
}


function HeldItem({
  item,
  selectedHand,
  pose,
  poseVisualId,
}: {
  item:
    CosmeticItem | null;

  selectedHand:
    HeldItemHand;

  pose:
    CharacterPose;

  poseVisualId?:
    string;
}) {
  if (
    !item ||
    shouldHideHeldItemForPose(
      poseVisualId
    )
  ) {
    return null;
  }


  const emoji =
    heldItemEmoji[
      item.visualId
    ] ??
    "✨";


  const twoHanded =
    isTwoHandedHeldItem(
      item.visualId
    );


  const activeArmStyle =
    selectedHand ===
    "left"
      ? pose.leftArm
      : pose.rightArm;


  const anchor =
    twoHanded
      ? {
          x: 135,
          y:
            pose.legs ===
            "crossed"
              ? 205
              : 190,
          rotation: 0,
        }
      : getHandAnchor(
          selectedHand,
          activeArmStyle
        );


  const tierScale:
    Record<
      CosmeticTier,
      number
    > = {
    Bronze: 0.88,
    Silver: 0.96,
    Gold: 1.03,
    Platinum: 1.08,
    Diamond: 1.13,
    Master: 1.18,
    Legendary: 1.24,
  };


  const effectClass =
    item.tier ===
    "Master"
      ? getMasterHeldItemClass(
          item.visualId
        )
      : item.tier ===
        "Legendary"
      ? getLegendaryHeldItemClass(
          item.visualId
        )
      : "";


  return (
    <g
      transform={`
        translate(
          ${anchor.x}
          ${anchor.y}
        )
        rotate(
          ${anchor.rotation}
        )
        scale(
          ${tierScale[item.tier]}
        )
      `}
    >
      <HeldItemBackdrop
        item={
          item
        }
      />


      <text
        className={
          effectClass
        }
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={
          twoHanded
            ? 50
            : 46
        }
      >
        {emoji}
      </text>


      <HeldItemEffect
        item={
          item
        }
      />
    </g>
  );
}


function HeldItemBackdrop({
  item,
}: {
  item:
    CosmeticItem;
}) {
  const colors =
    tierColors[
      item.tier
    ];


  if (
    item.tier ===
    "Bronze"
  ) {
    return (
      <circle
        cx="0"
        cy="0"
        r="25"
        fill="rgba(0,0,0,.22)"
      />
    );
  }


  if (
    item.tier ===
    "Silver"
  ) {
    return (
      <circle
        cx="0"
        cy="0"
        r="27"
        fill="rgba(15,23,42,.34)"
        stroke={
          colors.highlight
        }
        strokeWidth="2"
        opacity=".72"
      />
    );
  }


  if (
    item.tier ===
    "Gold"
  ) {
    return (
      <polygon
        points="
          0,-31
          28,-15
          28,15
          0,31
          -28,15
          -28,-15
        "
        fill="rgba(66,32,6,.35)"
        stroke={
          colors.highlight
        }
        strokeWidth="3"
      />
    );
  }


  if (
    item.tier ===
    "Platinum"
  ) {
    return (
      <>
        <circle
          cx="0"
          cy="0"
          r="30"
          fill="rgba(2,6,23,.42)"
          stroke={
            colors.primary
          }
          strokeWidth="3"
        />

        <path
          d="
            M-34 0
            L-23 0

            M23 0
            L34 0

            M0 -34
            L0 -23

            M0 23
            L0 34
          "
          stroke={
            colors.highlight
          }
          strokeWidth="3"
        />
      </>
    );
  }


  if (
    item.tier ===
    "Diamond"
  ) {
    return (
      <polygon
        points="
          0,-38
          25,-24
          37,0
          25,24
          0,38
          -25,24
          -37,0
          -25,-24
        "
        fill="rgba(8,47,73,.38)"
        stroke={
          colors.highlight
        }
        strokeWidth="3"
        opacity=".9"
      />
    );
  }


  return (
    <circle
      cx="0"
      cy="0"
      r="35"
      fill="rgba(0,0,0,.44)"
      stroke={
        colors.highlight
      }
      strokeWidth="3"
      className="
        held-item-endgame-ring
      "
    />
  );
}


function getMasterHeldItemClass(
  visualId:
    string
) {
  if (
    visualId.includes(
      "flame-blade"
    )
  ) {
    return "held-item-flame-blade";
  }


  if (
    visualId.includes(
      "rune-book"
    )
  ) {
    return "held-item-rune-book";
  }


  return "held-item-lightning-hammer";
}


function getLegendaryHeldItemClass(
  visualId:
    string
) {
  if (
    visualId.includes(
      "celestial-sword"
    )
  ) {
    return "held-item-celestial-sword";
  }


  if (
    visualId.includes(
      "crown-staff"
    )
  ) {
    return "held-item-crown-staff";
  }


  return "held-item-cosmic-orb";
}


function HeldItemEffect({
  item,
}: {
  item:
    CosmeticItem;
}) {
  if (
    item.visualId.includes(
      "flame-blade"
    )
  ) {
    return (
      <>
        {Array.from({
          length: 5,
        }).map(
          (
            _,
            index
          ) => (
            <circle
              key={
                index
              }
              className="
                held-item-flame-particle
              "
              cx={
                -18 +
                index *
                  9
              }
              cy={
                25
              }
              r={
                3 +
                (
                  index %
                  2
                )
              }
              fill="#fb923c"
              style={{
                animationDelay:
                  `${index * 0.13}s`,
              }}
            />
          )
        )}
      </>
    );
  }


  if (
    item.visualId.includes(
      "rune-book"
    )
  ) {
    return (
      <g
        className="
          held-item-rune-orbit
        "
      >
        <text
          x="-35"
          y="-20"
          fontSize="15"
          fill="#f3e8ff"
        >
          ᚱ
        </text>

        <text
          x="30"
          y="20"
          fontSize="15"
          fill="#c4b5fd"
        >
          ᛟ
        </text>
      </g>
    );
  }


  if (
    item.visualId.includes(
      "lightning-hammer"
    )
  ) {
    return (
      <path
        className="
          held-item-hammer-arc
        "
        d="
          M-31 -4
          L-17 -18
          L-8 -9
          L7 -27
          L3 -8
          L17 -11
          L5 7
        "
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }


  if (
    item.visualId.includes(
      "celestial-sword"
    )
  ) {
    return (
      <path
        className="
          held-item-sword-light
        "
        d="
          M-31 20
          L27 -29
        "
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
      />
    );
  }


  if (
    item.visualId.includes(
      "crown-staff"
    )
  ) {
    return (
      <g
        className="
          held-item-staff-gems
        "
      >
        <circle
          cx="0"
          cy="-35"
          r="5"
          fill="#fef3c7"
        />

        <circle
          cx="31"
          cy="0"
          r="4"
          fill="#67e8f9"
        />

        <circle
          cx="-31"
          cy="0"
          r="4"
          fill="#c084fc"
        />
      </g>
    );
  }


  if (
    item.visualId.includes(
      "cosmic-orb"
    )
  ) {
    return (
      <>
        <circle
          className="
            held-item-cosmic-ring-one
          "
          cx="0"
          cy="0"
          r="31"
          fill="none"
          stroke="#c084fc"
          strokeWidth="3"
        />

        <ellipse
          className="
            held-item-cosmic-ring-two
          "
          cx="0"
          cy="0"
          rx="37"
          ry="15"
          fill="none"
          stroke="#67e8f9"
          strokeWidth="3"
        />
      </>
    );
  }


  return null;
}


function FrameLayer({
  item,
}: {
  item:
    CosmeticItem;
}) {
  const colors =
    tierColors[
      item.tier
    ];


  const id =
    item.visualId;


  switch (id) {
    case "bronze-wood-branches":
      return (
        <FrameSvg>
          <rect x="10" y="10" width="400" height="520" rx="36" fill="none" stroke="#3f2a1d" strokeWidth="10" />
          <Branch x={27} y={38} color="#7c5a35" />
          <Branch x={393} y={38} horizontalFlip color="#6b8f47" />
          <Branch x={27} y={502} flip color="#6b8f47" />
          <Branch x={393} y={502} flip horizontalFlip color="#7c5a35" />
          {Array.from({ length: 9 }).map((_, index) => (
            <ellipse
              key={index}
              className="frame-leaf-drift"
              cx={36 + (index * 47) % 350}
              cy={35 + (index % 3) * 9}
              rx="7"
              ry="3.5"
              fill={index % 2 === 0 ? "#84a94f" : "#b48445"}
              style={{ animationDelay: `${index * 0.35}s` }}
            />
          ))}
        </FrameSvg>
      );

    case "bronze-license-plate":
      return (
        <FrameSvg>
          <defs>
            <linearGradient id="licenseMetal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d6d3d1" />
              <stop offset="45%" stopColor="#78716c" />
              <stop offset="100%" stopColor="#e7e5e4" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="404" height="524" rx="26" fill="none" stroke="#1c1917" strokeWidth="12" />
          <rect x="13" y="72" width="42" height="398" rx="8" fill="url(#licenseMetal)" stroke="#292524" strokeWidth="4" />
          <rect x="365" y="72" width="42" height="398" rx="8" fill="url(#licenseMetal)" stroke="#292524" strokeWidth="4" />
          <rect x="70" y="489" width="280" height="37" rx="9" fill="url(#licenseMetal)" stroke="#292524" strokeWidth="4" />
          <text x="34" y="285" transform="rotate(-90 34 285)" textAnchor="middle" fontSize="13" fontWeight="900" fill="#292524" letterSpacing="3">RPG 001</text>
          <text x="386" y="285" transform="rotate(90 386 285)" textAnchor="middle" fontSize="13" fontWeight="900" fill="#292524" letterSpacing="3">LEVEL UP</text>
          <text x="210" y="514" textAnchor="middle" fontSize="13" fontWeight="900" fill="#292524" letterSpacing="4">ADVENTURER</text>
          {[[31,88],[389,88],[31,454],[389,454],[88,507],[332,507]].map((point,index)=>(
            <circle key={index} cx={point[0]} cy={point[1]} r="6" fill="#292524" stroke="#f5f5f4" strokeWidth="2" />
          ))}
          <path d="M18 155 L48 143 M372 405 L402 392 M110 499 L128 518" stroke="#44403c" strokeWidth="3" opacity=".65" />
        </FrameSvg>
      );

    case "bronze-rope-and-badges":
      return (
        <FrameSvg>
          <rect x="13" y="13" width="394" height="514" rx="42" fill="none" stroke="#5b3a22" strokeWidth="15" strokeDasharray="5 4" />
          <rect x="20" y="20" width="380" height="500" rx="36" fill="none" stroke="#c89b62" strokeWidth="5" strokeDasharray="12 7" />
          <circle cx="42" cy="67" r="24" fill="#7c2d12" stroke="#fbbf24" strokeWidth="4" />
          <path d="M42 49 L48 62 L62 64 L52 74 L55 89 L42 81 L29 89 L32 74 L22 64 L36 62 Z" fill="#fbbf24" />
          <circle cx="378" cy="472" r="24" fill="#14532d" stroke="#d6d3d1" strokeWidth="4" />
          <path d="M366 472 L376 482 L392 458" fill="none" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
          <path d="M23 226 C47 242 47 294 23 310 M397 226 C373 242 373 294 397 310" fill="none" stroke="#d4a574" strokeWidth="8" />
          <path d="M17 115 L56 143 M403 115 L364 143" stroke="#94a3b8" strokeWidth="6" />
        </FrameSvg>
      );

    case "silver-frosted-steel":
      return (
        <FrameSvg>
          <defs><linearGradient id="steelFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f8fafc"/><stop offset="40%" stopColor="#64748b"/><stop offset="75%" stopColor="#cbd5e1"/><stop offset="100%" stopColor="#334155"/></linearGradient></defs>
          <path d="M18 74 L50 18 L370 18 L402 74 L402 466 L370 522 L50 522 L18 466 Z" fill="none" stroke="url(#steelFrame)" strokeWidth="15" strokeLinejoin="round" />
          <path d="M29 83 L60 32 L360 32 L391 83 M29 457 L60 508 L360 508 L391 457" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          {[[43,59],[377,59],[43,481],[377,481]].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="8" fill="#334155" stroke="#f8fafc" strokeWidth="3"/>)}
          {Array.from({length:12}).map((_,i)=><path key={i} d={`M${18+i*34} ${18+(i%3)*6} l10 14 l-18 4`} fill="none" stroke="#dbeafe" strokeWidth="3" opacity=".8"/>)}
        </FrameSvg>
      );

    case "silver-cathedral-arches":
      return (
        <FrameSvg>
          <path d="M18 525 L18 122 Q63 34 108 122 L108 47 Q210 -10 312 47 L312 122 Q357 34 402 122 L402 525" fill="none" stroke="#52525b" strokeWidth="17" />
          <path d="M34 525 L34 139 Q63 82 92 139 L92 69 Q210 10 328 69 L328 139 Q357 82 386 139 L386 525" fill="none" stroke="#d4d4d8" strokeWidth="5" />
          <path d="M176 35 L210 15 L244 35 L230 65 L190 65 Z" fill="#7c3aed" stroke="#f5d0fe" strokeWidth="4" />
          <circle cx="210" cy="50" r="13" fill="#38bdf8" opacity=".75" />
          <path d="M20 320 H76 M344 320 H400" stroke="#a1a1aa" strokeWidth="8" />
        </FrameSvg>
      );

    case "silver-wolf-crest":
      return (
        <FrameSvg>
          <path d="M18 80 L53 20 H367 L402 80 V458 L367 520 H53 L18 458 Z" fill="none" stroke="#1f2937" strokeWidth="17" />
          <path d="M29 88 L62 34 H358 L391 88 V450 L358 506 H62 L29 450 Z" fill="none" stroke="#94a3b8" strokeWidth="5" />
          <path d="M164 520 L180 480 L210 492 L240 480 L256 520" fill="#374151" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M179 505 L190 477 L210 489 L230 477 L241 505 L226 494 L210 516 L194 494 Z" fill="#d1d5db" />
          <path d="M25 145 L65 165 M395 145 L355 165 M25 395 L65 375 M395 395 L355 375" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
        </FrameSvg>
      );

    case "gold-laurel-frame":
      return (
        <FrameSvg>
          <rect x="13" y="13" width="394" height="514" rx="40" fill="none" stroke="#7c5a12" strokeWidth="8" />
          <path d="M70 482 C28 390 26 244 75 100" fill="none" stroke="#d4a017" strokeWidth="9" />
          <path d="M350 482 C392 390 394 244 345 100" fill="none" stroke="#d4a017" strokeWidth="9" />
          {Array.from({length:12}).map((_,i)=><ellipse key={`l${i}`} cx={53+(i%2)*12} cy={450-i*29} rx="15" ry="7" transform={`rotate(${-45+i*3} ${53+(i%2)*12} ${450-i*29})`} fill="#facc15"/>)}
          {Array.from({length:12}).map((_,i)=><ellipse key={`r${i}`} cx={367-(i%2)*12} cy={450-i*29} rx="15" ry="7" transform={`rotate(${45-i*3} ${367-(i%2)*12} ${450-i*29})`} fill="#fde047"/>)}
          <circle cx="210" cy="510" r="25" fill="#a16207" stroke="#fef08a" strokeWidth="5" />
          <path d="M195 512 L205 522 L226 496" fill="none" stroke="#fef08a" strokeWidth="5" strokeLinecap="round" />
        </FrameSvg>
      );

    case "gold-sun-emblem":
      return (
        <FrameSvg>
          <rect x="14" y="14" width="392" height="512" rx="38" fill="none" stroke="#a16207" strokeWidth="11" />
          <circle cx="210" cy="42" r="31" fill="#facc15" stroke="#fef08a" strokeWidth="5" />
          {Array.from({length:16}).map((_,i)=><path key={i} d="M210 2 L216 18 L204 18 Z" fill="#fbbf24" transform={`rotate(${i*22.5} 210 42)`}/>)}
          <path d="M23 110 H75 M345 110 H397 M23 430 H75 M345 430 H397" stroke="#facc15" strokeWidth="7" />
          <path d="M32 270 C55 245 55 295 32 270 M388 270 C365 245 365 295 388 270" fill="#fef08a" />
        </FrameSvg>
      );

    case "gold-royal-banner":
      return (
        <FrameSvg>
          <rect x="15" y="15" width="390" height="510" rx="38" fill="none" stroke="#7e22ce" strokeWidth="10" />
          <path d="M20 65 H85 V355 L52 330 L20 355 Z" fill="#7e22ce" stroke="#facc15" strokeWidth="5" />
          <path d="M400 65 H335 V355 L368 330 L400 355 Z" fill="#7e22ce" stroke="#facc15" strokeWidth="5" />
          <path d="M26 72 H79 M341 72 H394" stroke="#fef3c7" strokeWidth="5" />
          <path d="M178 500 L210 472 L242 500 L228 523 H192 Z" fill="#a16207" stroke="#fde68a" strokeWidth="4" />
          <path d="M188 492 L198 468 L210 483 L222 468 L232 492" fill="#facc15" />
          {Array.from({length:6}).map((_,i)=><circle key={i} cx={52} cy={105+i*34} r="5" fill="#facc15"/>)}
          {Array.from({length:6}).map((_,i)=><circle key={i} cx={368} cy={105+i*34} r="5" fill="#facc15"/>)}
        </FrameSvg>
      );

    case "platinum-industrial-rivets":
      return (
        <FrameSvg>
          <path d="M18 70 L58 18 H362 L402 70 V470 L362 522 H58 L18 470 Z" fill="none" stroke="#111827" strokeWidth="22" />
          <path d="M27 77 L65 30 H355 L393 77 V463 L355 510 H65 L27 463 Z" fill="none" stroke="#94a3b8" strokeWidth="7" />
          {[[50,57],[370,57],[50,483],[370,483],[26,270],[394,270]].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="9" fill="#020617" stroke="#e2e8f0" strokeWidth="4"/>)}
          <rect x="12" y="185" width="38" height="82" rx="7" fill="#334155" stroke="#cbd5e1" strokeWidth="4" />
          <rect x="370" y="300" width="38" height="82" rx="7" fill="#334155" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="31" cy="207" r="7" fill="#22c55e"/><circle cx="389" cy="322" r="7" fill="#ef4444"/>
        </FrameSvg>
      );

    case "platinum-neon-tubes":
      return (
        <FrameSvg>
          <path className="frame-neon-pulse" d="M19 91 L63 19 H357 L401 91 V449 L357 521 H63 L19 449 Z" fill="none" stroke="#22d3ee" strokeWidth="11" />
          <path className="frame-neon-pulse-two" d="M34 98 L72 35 H348 L386 98 V442 L348 505 H72 L34 442 Z" fill="none" stroke="#f472b6" strokeWidth="5" />
          <path d="M20 176 H72 L90 158 M400 364 H348 L330 382" fill="none" stroke="#a78bfa" strokeWidth="6" />
          <rect x="15" y="220" width="18" height="96" rx="9" fill="#22d3ee" opacity=".8" />
          <rect x="387" y="220" width="18" height="96" rx="9" fill="#f472b6" opacity=".8" />
        </FrameSvg>
      );

    case "platinum-winged-frame":
      return (
        <FrameSvg>
          <rect x="18" y="18" width="384" height="504" rx="38" fill="none" stroke="#64748b" strokeWidth="9" />
          <path d="M18 112 C61 60 100 63 131 126 C87 100 59 118 21 177" fill="#e2e8f0" stroke="#ffffff" strokeWidth="4" />
          <path d="M402 112 C359 60 320 63 289 126 C333 100 361 118 399 177" fill="#cbd5e1" stroke="#ffffff" strokeWidth="4" />
          <path d="M18 428 C61 480 100 477 131 414 C87 440 59 422 21 363" fill="#cbd5e1" stroke="#ffffff" strokeWidth="4" />
          <path d="M402 428 C359 480 320 477 289 414 C333 440 361 422 399 363" fill="#e2e8f0" stroke="#ffffff" strokeWidth="4" />
          <path d="M184 18 L210 2 L236 18 L226 50 H194 Z" fill="#94a3b8" stroke="#f8fafc" strokeWidth="4" />
        </FrameSvg>
      );

    case "diamond-crystal-shards":
      return (
        <FrameSvg>
          <defs><linearGradient id="crystalFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#cffafe"/><stop offset="48%" stopColor="#67e8f9"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
          <path d="M24 90 L58 20 L131 34 L210 8 L289 34 L362 20 L396 90 L407 185 L395 270 L407 355 L395 455 L358 520 L290 502 L210 530 L130 502 L62 520 L25 455 L13 355 L25 270 L13 185 Z" fill="none" stroke="url(#crystalFrame)" strokeWidth="13" strokeLinejoin="round" />
          {[[34,76,0],[386,76,90],[34,464,-90],[386,464,180],[210,20,0],[210,520,180]].map((p,i)=><polygon key={i} points="0,-25 15,10 0,32 -15,10" fill={i%2?"#a5f3fc":"#ddd6fe"} stroke="#f0fdfa" strokeWidth="3" transform={`translate(${p[0]} ${p[1]}) rotate(${p[2]})`}/>)}
          {Array.from({length:8}).map((_,i)=><circle key={i} className="frame-crystal-glint" cx={45+(i*49)%330} cy={30+(i%2)*472} r="4" fill="#ffffff" style={{animationDelay:`${i*.3}s`}}/>)}
        </FrameSvg>
      );

    case "diamond-ice-crown":
      return (
        <FrameSvg>
          <rect x="14" y="21" width="392" height="505" rx="38" fill="none" stroke="#67e8f9" strokeWidth="11" />
          <path d="M88 34 L125 6 L158 36 L210 0 L262 36 L295 6 L332 34 L314 73 H106 Z" fill="#cffafe" stroke="#0891b2" strokeWidth="5" />
          {Array.from({length:11}).map((_,i)=><path key={i} d={`M${34+i*35} 514 l10 0 l-5 ${17+(i%3)*8} Z`} fill="#dbeafe" stroke="#67e8f9" strokeWidth="2"/>)}
          <path d="M20 120 C40 112 49 125 61 105 M400 120 C380 112 371 125 359 105" fill="none" stroke="#e0f2fe" strokeWidth="6" />
          <circle cx="210" cy="34" r="10" fill="#ffffff" className="frame-crystal-glint" />
        </FrameSvg>
      );

    case "diamond-prismatic-edge":
      return (
        <FrameSvg>
          <defs><linearGradient id="prismEdge" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22d3ee"/><stop offset="25%" stopColor="#818cf8"/><stop offset="50%" stopColor="#f472b6"/><stop offset="75%" stopColor="#facc15"/><stop offset="100%" stopColor="#34d399"/></linearGradient></defs>
          {[[25,75,25,190],[25,350,25,465],[395,75,395,190],[395,350,395,465],[80,22,165,22],[255,22,340,22],[80,518,165,518],[255,518,340,518]].map((p,i)=><path key={i} d={`M${p[0]} ${p[1]} L${p[2]} ${p[3]}`} stroke="url(#prismEdge)" strokeWidth="14" strokeLinecap="round"/>)}
          {[[25,270],[395,270],[210,22],[210,518]].map((p,i)=><polygon key={i} points="0,-22 15,0 0,22 -15,0" fill="#e0e7ff" stroke="#c4b5fd" strokeWidth="4" transform={`translate(${p[0]} ${p[1]}) rotate(${i%2?0:45})`}/>)}
          <path className="frame-prism-shift" d="M25 75 L80 22 M340 22 L395 75 M395 465 L340 518 M80 518 L25 465" stroke="#ffffff" strokeWidth="5" opacity=".8" />
        </FrameSvg>
      );

    case "master-rune-frame":
      return (
        <FrameSvg>
          <path d="M22 82 L62 20 H358 L398 82 V458 L358 520 H62 L22 458 Z" fill="none" stroke="#3b0764" strokeWidth="19" />
          <path d="M32 88 L69 34 H351 L388 88 V452 L351 506 H69 L32 452 Z" fill="none" stroke="#7e22ce" strokeWidth="7" />
          {Array.from({length:14}).map((_,i)=><text key={i} className="frame-rune-glow" x={i<7?39:381} y={112+(i%7)*52} textAnchor="middle" fontSize="18" fontWeight="900" fill="#e9d5ff" style={{animationDelay:`${i*.18}s`}}>{["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ"][i%7]}</text>)}
          <circle className="frame-rune-orbit" cx="210" cy="35" r="13" fill="#d8b4fe" />
          <circle className="frame-rune-orbit-two" cx="210" cy="505" r="10" fill="#c084fc" />
        </FrameSvg>
      );

    case "master-flame-pillars":
      return (
        <FrameSvg>
          <rect x="18" y="18" width="384" height="504" rx="32" fill="none" stroke="#260b07" strokeWidth="20" />
          <path d="M34 478 V62 H75 V478 Z M345 478 V62 H386 V478 Z" fill="#431407" stroke="#9a3412" strokeWidth="5" />
          {Array.from({length:10}).map((_,i)=><path key={`l${i}`} className="frame-channel-fire" d={`M54 ${445-i*39} C39 ${430-i*39} 70 ${414-i*39} 54 ${394-i*39}`} fill="none" stroke={i%2?"#facc15":"#f97316"} strokeWidth="8" strokeLinecap="round" style={{animationDelay:`${i*.12}s`}}/>)}
          {Array.from({length:10}).map((_,i)=><path key={`r${i}`} className="frame-channel-fire" d={`M366 ${445-i*39} C381 ${430-i*39} 350 ${414-i*39} 366 ${394-i*39}`} fill="none" stroke={i%2?"#fb923c":"#fde047"} strokeWidth="8" strokeLinecap="round" style={{animationDelay:`${i*.12+.2}s`}}/>)}
          <path d="M35 62 L73 26 H347 L385 62" fill="none" stroke="#f97316" strokeWidth="10" />
        </FrameSvg>
      );

    case "master-orbit-frame":
      return (
        <FrameSvg>
          <ellipse cx="210" cy="270" rx="194" ry="253" fill="none" stroke="#1e1b4b" strokeWidth="17" />
          <ellipse cx="210" cy="270" rx="181" ry="240" fill="none" stroke="#7c3aed" strokeWidth="5" strokeDasharray="24 13" className="frame-orbit-ring" />
          <ellipse cx="210" cy="270" rx="205" ry="210" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="10 17" className="frame-orbit-ring-reverse" />
          <g className="frame-orbit-object"><circle cx="210" cy="20" r="15" fill="#fbbf24"/><circle cx="205" cy="16" r="4" fill="#fef3c7"/></g>
          <g className="frame-orbit-object-two"><circle cx="405" cy="270" r="11" fill="#67e8f9"/><circle cx="402" cy="267" r="3" fill="#ffffff"/></g>
          {Array.from({length:12}).map((_,i)=><circle key={i} cx={32+(i*33)%360} cy={35+(i*71)%470} r={i%3+1} fill="#ffffff" opacity=".7"/>)}
        </FrameSvg>
      );

    case "legendary-celestial-gate":
      return (
        <FrameSvg>
          <defs><linearGradient id="celestialGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff7cc"/><stop offset="45%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#92400e"/></linearGradient></defs>
          <path d="M18 526 V130 Q63 32 108 130 V64 Q210 -8 312 64 V130 Q357 32 402 130 V526" fill="none" stroke="url(#celestialGold)" strokeWidth="18" />
          <path className="frame-celestial-flow" d="M34 526 V143 Q63 86 92 143 V82 Q210 17 328 82 V143 Q357 86 386 143 V526" fill="none" stroke="#ffffff" strokeWidth="5" />
          <circle cx="210" cy="58" r="28" fill="#1e1b4b" stroke="#fef3c7" strokeWidth="5" />
          {Array.from({length:10}).map((_,i)=><circle key={i} className="frame-star-travel" cx={52+(i*35)%320} cy={75+(i%3)*170} r={3+(i%2)} fill="#ffffff" style={{animationDelay:`${i*.25}s`}}/>)}
        </FrameSvg>
      );

    case "legendary-dragon-frame":
      return (
        <FrameSvg>
          <rect x="17" y="17" width="386" height="506" rx="38" fill="none" stroke="#450a0a" strokeWidth="18" />
          <path d="M24 462 C52 405 36 333 67 278 C89 238 73 167 43 108 C91 125 121 172 112 226 C105 272 145 300 125 354 C108 399 75 451 42 491" fill="none" stroke="#b91c1c" strokeWidth="15" strokeLinecap="round" />
          <path d="M396 462 C368 405 384 333 353 278 C331 238 347 167 377 108 C329 125 299 172 308 226 C315 272 275 300 295 354 C312 399 345 451 378 491" fill="none" stroke="#dc2626" strokeWidth="15" strokeLinecap="round" />
          <path d="M33 96 L58 54 L89 91 L70 126 Z M387 96 L362 54 L331 91 L350 126 Z" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="4" />
          <circle className="frame-dragon-eye" cx="59" cy="86" r="6" fill="#fef08a"/><circle className="frame-dragon-eye" cx="361" cy="86" r="6" fill="#fef08a"/>
          <path className="frame-dragon-smoke" d="M61 104 C88 116 72 140 95 151" fill="none" stroke="#d1d5db" strokeWidth="7" strokeLinecap="round" opacity=".55" />
          <path className="frame-dragon-smoke-two" d="M359 104 C332 116 348 140 325 151" fill="none" stroke="#d1d5db" strokeWidth="7" strokeLinecap="round" opacity=".55" />
        </FrameSvg>
      );

    case "legendary-crown-frame":
      return (
        <FrameSvg>
          <defs><linearGradient id="eternalGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fef3c7"/><stop offset="45%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#b91c1c"/></linearGradient></defs>
          <path d="M18 94 L62 22 L128 45 L210 8 L292 45 L358 22 L402 94 V452 L360 520 L60 520 L18 452 Z" fill="none" stroke="url(#eternalGold)" strokeWidth="18" strokeLinejoin="round" />
          <path d="M105 56 L138 13 L176 50 L210 2 L244 50 L282 13 L315 56 L294 93 H126 Z" fill="#a16207" stroke="#fef3c7" strokeWidth="5" />
          <path className="frame-crown-energy" d="M27 100 L70 34 L132 58 L210 22 L288 58 L350 34 L393 100 V444 L352 507 H68 L27 444 Z" fill="none" stroke="#ffffff" strokeWidth="5" />
          {[[112,52],[210,26],[308,52],[44,270],[376,270],[210,505]].map((p,i)=><polygon key={i} className="frame-floating-jewel" points="0,-12 9,0 0,12 -9,0" fill={i%2?"#67e8f9":"#f472b6"} stroke="#ffffff" strokeWidth="2" transform={`translate(${p[0]} ${p[1]})`} style={{animationDelay:`${i*.3}s`}}/>)}
        </FrameSvg>
      );

    default:
      return (
        <FrameSvg>
          <rect x="14" y="14" width="392" height="512" rx="38" fill="none" stroke={colors.primary} strokeWidth="10" />
          <rect x="24" y="24" width="372" height="492" rx="31" fill="none" stroke={colors.highlight} strokeWidth="4" />
        </FrameSvg>
      );
  }
}


function FrameSvg({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <svg
      className="
        pointer-events-none
        absolute
        inset-0
        z-[75]

        h-full
        w-full

        overflow-visible
      "
      viewBox="0 0 420 540"
      preserveAspectRatio="none"
    >
      {children}
    </svg>
  );
}


function Branch({
  x,
  y,
  flip = false,
  horizontalFlip = false,
  color,
}: {
  x:
    number;

  y:
    number;

  flip?:
    boolean;

  horizontalFlip?:
    boolean;

  color:
    string;
}) {
  const xScale =
    horizontalFlip
      ? -1
      : 1;


  const yScale =
    flip
      ? -1
      : 1;


  return (
    <g
      transform={`
        translate(${x} ${y})
        scale(${xScale} ${yScale})
      `}
    >
      <path
        d="
          M0 0
          C25 14 42 36 52 66
          C60 91 73 107 99 122
        "
        fill="none"
        stroke={
          color
        }
        strokeWidth="7"
        strokeLinecap="round"
      />

      <path
        d="
          M29 27
          C18 13 11 8 3 7
        "
        fill="none"
        stroke={
          color
        }
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="
          M50 65
          C65 48 75 42 89 41
        "
        fill="none"
        stroke={
          color
        }
        strokeWidth="5"
        strokeLinecap="round"
      />

      <ellipse
        cx="10"
        cy="8"
        rx="10"
        ry="5"
        fill={
          color
        }
        transform="rotate(28 10 8)"
      />

      <ellipse
        cx="90"
        cy="41"
        rx="11"
        ry="5"
        fill={
          color
        }
        transform="rotate(-25 90 41)"
      />
    </g>
  );
}


function CharacterAnimationStyles() {
  return (
    <style>
      {`
        @keyframes sceneBlizzardFallNear {
          0% {
            transform: translate3d(-30px,-40px,0) rotate(0deg);
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          100% {
            transform: translate3d(120px,620px,0) rotate(720deg);
            opacity: .8;
          }
        }

        @keyframes sceneBlizzardFallMid {
          0% {
            transform: translate3d(-20px,-40px,0) rotate(0deg);
            opacity: 0;
          }

          12% {
            opacity: .9;
          }

          100% {
            transform: translate3d(90px,620px,0) rotate(540deg);
            opacity: .65;
          }
        }

        @keyframes sceneBlizzardFallFar {
          0% {
            transform: translate3d(-10px,-40px,0);
            opacity: 0;
          }

          15% {
            opacity: .65;
          }

          100% {
            transform: translate3d(60px,620px,0);
            opacity: .35;
          }
        }

        @keyframes sceneBlizzardGust {
          0%, 70%, 100% {
            transform: translateX(-30%);
            opacity: 0;
          }

          78% {
            opacity: .55;
          }

          92% {
            transform: translateX(30%);
            opacity: .22;
          }
        }

        @keyframes sceneSupercellRain {
          to {
            transform: translate3d(-110px,680px,0);
          }
        }

        @keyframes sceneSupercellFlash {
          0%, 68%, 100% {
            background-color: rgba(224,242,254,0);
          }

          72%, 77% {
            background-color: rgba(224,242,254,.45);
          }

          80% {
            background-color: rgba(224,242,254,.08);
          }

          84% {
            background-color: rgba(224,242,254,.28);
          }
        }

        @keyframes sceneBoltFlash {
          0%, 68%, 100% {
            opacity: 0;
          }

          72%, 77% {
            opacity: 1;
          }

          80% {
            opacity: .15;
          }

          84% {
            opacity: .85;
          }
        }

        @keyframes sceneMeteorStarTwinkle {
          0%, 100% {
            opacity: .2;
            transform: scale(.7);
          }

          50% {
            opacity: 1;
            transform: scale(1.4);
          }
        }

        @keyframes sceneMeteorSmall {
          0% {
            transform: translate3d(0,0,0) rotate(-32deg);
            opacity: 0;
          }

          8% {
            opacity: 1;
          }

          100% {
            transform: translate3d(680px,420px,0) rotate(-32deg);
            opacity: 0;
          }
        }

        @keyframes sceneMeteorLarge {
          0%, 72% {
            transform: translate3d(0,0,0) rotate(-32deg) scale(1.3);
            opacity: 0;
          }

          76% {
            opacity: 1;
          }

          100% {
            transform: translate3d(760px,470px,0) rotate(-32deg) scale(1.3);
            opacity: 0;
          }
        }

        @keyframes sceneDragonFlight {
          0% {
            transform: translateX(-20%) translateY(10px) scale(.88);
          }

          45% {
            transform: translateX(170%) translateY(-20px) scale(1.05);
          }

          100% {
            transform: translateX(320%) translateY(5px) scale(.9);
          }
        }

        @keyframes sceneDragonFire {
          0%, 45%, 100% {
            transform: translateX(-20%) scaleX(.2);
            opacity: 0;
          }

          52% {
            transform: translateX(95%) scaleX(1);
            opacity: .95;
          }

          62% {
            transform: translateX(165%) scaleX(.65);
            opacity: 0;
          }
        }

        @keyframes sceneAirshowJet {
          0% {
            transform: translateX(-20vw) translateY(0) rotate(8deg);
          }

          100% {
            transform: translateX(130vw) translateY(-70px) rotate(8deg);
          }
        }

        @keyframes sceneAirshowBreakaway {
          0% {
            transform: translateX(-20vw) translateY(0) rotate(8deg);
          }

          55% {
            transform: translateX(65vw) translateY(-35px) rotate(8deg);
          }

          70% {
            transform: translateX(80vw) translateY(-150px) rotate(-35deg);
          }

          100% {
            transform: translateX(130vw) translateY(-220px) rotate(-35deg);
          }
        }

        @keyframes sceneContrail {
          0% {
            transform: translateX(-30%);
            opacity: 0;
          }

          20% {
            opacity: .55;
          }

          100% {
            transform: translateX(250%);
            opacity: 0;
          }
        }

        @keyframes sceneOrbitalFighter {
          0% {
            transform: translateX(-20vw) rotate(10deg);
          }

          100% {
            transform: translateX(130vw) translateY(-120px) rotate(10deg);
          }
        }

        @keyframes sceneOrbitalLaser {
          0%, 100% {
            opacity: 0;
            transform: translateX(-30px);
          }

          35% {
            opacity: 1;
          }

          60% {
            opacity: 0;
            transform: translateX(110px);
          }
        }

        @keyframes sceneOrbitalExplosion {
          0%, 70%, 100% {
            transform: scale(.1);
            opacity: 0;
          }

          76% {
            transform: scale(1.4);
            opacity: 1;
          }

          88% {
            transform: scale(.7);
            opacity: .45;
          }
        }

        @keyframes sceneEclipseMoon {
          0%, 100% {
            transform: translateX(0);
          }

          50% {
            transform: translateX(135%);
          }
        }

        @keyframes sceneEclipseDim {
          0%, 18%, 82%, 100% {
            background-color: rgba(2,6,23,0);
          }

          45%, 55% {
            background-color: rgba(2,6,23,.62);
          }
        }

        @keyframes sceneEclipseStars {
          0%, 20%, 80%, 100% {
            opacity: 0;
          }

          45%, 55% {
            opacity: 1;
          }
        }

        @keyframes sceneTitanStep {
          0%, 100% {
            transform: translateX(-50%) translateY(8px);
          }

          50% {
            transform: translateX(-50%) translateY(-7px);
          }
        }

        @keyframes sceneTitanDust {
          0%, 100% {
            transform: scaleX(.9);
            opacity: .12;
          }

          50% {
            transform: scaleX(1.15);
            opacity: .35;
          }
        }

        @keyframes sceneTitanEye {
          0%, 100% {
            filter: brightness(.8);
          }

          50% {
            filter: brightness(1.6);
          }
        }

        @keyframes sceneRealityAurora {
          0%, 100% {
            transform: translateX(-8%) rotate(-8deg);
            opacity: .2;
          }

          50% {
            transform: translateX(8%) rotate(-2deg);
            opacity: .65;
          }
        }

        @keyframes sceneRealityRift {
          0%, 100% {
            transform: translateX(-50%) rotate(16deg) scale(.82);
            opacity: .25;
          }

          50% {
            transform: translateX(-50%) rotate(196deg) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes sceneRealityDebris {
          to {
            transform: translate(-50%,-50%) rotate(360deg) translateX(165px) rotate(-360deg);
          }
        }

        @keyframes sceneRealityComet {
          0% {
            transform: translateX(0) rotate(-28deg);
            opacity: 0;
          }

          12% {
            opacity: 1;
          }

          100% {
            transform: translateX(700px) translateY(330px) rotate(-28deg);
            opacity: 0;
          }
        }

        @keyframes sceneRealityLight {
          0%, 100% {
            opacity: .1;
          }

          50% {
            opacity: .7;
          }
        }

        .scene-blizzard-flake-near {
          animation: sceneBlizzardFallNear 3.6s linear infinite;
        }

        .scene-blizzard-flake-mid {
          animation: sceneBlizzardFallMid 5s linear infinite;
        }

        .scene-blizzard-flake-far {
          animation: sceneBlizzardFallFar 7.2s linear infinite;
        }

        .scene-blizzard-gust {
          animation: sceneBlizzardGust 8s ease-in-out infinite;
        }

        .scene-supercell-rain {
          animation: sceneSupercellRain 1.05s linear infinite;
        }

        .scene-supercell-flash {
          animation: sceneSupercellFlash 5.8s steps(1,end) infinite;
        }

        .scene-supercell-bolt-one,
        .scene-supercell-bolt-two {
          animation: sceneBoltFlash 5.8s steps(1,end) infinite;
        }

        .scene-supercell-bolt-two {
          animation-delay: .38s;
        }

        .scene-meteor-star {
          animation: sceneMeteorStarTwinkle 2.4s ease-in-out infinite;
        }

        .scene-meteor-small {
          animation: sceneMeteorSmall 5.4s linear infinite;
        }

        .scene-meteor-large {
          animation: sceneMeteorLarge 11s linear infinite;
        }

        .scene-dragon-flight {
          animation: sceneDragonFlight 10s linear infinite;
        }

        .scene-dragon-fire {
          animation: sceneDragonFire 10s ease-out infinite;
        }

        .scene-airshow-jet {
          animation: sceneAirshowJet 7s linear infinite;
        }

        .scene-airshow-breakaway {
          animation-name: sceneAirshowBreakaway;
        }

        .scene-airshow-contrail {
          animation: sceneContrail 7s linear infinite;
        }

        .scene-orbital-fighter {
          animation: sceneOrbitalFighter 5.5s linear infinite;
        }

        .scene-orbital-laser {
          animation: sceneOrbitalLaser 1.8s linear infinite;
        }

        .scene-orbital-explosion {
          animation: sceneOrbitalExplosion 3.4s ease-out infinite;
        }

        .scene-eclipse-moon {
          animation: sceneEclipseMoon 14s ease-in-out infinite;
        }

        .scene-eclipse-dim {
          animation: sceneEclipseDim 14s ease-in-out infinite;
        }

        .scene-eclipse-star {
          animation: sceneEclipseStars 14s ease-in-out infinite;
        }

        .scene-titan-body {
          animation: sceneTitanStep 6.4s ease-in-out infinite;
        }

        .scene-titan-dust {
          animation: sceneTitanDust 6.4s ease-in-out infinite;
        }

        .scene-titan-eye-left,
        .scene-titan-eye-right {
          animation: sceneTitanEye 2.8s ease-in-out infinite;
        }

        .scene-reality-aurora {
          animation: sceneRealityAurora 7s ease-in-out infinite;
        }

        .scene-reality-rift {
          animation: sceneRealityRift 9s ease-in-out infinite;
        }

        .scene-reality-debris {
          animation: sceneRealityDebris 7.5s linear infinite;
        }

        .scene-reality-comet {
          animation: sceneRealityComet 6.2s linear infinite;
        }

        .scene-reality-light {
          animation: sceneRealityLight 4.5s ease-in-out infinite;
        }

        @keyframes heldItemEndgamePulse {
          0%, 100% {
            opacity: .62;
            transform: scale(.94);
          }

          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes heldItemFlameBlade {
          0%, 100% {
            filter:
              drop-shadow(0 0 5px #fb923c)
              brightness(.95);
          }

          50% {
            filter:
              drop-shadow(0 0 15px #f97316)
              brightness(1.25);
          }
        }

        @keyframes heldItemRuneBook {
          0%, 100% {
            transform: rotate(-4deg) translateY(0);
            filter:
              drop-shadow(0 0 5px #c084fc);
          }

          50% {
            transform: rotate(4deg) translateY(-5px);
            filter:
              drop-shadow(0 0 14px #e879f9);
          }
        }

        @keyframes heldItemHammerFlash {
          0%, 68%, 100% {
            opacity: .12;
          }

          72%, 84% {
            opacity: 1;
          }
        }

        @keyframes heldItemCelestialLight {
          0% {
            stroke-dashoffset: 75;
            opacity: .1;
          }

          45% {
            opacity: 1;
          }

          100% {
            stroke-dashoffset: -75;
            opacity: .1;
          }
        }

        @keyframes heldItemStaffOrbit {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes heldItemCosmicOrbit {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes heldItemCosmicOrbitReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes heldItemFlameParticle {
          0% {
            transform: translateY(8px) scale(.7);
            opacity: 0;
          }

          35% {
            opacity: 1;
          }

          100% {
            transform: translateY(-38px) scale(1.15);
            opacity: 0;
          }
        }

        .held-item-endgame-ring {
          transform-origin: center;
          animation:
            heldItemEndgamePulse
            2.2s
            ease-in-out
            infinite;
        }

        .held-item-flame-blade {
          animation:
            heldItemFlameBlade
            1.25s
            ease-in-out
            infinite;
        }

        .held-item-rune-book {
          transform-origin: center;
          animation:
            heldItemRuneBook
            2.1s
            ease-in-out
            infinite;
        }

        .held-item-lightning-hammer {
          animation:
            heldItemFlameBlade
            1.55s
            ease-in-out
            infinite;
        }

        .held-item-celestial-sword {
          animation:
            heldItemFlameBlade
            2.2s
            ease-in-out
            infinite;
        }

        .held-item-crown-staff {
          animation:
            heldItemRuneBook
            2.8s
            ease-in-out
            infinite;
        }

        .held-item-cosmic-orb {
          animation:
            heldItemEndgamePulse
            2.8s
            ease-in-out
            infinite;
        }

        .held-item-flame-particle {
          animation:
            heldItemFlameParticle
            1.2s
            ease-out
            infinite;
        }

        .held-item-rune-orbit,
        .held-item-staff-gems {
          transform-origin:
            0px
            0px;

          animation:
            heldItemStaffOrbit
            4.5s
            linear
            infinite;
        }

        .held-item-hammer-arc {
          animation:
            heldItemHammerFlash
            1.35s
            steps(1,end)
            infinite;
        }

        .held-item-sword-light {
          stroke-dasharray:
            18
            12;

          animation:
            heldItemCelestialLight
            1.55s
            linear
            infinite;
        }

        .held-item-cosmic-ring-one {
          transform-origin:
            0px
            0px;

          animation:
            heldItemCosmicOrbit
            4s
            linear
            infinite;
        }

        .held-item-cosmic-ring-two {
          transform-origin:
            0px
            0px;

          animation:
            heldItemCosmicOrbitReverse
            3.1s
            linear
            infinite;
        }

        @keyframes auraSoftHaloPulse {
          0%, 100% {
            opacity: .72;
            transform: translateX(-50%) scale(.98);
          }

          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.025);
          }
        }

        @keyframes auraGroundRingPulse {
          0%, 100% {
            transform: translateX(-50%) scale(.94);
            opacity: .68;
          }

          50% {
            transform: translateX(-50%) scale(1.05);
            opacity: 1;
          }
        }

        @keyframes auraSpeckRise {
          0% {
            transform: translateY(16px);
            opacity: 0;
          }

          35% {
            opacity: 1;
          }

          100% {
            transform: translateY(-70px);
            opacity: 0;
          }
        }

        @keyframes auraMistDriftOne {
          0%, 100% {
            transform: translateX(-4%);
          }

          50% {
            transform: translateX(12%);
          }
        }

        @keyframes auraMistDriftTwo {
          0%, 100% {
            transform: translateX(10%);
          }

          50% {
            transform: translateX(-8%);
          }
        }

        @keyframes auraWindSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes auraLunarPulse {
          0%, 100% {
            opacity: .72;
            transform: translateX(-50%) scale(.98);
          }

          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.03);
          }
        }

        @keyframes auraSolarRotate {
          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        @keyframes auraOrbitOne {
          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        @keyframes auraOrbitTwo {
          to {
            transform: translateX(-50%) rotate(-360deg);
          }
        }

        @keyframes auraFlameRise {
          0%, 100% {
            transform: translateY(8px) scaleY(.82);
            opacity: .72;
          }

          50% {
            transform: translateY(-12px) scaleY(1.12);
            opacity: 1;
          }
        }

        @keyframes auraScanMove {
          0% {
            transform: translate(-50%, 0);
            opacity: 0;
          }

          15%, 85% {
            opacity: 1;
          }

          100% {
            transform: translate(-50%, -290px);
            opacity: 0;
          }
        }

        @keyframes auraArcFlash {
          0%, 72%, 100% {
            opacity: .12;
          }

          76%, 84% {
            opacity: 1;
          }
        }

        @keyframes auraHoloLeft {
          0%, 100% {
            transform: translateX(-8px);
            opacity: .38;
          }

          50% {
            transform: translateX(-20px);
            opacity: .62;
          }
        }

        @keyframes auraHoloRight {
          0%, 100% {
            transform: translateX(8px);
            opacity: .35;
          }

          50% {
            transform: translateX(20px);
            opacity: .58;
          }
        }

        @keyframes auraCrystalShimmer {
          0%, 100% {
            filter: brightness(.85);
            transform: rotate(45deg) translateY(0);
          }

          50% {
            filter: brightness(1.4);
            transform: rotate(45deg) translateY(-7px);
          }
        }

        @keyframes auraBoltFlash {
          0%, 68%, 100% {
            opacity: .08;
          }

          72%, 81% {
            opacity: 1;
          }
        }

        @keyframes auraIceRise {
          0%, 100% {
            transform: translateY(10px) scaleY(.86);
            opacity: .68;
          }

          50% {
            transform: translateY(0) scaleY(1);
            opacity: 1;
          }
        }

        @keyframes auraColdVaporDrift {
          0%, 100% {
            transform: translateX(-5%);
          }

          50% {
            transform: translateX(9%);
          }
        }

        @keyframes auraRuneSpinOuter {
          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        @keyframes auraRuneSpinInner {
          to {
            transform: translateX(-50%) rotate(-360deg);
          }
        }

        @keyframes auraRuneSymbolsPulse {
          0%, 100% {
            opacity: .45;
            filter: brightness(.8);
          }

          50% {
            opacity: 1;
            filter: brightness(1.45);
          }
        }

        @keyframes auraInfernoOrbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(105px) scale(.75);
            opacity: .55;
          }

          50% {
            opacity: 1;
          }

          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(105px) scale(1.15);
            opacity: .55;
          }
        }

        @keyframes auraAstralRotate {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes auraSingularityPulse {
          0%, 100% {
            transform: translateX(-50%) scale(.96);
            filter: brightness(.8);
          }

          50% {
            transform: translateX(-50%) scale(1.04);
            filter: brightness(1.3);
          }
        }

        @keyframes auraDebrisOrbit {
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(142px) rotate(-360deg);
          }
        }

        @keyframes auraSolarDeitySpin {
          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        @keyframes auraPlasmaArc {
          0%, 100% {
            transform: translateX(-50%) rotate(0deg) scale(.96);
            opacity: .55;
          }

          50% {
            transform: translateX(-50%) rotate(180deg) scale(1.04);
            opacity: 1;
          }
        }

        @keyframes auraTempestPulse {
          0%, 100% {
            filter: brightness(.85);
            transform: translateX(-50%) scale(.98);
          }

          50% {
            filter: brightness(1.35);
            transform: translateX(-50%) scale(1.025);
          }
        }

        @keyframes auraCloudDriftOne {
          0%, 100% {
            transform: translateX(-10px);
          }

          50% {
            transform: translateX(18px);
          }
        }

        @keyframes auraCloudDriftTwo {
          0%, 100% {
            transform: translateX(14px);
          }

          50% {
            transform: translateX(-16px);
          }
        }

        @keyframes auraTempestRingSpin {
          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        .aura-soft-halo {
          animation: auraSoftHaloPulse 2.8s ease-in-out infinite;
        }

        .aura-ground-ring {
          animation: auraGroundRingPulse 2.15s ease-in-out infinite;
        }

        .aura-warm-speck {
          animation: auraSpeckRise 2.4s ease-in infinite;
        }

        .aura-moon-mist-one {
          animation: auraMistDriftOne 5.6s ease-in-out infinite;
        }

        .aura-moon-mist-two {
          animation: auraMistDriftTwo 6.4s ease-in-out infinite;
        }

        .aura-wind-ribbon-one {
          transform-origin: 210px 325px;
          animation: auraWindSpin 5.5s linear infinite;
        }

        .aura-wind-ribbon-two {
          transform-origin: 210px 258px;
          animation: auraWindSpin 4.2s linear infinite reverse;
        }

        .aura-lunar-disc {
          animation: auraLunarPulse 3.2s ease-in-out infinite;
        }

        .aura-lunar-crescent {
          animation: auraRuneSymbolsPulse 2.6s ease-in-out infinite;
        }

        .aura-solar-rays {
          animation: auraSolarRotate 13s linear infinite;
        }

        .aura-gold-orbit-one {
          animation: auraOrbitOne 6.5s linear infinite;
        }

        .aura-gold-orbit-two {
          animation: auraOrbitTwo 5.1s linear infinite;
        }

        .aura-back-flame {
          animation: auraFlameRise 1.45s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .aura-neon-scan {
          animation: auraScanMove 2.4s linear infinite;
        }

        .aura-cage-arc {
          animation: auraArcFlash 1.7s steps(1,end) infinite;
        }

        .aura-holo-echo-left {
          animation: auraHoloLeft 1.8s ease-in-out infinite;
        }

        .aura-holo-echo-right {
          animation: auraHoloRight 1.8s ease-in-out infinite;
        }

        .aura-crystal-segment {
          animation: auraCrystalShimmer 2.6s ease-in-out infinite;
        }

        .aura-diamond-bolt {
          animation: auraBoltFlash 1.9s steps(1,end) infinite;
        }

        .aura-ice-pillar {
          animation: auraIceRise 2.7s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .aura-cold-vapor {
          animation: auraColdVaporDrift 6s ease-in-out infinite;
        }

        .aura-master-rune-outer {
          animation: auraRuneSpinOuter 12s linear infinite;
        }

        .aura-master-rune-inner {
          animation: auraRuneSpinInner 8s linear infinite;
        }

        .aura-master-rune-symbols {
          animation: auraRuneSymbolsPulse 2.1s ease-in-out infinite;
        }

        .aura-inferno-vortex {
          animation: auraInfernoOrbit 3.2s linear infinite;
        }

        .aura-constellation {
          transform-origin: 210px 270px;
          animation: auraAstralRotate 18s linear infinite;
        }

        .aura-singularity {
          animation: auraSingularityPulse 3.1s ease-in-out infinite;
        }

        .aura-singularity-debris {
          animation: auraDebrisOrbit 5.8s linear infinite;
        }

        .aura-solar-deity-rays {
          animation: auraSolarDeitySpin 12s linear infinite;
        }

        .aura-plasma-arc {
          animation: auraPlasmaArc 4.2s linear infinite;
        }

        .aura-tempest-shell {
          animation: auraTempestPulse 2.8s ease-in-out infinite;
        }

        .aura-tempest-cloud-one {
          animation: auraCloudDriftOne 5s ease-in-out infinite;
        }

        .aura-tempest-cloud-two {
          animation: auraCloudDriftTwo 5.8s ease-in-out infinite;
        }

        .aura-tempest-ring {
          animation: auraTempestRingSpin 8s linear infinite;
        }

        @keyframes posePushupLoop {
          0%, 100% {
            transform: translate(4px, 112px) rotate(90deg) translateY(0);
          }

          50% {
            transform: translate(4px, 126px) rotate(90deg) translateY(9px);
          }
        }

        @keyframes posePullupLoop {
          0%, 100% {
            transform: translateY(8px);
          }

          50% {
            transform: translateY(-38px);
          }
        }

        @keyframes poseJumpingJackLoop {
          0%, 100% {
            transform: translateY(7px) scaleX(.88);
          }

          50% {
            transform: translateY(-6px) scaleX(1.08);
          }
        }

        @keyframes poseCombatCombo {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }

          22% {
            transform: translate(15px, -2px) rotate(7deg);
          }

          48% {
            transform: translate(-12px, 3px) rotate(-8deg);
          }

          72% {
            transform: translate(10px, -5px) rotate(5deg);
          }
        }

        @keyframes posePowerLeap {
          0%, 100% {
            transform: translateY(22px) scaleY(.94);
          }

          18% {
            transform: translateY(30px) scaleY(.9);
          }

          50% {
            transform: translateY(-72px) scaleY(1.04);
          }

          72% {
            transform: translateY(-20px) scaleY(1);
          }
        }

        @keyframes poseChampionAscension {
          0%, 100% {
            transform: translateY(14px) rotate(-2deg);
            filter: drop-shadow(0 0 4px rgba(250,204,21,.25));
          }

          50% {
            transform: translateY(-36px) rotate(2deg);
            filter: drop-shadow(0 0 18px rgba(250,204,21,.85));
          }
        }

        .pose-pushup-loop {
          animation: posePushupLoop 1.45s ease-in-out infinite;
          transform-origin: 135px 230px;
        }

        .pose-pullup-loop {
          animation: posePullupLoop 1.65s ease-in-out infinite;
          transform-origin: 135px 50px;
        }

        .pose-jumping-jack-loop {
          animation: poseJumpingJackLoop 1.15s ease-in-out infinite;
          transform-origin: 135px 250px;
        }

        .pose-combat-combo {
          animation: poseCombatCombo 2.15s cubic-bezier(.45,0,.2,1) infinite;
          transform-origin: 135px 220px;
        }

        .pose-power-leap {
          animation: posePowerLeap 2.25s cubic-bezier(.4,0,.2,1) infinite;
          transform-origin: 135px 320px;
        }

        .pose-champion-ascension {
          animation: poseChampionAscension 3.4s ease-in-out infinite;
          transform-origin: 135px 190px;
        }

        @keyframes frameLeafDrift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: .85; }
          50% { transform: translate(12px, 8px) rotate(28deg); opacity: .55; }
        }

        @keyframes frameNeonPulse {
          0%, 100% { filter: drop-shadow(0 0 5px currentColor); opacity: .72; }
          50% { filter: drop-shadow(0 0 16px currentColor); opacity: 1; }
        }

        @keyframes frameCrystalGlint {
          0%, 70%, 100% { opacity: .15; transform: scale(.65); }
          78% { opacity: 1; transform: scale(1.65); }
        }

        @keyframes framePrismShift {
          0%, 100% { opacity: .25; stroke-dashoffset: 0; }
          50% { opacity: 1; stroke-dashoffset: -45; }
        }

        @keyframes frameRuneGlow {
          0%, 100% { opacity: .25; filter: drop-shadow(0 0 0 transparent); }
          45%, 60% { opacity: 1; filter: drop-shadow(0 0 8px #d8b4fe); }
        }

        @keyframes frameRuneOrbit {
          from { transform: rotate(0deg); transform-origin: 210px 270px; }
          to { transform: rotate(360deg); transform-origin: 210px 270px; }
        }

        @keyframes frameChannelFire {
          0%, 100% { opacity: .35; stroke-width: 6px; }
          50% { opacity: 1; stroke-width: 11px; }
        }

        @keyframes frameOrbitSpin {
          from { transform: rotate(0deg); transform-origin: 210px 270px; }
          to { transform: rotate(360deg); transform-origin: 210px 270px; }
        }

        @keyframes frameCelestialFlow {
          0% { stroke-dasharray: 20 34; stroke-dashoffset: 0; opacity: .45; }
          50% { opacity: 1; }
          100% { stroke-dasharray: 20 34; stroke-dashoffset: -108; opacity: .45; }
        }

        @keyframes frameStarTravel {
          0%, 100% { opacity: .12; transform: translateY(18px) scale(.6); }
          50% { opacity: 1; transform: translateY(-18px) scale(1.35); }
        }

        @keyframes frameDragonEye {
          0%, 100% { opacity: .55; filter: drop-shadow(0 0 3px #facc15); }
          50% { opacity: 1; filter: drop-shadow(0 0 13px #fef08a); }
        }

        @keyframes frameDragonSmoke {
          0% { opacity: 0; transform: translateY(4px) scale(.8); }
          45% { opacity: .65; }
          100% { opacity: 0; transform: translateY(-25px) scale(1.25); }
        }

        @keyframes frameCrownEnergy {
          0% { stroke-dasharray: 16 28; stroke-dashoffset: 0; opacity: .35; }
          50% { opacity: 1; }
          100% { stroke-dasharray: 16 28; stroke-dashoffset: -88; opacity: .35; }
        }

        @keyframes frameFloatingJewel {
          0%, 100% { opacity: .55; transform: translateY(0) rotate(0deg); }
          50% { opacity: 1; transform: translateY(-8px) rotate(180deg); }
        }

        .frame-leaf-drift { animation: frameLeafDrift 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .frame-neon-pulse { animation: frameNeonPulse 2.2s ease-in-out infinite; color: #22d3ee; }
        .frame-neon-pulse-two { animation: frameNeonPulse 2.2s ease-in-out infinite .8s; color: #f472b6; }
        .frame-crystal-glint { animation: frameCrystalGlint 3.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .frame-prism-shift { animation: framePrismShift 3s linear infinite; stroke-dasharray: 24 18; }
        .frame-rune-glow { animation: frameRuneGlow 2.8s ease-in-out infinite; }
        .frame-rune-orbit { animation: frameRuneOrbit 8s linear infinite; transform-origin: 210px 270px; }
        .frame-rune-orbit-two { animation: frameRuneOrbit 11s linear infinite reverse; transform-origin: 210px 270px; }
        .frame-channel-fire { animation: frameChannelFire 1.45s ease-in-out infinite; }
        .frame-orbit-ring { animation: frameOrbitSpin 15s linear infinite; transform-origin: 210px 270px; }
        .frame-orbit-ring-reverse { animation: frameOrbitSpin 20s linear infinite reverse; transform-origin: 210px 270px; }
        .frame-orbit-object { animation: frameOrbitSpin 8s linear infinite; transform-origin: 210px 270px; }
        .frame-orbit-object-two { animation: frameOrbitSpin 12s linear infinite reverse; transform-origin: 210px 270px; }
        .frame-celestial-flow { animation: frameCelestialFlow 4s linear infinite; }
        .frame-star-travel { animation: frameStarTravel 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .frame-dragon-eye { animation: frameDragonEye 2.4s ease-in-out infinite; }
        .frame-dragon-smoke { animation: frameDragonSmoke 4.2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        .frame-dragon-smoke-two { animation: frameDragonSmoke 4.2s ease-out infinite 1.2s; transform-box: fill-box; transform-origin: center; }
        .frame-crown-energy { animation: frameCrownEnergy 4.5s linear infinite; }
        .frame-floating-jewel { animation: frameFloatingJewel 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

        @keyframes rainFall {
          0% {
            transform: translate3d(0, -100px, 0) rotate(12deg);
            opacity: 0;
          }

          10% {
            opacity: .95;
          }

          100% {
            transform: translate3d(-55px, 720px, 0) rotate(12deg);
            opacity: 0;
          }
        }

        .rain-drop {
          animation-name: rainFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }


        @keyframes snowFall {
          0% {
            transform: translate3d(0, -70px, 0);
            opacity: 0;
          }

          10% {
            opacity: 1;
          }

          50% {
            transform: translate3d(30px, 300px, 0);
          }

          100% {
            transform: translate3d(-24px, 670px, 0);
            opacity: 0;
          }
        }

        .snow-flake {
          animation-name: snowFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }


        @keyframes petalFall {
          0% {
            transform: translate3d(0, -55px, 0) rotate(0deg);
            opacity: 0;
          }

          12% {
            opacity: .95;
          }

          50% {
            transform: translate3d(48px, 300px, 0) rotate(180deg);
          }

          100% {
            transform: translate3d(-30px, 675px, 0) rotate(390deg);
            opacity: 0;
          }
        }

        .petal {
          animation: petalFall 5.3s linear infinite;
        }


        @keyframes sceneRise {
          0% {
            transform: translateY(110px) scale(.5);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          100% {
            transform: translateY(-560px) scale(1.25);
            opacity: 0;
          }
        }

        .scene-ember,
        .background-ember {
          animation: sceneRise 4s ease-out infinite;
        }


        @keyframes sceneSpark {
          0%, 100% {
            transform: scale(.25) rotate(0deg);
            opacity: 0;
          }

          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
        }

        .scene-spark,
        .background-spark,
        .character-star {
          animation: sceneSpark 2.2s ease-in-out infinite;
        }


        @keyframes lightningStrike {
          0%, 88%, 100% {
            opacity: 0;
          }

          89% {
            opacity: 1;
          }

          91% {
            opacity: .15;
          }

          93% {
            opacity: 1;
          }

          96% {
            opacity: 0;
          }
        }

        .background-lightning,
        .scene-lightning {
          animation: lightningStrike 4.2s linear infinite;
          filter: drop-shadow(0 0 12px rgba(224,242,254,1));
        }

        .lightning-flash {
          animation: lightningStrike 4.2s linear infinite;
          opacity: 0;
        }


        @keyframes mistMove {
          0%, 100% {
            transform: translateX(-8%);
            opacity: .35;
          }

          50% {
            transform: translateX(8%);
            opacity: .65;
          }
        }

        .mist-one {
          animation: mistMove 7s ease-in-out infinite;
        }

        .mist-two {
          animation: mistMove 9s ease-in-out infinite reverse;
        }


        @keyframes auroraMove {
          0%, 100% {
            transform: translateX(-7%) rotate(-8deg) scaleY(.82);
            opacity: .45;
          }

          50% {
            transform: translateX(9%) rotate(-3deg) scaleY(1.26);
            opacity: .95;
          }
        }

        .aurora-one {
          animation: auroraMove 5s ease-in-out infinite;
        }

        .aurora-two {
          animation: auroraMove 6.5s ease-in-out infinite reverse;
        }


        @keyframes auraGlow {
          0%, 100% {
            transform: translateX(-50%) scale(.92);
            opacity: .48;
          }

          50% {
            transform: translateX(-50%) scale(1.08);
            opacity: .92;
          }
        }

        .aura-background-glow {
          animation: auraGlow 2.8s ease-in-out infinite;
        }


        @keyframes auraRingPulse {
          0%, 100% {
            transform: translateX(-50%) scale(.96);
            opacity: .35;
          }

          50% {
            transform: translateX(-50%) scale(1.05);
            opacity: .92;
          }
        }

        .aura-ring {
          animation: auraRingPulse 2.3s ease-in-out infinite;
        }

        .aura-ring-two {
          animation: auraRingPulse 2.3s ease-in-out infinite reverse;
        }


        @keyframes runeSpin {
          from {
            transform: translateX(-50%) rotate(0deg);
          }

          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        .aura-runes {
          animation: runeSpin 8s linear infinite;
        }


        @keyframes orbitParticle {
          0% {
            transform: rotate(0deg) translateX(128px) rotate(0deg);
          }

          100% {
            transform: rotate(360deg) translateX(128px) rotate(-360deg);
          }
        }

        .aura-orbit-particle {
          transform-origin: 0 0;
          animation: orbitParticle 4.4s linear infinite;
        }


        @keyframes auraLightning {
          0%, 80%, 100% {
            opacity: .18;
          }

          84% {
            opacity: 1;
          }

          87% {
            opacity: .35;
          }

          90% {
            opacity: 1;
          }
        }

        .aura-lightning {
          animation: auraLightning 2.7s linear infinite;
          filter: drop-shadow(0 0 9px currentColor);
        }


        @keyframes auraCrystal {
          0%, 100% {
            transform: rotate(45deg) translateY(0) scale(.75);
            opacity: .4;
          }

          50% {
            transform: rotate(70deg) translateY(-18px) scale(1.2);
            opacity: 1;
          }
        }

        .aura-crystal {
          animation: auraCrystal 2.2s ease-in-out infinite;
        }


        @keyframes auraMist {
          0%, 100% {
            transform: translateX(-50%) scale(.92);
            opacity: .35;
          }

          50% {
            transform: translateX(-50%) scale(1.08);
            opacity: .75;
          }
        }

        .aura-mist {
          animation: auraMist 3.4s ease-in-out infinite;
        }


        @keyframes auraFlameShell {
          0%, 100% {
            transform: translateX(-50%) scaleX(.96) scaleY(1);
            opacity: .5;
          }

          50% {
            transform: translateX(-50%) scaleX(1.06) scaleY(1.04);
            opacity: .92;
          }
        }

        .aura-flame-shell {
          animation: auraFlameShell 1.35s ease-in-out infinite;
        }


        @keyframes auraSparkRise {
          0% {
            transform: translate3d(0, 35px, 0) scale(.5);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          100% {
            transform: translate3d(15px, -315px, 0) scale(1.25);
            opacity: 0;
          }
        }

        .aura-spark-rise {
          animation: auraSparkRise 2.6s ease-out infinite;
        }


        @keyframes outfitSparkle {
          0%, 100% {
            transform: scale(.2) rotate(0deg);
            opacity: 0;
          }

          45% {
            transform: scale(1.35) rotate(90deg);
            opacity: 1;
          }

          70% {
            transform: scale(.65) rotate(180deg);
            opacity: .35;
          }
        }

        .outfit-sparkle {
          animation: outfitSparkle 2.1s ease-in-out infinite;
        }


        @keyframes outfitFlame {
          0%, 100% {
            transform: scaleX(.82) scaleY(.92) skewX(-4deg);
            opacity: .72;
          }

          50% {
            transform: scaleX(1.14) scaleY(1.2) skewX(7deg);
            opacity: 1;
          }
        }

        .outfit-flame,
        .frame-flame {
          animation: outfitFlame .72s ease-in-out infinite;
        }


        @keyframes energyLine {
          0% {
            stroke-dashoffset: 0;
            opacity: .4;
          }

          50% {
            opacity: 1;
          }

          100% {
            stroke-dashoffset: -80;
            opacity: .4;
          }
        }

        .outfit-energy-line,
        .outfit-energy-line-two {
          stroke-dasharray: 10 8;
          animation: energyLine 2s linear infinite;
        }

        .outfit-energy-line-two {
          animation-direction: reverse;
        }


        @keyframes frameFlow {
          0% {
            stroke-dashoffset: 0;
            filter: drop-shadow(0 0 4px rgba(251,191,36,.5));
          }

          50% {
            filter: drop-shadow(0 0 15px rgba(251,191,36,1));
          }

          100% {
            stroke-dashoffset: -110;
            filter: drop-shadow(0 0 4px rgba(251,191,36,.5));
          }
        }

        .legendary-frame-flow {
          stroke-dasharray: 22 12;
          animation: frameFlow 2.6s linear infinite;
        }



        @keyframes stormCloudDriftOne {
          0%, 100% {
            transform: translateX(-4%);
          }

          50% {
            transform: translateX(12%);
          }
        }

        .storm-cloud-bank-one {
          animation: stormCloudDriftOne 8s ease-in-out infinite;
        }

        @keyframes stormCloudDriftTwo {
          0%, 100% {
            transform: translateX(10%);
          }

          50% {
            transform: translateX(-7%);
          }
        }

        .storm-cloud-bank-two {
          animation: stormCloudDriftTwo 10s ease-in-out infinite;
        }


        @keyframes cloudLightningGlowOne {
          0%, 70%, 100% { opacity: 0; transform: scale(.82); }
          72% { opacity: .18; transform: scale(.9); }
          74% { opacity: .95; transform: scale(1.08); }
          76% { opacity: .22; transform: scale(.96); }
          78% { opacity: .76; transform: scale(1.04); }
          82% { opacity: 0; transform: scale(.9); }
        }

        @keyframes cloudLightningGlowTwo {
          0%, 42%, 100% { opacity: 0; transform: scale(.84); }
          44% { opacity: .65; transform: scale(1.04); }
          47% { opacity: .15; transform: scale(.94); }
          49% { opacity: .88; transform: scale(1.1); }
          53% { opacity: 0; transform: scale(.88); }
        }

        @keyframes cloudLightningGlowThree {
          0%, 86%, 100% { opacity: 0; transform: scale(.86); }
          88% { opacity: .55; transform: scale(1.02); }
          90% { opacity: .1; transform: scale(.95); }
          92% { opacity: .72; transform: scale(1.06); }
          95% { opacity: 0; transform: scale(.9); }
        }

        .cloud-lightning-glow-one {
          opacity: 0;
          animation: cloudLightningGlowOne 5.8s linear infinite;
          mix-blend-mode: screen;
        }

        .cloud-lightning-glow-two {
          opacity: 0;
          animation: cloudLightningGlowTwo 7.1s linear infinite;
          mix-blend-mode: screen;
        }

        .cloud-lightning-glow-three {
          opacity: 0;
          animation: cloudLightningGlowThree 4.9s linear infinite;
          mix-blend-mode: screen;
        }

        @keyframes citadelLightningOne {
          0%, 83%, 100% {
            opacity: 0;
          }

          84%, 87% {
            opacity: 1;
          }

          85%, 88% {
            opacity: .15;
          }
        }

        .citadel-lightning-one {
          animation: citadelLightningOne 4.4s linear infinite;
          filter: drop-shadow(0 0 14px rgba(224,242,254,1));
        }

        @keyframes citadelLightningTwo {
          0%, 69%, 100% {
            opacity: 0;
          }

          70%, 73% {
            opacity: 1;
          }

          71%, 74% {
            opacity: .12;
          }
        }

        .citadel-lightning-two {
          animation: citadelLightningTwo 6.1s linear infinite;
          filter: drop-shadow(0 0 14px rgba(196,181,253,1));
        }

        @keyframes lavaFlowOne {
          0%, 100% {
            transform: translateX(-12px) scaleY(.96);
          }

          50% {
            transform: translateX(18px) scaleY(1.06);
          }
        }

        .lava-flow-one {
          animation: lavaFlowOne 3.4s ease-in-out infinite;
        }

        @keyframes lavaFlowTwo {
          0%, 100% {
            transform: translateX(15px) scaleY(1.04);
          }

          50% {
            transform: translateX(-17px) scaleY(.95);
          }
        }

        .lava-flow-two {
          animation: lavaFlowTwo 4.1s ease-in-out infinite;
        }

        @keyframes palaceEmberRise {
          0% {
            transform: translate3d(0, 50px, 0) scale(.4);
            opacity: 0;
          }

          18% {
            opacity: 1;
          }

          100% {
            transform: translate3d(24px, -430px, 0) scale(1.25);
            opacity: 0;
          }
        }

        .palace-ember {
          animation: palaceEmberRise 4.3s ease-out infinite;
        }

        @keyframes floatingBook {
          0%, 100% {
            transform: translateY(0) rotate(-8deg);
          }

          50% {
            transform: translateY(-24px) rotate(9deg);
          }
        }

        .floating-book {
          animation: floatingBook 3.2s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(196,181,253,.85));
        }

        @keyframes flyingPageOne {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(12deg);
          }

          50% {
            transform: translate3d(130px, -75px, 0) rotate(240deg);
          }
        }

        .library-page-one {
          animation: flyingPageOne 5.2s ease-in-out infinite;
        }

        @keyframes flyingPageTwo {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-12deg);
          }

          50% {
            transform: translate3d(-150px, 70px, 0) rotate(-250deg);
          }
        }

        .library-page-two {
          animation: flyingPageTwo 6.1s ease-in-out infinite;
        }

        @keyframes libraryRunePulse {
          0%, 100% {
            transform: translateX(-50%) scale(.85);
            opacity: .28;
          }

          50% {
            transform: translateX(-50%) scale(1.08);
            opacity: .95;
          }
        }

        .library-rune-pulse {
          animation: libraryRunePulse 2.4s ease-in-out infinite;
          box-shadow: 0 0 28px rgba(196,181,253,.8);
        }

        @keyframes cosmicCometFly {
          0% {
            transform: translate3d(-140px, -80px, 0) rotate(-28deg);
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          100% {
            transform: translate3d(610px, 310px, 0) rotate(-28deg);
            opacity: 0;
          }
        }

        .cosmic-comet {
          left: -25%;
          animation: cosmicCometFly 6.8s linear infinite;
        }

        .cosmic-comet::after {
          content: "";
          position: absolute;
          right: 4px;
          top: 4px;
          width: 110px;
          height: 3px;
          transform: translateX(-100%);
          background: linear-gradient(to left, rgba(255,255,255,.95), transparent);
          filter: blur(1px);
        }

        @keyframes cosmicShipOne {
          0% {
            transform: translateX(0) translateY(0) rotate(10deg);
          }

          100% {
            transform: translateX(620px) translateY(95px) rotate(10deg);
          }
        }

        .cosmic-ship-one {
          animation: cosmicShipOne 11s linear infinite;
        }

        @keyframes cosmicShipTwo {
          0% {
            transform: translateX(0) translateY(0) rotate(-13deg);
          }

          100% {
            transform: translateX(-610px) translateY(-125px) rotate(-13deg);
          }
        }

        .cosmic-ship-two {
          animation: cosmicShipTwo 13s linear infinite;
        }

        @keyframes cosmicOrbitLine {
          from {
            transform: translateX(-50%) rotate(0deg);
          }

          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        .cosmic-orbit-line {
          animation: cosmicOrbitLine 12s linear infinite;
        }

        @keyframes realmAuroraOne {
          0%, 100% {
            transform: translateX(-8%) rotate(-6deg) scaleY(.86);
            opacity: .45;
          }

          50% {
            transform: translateX(9%) rotate(-2deg) scaleY(1.22);
            opacity: .92;
          }
        }

        .realm-aurora-one {
          animation: realmAuroraOne 6.2s ease-in-out infinite;
        }

        @keyframes realmAuroraTwo {
          0%, 100% {
            transform: translateX(7%) rotate(6deg) scaleY(1.12);
            opacity: .38;
          }

          50% {
            transform: translateX(-9%) rotate(2deg) scaleY(.82);
            opacity: .9;
          }
        }

        .realm-aurora-two {
          animation: realmAuroraTwo 7.4s ease-in-out infinite;
        }

        @keyframes skyTrainTravel {
          0% {
            transform: translateX(0) translateY(18px) rotate(-5deg);
          }

          100% {
            transform: translateX(730px) translateY(-75px) rotate(-5deg);
          }
        }

        .sky-train {
          animation: skyTrainTravel 9s linear infinite;
        }

        @keyframes solarRayWheel {
          from {
            transform: translateX(-50%) rotate(0deg);
          }

          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        .solar-ray-wheel {
          animation: solarRayWheel 18s linear infinite;
        }

        @keyframes planeLaunchOne {
          0% {
            transform: translate3d(0, 60px, 0) rotate(-8deg) scale(.65);
            opacity: 0;
          }

          14% {
            opacity: 1;
          }

          100% {
            transform: translate3d(-250px, -460px, 0) rotate(-23deg) scale(1.15);
            opacity: 0;
          }
        }

        .launch-plane-one {
          animation: planeLaunchOne 7s ease-in infinite;
        }

        @keyframes planeLaunchTwo {
          0% {
            transform: translate3d(0, 45px, 0) rotate(7deg) scale(.55);
            opacity: 0;
          }

          18% {
            opacity: 1;
          }

          100% {
            transform: translate3d(245px, -420px, 0) rotate(24deg) scale(1.05);
            opacity: 0;
          }
        }

        .launch-plane-two {
          animation: planeLaunchTwo 8.5s ease-in infinite 1.5s;
        }

        @keyframes solarAirshipCross {
          0% {
            transform: translateX(0) translateY(0);
          }

          100% {
            transform: translateX(-650px) translateY(-70px);
          }
        }

        .solar-airship {
          animation: solarAirshipCross 14s linear infinite;
        }

        @keyframes runwayGlow {
          0%, 100% {
            opacity: .25;
            transform: translateX(-50%) scaleY(.8);
          }

          50% {
            opacity: .8;
            transform: translateX(-50%) scaleY(1.15);
          }
        }

        .runway-glow {
          animation: runwayGlow 2s ease-in-out infinite;
        }

        @keyframes neonPulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(34,211,238,.7));
          }

          50% {
            filter: drop-shadow(0 0 17px rgba(34,211,238,1));
          }
        }

        .neon-frame {
          animation: neonPulse 2.4s ease-in-out infinite;
        }

        .neon-frame-two {
          animation: neonPulse 2.4s ease-in-out infinite reverse;
        }


        @keyframes accessoryClothFlow {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(4deg) translateY(-3px); }
        }

        .accessory-bandana-tail,
        .accessory-scarf-flow,
        .accessory-mantle-flow,
        .accessory-commander-cape {
          transform-origin: 145px 126px;
          animation: accessoryClothFlow 2.8s ease-in-out infinite;
        }

        @keyframes accessoryJetPulse {
          0%, 100% { transform: scaleY(.7); opacity: .55; }
          50% { transform: scaleY(1.25); opacity: 1; }
        }

        .accessory-jet-pulse {
          transform-origin: center top;
          animation: accessoryJetPulse .8s ease-in-out infinite;
        }

        .accessory-delay { animation-delay: -.38s !important; }

        @keyframes accessoryDroneHover {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-9px) rotate(3deg); }
        }

        .accessory-drone-hover {
          animation: accessoryDroneHover 2.4s ease-in-out infinite;
        }

        @keyframes accessoryRotorSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .accessory-drone-rotor {
          transform-origin: center;
          animation: accessoryRotorSpin .45s linear infinite;
        }

        @keyframes accessoryScan {
          0%, 100% { transform: translateX(-8px); opacity: .35; }
          50% { transform: translateX(12px); opacity: 1; }
        }

        .accessory-hud-scan {
          animation: accessoryScan 1.6s ease-in-out infinite;
        }

        @keyframes accessoryCrystalPulse {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(103,232,249,.5)); opacity: .75; }
          50% { filter: drop-shadow(0 0 15px rgba(255,255,255,1)); opacity: 1; }
        }

        .accessory-crystal-wings,
        .accessory-crystal-core {
          animation: accessoryCrystalPulse 2.6s ease-in-out infinite;
        }

        @keyframes accessoryCrownFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }

        .accessory-floating-crown {
          transform-origin: 135px 31px;
          animation: accessoryCrownFloat 2.7s ease-in-out infinite;
        }

        @keyframes accessoryRuneFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -72; }
        }

        .accessory-rune-line {
          animation: accessoryRuneFlow 1.8s linear infinite;
        }

        @keyframes accessoryRuneCore {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(192,132,252,.55)); }
          50% { filter: drop-shadow(0 0 18px rgba(243,232,255,1)); }
        }

        .accessory-rune-core {
          animation: accessoryRuneCore 1.7s ease-in-out infinite;
        }

        @keyframes accessoryCapeFlame {
          0%, 100% { transform: scaleY(.88) skewX(-3deg); opacity: .78; }
          50% { transform: scaleY(1.16) skewX(5deg); opacity: 1; }
        }

        .accessory-cape-flame {
          transform-origin: center bottom;
          animation: accessoryCapeFlame .72s ease-in-out infinite;
        }

        @keyframes accessoryOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .accessory-star-orbit {
          transform-origin: 135px 167px;
          animation: accessoryOrbit 8s linear infinite;
        }

        .accessory-crown-orbit {
          transform-origin: 135px 31px;
          animation: accessoryOrbit 5.5s linear infinite reverse;
        }

        @keyframes accessoryFeatherWave {
          0%, 100% { transform: rotate(-1deg) scaleY(.98); }
          50% { transform: rotate(2deg) scaleY(1.04); }
        }

        .accessory-feather-wave,
        .accessory-seraph-wings {
          transform-origin: 135px 150px;
          animation: accessoryFeatherWave 2.8s ease-in-out infinite;
        }

        @keyframes accessoryDragonBreathe {
          0%, 100% { transform: scaleX(.99) scaleY(1); }
          50% { transform: scaleX(1.025) scaleY(1.015); }
        }

        .accessory-dragon-breathe {
          transform-origin: 135px 165px;
          animation: accessoryDragonBreathe 2.1s ease-in-out infinite;
        }

        @keyframes accessoryDragonGlow {
          0%, 100% { opacity: .45; filter: drop-shadow(0 0 3px #f97316); }
          50% { opacity: 1; filter: drop-shadow(0 0 12px #fef08a); }
        }

        .accessory-dragon-vein,
        .accessory-dragon-eye {
          animation: accessoryDragonGlow 1.3s ease-in-out infinite;
        }

        @keyframes accessoryCrownEnergy {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(250,204,21,.55)); opacity: .8; }
          50% { filter: drop-shadow(0 0 20px rgba(255,255,255,1)); opacity: 1; }
        }

        .accessory-celestial-crown,
        .accessory-crown-core,
        .accessory-star-core,
        .accessory-sun-gem,
        .accessory-drone-eye {
          animation: accessoryCrownEnergy 2s ease-in-out infinite;
        }
      `}
    </style>
  );
}
