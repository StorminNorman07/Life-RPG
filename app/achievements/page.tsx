"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AchievementCategory,
  AchievementDefinition,
  achievementRoads,
  achievements,
} from "@/data/achievements";

import {
  useAchievements,
} from "@/context/AchievementContext";


type Position = {
  x: number;
  y: number;
};


type RoadTheme = {
  road: string;
  edge: string;
  completed: string;
  centerLine: string;
};


const MAP_WIDTH = 1500;
const MAP_HEIGHT = 1500;


const categories:
  AchievementCategory[] = [
  "general",
  "daily",
  "skills",
  "budget",
  "calendar",
  "friends",
  "focus",
  "hidden",
];


const roadThemes:
  Record<
    AchievementCategory,
    RoadTheme
  > = {
  general: {
    road: "#3f3f46",
    edge: "#18181b",
    completed: "#facc15",
    centerLine: "#e4e4e7",
  },

  daily: {
    road: "#78716c",
    edge: "#292524",
    completed: "#22c55e",
    centerLine: "#d6d3d1",
  },

  skills: {
    road: "#713f12",
    edge: "#422006",
    completed: "#84cc16",
    centerLine: "#f59e0b",
  },

  budget: {
    road: "#475569",
    edge: "#0f172a",
    completed: "#38bdf8",
    centerLine: "#cbd5e1",
  },


  calendar: { road: "#334155", edge: "#0f172a", completed: "#a78bfa", centerLine: "#ddd6fe" },
  friends: { road: "#701a75", edge: "#3b0764", completed: "#f472b6", centerLine: "#fce7f3" },
  focus: { road: "#155e75", edge: "#083344", completed: "#22d3ee", centerLine: "#cffafe" },

  hidden: {
    road: "#64748b",
    edge: "#164e63",
    completed: "#67e8f9",
    centerLine: "#e0f2fe",
  },
};


/*
  Each array contains one position for every
  achievement on that road.
*/

const branchOrigins:
  Partial<
    Record<
      AchievementCategory,
      Position
    >
  > = {
  skills: { x: 360, y: 750 },
  budget: { x: 680, y: 750 },
  focus: { x: 1050, y: 750 },
  daily: { x: 245, y: 770 },
  calendar: { x: 555, y: 770 },
  friends: { x: 900, y: 770 },
  hidden: { x: 1230, y: 770 },
};


const roadPositions:
  Record<
    AchievementCategory,
    Position[]
  > = {
  general: [
    { x: 110, y: 760 },
    { x: 320, y: 760 },
    { x: 530, y: 760 },
    { x: 740, y: 760 },
    { x: 950, y: 760 },
    { x: 1160, y: 760 },
    { x: 1380, y: 760 },
  ],

  // Upper-left lane. It rises left before turning inward,
  // keeping it clear of the Financial District.
  skills: [
    { x: 330, y: 640 },
    { x: 270, y: 555 },
    { x: 220, y: 465 },
    { x: 190, y: 365 },
    { x: 205, y: 270 },
    { x: 260, y: 195 },
    { x: 345, y: 145 },
    { x: 440, y: 125 },
    { x: 530, y: 145 },
    { x: 590, y: 205 },
    { x: 610, y: 290 },
    { x: 585, y: 380 },
  ],

  // Upper-center lane. It climbs nearly straight before
  // bending right, avoiding both neighboring roads.
  budget: [
    { x: 680, y: 625 },
    { x: 670, y: 520 },
    { x: 675, y: 415 },
    { x: 700, y: 315 },
    { x: 750, y: 230 },
    { x: 825, y: 175 },
    { x: 910, y: 155 },
    { x: 985, y: 190 },
  ],

  // Upper-right lane. It travels right immediately, then
  // curls upward along the outside edge of the map.
  focus: [
    { x: 1085, y: 640 },
    { x: 1165, y: 575 },
    { x: 1245, y: 505 },
    { x: 1320, y: 425 },
    { x: 1370, y: 335 },
    { x: 1380, y: 245 },
    { x: 1340, y: 165 },
    { x: 1260, y: 120 },
  ],

  // Lower-left outside lane.
  daily: [
    { x: 225, y: 900 },
    { x: 170, y: 995 },
    { x: 145, y: 1095 },
    { x: 170, y: 1190 },
    { x: 240, y: 1260 },
  ],

  // Lower-left-center lane.
  calendar: [
    { x: 545, y: 900 },
    { x: 510, y: 995 },
    { x: 505, y: 1095 },
    { x: 535, y: 1190 },
    { x: 600, y: 1260 },
    { x: 685, y: 1300 },
    { x: 770, y: 1290 },
  ],

  // Lower-right-center lane.
  friends: [
    { x: 905, y: 900 },
    { x: 930, y: 995 },
    { x: 975, y: 1080 },
    { x: 1040, y: 1155 },
    { x: 1120, y: 1215 },
    { x: 1210, y: 1255 },
  ],

  // Lower-right outside lane.
  hidden: [
    { x: 1250, y: 900 },
    { x: 1320, y: 985 },
    { x: 1360, y: 1080 },
    { x: 1360, y: 1180 },
    { x: 1315, y: 1270 },
  ],
};


