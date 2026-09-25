"use client";

import {
  useEffect,
  useState,
} from "react";

import CharacterCustomizer from "@/components/CharacterCustomizer";

import CharacterDisplay from "@/components/CharacterDisplay";

import {
  useCharacter,
} from "@/context/CharacterContext";

import {
  useGame,
} from "@/context/GameContext";

import {
  getProgress,
  MAX_LEVEL,
} from "@/data/levels";


type StoredDailyHistory =
  Record<
    string,
    {
      allTasksCompleted?:
        boolean;
    }
  >;


function getLocalDateKey(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function readCurrentPerfectDayStreak() {
  try {
    const savedHistory =
      localStorage.getItem(
        "achievementDailyHistory"
      );

    if (
      !savedHistory
    ) {
      return 0;
    }

    const history =
      JSON.parse(
        savedHistory
      ) as
        StoredDailyHistory;

    const cursor =
      new Date();

    cursor.setHours(
      0,
      0,
      0,
      0
    );

    /*
     * An unfinished current day does not break the
     * streak until that day has actually ended.
     */
    if (
      !history[
        getLocalDateKey(
          cursor
        )
      ]?.allTasksCompleted
    ) {
      cursor.setDate(
        cursor.getDate() - 1
      );
    }

    let streak =
      0;

    while (
      history[
        getLocalDateKey(
          cursor
        )
      ]?.allTasksCompleted
    ) {
      streak +=
        1;

      cursor.setDate(
        cursor.getDate() - 1
      );
    }

    return streak;
  } catch {
    return 0;
  }
}


export default function Home() {
  const {
    player,
  } =
    useGame();


  const {
    currentLevel,

    currentTier,

    prestigeStars,

    prestigeDisplay,

    hasCrown,
  } =
    useCharacter();


  const [
    showCustomizer,
    setShowCustomizer,
  ] =
    useState(false);


  const [
    currentPerfectDayStreak,
    setCurrentPerfectDayStreak,
  ] =
    useState(0);


  useEffect(() => {
    let midnightTimer:
      number | null =
        null;


    function refreshStreak() {
      setCurrentPerfectDayStreak(
        readCurrentPerfectDayStreak()
      );
    }


    function handleVisibilityChange() {
      if (
        document.visibilityState ===
          "visible"
      ) {
        refreshStreak();
      }
    }


    function scheduleMidnightRefresh() {
      if (
        midnightTimer !==
        null
      ) {
        window.clearTimeout(
          midnightTimer
        );
      }

      const now =
        new Date();

      const nextMidnight =
        new Date(
          now
        );

      nextMidnight.setHours(
        24,
        0,
        1,
        0
      );

      midnightTimer =
        window.setTimeout(
          () => {
            refreshStreak();

            scheduleMidnightRefresh();
          },
          nextMidnight.getTime() -
            now.getTime()
        );
    }


    refreshStreak();

    scheduleMidnightRefresh();

    window.addEventListener(
      "achievement-data-updated",
      refreshStreak
    );

    window.addEventListener(
      "storage",
      refreshStreak
    );

    window.addEventListener(
      "focus",
      refreshStreak
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      if (
        midnightTimer !==
        null
      ) {
        window.clearTimeout(
          midnightTimer
        );
      }

      window.removeEventListener(
        "achievement-data-updated",
        refreshStreak
      );

      window.removeEventListener(
        "storage",
        refreshStreak
      );

      window.removeEventListener(
        "focus",
        refreshStreak
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);


  const progress =
    getProgress(
      player.totalXP
    );


  return (
    <main
      className="
        min-h-screen
        bg-black
        px-6
        pb-16
        pt-3
        text-white

        md:pt-0
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <section
          className="
            relative
            overflow-hidden

            rounded-3xl
            border
            border-zinc-800

            bg-zinc-950

            px-6
            py-10
          "
        >
          <div
            className="
              pointer-events-none

              absolute
              left-1/2
              top-16

              h-[420px]
              w-[420px]

              -translate-x-1/2

              rounded-full

              bg-white/5

              blur-3xl
            "
          />


          <div
            className="
              relative
              z-10

              flex
              flex-col
              items-center
            "
          >
            <CharacterDisplay
              showName
              showTitle
              showLevel
            />


            <button
              type="button"
              onClick={() =>
                setShowCustomizer(
                  true
                )
              }
              className="
                mt-7

                rounded-xl
                border
                border-white/20

                bg-white

                px-6
                py-3

                font-black
                text-black

                transition

                hover:-translate-y-0.5
                hover:bg-zinc-200
              "
            >
              🎨 Customize Character
            </button>


            <div
              className="
                mt-9
                w-full
                max-w-2xl
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
                      text-sm
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-zinc-500
                    "
                  >
                    Character Progress
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-black
                    "
                  >
                    Level {currentLevel}
                  </p>
                </div>


                <div
                  className="
                    text-right
                  "
                >
                  <p
                    className="
                      text-sm
                      text-zinc-400
                    "
                  >
                    {player.totalXP.toLocaleString()} total XP
                  </p>

                  <p
                    className="
                      mt-1
                      font-bold
                      text-yellow-300
                    "
                  >
                    {currentLevel >=
                    MAX_LEVEL
                      ? "Maximum level reached"
                      : `${progress}% to Level ${
                          currentLevel + 1
                        }`}
                  </p>
                </div>
              </div>


              <div
                className="
                  mt-4

                  h-7
                  overflow-hidden

                  rounded-full
                  border
                  border-zinc-700

                  bg-zinc-900

                  p-1
                "
              >
                <div
                  className="
                    h-full
                    rounded-full

                    bg-gradient-to-r
                    from-yellow-700
                    via-yellow-400
                    to-white

                    transition-all
                    duration-500
                  "
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>


        <section
          className="
            mt-8

            grid
            grid-cols-2
            gap-3

            md:gap-5
            xl:grid-cols-4
          "
        >
          <DashboardCard
            icon="🔥"
            title="Current Streak"
            value={
              String(
                currentPerfectDayStreak
              )
            }
            description={
              currentPerfectDayStreak ===
              1
                ? "perfect day in a row"
                : "perfect days in a row"
            }
            accent="orange"
          />


          <DashboardCard
            icon="🏅"
            title="Current Tier"
            value={
              currentTier
            }
            description={
              currentLevel >=
              100
                ? "Prestige progression active"
                : "Cosmetic progression tier"
            }
            accent="cyan"
          />


          <DashboardCard
            icon="⭐"
            title="Prestige Stars"
            value={
              currentLevel >=
              100
                ? prestigeDisplay
                : "☆☆☆☆☆"
            }
            description={
              prestigeStars > 0
                ? `${prestigeStars} of 5 stars earned`
                : "First star unlocks at Level 100"
            }
            accent="yellow"
          />


          <DashboardCard
            icon={
              hasCrown
                ? "👑"
                : "🔒"
            }
            title="Crown"
            value={
              hasCrown
                ? "Unlocked"
                : "Level 1000"
            }
            description={
              hasCrown
                ? "The crown is yours."
                : "The final prestige reward"
            }
            accent="purple"
          />
        </section>


        <section
          className="
            mt-8

            rounded-3xl
            border
            border-zinc-800

            bg-zinc-950

            p-6
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
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-zinc-500
                "
              >
                Next cosmetic reward
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-black
                "
              >
                {currentLevel >=
                MAX_LEVEL
                  ? "All level rewards earned"
                  : `Level ${
                      currentLevel + 1
                    }`}
              </h2>

              <p
                className="
                  mt-2
                  text-zinc-400
                "
              >
                {currentLevel >=
                MAX_LEVEL
                  ? "You reached the Level 1000 cap."
                  : "Keep earning XP to unlock the next character customization item."}
              </p>
            </div>


            <button
              type="button"
              onClick={() =>
                setShowCustomizer(
                  true
                )
              }
              className="
                rounded-xl
                border
                border-zinc-700

                bg-black

                px-5
                py-3

                font-bold

                hover:border-white
              "
            >
              View Collection
            </button>
          </div>
        </section>
      </div>


      <CharacterCustomizer
        open={
          showCustomizer
        }
        onClose={() =>
          setShowCustomizer(
            false
          )
        }
      />
    </main>
  );
}


function DashboardCard({
  icon,

  title,

  value,

  description,

  accent,
}: {
  icon: string;

  title: string;

  value: string;

  description: string;

  accent:
    | "orange"
    | "cyan"
    | "yellow"
    | "purple";
}) {
  const accentStyles = {
    orange:
      "border-orange-500/40 bg-gradient-to-b from-orange-950/55 to-zinc-950 shadow-[0_0_30px_rgba(249,115,22,.10)]",

    cyan:
      "border-cyan-500/40 bg-gradient-to-b from-cyan-950/55 to-zinc-950 shadow-[0_0_30px_rgba(6,182,212,.10)]",

    yellow:
      "border-yellow-500/40 bg-gradient-to-b from-yellow-950/55 to-zinc-950 shadow-[0_0_30px_rgba(234,179,8,.10)]",

    purple:
      "border-purple-500/40 bg-gradient-to-b from-purple-950/55 to-zinc-950 shadow-[0_0_30px_rgba(168,85,247,.10)]",
  };


  return (
    <div
      className={`
        rounded-2xl
        border

        p-3
        text-center

        md:p-5

        ${
          accentStyles[
            accent
          ]
        }
      `}
    >
      <div
        className="
          text-2xl

          md:text-4xl
        "
      >
        {icon}
      </div>


      <h2
        className="
          mt-2
          text-[10px]

          md:mt-3
          md:text-sm
          font-bold
          uppercase
          tracking-[0.16em]
          text-zinc-400
        "
      >
        {title}
      </h2>


      <p
        className="
          mt-2
          text-xl

          md:mt-3
          md:text-3xl
          font-black
        "
      >
        {value}
      </p>


      <p
        className="
          mt-1
          text-xs
          leading-4
          text-zinc-500

          md:mt-2
          md:text-sm
        "
      >
        {description}
      </p>
    </div>
  );
}