export default function AchievementsPage() {
  const mapViewportRef =
    useRef<HTMLDivElement | null>(null);


  const [
    mapScale,
    setMapScale,
  ] =
    useState(1);


  useEffect(() => {
    function updateMapScale() {
      const activeViewport =
        mapViewportRef.current;

      if (!activeViewport) {
        return;
      }

      const mobile =
        window.matchMedia(
          "(max-width: 767px)"
        ).matches;

      if (!mobile) {
        setMapScale(1);

        return;
      }

      setMapScale(
        Math.max(
          0.2,
          Math.min(
            1,
            (activeViewport.clientHeight - 2) /
              MAP_HEIGHT
          )
        )
      );
    }

    updateMapScale();

    window.addEventListener(
      "resize",
      updateMapScale
    );

    window.visualViewport?.addEventListener(
      "resize",
      updateMapScale
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateMapScale
      );

      window.visualViewport?.removeEventListener(
        "resize",
        updateMapScale
      );
    };
  }, []);


  useEffect(() => {
    const viewport =
      mapViewportRef.current;

    if (!viewport) {
      return;
    }

    const activeViewport =
      viewport;

    const storageKey =
      "life-rpg-achievement-map-position";

    const frame =
      window.requestAnimationFrame(() => {
        try {
          const saved =
            localStorage.getItem(
              storageKey
            );

          if (saved) {
            const position =
              JSON.parse(
                saved
              ) as {
                left?: number;
              };

            activeViewport.scrollTo({
              left:
                Math.max(
                  0,
                  position.left ??
                    0
                ),

              top:
                0,

              behavior:
                "auto",
            });

            return;
          }
        } catch {}

        const targetX =
          750 *
          mapScale;

        activeViewport.scrollTo({
          left:
            Math.max(
              0,
              targetX -
                activeViewport.clientWidth /
                  2
            ),

          top:
            0,

          behavior:
            "auto",
        });
      });

    function savePosition() {
      localStorage.setItem(
        storageKey,

        JSON.stringify({
          left:
            activeViewport.scrollLeft,
        })
      );
    }

    activeViewport.addEventListener(
      "scroll",
      savePosition,
      {
        passive:
          true,
      }
    );

    return () => {
      window.cancelAnimationFrame(
        frame
      );

      activeViewport.removeEventListener(
        "scroll",
        savePosition
      );
    };
  }, [mapScale]);


  const {
    unlockedAchievementIds,
    unlockDates,
    unlockedCount,
    totalVisibleAchievements,
    getProgress,
    isUnlocked,
    earnedTitles,
    selectedTitle,
    selectTitle,
  } = useAchievements();


  const [
    selectedAchievement,
    setSelectedAchievement,
  ] =
    useState<
      AchievementDefinition | null
    >(null);


  const completionPercentage =
    totalVisibleAchievements > 0
      ? Math.round(
          (
            unlockedCount /
            totalVisibleAchievements
          ) *
            100
        )
      : 0;


  const achievementMap =
    useMemo(() => {
      return new Map(
        achievements.map(
          (achievement) => [
            achievement.id,
            achievement,
          ]
        )
      );
    }, []);


  function getRoadAchievements(
    category:
      AchievementCategory
  ) {
    const road =
      achievementRoads.find(
        (item) =>
          item.id === category
      );

    if (!road) {
      return [];
    }

    return road.achievements
      .map(
        (achievementId) =>
          achievementMap.get(
            achievementId
          )
      )
      .filter(
        (
          achievement
        ): achievement is AchievementDefinition =>
          achievement !== undefined
      );
  }


  function createRoadPath(
    positions: Position[]
  ) {
    if (
      positions.length === 0
    ) {
      return "";
    }

    if (
      positions.length === 1
    ) {
      return `M ${positions[0].x} ${positions[0].y}`;
    }

    let path =
      `M ${positions[0].x} ${positions[0].y}`;

    for (
      let index = 1;
      index <
      positions.length - 1;
      index++
    ) {
      const current =
        positions[index];

      const next =
        positions[index + 1];

      const midpointX =
        (current.x + next.x) / 2;

      const midpointY =
        (current.y + next.y) / 2;

      path +=
        ` Q ${current.x} ${current.y}, ${midpointX} ${midpointY}`;
    }

    const final =
      positions[positions.length - 1];

    path +=
      ` T ${final.x} ${final.y}`;

    return path;
  }


  function getCompletedIndex(
    roadAchievements:
      AchievementDefinition[]
  ) {
    let completedIndex =
      -1;

    roadAchievements.forEach(
      (
        achievement,
        index
      ) => {
        if (
          isUnlocked(
            achievement.id
          )
        ) {
          completedIndex =
            index;
        }
      }
    );

    return completedIndex;
  }


  function getCompletedPath(
    positions: Position[],
    completedIndex: number
  ) {
    if (
      completedIndex < 0
    ) {
      return "";
    }

    return createRoadPath(
      positions.slice(
        0,
        completedIndex + 1
      )
    );
  }


  return (
    <main
      className="
        min-h-screen
        bg-black
        px-4
        pb-24
        text-white

        md:px-6
        md:pb-16
      "
    >
      <div
        className="
          mx-auto
          max-w-[1800px]
        "
      >
        <header
          className="
            flex
            flex-wrap
            items-start
            justify-between
            gap-6
          "
        >
          <div>
            <h1
              className="
                text-4xl
                font-black
              "
            >
              🏆 Achievements
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-zinc-400
              "
            >
              Every milestone builds another section of your road.
            </p>
          </div>


          <div
            className="
              min-w-[260px]
              rounded-2xl
              border
              border-zinc-700
              bg-zinc-950
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <span
                className="
                  text-sm
                  uppercase
                  tracking-wider
                  text-zinc-500
                "
              >
                Progress
              </span>

              <strong>
                {unlockedCount}
                {" / "}
                {totalVisibleAchievements}
              </strong>
            </div>

            <div
              className="
                mt-3
                h-3
                overflow-hidden
                rounded-full
                bg-zinc-800
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-yellow-400
                  transition-all
                  duration-500
                "
                style={{
                  width:
                    `${completionPercentage}%`,
                }}
              />
            </div>

            <p
              className="
                mt-2
                text-right
                text-sm
                text-zinc-400
              "
            >
              {completionPercentage}% complete
            </p>
          </div>
        </header>


        <section
          className="
            mt-8
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-5
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-bold
                "
              >
                Equipped Title
              </h2>

              <p
                className="
                  mt-1
                  text-zinc-400
                "
              >
                {selectedTitle ??
                  "No title equipped"}
              </p>
            </div>

            <select
              value={
                selectedTitle ??
                ""
              }
              onChange={(
                event
              ) =>
                selectTitle(
                  event.target.value ||
                    null
                )
              }
              className="
                min-w-[230px]
                rounded-lg
                border
                border-zinc-700
                bg-black
                px-4
                py-3
              "
            >
              <option value="">
                No title
              </option>

              {earnedTitles.map(
                (title) => (
                  <option
                    key={title}
                    value={title}
                  >
                    {title}
                  </option>
                )
              )}
            </select>
          </div>
        </section>


        <section
          ref={mapViewportRef}
          className="
            mt-6
            h-[calc(100dvh-11rem)]
            min-h-[480px]
            overflow-x-auto
            overflow-y-hidden
            overscroll-x-contain
            overscroll-y-auto
            rounded-3xl
            border
            border-zinc-700
            bg-zinc-950
            touch-auto
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            md:mt-8
            md:h-auto
          "
        >
          <div
            className="
              relative
              shrink-0
            "
            style={{
              width:
                `${MAP_WIDTH * mapScale}px`,

              height:
                `${MAP_HEIGHT * mapScale}px`,
            }}
          >
          <div
            className="
              absolute
              left-0
              top-0
              origin-top-left
              overflow-hidden
              touch-auto
            "
            style={{
              width:
                `${MAP_WIDTH}px`,

              height:
                `${MAP_HEIGHT}px`,

              background:
                "#071015",

              transform:
                `scale(${mapScale})`,
            }}
          >
            <TerrainDecorations />


            <svg
              className="
                absolute
                inset-0
                z-10
                h-full
                w-full
                pointer-events-none
              "
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            >
              {categories.map(
                (category) => {
                  const roadAchievements =
                    getRoadAchievements(
                      category
                    );

                  const achievementPositions =
                    roadPositions[
                      category
                    ].slice(
                      0,
                      roadAchievements.length
                    );

                  const origin =
                    branchOrigins[
                      category
                    ];

                  const pathPositions =
                    category ===
                      "general" ||
                    !origin
                      ? achievementPositions
                      : [
                          origin,
                          ...achievementPositions,
                        ];

                  const completedIndex =
                    getCompletedIndex(
                      roadAchievements
                    );

                  const fullPath =
                    createRoadPath(
                      pathPositions
                    );

                  const completedPath =
                    category ===
                      "general"
                      ? getCompletedPath(
                          pathPositions,
                          completedIndex
                        )
                      : completedIndex <
                        0
                      ? ""
                      : createRoadPath(
                          pathPositions.slice(
                            0,
                            completedIndex +
                              2
                          )
                        );

                  const theme =
                    roadThemes[
                      category
                    ];

                  const mainRoad =
                    category ===
                    "general";

                  return (
                    <g
                      key={
                        category
                      }
                    >
                      <path
                        d={fullPath}
                        fill="none"
                        stroke={
                          theme.edge
                        }
                        strokeWidth={
                          mainRoad
                            ? 62
                            : 48
                        }
                        strokeLinecap="round"
                      />

                      <path
                        d={fullPath}
                        fill="none"
                        stroke={
                          theme.road
                        }
                        strokeWidth={
                          mainRoad
                            ? 46
                            : 34
                        }
                        strokeLinecap="round"
                      />

                      <path
                        d={fullPath}
                        fill="none"
                        stroke={
                          theme.centerLine
                        }
                        strokeWidth={
                          mainRoad
                            ? 3
                            : 2
                        }
                        strokeLinecap="round"
                        strokeDasharray={
                          mainRoad
                            ? "20 18"
                            : "8 13"
                        }
                        opacity=".85"
                      />

                      {completedPath && (
                        <path
                          d={
                            completedPath
                          }
                          fill="none"
                          stroke={
                            theme.completed
                          }
                          strokeWidth={
                            mainRoad
                              ? 10
                              : 8
                          }
                          strokeLinecap="round"
                          opacity=".9"
                        />
                      )}
                    </g>
                  );
                }
              )}
            </svg>


            {categories.flatMap(
              (category) => {
                const roadAchievements =
                  getRoadAchievements(
                    category
                  );

                const positions =
                  roadPositions[
                    category
                  ];

                return roadAchievements.map(
                  (
                    achievement,
                    index
                  ) => {
                    const position =
                      positions[index];

                    if (
                      !position
                    ) {
                      return null;
                    }

                    const unlocked =
                      isUnlocked(
                        achievement.id
                      );

                    const progress =
                      getProgress(
                        achievement
                      );

                    const hiddenLocked =
                      achievement.hidden &&
                      !unlocked;

                    const previousUnlocked =
                      index === 0
                        ? true
                        : isUnlocked(
                            roadAchievements[
                              index - 1
                            ].id
                          );

                    const nextAchievement =
                      !unlocked &&
                      previousUnlocked;

                    return (
                      <button
                        key={
                          achievement.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedAchievement(
                            achievement
                          )
                        }
                        className={`
                          absolute
                          z-30

                          flex
                          h-16
                          w-16

                          -translate-x-1/2
                          -translate-y-1/2

                          items-center
                          justify-center

                          rounded-full
                          border-4

                          text-2xl

                          transition
                          duration-300

                          hover:scale-110

                          ${
                            unlocked
                              ? `
                                border-yellow-300
                                bg-zinc-900
                                shadow-[0_0_25px_rgba(250,204,21,.85)]
                              `
                              : nextAchievement
                              ? `
                                border-white
                                bg-zinc-900
                                shadow-[0_0_20px_rgba(255,255,255,.65)]
                              `
                              : `
                                border-zinc-700
                                bg-zinc-950
                                opacity-80
                              `
                          }
                        `}
                        style={{
                          left:
                            `${position.x}px`,

                          top:
                            `${position.y}px`,
                        }}
                        aria-label={
                          hiddenLocked
                            ? "Hidden achievement"
                            : achievement.title
                        }
                      >
                        {hiddenLocked
                          ? "?"
                          : unlocked
                          ? achievement.icon
                          : "🔒"}

                        {!unlocked &&
                          !hiddenLocked &&
                          progress.current >
                            0 && (
                            <span
                              className="
                                absolute
                                -bottom-7

                                whitespace-nowrap

                                rounded
                                border
                                border-zinc-800

                                bg-black/90

                                px-2
                                py-1

                                text-[10px]
                                text-zinc-300
                              "
                            >
                              {Math.min(
                                progress.current,
                                progress.target
                              )}
                              {" / "}
                              {progress.target}
                            </span>
                          )}
                      </button>
                    );
                  }
                );
              }
            )}


            <RoadLabel
              x={85}
              y={650}
              title="🛣️ Main Highway"
              subtitle="General progress"
            />

            <RoadLabel
              x={250}
              y={25}
              title="🌲 Mastery Forest"
              subtitle="Skill-tree progress"
            />

            <RoadLabel
              x={650}
              y={25}
              title="🏙️ Financial District"
              subtitle="Budget milestones"
            />

            <RoadLabel
              x={1045}
              y={280}
              title="🎯 Focus Route"
              subtitle="Deliberate attention"
            />

            <RoadLabel
              x={55}
              y={1320}
              title="🏔️ Daily Trail"
              subtitle="Consistency and streaks"
            />

            <RoadLabel
              x={455}
              y={1390}
              title="📅 Planning Parkway"
              subtitle="Calendar and planning"
            />

            <RoadLabel
              x={865}
              y={1325}
              title="👥 Social Avenue"
              subtitle="Friends and accountability"
            />

            <RoadLabel
              x={1240}
              y={1365}
              title="❄️ Frozen Road"
              subtitle="Hidden achievements"
            />
          </div>
          </div>
        </section>
      </div>


      {selectedAchievement && (
        <AchievementPopup
          achievement={
            selectedAchievement
          }
          unlocked={
            unlockedAchievementIds.includes(
              selectedAchievement.id
            )
          }
          unlockDate={
            unlockDates[
              selectedAchievement.id
            ]
          }
          progress={
            getProgress(
              selectedAchievement
            )
          }
          onClose={() =>
            setSelectedAchievement(
              null
            )
          }
        />
      )}
    </main>
  );
}


function RoadLabel({
  x,
  y,
  title,
  subtitle,
}: {
  x: number;
  y: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="
        absolute
        z-20

        max-w-[210px]

        rounded-xl
        border
        border-zinc-700

        bg-black/75

        px-4
        py-3

        backdrop-blur-md
      "
      style={{
        left:
          `${x}px`,

        top:
          `${y}px`,
      }}
    >
      <p
        className="
          font-bold
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1

          text-xs
          uppercase
          tracking-wider

          text-zinc-400
        "
      >
        {subtitle}
      </p>
    </div>
  );
}


function AchievementPopup({
  achievement,
  unlocked,
  unlockDate,
  progress,
  onClose,
}: {
  achievement:
    AchievementDefinition;

  unlocked: boolean;

  unlockDate?:
    string;

  progress: {
    current: number;
    target: number;
    percentage: number;
    complete: boolean;
  };

  onClose:
    () => void;
}) {
  const hiddenLocked =
    achievement.hidden &&
    !unlocked;


  const unlockLabel =
    unlockDate
      ? new Date(
          unlockDate
        ).toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        )
      : null;


  return (
    <div
      className="
        fixed
        inset-0
        z-50

        flex
        items-center
        justify-center

        bg-black/80
        p-4
      "
      onMouseDown={
        onClose
      }
    >
      <div
        className="
          w-full
          max-w-md

          rounded-2xl
          border
          border-zinc-700

          bg-zinc-950
          p-6

          text-white
        "
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
              "
            >
              {hiddenLocked
                ? "Hidden achievement"
                : achievement.category}
            </p>

            <h2
              className="
                mt-2
                text-3xl
                font-black
              "
            >
              {hiddenLocked
                ? "???"
                : achievement.title}
            </h2>
          </div>

          <div
            className="
              flex
              h-16
              w-16

              shrink-0

              items-center
              justify-center

              rounded-full
              border
              border-zinc-700

              bg-black

              text-3xl
            "
          >
            {hiddenLocked
              ? "❓"
              : achievement.icon}
          </div>
        </div>


        <p
          className="
            mt-5
            text-zinc-300
          "
        >
          {hiddenLocked
            ? "This achievement remains hidden until you discover how to unlock it."
            : achievement.description}
        </p>


        {hiddenLocked && (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-zinc-800
              bg-black
              p-4
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-zinc-500
              "
            >
              Title reward
            </p>

            <p
              className="
                mt-1
                font-bold
              "
            >
              ???
            </p>
          </div>
        )}


        {!hiddenLocked && (
          <>
            <div
              className="
                mt-6
              "
            >
              <div
                className="
                  flex
                  justify-between
                  text-sm
                "
              >
                <span
                  className="
                    text-zinc-400
                  "
                >
                  Progress
                </span>

                <strong>
                  {Math.min(
                    progress.current,
                    progress.target
                  )}
                  {" / "}
                  {progress.target}
                </strong>
              </div>

              <div
                className="
                  mt-2
                  h-3
                  overflow-hidden
                  rounded-full
                  bg-zinc-800
                "
              >
                <div
                  className={`
                    h-full
                    rounded-full

                    ${
                      unlocked
                        ? "bg-yellow-400"
                        : "bg-white"
                    }
                  `}
                  style={{
                    width:
                      `${progress.percentage}%`,
                  }}
                />
              </div>
            </div>


            <div
              className="
                mt-5

                rounded-xl
                border
                border-zinc-800

                bg-black
                p-4
              "
            >
              <p
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-zinc-500
                "
              >
                Title reward
              </p>

              <p
                className="
                  mt-1
                  font-bold
                "
              >
                {achievement.rewardTitle ??
                  achievement.title}
              </p>
            </div>
          </>
        )}


        <div
          className="
            mt-5

            rounded-xl
            border
            border-zinc-800

            bg-zinc-900
            p-4
          "
        >
          <p
            className="
              text-xs
              uppercase
              tracking-wider
              text-zinc-500
            "
          >
            Status
          </p>

          <p
            className={`
              mt-1
              font-bold

              ${
                unlocked
                  ? "text-yellow-300"
                  : "text-zinc-300"
              }
            `}
          >
            {unlocked
              ? "Unlocked"
              : "Locked"}
          </p>

          {unlockLabel && (
            <p
              className="
                mt-1
                text-sm
                text-zinc-400
              "
            >
              Earned {unlockLabel}
            </p>
          )}
        </div>


        <button
          type="button"
          onClick={
            onClose
          }
          className="
            mt-6
            w-full

            rounded-lg

            bg-white

            px-4
            py-3

            font-bold
            text-black

            hover:bg-zinc-200
          "
        >
          Back
        </button>
      </div>
    </div>
  );
}


function TerrainDecorations() {
  const forestTrees = [
    { x: 55, y: 85, scale: 1.1 },
    { x: 130, y: 155, scale: 0.82 },
    { x: 205, y: 65, scale: 1 },
    { x: 290, y: 115, scale: 0.76 },
    { x: 385, y: 55, scale: 1.04 },
    { x: 475, y: 105, scale: 0.78 },
    { x: 540, y: 215, scale: 0.88 },
    { x: 105, y: 315, scale: 0.78 },
    { x: 195, y: 375, scale: 1 },
    { x: 305, y: 315, scale: 0.7 },
    { x: 440, y: 355, scale: 0.9 },
    { x: 535, y: 445, scale: 0.72 },
  ];

  const cityBuildings = [
    {
      x: 555,
      y: 165,
      width: 72,
      height: 285,
      body: "#202b3b",
    },
    {
      x: 625,
      y: 105,
      width: 90,
      height: 345,
      body: "#273449",
    },
    {
      x: 710,
      y: 190,
      width: 68,
      height: 260,
      body: "#1f2937",
    },
    {
      x: 775,
      y: 72,
      width: 102,
      height: 378,
      body: "#29384d",
    },
    {
      x: 870,
      y: 145,
      width: 80,
      height: 305,
      body: "#222f43",
    },
    {
      x: 945,
      y: 215,
      width: 66,
      height: 235,
      body: "#1e293b",
    },
  ];

  const socialHouses = [
    {
      x: 865,
      y: 1015,
      body: "#9f5a5a",
      roof: "#5b2e3c",
    },
    {
      x: 975,
      y: 960,
      body: "#bc8c5a",
      roof: "#6f3a2f",
    },
    {
      x: 1090,
      y: 1010,
      body: "#7a6aa8",
      roof: "#463566",
    },
  ];

  const focusStars = Array.from(
    {
      length:
        30,
    },
    (
      _,
      index
    ) => ({
      x:
        1025 +
        (
          index *
          71
        ) %
          450,

      y:
        45 +
        (
          index *
          47
        ) %
          500,

      radius:
        1 +
        (
          index %
          3
        ),
    })
  );

  return (
    <svg
      className="
        pointer-events-none
        absolute
        inset-0
        z-0
        h-full
        w-full
      "
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="world-base"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#08131d"
          />

          <stop
            offset="48%"
            stopColor="#18232d"
          />

          <stop
            offset="100%"
            stopColor="#091014"
          />
        </linearGradient>

        <linearGradient
          id="forest-ground"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#355a3e"
          />

          <stop
            offset="100%"
            stopColor="#14281e"
          />
        </linearGradient>

        <linearGradient
          id="city-sky"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#34455d"
          />

          <stop
            offset="100%"
            stopColor="#111827"
          />
        </linearGradient>

        <linearGradient
          id="focus-sky"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#07142c"
          />

          <stop
            offset="100%"
            stopColor="#0b2932"
          />
        </linearGradient>

        <linearGradient
          id="daily-ground"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#54785e"
          />

          <stop
            offset="100%"
            stopColor="#203a2d"
          />
        </linearGradient>

        <linearGradient
          id="planning-ground"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#30445a"
          />

          <stop
            offset="100%"
            stopColor="#172033"
          />
        </linearGradient>

        <linearGradient
          id="social-ground"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#522d57"
          />

          <stop
            offset="100%"
            stopColor="#26162b"
          />
        </linearGradient>

        <linearGradient
          id="frozen-sky"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#1a3858"
          />

          <stop
            offset="100%"
            stopColor="#9dcede"
          />
        </linearGradient>

        <linearGradient
          id="frozen-ground"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#e7fbff"
          />

          <stop
            offset="100%"
            stopColor="#83b7cd"
          />
        </linearGradient>

        <pattern
          id="city-windows"
          width="22"
          height="27"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="5"
            y="5"
            width="7"
            height="10"
            rx="1"
            fill="#fde68a"
            opacity=".7"
          />
        </pattern>

        <filter
          id="world-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="13"
          />
        </filter>
      </defs>


      <rect
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        fill="url(#world-base)"
      />


      {/* Mastery Forest */}
      <path
        d="M0 0 H610 V570 C505 535 410 580 305 542 C190 500 95 548 0 505 Z"
        fill="url(#forest-ground)"
      />

      <path
        d="M0 340 C105 285 180 350 265 300 C355 247 445 318 610 245 V0 H0 Z"
        fill="#172f26"
        opacity=".72"
      />

      <circle
        cx="105"
        cy="105"
        r="50"
        fill="#d9f5cf"
        opacity=".18"
        filter="url(#world-glow)"
      />

      {forestTrees.map(
        (
          tree,
          index
        ) => (
          <g
            key={`forest-${index}`}
            transform={`translate(${tree.x} ${tree.y}) scale(${tree.scale})`}
          >
            <rect
              x="-7"
              y="43"
              width="14"
              height="58"
              rx="4"
              fill="#5c3926"
            />

            <polygon
              points="0,-12 -40,54 40,54"
              fill={
                index %
                  2 ===
                0
                  ? "#255d3e"
                  : "#1f4d34"
              }
            />

            <polygon
              points="0,17 -34,74 34,74"
              fill={
                index %
                  2 ===
                0
                  ? "#1b4930"
                  : "#173d29"
              }
            />
          </g>
        )
      )}

      <path
        d="M40 495 C145 425 235 500 330 430 C420 365 515 430 605 360"
        fill="none"
        stroke="#6aa6a7"
        strokeWidth="25"
        opacity=".72"
      />

      <path
        d="M40 495 C145 425 235 500 330 430 C420 365 515 430 605 360"
        fill="none"
        stroke="#c6ece7"
        strokeWidth="5"
        opacity=".4"
      />

      <g
        transform="translate(435 365)"
      >
        <rect
          x="-48"
          y="-6"
          width="96"
          height="14"
          rx="7"
          fill="#8b6547"
        />

        <rect
          x="-34"
          y="4"
          width="10"
          height="29"
          fill="#4f3527"
        />

        <rect
          x="24"
          y="4"
          width="10"
          height="29"
          fill="#4f3527"
        />
      </g>


      {/* Financial District */}
      <rect
        x="540"
        y="0"
        width="500"
        height="565"
        fill="url(#city-sky)"
      />

      <circle
        cx="900"
        cy="102"
        r="42"
        fill="#fff3bd"
        opacity=".45"
      />

      {cityBuildings.map(
        (
          building,
          index
        ) => (
          <g
            key={`building-${index}`}
          >
            <rect
              x={building.x}
              y={building.y}
              width={building.width}
              height={building.height}
              rx="4"
              fill={building.body}
              stroke="#4b5d75"
              strokeWidth="4"
            />

            <rect
              x={building.x + 8}
              y={building.y + 12}
              width={Math.max(
                12,
                building.width -
                  16
              )}
              height={Math.max(
                12,
                building.height -
                  25
              )}
              fill="url(#city-windows)"
              opacity=".86"
            />
          </g>
        )
      )}

      <rect
        x="540"
        y="465"
        width="500"
        height="100"
        fill="#15191f"
      />

      <path
        d="M540 518 H1040"
        stroke="#f8fafc"
        strokeWidth="4"
        strokeDasharray="28 22"
        opacity=".5"
      />

      <g
        transform="translate(615 405)"
      >
        <rect
          x="0"
          y="32"
          width="120"
          height="68"
          fill="#d8dee8"
          stroke="#758196"
          strokeWidth="4"
        />

        <polygon
          points="-12,34 60,-8 132,34"
          fill="#adb7c6"
          stroke="#6b7280"
          strokeWidth="4"
        />

        {[18, 44, 70, 96].map(
          (
            x
          ) => (
            <rect
              key={x}
              x={x}
              y="48"
              width="12"
              height="52"
              fill="#717d90"
            />
          )
        )}
      </g>


      {/* Focus Route */}
      <path
        d="M1005 0 H1500 V680 C1410 642 1325 692 1238 652 C1158 614 1082 660 1005 622 Z"
        fill="url(#focus-sky)"
      />

      <circle
        cx="1350"
        cy="104"
        r="44"
        fill="#dff8ff"
        opacity=".75"
      />

      {focusStars.map(
        (
          star,
          index
        ) => (
          <circle
            key={`star-${index}`}
            cx={star.x}
            cy={star.y}
            r={star.radius}
            fill="#ffffff"
            opacity={
              0.38 +
              (
                index %
                5
              ) *
                0.1
            }
          />
        )
      )}

      <path
        d="M1005 450 L1095 355 L1180 430 L1278 300 L1380 438 L1465 360 L1500 405 V680 H1005 Z"
        fill="#163642"
      />

      <path
        d="M1110 680 C1140 565 1190 500 1248 455 C1305 505 1360 570 1392 680 Z"
        fill="#0f252b"
      />

      <g
        transform="translate(1110 455)"
      >
        <rect
          x="-28"
          y="24"
          width="80"
          height="63"
          rx="4"
          fill="#6f482d"
          stroke="#3e291d"
          strokeWidth="4"
        />

        <polygon
          points="-38,27 12,-12 63,27"
          fill="#38271f"
          stroke="#9a6b43"
          strokeWidth="4"
        />

        <rect
          x="5"
          y="54"
          width="18"
          height="33"
          fill="#201711"
        />

        <rect
          x="-13"
          y="42"
          width="15"
          height="15"
          fill="#fde68a"
        />

        <rect
          x="30"
          y="42"
          width="15"
          height="15"
          fill="#fde68a"
        />
      </g>

      <g
        transform="translate(1420 420)"
      >
        <circle
          cx="0"
          cy="0"
          r="24"
          fill="#bfdbfe"
          opacity=".8"
        />

        <rect
          x="-7"
          y="20"
          width="14"
          height="70"
          fill="#94a3b8"
        />

        <path
          d="M-44 89 H44"
          stroke="#cbd5e1"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d="M0 30 L38 5"
          stroke="#cbd5e1"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>


      {/* Main Highway landscape */}
      <rect
        x="0"
        y="625"
        width="1500"
        height="275"
        fill="#27392c"
      />

      <path
        d="M0 688 C180 635 325 703 510 658 C690 614 860 687 1030 648 C1210 607 1370 668 1500 632 V900 H0 Z"
        fill="#36533d"
      />

      {[95, 420, 815, 1185, 1435].map(
        (
          x,
          index
        ) => (
          <g
            key={`lamp-${index}`}
            transform={`translate(${x} 672)`}
            opacity=".52"
          >
            <rect
              x="-3"
              y="0"
              width="6"
              height="78"
              fill="#b4bbc5"
            />

            <path
              d="M0 0 H27"
              stroke="#b4bbc5"
              strokeWidth="6"
              strokeLinecap="round"
            />

            <circle
              cx="28"
              cy="4"
              r="7"
              fill="#fde68a"
            />
          </g>
        )
      )}


      {/* Daily Trail */}
      <path
        d="M0 870 H390 V1500 H0 Z"
        fill="url(#daily-ground)"
      />

      <circle
        cx="95"
        cy="955"
        r="54"
        fill="#ffe7a3"
        opacity=".72"
      />

      <path
        d="M0 1160 L92 1000 L180 1115 L275 940 L390 1125 V1500 H0 Z"
        fill="#415a46"
      />

      <path
        d="M58 1048 L92 1000 L125 1050 L107 1041 L92 1062 L77 1041 Z M235 1004 L275 940 L319 1008 L295 996 L275 1025 L256 998 Z"
        fill="#e6ece8"
        opacity=".85"
      />

      <path
        d="M115 1500 C132 1388 169 1280 235 1195 C194 1305 187 1410 188 1500 Z"
        fill="#a88761"
      />

      {[58, 315].map(
        (
          x,
          index
        ) => (
          <g
            key={`trail-sign-${index}`}
            transform={`translate(${x} ${1225 + index * 75})`}
          >
            <rect
              x="-4"
              y="0"
              width="8"
              height="58"
              fill="#6b4931"
            />

            <rect
              x="-31"
              y="-15"
              width="62"
              height="28"
              rx="4"
              fill="#c89d67"
              stroke="#69462d"
              strokeWidth="4"
            />

            <path
              d="M-18 -1 H18"
              stroke="#6b4931"
              strokeWidth="4"
            />
          </g>
        )
      )}


      {/* Planning Parkway */}
      <path
        d="M355 870 H875 V1500 H355 Z"
        fill="url(#planning-ground)"
      />

      <rect
        x="385"
        y="1075"
        width="450"
        height="425"
        rx="42"
        fill="#27364b"
        opacity=".9"
      />

      <path
        d="M410 1320 H820 M615 1085 V1490"
        stroke="#697a92"
        strokeWidth="18"
        opacity=".42"
      />

      <g
        transform="translate(475 1035)"
      >
        <rect
          x="-45"
          y="0"
          width="90"
          height="82"
          rx="10"
          fill="#e5e7eb"
          stroke="#64748b"
          strokeWidth="5"
        />

        <rect
          x="-45"
          y="0"
          width="90"
          height="22"
          fill="#a78bfa"
        />

        {[
          {
            x:
              -20,
            y:
              38,
          },
          {
            x:
              7,
            y:
              38,
          },
          {
            x:
              -20,
            y:
              62,
          },
          {
            x:
              7,
            y:
              62,
          },
        ].map(
          (
            square,
            index
          ) => (
            <rect
              key={index}
              x={square.x}
              y={square.y}
              width="13"
              height="12"
              rx="2"
              fill="#64748b"
            />
          )
        )}
      </g>

      <g
        transform="translate(740 1020)"
      >
        <circle
          cx="0"
          cy="0"
          r="45"
          fill="#e2e8f0"
          stroke="#64748b"
          strokeWidth="6"
        />

        <path
          d="M0 0 V-24 M0 0 L21 12"
          stroke="#334155"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      <g
        transform="translate(630 1245)"
      >
        <rect
          x="-88"
          y="0"
          width="176"
          height="86"
          rx="8"
          fill="#334155"
          stroke="#94a3b8"
          strokeWidth="5"
        />

        <path
          d="M-60 28 H60 M-60 53 H22"
          stroke="#cbd5e1"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <rect
          x="-8"
          y="86"
          width="16"
          height="82"
          fill="#64748b"
        />
      </g>


      {/* Social Avenue */}
      <path
        d="M840 870 H1215 V1500 H840 Z"
        fill="url(#social-ground)"
      />

      <path
        d="M840 1185 C930 1135 1015 1188 1095 1142 C1150 1110 1180 1123 1215 1100 V1500 H840 Z"
        fill="#3b2441"
      />

      {socialHouses.map(
        (
          house,
          index
        ) => (
          <g
            key={`house-${index}`}
            transform={`translate(${house.x} ${house.y})`}
          >
            <rect
              x="0"
              y="35"
              width="88"
              height="78"
              rx="5"
              fill={house.body}
              stroke="#2b1d25"
              strokeWidth="5"
            />

            <polygon
              points="-9,37 44,-7 97,37"
              fill={house.roof}
              stroke="#2b1d25"
              strokeWidth="5"
            />

            <rect
              x="34"
              y="73"
              width="20"
              height="40"
              fill="#35221c"
            />

            <rect
              x="12"
              y="54"
              width="17"
              height="17"
              fill="#fde68a"
            />

            <rect
              x="60"
              y="54"
              width="17"
              height="17"
              fill="#fde68a"
            />
          </g>
        )
      )}

      <g
        transform="translate(1015 1255)"
      >
        <ellipse
          cx="0"
          cy="58"
          rx="88"
          ry="25"
          fill="#1d4f64"
          stroke="#9bd5e8"
          strokeWidth="5"
        />

        <path
          d="M0 -18 C-15 13 -29 29 -38 47 M0 -18 C15 13 29 29 38 47 M0 -18 V52"
          fill="none"
          stroke="#bde7f2"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <circle
          cx="0"
          cy="-24"
          r="12"
          fill="#d9f7ff"
        />
      </g>


      {/* Frozen Road */}
      <path
        d="M1185 870 H1500 V1500 H1185 Z"
        fill="url(#frozen-sky)"
      />

      <path
        d="M1185 1130 L1245 1010 L1305 1085 L1375 940 L1445 1065 L1500 995 V1500 H1185 Z"
        fill="#5d8097"
      />

      <path
        d="M1220 1058 L1245 1010 L1270 1060 L1255 1052 L1245 1070 L1234 1052 Z M1342 986 L1375 940 L1408 991 L1388 980 L1375 1003 L1361 980 Z M1474 1033 L1500 995 L1500 1066 Z"
        fill="#eefbff"
      />

      <path
        d="M1185 1265 C1260 1230 1320 1270 1385 1235 C1440 1206 1475 1220 1500 1200 V1500 H1185 Z"
        fill="url(#frozen-ground)"
      />

      <ellipse
        cx="1365"
        cy="1355"
        rx="142"
        ry="55"
        fill="#69b5d0"
        opacity=".68"
      />

      <ellipse
        cx="1365"
        cy="1355"
        rx="107"
        ry="34"
        fill="#d9f7ff"
        opacity=".42"
      />

      {[
        {
          x:
            1210,
          y:
            1025,
          scale:
            0.82,
        },
        {
          x:
            1300,
          y:
            1115,
          scale:
            1,
        },
        {
          x:
            1410,
          y:
            1035,
          scale:
            0.9,
        },
        {
          x:
            1260,
          y:
            1290,
          scale:
            0.78,
        },
        {
          x:
            1440,
          y:
            1280,
          scale:
            0.98,
        },
      ].map(
        (
          pine,
          index
        ) => (
          <g
            key={`pine-${index}`}
            transform={`translate(${pine.x} ${pine.y}) scale(${pine.scale})`}
          >
            <rect
              x="-6"
              y="54"
              width="12"
              height="50"
              fill="#5c4435"
            />

            <polygon
              points="0,-6 -39,61 39,61"
              fill="#164e63"
              stroke="#dff7ff"
              strokeWidth="5"
            />

            <polygon
              points="0,25 -33,82 33,82"
              fill="#155e75"
              stroke="#dff7ff"
              strokeWidth="4"
            />
          </g>
        )
      )}

      {Array.from(
        {
          length:
            34,
        },
        (
          _,
          index
        ) => (
          <circle
            key={`snow-${index}`}
            cx={
              1195 +
              (
                index *
                47
              ) %
                295
            }
            cy={
              890 +
              (
                index *
                79
              ) %
                575
            }
            r={
              2 +
              (
                index %
                3
              )
            }
            fill="#ffffff"
            opacity=".62"
          />
        )
      )}


      {/* Subtle separators and finishing layer */}
      <path
        d="M540 0 V565"
        stroke="#d4a85d"
        strokeWidth="5"
        opacity=".13"
      />

      <path
        d="M1005 0 V680"
        stroke="#67e8f9"
        strokeWidth="5"
        opacity=".12"
      />

      <path
        d="M390 870 V1500"
        stroke="#d7e5d7"
        strokeWidth="5"
        opacity=".1"
      />

      <path
        d="M840 870 V1500"
        stroke="#ddd6fe"
        strokeWidth="5"
        opacity=".1"
      />

      <path
        d="M1185 870 V1500"
        stroke="#dff7ff"
        strokeWidth="5"
        opacity=".14"
      />

      <rect
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        fill="#000000"
        opacity=".08"
      />
    </svg>
  );
}
