"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import FocusAudioMixer from "@/components/focus/FocusAudioMixer";

import {
  type ModeId,
  type SceneId,
  useFocusTimer,
} from "@/context/FocusTimerContext";

import {
  usePremium,
} from "@/context/PremiumContext";


type Mode = {
  id: ModeId;
  name: string;
  icon: string;
  focus: number;
  rest: number;
  description: string;
};


type Scene = {
  id: SceneId;
  name: string;
  icon: string;
  description: string;
};


const modes: Mode[] = [
  {
    id: "pomodoro",
    name: "Pomodoro",
    icon: "🍅",
    focus: 25,
    rest: 5,
    description:
      "Classic short focus blocks.",
  },
  {
    id: "sprint",
    name: "Sprint",
    icon: "⚡",
    focus: 45,
    rest: 15,
    description:
      "A strong focused burst.",
  },
  {
    id: "deep",
    name: "Deep Work",
    icon: "🧠",
    focus: 90,
    rest: 20,
    description:
      "Long uninterrupted concentration.",
  },
  {
    id: "marathon",
    name: "Marathon",
    icon: "🏔️",
    focus: 180,
    rest: 30,
    description:
      "A three-hour campaign.",
  },
  {
    id: "custom",
    name: "Custom",
    icon: "🛠️",
    focus: 30,
    rest: 10,
    description:
      "Build your own focus cycle.",
  },
];


const scenes: Scene[] = [
  {
    id: "storm",
    name: "Thunderstorm",
    icon: "⛈️",
    description:
      "Dark clouds and lightning.",
  },
  {
    id: "beach",
    name: "Moonlit Beach",
    icon: "🌊",
    description:
      "Waves beneath the moon.",
  },
  {
    id: "forest",
    name: "Living Forest",
    icon: "🌲",
    description:
      "Trees, leaves, and light.",
  },
  {
    id: "cabin",
    name: "Winter Cabin",
    icon: "🔥",
    description:
      "Snowfall and firelight.",
  },
  {
    id: "space",
    name: "Deep Space",
    icon: "🌌",
    description:
      "Stars, nebulae, and planets.",
  },
  {
    id: "lofi",
    name: "Lofi City",
    icon: "🎧",
    description:
      "A neon desk at night.",
  },
];


const dots =
  Array.from(
    {
      length: 42,
    },
    (
      _,
      index
    ) => ({
      id: index,
      left:
        (
          index *
          37
        ) %
        100,
      top:
        (
          index *
          23
        ) %
        100,
      size:
        1 +
        (
          index %
          4
        ),
      opacity:
        0.2 +
        (
          index %
          5
        ) *
          0.15,
    })
  );

export default function FocusPage() {
  const { isPremium } = usePremium();
  const {
    modeId,
    setModeId,
    sceneId,
    setSceneId,
    timerState,
    customFocus,
    setCustomFocus,
    customRest,
    setCustomRest,
    secondsRemaining,
    sessions,
    focusedSeconds,
    focusMinutes,
    restMinutes,
    startTimer,
    pauseTimer,
    resetTimer,
    startBreak,
    finishSession,
  } = useFocusTimer();

  const selectedMode =
    useMemo(
      () =>
        modes.find(
          (
            mode
          ) =>
            mode.id ===
            modeId
        ) ??
        modes[0],
      [
        modeId,
      ]
    );


  const totalSeconds =
    (
      timerState ===
      "break"
        ? restMinutes
        : focusMinutes
    ) *
    60;


  const progress =
    totalSeconds >
    0
      ? Math.max(
          0,
          Math.min(
            100,
            (
              (
                totalSeconds -
                secondsRemaining
              ) /
              totalSeconds
            ) *
              100
          )
        )
      : 0;


  return (
    <main
      className="
        min-h-screen
        overflow-x-hidden
        bg-black
        p-3
        text-white

        sm:p-5
        md:p-8
      "
    >
      <div
        className="
          mx-auto
          w-full
          min-w-0
          max-w-7xl
        "
      >
        <header
          className="
            flex
            min-w-0
            flex-wrap
            items-end
            justify-between
            gap-3

            sm:gap-5
          "
        >
          <div>
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.22em]
                text-zinc-500
              "
            >
              Productivity Hub
            </p>

            <h1
              className="
                mt-1
                text-2xl
                font-black

                sm:mt-2
                sm:text-4xl
              "
            >
              🎯 Focus
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-xs
                leading-relaxed
                text-zinc-400

                sm:mt-3
                sm:text-base
              "
            >
              Choose a focus rhythm and enter an animated environment.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-2

              sm:gap-3
            "
          >
            <StatCard
              label="Sessions"
              value={
                sessions.toLocaleString()
              }
            />

            <StatCard
              label="Today"
              value={
                formatDuration(
                  focusedSeconds
                )
              }
            />
          </div>
        </header>


        <section
          className="
            mt-7
          "
        >
          <div
            className="
              grid
              min-w-0
              items-stretch
              gap-3

              sm:gap-5

              xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.85fr)]
            "
          >
            <div
              className="
                flex
                h-full
                min-w-0
                flex-col
                gap-3

                sm:gap-5
              "
            >
              <div
                className="
                  min-w-0
                  overflow-hidden
                  rounded-2xl

                  sm:rounded-3xl
                  border
                  border-zinc-700
                  bg-zinc-950
                "
              >
                <SceneStage
                  key={isPremium ? "premium-scenes" : "free-scene"}
                  sceneId={
                    sceneId
                  }
                  premium={isPremium}
                >
                  <div
                    className="
                      relative
                      z-30

                      flex
                      min-h-[470px]
                      items-center
                      justify-center

                      p-3
                      text-center

                      sm:min-h-[620px]
                      sm:p-6
                    "
                  >
                    <div
                      className="
                        flex
                        w-full
                        flex-col
                        items-center
                        justify-center

                        [zoom:.72]

                        sm:[zoom:1]
                      "
                    >
                    <p
                      className="
                        text-sm
                        font-black
                        uppercase
                        tracking-[0.24em]
                        text-white/65
                      "
                    >
                      {timerState ===
                      "break"
                        ? "Recovery"
                        : selectedMode.name}
                    </p>

                    <div
                      className="
                        relative
                        mt-3
                        flex
                        aspect-square
                        w-[min(72vw,17rem)]
                        max-w-full
                        items-center
                        justify-center
                        rounded-full

                        sm:mt-5
                        sm:h-80
                        sm:w-80
                        border
                        border-white/15
                        bg-black/35
                        backdrop-blur-xl
                        shadow-[0_0_80px_rgba(0,0,0,.45)]
                      "
                    >
                      <svg
                        className="
                          absolute
                          inset-0
                          h-full
                          w-full
                          -rotate-90
                        "
                        viewBox="0 0 320 320"
                        aria-hidden="true"
                      >
                        <circle
                          cx="160"
                          cy="160"
                          r="142"
                          fill="none"
                          stroke="rgba(255,255,255,.10)"
                          strokeWidth="10"
                        />

                        <circle
                          cx="160"
                          cy="160"
                          r="142"
                          fill="none"
                          stroke="rgba(255,255,255,.95)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={892}
                          strokeDashoffset={
                            892 -
                            (
                              progress /
                              100
                            ) *
                              892
                          }
                          className="
                            transition-all
                            duration-700
                            ease-out
                          "
                        />
                      </svg>

                      <div
                        className="
                          relative
                          z-10
                          text-center
                        "
                      >
                        <AnimatedTimerText
                          seconds={
                            secondsRemaining
                          }
                        />

                        <p
                          className="
                            mt-1.5
                            text-[8px]
                            font-black
                            uppercase
                            tracking-[0.16em]

                            min-[390px]:text-[9px]

                            sm:mt-3
                            sm:text-xs
                            sm:tracking-[0.22em]
                            text-white/50
                          "
                        >
                          {Math.round(
                            progress
                          )}% complete
                        </p>
                      </div>
                    </div>


                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        justify-center
                        gap-2

                        sm:mt-7
                        sm:gap-3
                      "
                    >
                      {timerState ===
                        "running" ||
                      timerState ===
                        "break" ? (
                        <button
                          type="button"
                          onClick={
                            pauseTimer
                          }
                          className="
                            rounded-lg
                            bg-white
                            px-4
                            py-2
                            text-xs
                            font-black
                            text-black

                            sm:rounded-xl
                            sm:px-7
                            sm:py-3
                            sm:text-base
                          "
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={
                            startTimer
                          }
                          className="
                            rounded-lg
                            bg-white
                            px-4
                            py-2
                            text-xs
                            font-black
                            text-black

                            sm:rounded-xl
                            sm:px-7
                            sm:py-3
                            sm:text-base
                          "
                        >
                          {timerState ===
                          "paused"
                            ? "Resume"
                            : "Start Focus"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={
                          resetTimer
                        }
                        className="
                          rounded-lg
                          border
                          border-white/30
                          bg-black/30
                          px-4
                          py-2
                          text-xs
                          font-black

                          sm:rounded-xl
                          sm:px-6
                          sm:py-3
                          sm:text-base
                        "
                      >
                        Reset
                      </button>
                    </div>
                    </div>
                  </div>
                </SceneStage>
              </div>


              <div
                className="
                  flex-1
                  min-h-[220px]
                  [&>section]:h-full
                "
              >
                <FocusAudioMixer
                  sceneId={
                    sceneId
                  }
                />
              </div>
            </div>


            <aside
              className="
                grid
                h-full
                min-w-0
                grid-rows-[auto_1fr_auto]
                gap-3

                sm:gap-5
              "
            >
              <Panel
                title="Focus Mode"
                description="Choose the rhythm that fits the work."
              >
                <div
                  className="
                    grid
                    gap-2
                  "
                >
                  {modes.map(
                    (
                      mode
                    ) => (
                      <button
                        type="button"
                        key={
                          mode.id
                        }
                        onClick={() => {
                          setModeId(
                            mode.id
                          );

                          resetTimer();
                        }}
                        className={`
                          min-w-0
                          rounded-lg
                          border
                          p-2
                          text-left

                          sm:rounded-xl
                          sm:p-3

                          ${
                            modeId ===
                            mode.id
                              ? "border-white bg-white text-black"
                              : "border-zinc-800 bg-black hover:border-zinc-500"
                          }
                        `}
                      >
                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            justify-between
                            gap-2

                            sm:gap-3
                          "
                        >
                          <span
                            className="
                              min-w-0
                              truncate
                              text-[11px]
                              font-black

                              sm:text-base
                            "
                          >
                            {mode.icon} {mode.name}
                          </span>

                          <span
                            className="
                              shrink-0
                              text-[9px]
                              font-bold
                              opacity-65

                              sm:text-xs
                            "
                          >
                            {mode.focus}/{mode.rest}
                          </span>
                        </div>

                        <p
                          className="
                            mt-0.5
                            line-clamp-2
                            text-[9px]
                            leading-tight
                            opacity-65

                            sm:mt-1
                            sm:text-xs
                          "
                        >
                          {mode.description}
                        </p>
                      </button>
                    )
                  )}
                </div>


                {modeId ===
                  "custom" && (
                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <NumberInput
                      label="Focus"
                      value={
                        customFocus
                      }
                      min={
                        1
                      }
                      max={
                        360
                      }
                      onChange={
                        setCustomFocus
                      }
                    />

                    <NumberInput
                      label="Break"
                      value={
                        customRest
                      }
                      min={
                        1
                      }
                      max={
                        120
                      }
                      onChange={
                        setCustomRest
                      }
                    />
                  </div>
                )}
              </Panel>


              <div
                className="
                  h-full
                  [&>section]:h-full
                "
              >
                <Panel
                  title={isPremium ? "Environment" : "Premium environments"}
                  description={isPremium ? "Choose your animated visual space." : "Your focus timer is free. Animated backgrounds are part of Premium."}
                >
                  {!isPremium ? (
                    <div className="rounded-xl border border-amber-100/10 bg-gradient-to-br from-amber-200/[.08] to-violet-300/[.05] p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌌</span>
                        <div>
                          <p className="font-black">Focus scenes are Premium</p>
                          <p className="mt-1 text-xs leading-relaxed text-zinc-500">Pomodoro modes, custom focus and break lengths, and music stay free.</p>
                        </div>
                      </div>
                      <Link href="/shop" className="mt-4 inline-flex rounded-lg border border-amber-100/15 bg-amber-100/[.08] px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-100/[.14]">See Premium plans →</Link>
                    </div>
                  ) : (
                  <div
                    className="
                      grid
                      h-full
                      grid-cols-2
                      content-stretch
                      gap-2
                    "
                  >
                    {scenes.map(
                      (
                        scene
                      ) => (
                        <button
                          type="button"
                          key={
                            scene.id
                          }
                          onClick={() =>
                            setSceneId(
                              scene.id
                            )
                          }
                          className={`
                            min-h-0
                            min-w-0
                            rounded-lg

                            sm:min-h-24
                            sm:rounded-xl
                            transition-[border-color,background-color,box-shadow]
                            duration-300
                            border
                            p-2
                            text-left

                            sm:p-3

                            ${
                              sceneId ===
                              scene.id
                                ? "border-cyan-300 bg-cyan-950/45 shadow-[0_0_24px_rgba(103,232,249,.14)]"
                                : "border-zinc-800 bg-black/70 hover:border-zinc-600"
                            }
                          `}
                        >
                          <span
                            className="
                              block
                              min-w-0
                              break-words
                              text-[10px]
                              font-black
                              leading-tight

                              sm:text-base
                            "
                          >
                            {scene.icon} {scene.name}
                          </span>

                          <p
                            className="
                              mt-0.5
                              line-clamp-2
                              text-[8px]
                              leading-tight
                              text-zinc-500

                              sm:mt-1
                              sm:text-xs
                            "
                          >
                            {scene.description}
                          </p>
                        </button>
                      )
                    )}
                  </div>
                  )}
                </Panel>
              </div>


              <div>
                <Panel
                  title="Session Plan"
                  description="Your current focus and break cycle."
                >
                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <InfoBox
                      label="Focus"
                      value={`${focusMinutes} min`}
                    />

                    <InfoBox
                      label="Break"
                      value={`${restMinutes} min`}
                    />
                  </div>
                </Panel>
              </div>
            </aside>
          </div>
        </section>
      </div>


      {timerState ===
        "complete" && (
        <div
          className="
            fixed
            inset-0
            z-[300]
            flex
            items-center
            justify-center
            bg-black/85
            p-5
          "
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-3xl
              border
              border-zinc-700
              bg-zinc-950
              p-7
              text-center
            "
          >
            <div
              className="
                text-6xl
              "
            >
              🏆
            </div>

            <h2
              className="
                mt-4
                text-3xl
                font-black
              "
            >
              Session Complete
            </h2>

            <p
              className="
                mt-3
                text-zinc-400
              "
            >
              You completed {focusMinutes} focused minutes in {selectedMode.name}.
            </p>

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-3
              "
            >
              <button
                type="button"
                onClick={
                  finishSession
                }
                className="
                  rounded-xl
                  border
                  border-zinc-700
                  px-4
                  py-3
                  font-black
                "
              >
                Finish
              </button>

              <button
                type="button"
                onClick={
                  startBreak
                }
                className="
                  rounded-xl
                  border
                  border-cyan-700
                  bg-cyan-950/40
                  px-4
                  py-3
                  font-black
                  text-cyan-200
                "
              >
                Start Break
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


function SceneStage({
  sceneId,
  premium,
  children,
}: {
  sceneId:
    SceneId;

  premium:
    boolean;

  children:
    React.ReactNode;
}) {
  const [
    previousSceneId,
    setPreviousSceneId
  ] =
    useState<SceneId | null>(
      null
    );

  const [
    sceneVisible,
    setSceneVisible
  ] =
    useState(true);

  const lastSceneRef =
    useRef<SceneId>(
      sceneId
    );


  useEffect(() => {
    if (!premium) {
      lastSceneRef.current = sceneId;
      return;
    }

    if (
      lastSceneRef.current ===
      sceneId
    ) {
      return;
    }

    const outgoingScene =
      lastSceneRef.current;

    lastSceneRef.current =
      sceneId;

    setPreviousSceneId(
      outgoingScene
    );

    setSceneVisible(
      false
    );

    const firstFrame =
      window.requestAnimationFrame(
        () => {
          const secondFrame =
            window.requestAnimationFrame(
              () => {
                setSceneVisible(
                  true
                );
              }
            );

          return () =>
            window.cancelAnimationFrame(
              secondFrame
            );
        }
      );

    const cleanupTimer =
      window.setTimeout(
        () => {
          setPreviousSceneId(
            null
          );
        },
        1100
      );

    return () => {
      window.cancelAnimationFrame(
        firstFrame
      );

      window.clearTimeout(
        cleanupTimer
      );
    };
  }, [
    sceneId,
    premium,
  ]);


  if (!premium) {
    return (
      <div className="relative min-h-[470px] overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,.11),transparent_55%),linear-gradient(135deg,#111817,#090c0d_70%)] sm:min-h-[620px]">
        {children}
      </div>
    );
  }


  return (
    <div
      className="
        relative
        min-h-[470px]
        overflow-hidden
        bg-black

        sm:min-h-[620px]
      "
    >
      {previousSceneId && (
        <div
          className={`
            absolute
            inset-0
            transition-opacity
            duration-1000
            ease-in-out

            ${
              sceneVisible
                ? "opacity-0"
                : "opacity-100"
            }
          `}
        >
          <SceneVisual
            sceneId={
              previousSceneId
            }
          />
        </div>
      )}


      <div
        className={`
          absolute
          inset-0
          transition-opacity
          duration-1000
          ease-in-out

          ${
            sceneVisible
              ? "opacity-100"
              : "opacity-0"
          }
        `}
      >
        <SceneVisual
          sceneId={
            sceneId
          }
        />
      </div>


      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-20
          bg-black/20
        "
      />


      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-20
          overflow-hidden
        "
      >
        {[
          [12, 18, 2],
          [28, 72, 3],
          [43, 34, 2],
          [61, 14, 3],
          [76, 62, 2],
          [88, 28, 3],
          [18, 48, 2],
          [70, 42, 2],
        ].map(
          (
            particle,
            index
          ) => (
            <span
              key={
                index
              }
              className="
                absolute
                animate-pulse
                rounded-full
                bg-white/25
                blur-[1px]
              "
              style={{
                left:
                  `${particle[0]}%`,
                top:
                  `${particle[1]}%`,
                width:
                  `${particle[2]}px`,
                height:
                  `${particle[2]}px`,
                animationDelay:
                  `${index * 0.45}s`,
                animationDuration:
                  `${4 + (index % 4)}s`,
              }}
            />
          )
        )}
      </div>


      {children}
    </div>
  );
}


function SceneVisual({
  sceneId,
}: {
  sceneId:
    SceneId;
}) {
  const background =
    sceneId ===
      "storm"
      ? "from-slate-500 via-slate-950 to-black"
      : sceneId ===
        "beach"
      ? "from-indigo-950 via-blue-950 to-cyan-950"
      : sceneId ===
        "forest"
      ? "from-emerald-950 via-green-950 to-black"
      : sceneId ===
        "cabin"
      ? "from-slate-900 via-amber-950 to-black"
      : sceneId ===
        "space"
      ? "from-violet-950 via-slate-950 to-black"
      : "from-indigo-950 via-fuchsia-950 to-slate-950";


  return (
    <div
      className={`
        absolute
        inset-0
        overflow-hidden
        bg-gradient-to-b
        ${background}
      `}
    >
      <div
        className="
          absolute
          inset-0
          animate-[pulse_12s_ease-in-out_infinite]
          bg-white/[0.015]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-gradient-to-br
          from-white/[0.025]
          via-transparent
          to-black/15
        "
      />

      {sceneId ===
        "storm" && (
        <StormScene />
      )}

      {sceneId ===
        "beach" && (
        <BeachScene />
      )}

      {sceneId ===
        "forest" && (
        <ForestScene />
      )}

      {sceneId ===
        "cabin" && (
        <CabinScene />
      )}

      {sceneId ===
        "space" && (
        <SpaceScene />
      )}

      {sceneId ===
        "lofi" && (
        <LofiScene />
      )}
    </div>
  );
}


function StormScene() {
  return (
    <>
      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="rainSky"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#475569"
            />

            <stop
              offset="55%"
              stopColor="#0f172a"
            />

            <stop
              offset="100%"
              stopColor="#020617"
            />
          </linearGradient>

          <filter
            id="rainBlur"
          >
            <feGaussianBlur
              stdDeviation="8"
            />
          </filter>
        </defs>

        <rect
          width="1000"
          height="620"
          fill="url(#rainSky)"
        />

        <g
          opacity="0.35"
          filter="url(#rainBlur)"
        >
          <ellipse
            cx="220"
            cy="115"
            rx="180"
            ry="45"
            fill="#cbd5e1"
          >
            <animate
              attributeName="cx"
              values="160;300;160"
              dur="18s"
              repeatCount="indefinite"
            />
          </ellipse>

          <ellipse
            cx="720"
            cy="85"
            rx="210"
            ry="55"
            fill="#94a3b8"
          >
            <animate
              attributeName="cx"
              values="760;630;760"
              dur="22s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        <g
          opacity="0.45"
        >
          {Array.from({
            length: 36,
          }).map(
            (
              _,
              index
            ) => {
              const x =
                (
                  index *
                  73
                ) %
                1000;

              const delay =
                (
                  index %
                  10
                ) *
                0.18;

              return (
                <line
                  key={
                    index
                  }
                  x1={
                    x
                  }
                  y1="-80"
                  x2={
                    x - 18
                  }
                  y2="-10"
                  stroke="#bae6fd"
                  strokeWidth={
                    index %
                    3 ===
                    0
                      ? 3
                      : 2
                  }
                  strokeLinecap="round"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="-60 760"
                    dur={`${1.4 + (index % 5) * 0.18}s`}
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </line>
              );
            }
          )}
        </g>

        <g
          opacity="0.5"
        >
          <rect
            x="90"
            y="410"
            width="110"
            height="210"
            fill="#020617"
          />

          <rect
            x="240"
            y="360"
            width="95"
            height="260"
            fill="#020617"
          />

          <rect
            x="390"
            y="435"
            width="135"
            height="185"
            fill="#020617"
          />

          <rect
            x="590"
            y="325"
            width="115"
            height="295"
            fill="#020617"
          />

          <rect
            x="760"
            y="390"
            width="150"
            height="230"
            fill="#020617"
          />
        </g>

        <g
          fill="#fef3c7"
          opacity="0.55"
        >
          {[
            [125, 455],
            [155, 500],
            [270, 410],
            [295, 475],
            [430, 490],
            [470, 530],
            [625, 385],
            [665, 455],
            [805, 445],
            [855, 505],
          ].map(
            (
              point,
              index
            ) => (
              <rect
                key={
                  index
                }
                x={
                  point[0]
                }
                y={
                  point[1]
                }
                width="12"
                height="18"
                rx="2"
              >
                <animate
                  attributeName="opacity"
                  values="0.2;0.85;0.2"
                  dur={`${2.8 + (index % 4)}s`}
                  begin={`${index * 0.22}s`}
                  repeatCount="indefinite"
                />
              </rect>
            )
          )}
        </g>
      </svg>

      <div
        className="
          absolute
          inset-[7%]
          rounded-[2rem]
          border-[14px]
          border-slate-950/90
          shadow-[inset_0_0_80px_rgba(0,0,0,.65)]
        "
      />

      <div
        className="
          absolute
          bottom-[10%]
          left-[14%]
          h-24
          w-44
          animate-pulse
          rounded-full
          bg-amber-200/10
          blur-2xl
        "
      />


      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <rect
          width="1000"
          height="620"
          fill="#e0f2fe"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;0;0.75;0.08;0.5;0"
            keyTimes="0;0.72;0.74;0.76;0.79;1"
            dur="6.5s"
            repeatCount="indefinite"
          />
        </rect>

        <path
          d="
            M760 30
            L690 190
            L748 175
            L650 370
            L710 350
            L610 575
          "
          fill="none"
          stroke="#f0f9ff"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;0;1;0.1;0.8;0"
            keyTimes="0;0.72;0.74;0.76;0.79;1"
            dur="6.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </>
  );
}


function BeachScene() {
  return (
    <>
      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="beachSky"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#1e1b4b"
            />

            <stop
              offset="52%"
              stopColor="#172554"
            />

            <stop
              offset="100%"
              stopColor="#164e63"
            />
          </linearGradient>

          <radialGradient
            id="moonGlow"
          >
            <stop
              offset="0%"
              stopColor="#fef9c3"
              stopOpacity="1"
            />

            <stop
              offset="55%"
              stopColor="#fef08a"
              stopOpacity="0.7"
            />

            <stop
              offset="100%"
              stopColor="#fef08a"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        <rect
          width="1000"
          height="620"
          fill="url(#beachSky)"
        />

        <circle
          cx="180"
          cy="115"
          r="95"
          fill="url(#moonGlow)"
        >
          <animate
            attributeName="r"
            values="88;102;88"
            dur="7s"
            repeatCount="indefinite"
          />
        </circle>

        <circle
          cx="180"
          cy="115"
          r="48"
          fill="#fefce8"
        />

        <path
          d="
            M0 430
            C180 390 320 475 500 430
            C690 380 820 465 1000 420
            L1000 620
            L0 620
            Z
          "
          fill="#1d4ed8"
          opacity="0.6"
        >
          <animate
            attributeName="d"
            values="
              M0 430 C180 390 320 475 500 430 C690 380 820 465 1000 420 L1000 620 L0 620 Z;
              M0 420 C180 470 320 395 500 440 C690 480 820 390 1000 435 L1000 620 L0 620 Z;
              M0 430 C180 390 320 475 500 430 C690 380 820 465 1000 420 L1000 620 L0 620 Z
            "
            dur="8s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="
            M0 485
            C210 445 340 520 540 475
            C710 440 870 515 1000 465
            L1000 620
            L0 620
            Z
          "
          fill="#67e8f9"
          opacity="0.34"
        >
          <animate
            attributeName="d"
            values="
              M0 485 C210 445 340 520 540 475 C710 440 870 515 1000 465 L1000 620 L0 620 Z;
              M0 470 C210 530 340 445 540 490 C710 525 870 450 1000 480 L1000 620 L0 620 Z;
              M0 485 C210 445 340 520 540 475 C710 440 870 515 1000 465 L1000 620 L0 620 Z
            "
            dur="6s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="
            M0 570
            C220 545 430 590 650 560
            C780 545 900 565 1000 550
            L1000 620
            L0 620
            Z
          "
          fill="#fde68a"
          opacity="0.55"
        />

        <g
          fill="none"
          stroke="#e0f2fe"
          strokeWidth="4"
          opacity="0.55"
        >
          <path
            d="M690 140 Q710 120 730 140"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;80 -12;0 0"
              dur="14s"
              repeatCount="indefinite"
            />
          </path>

          <path
            d="M735 155 Q755 135 775 155"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;65 -8;0 0"
              dur="16s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    </>
  );
}


function ForestScene() {
  return (
    <>
      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="forestSky"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#064e3b"
            />

            <stop
              offset="100%"
              stopColor="#020617"
            />
          </linearGradient>

          <linearGradient
            id="sunBeam"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#fef3c7"
              stopOpacity="0.24"
            />

            <stop
              offset="100%"
              stopColor="#fef3c7"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <rect
          width="1000"
          height="620"
          fill="url(#forestSky)"
        />

        <polygon
          points="220,0 400,0 650,620 460,620"
          fill="url(#sunBeam)"
        >
          <animate
            attributeName="opacity"
            values="0.25;0.6;0.25"
            dur="9s"
            repeatCount="indefinite"
          />
        </polygon>

        {[
          [80, 360, 45, 280],
          [210, 300, 52, 340],
          [375, 350, 42, 290],
          [600, 285, 58, 355],
          [770, 345, 48, 295],
          [915, 310, 54, 330],
        ].map(
          (
            tree,
            index
          ) => (
            <g
              key={
                index
              }
              transform={`translate(${tree[0]} ${tree[1]})`}
            >
              <rect
                x="-12"
                y="0"
                width="24"
                height={
                  tree[3]
                }
                fill="#022c22"
              />

              <circle
                cx="0"
                cy="-22"
                r={
                  tree[2]
                }
                fill="#166534"
                opacity="0.75"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-2 0 0;2 0 0;-2 0 0"
                  dur={`${5 + index}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )
        )}

        {Array.from({
          length: 16,
        }).map(
          (
            _,
            index
          ) => (
            <text
              key={
                index
              }
              x="-40"
              y="-30"
              fontSize={
                18 +
                (
                  index %
                  3
                ) *
                  4
              }
            >
              {index %
              2 ===
              0
                ? "🍂"
                : "🍃"}

              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="1100 700"
                dur={`${8 + (index % 5)}s`}
                begin={`${index * -0.55}s`}
                repeatCount="indefinite"
              />

              <animateTransform
                attributeName="transform"
                additive="sum"
                type="rotate"
                from="0"
                to="720"
                dur={`${7 + (index % 4)}s`}
                repeatCount="indefinite"
              />
            </text>
          )
        )}
      </svg>
    </>
  );
}


function CabinScene() {
  return (
    <>
      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="cabinSky"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#334155"
            />

            <stop
              offset="100%"
              stopColor="#020617"
            />
          </linearGradient>

          <radialGradient
            id="fireGlow"
          >
            <stop
              offset="0%"
              stopColor="#f97316"
              stopOpacity="0.85"
            />

            <stop
              offset="100%"
              stopColor="#f97316"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>

        <rect
          width="1000"
          height="620"
          fill="#1c1917"
        />

        <rect
          x="70"
          y="45"
          width="860"
          height="390"
          rx="30"
          fill="url(#cabinSky)"
          stroke="#451a03"
          strokeWidth="30"
        />

        {Array.from({
          length: 40,
        }).map(
          (
            _,
            index
          ) => (
            <circle
              key={
                index
              }
              cx={
                (
                  index *
                  79
                ) %
                1000
              }
              cy="-20"
              r={
                2 +
                (
                  index %
                  3
                )
              }
              fill="#ffffff"
              opacity="0.7"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to={`${index % 2 === 0 ? 45 : -35} 700`}
                dur={`${5 + (index % 5)}s`}
                begin={`${index * -0.18}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        )}

        <circle
          cx="240"
          cy="505"
          r="160"
          fill="url(#fireGlow)"
        >
          <animate
            attributeName="r"
            values="145;175;145"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>

        <rect
          x="110"
          y="430"
          width="270"
          height="170"
          rx="36"
          fill="#0c0a09"
          stroke="#451a03"
          strokeWidth="20"
        />

        <path
          d="
            M240 565
            C195 530 200 470 235 450
            C235 485 275 495 260 455
            C310 490 305 540 240 565
          "
          fill="#fb923c"
        >
          <animate
            attributeName="d"
            values="
              M240 565 C195 530 200 470 235 450 C235 485 275 495 260 455 C310 490 305 540 240 565;
              M240 565 C205 530 215 485 245 445 C230 495 280 500 265 465 C300 495 300 540 240 565;
              M240 565 C195 530 200 470 235 450 C235 485 275 495 260 455 C310 490 305 540 240 565
            "
            dur="1.7s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="
            M240 555
            C220 525 228 495 245 475
            C252 505 272 515 258 485
            C280 510 275 540 240 555
          "
          fill="#fef08a"
        >
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="1.1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </>
  );
}


function SpaceScene() {
  return (
    <>
      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient
            id="spacePlanet"
          >
            <stop
              offset="0%"
              stopColor="#bfdbfe"
            />

            <stop
              offset="45%"
              stopColor="#3b82f6"
            />

            <stop
              offset="100%"
              stopColor="#4c1d95"
            />
          </radialGradient>

          <linearGradient
            id="nebula"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#ec4899"
              stopOpacity="0"
            />

            <stop
              offset="45%"
              stopColor="#a855f7"
              stopOpacity="0.3"
            />

            <stop
              offset="100%"
              stopColor="#22d3ee"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <rect
          width="1000"
          height="620"
          fill="#020617"
        />

        <ellipse
          cx="430"
          cy="310"
          rx="480"
          ry="110"
          fill="url(#nebula)"
          transform="rotate(-12 430 310)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-12 430 310;5 430 310;-12 430 310"
            dur="28s"
            repeatCount="indefinite"
          />
        </ellipse>

        {dots.map(
          (
            dot
          ) => (
            <circle
              key={
                dot.id
              }
              cx={
                dot.left *
                10
              }
              cy={
                dot.top *
                6.2
              }
              r={
                dot.size
              }
              fill="#ffffff"
              opacity={
                dot.opacity
              }
            >
              <animate
                attributeName="opacity"
                values={`${dot.opacity * 0.4};${Math.min(1, dot.opacity + 0.35)};${dot.opacity * 0.4}`}
                dur={`${2.4 + (dot.id % 5)}s`}
                begin={`${dot.id * -0.07}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        )}

        <g>
          <circle
            cx="800"
            cy="145"
            r="110"
            fill="url(#spacePlanet)"
          />

          <ellipse
            cx="800"
            cy="145"
            rx="160"
            ry="34"
            fill="none"
            stroke="#c4b5fd"
            strokeWidth="8"
            opacity="0.55"
            transform="rotate(-18 800 145)"
          />

          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -12;0 0"
            dur="7s"
            repeatCount="indefinite"
          />
        </g>

        <circle
          cx="-40"
          cy="170"
          r="3"
          fill="#ffffff"
        >
          <animate
            attributeName="cx"
            from="-40"
            to="1040"
            dur="10s"
            repeatCount="indefinite"
          />

          <animate
            attributeName="cy"
            from="170"
            to="380"
            dur="10s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </>
  );
}


function LofiScene() {
  return (
    <>
      <svg
        className="
          absolute
          inset-0
          h-full
          w-full
        "
        viewBox="0 0 1000 620"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="lofiSky"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#4c1d95"
            />

            <stop
              offset="55%"
              stopColor="#312e81"
            />

            <stop
              offset="100%"
              stopColor="#020617"
            />
          </linearGradient>
        </defs>

        <rect
          width="1000"
          height="620"
          fill="url(#lofiSky)"
        />

        <rect
          x="65"
          y="45"
          width="870"
          height="355"
          rx="28"
          fill="#111827"
          stroke="#312e81"
          strokeWidth="28"
        />

        <g
          opacity="0.8"
        >
          {[
            [110, 250, 95],
            [230, 210, 135],
            [380, 265, 80],
            [505, 185, 160],
            [700, 235, 110],
            [835, 195, 150],
          ].map(
            (
              building,
              index
            ) => (
              <g
                key={
                  index
                }
              >
                <rect
                  x={
                    building[0]
                  }
                  y={
                    400 -
                    building[1]
                  }
                  width={
                    building[2]
                  }
                  height={
                    building[1]
                  }
                  fill="#020617"
                />

                <rect
                  x={
                    building[0] +
                    18
                  }
                  y={
                    420 -
                    building[1]
                  }
                  width="12"
                  height="22"
                  fill={
                    index %
                    2 ===
                    0
                      ? "#67e8f9"
                      : "#f0abfc"
                  }
                >
                  <animate
                    attributeName="opacity"
                    values="0.25;1;0.25"
                    dur={`${3 + index}s`}
                    repeatCount="indefinite"
                  />
                </rect>
              </g>
            )
          )}
        </g>

        <rect
          x="80"
          y="445"
          width="840"
          height="150"
          rx="25"
          fill="#78350f"
          opacity="0.85"
        />

        <rect
          x="145"
          y="470"
          width="150"
          height="80"
          rx="12"
          fill="#164e63"
          opacity="0.65"
        />

        <circle
          cx="790"
          cy="490"
          r="58"
          fill="#27272a"
          stroke="#09090b"
          strokeWidth="14"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 790 490"
            to="360 790 490"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>

        <circle
          cx="790"
          cy="490"
          r="12"
          fill="#f0abfc"
        />

        <rect
          x="150"
          y="80"
          width="10"
          height="95"
          fill="#67e8f9"
        >
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>

        <rect
          x="730"
          y="120"
          width="130"
          height="10"
          fill="#f0abfc"
        >
          <animate
            attributeName="opacity"
            values="1;0.35;1"
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </>
  );
}


function Panel({
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
    <section
      className="
        min-w-0
        rounded-xl
        border
        border-white/10
        bg-zinc-950/75
        p-3

        sm:rounded-2xl
        sm:p-5
        backdrop-blur-xl
        shadow-[0_18px_60px_rgba(0,0,0,.22)]
      "
    >
      <h2
        className="
          text-base
          font-black

          sm:text-xl
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-0.5
          text-[10px]
          leading-tight
          text-zinc-500

          sm:mt-1
          sm:text-sm
        "
      >
        {description}
      </p>

      <div
        className="
          mt-2

          sm:mt-4
        "
      >
        {children}
      </div>
    </section>
  );
}


function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label:
    string;

  value:
    number;

  min:
    number;

  max:
    number;

  onChange:
    (
      value:
        number
    ) => void;
}) {
  return (
    <label>
      <span
        className="
          text-[10px]
          font-black

          sm:text-sm
        "
      >
        {label}
      </span>

      <input
        type="number"
        value={
          value
        }
        min={
          min
        }
        max={
          max
        }
        onChange={(
          event
        ) =>
          onChange(
            Math.max(
              min,
              Math.min(
                max,
                Number(
                  event.target.value
                )
              )
            )
          )
        }
        className="
          mt-1
          w-full
          min-w-0
          rounded-lg
          border
          border-zinc-700
          bg-black
          p-2
          text-xs

          sm:mt-2
          sm:rounded-xl
          sm:p-3
          sm:text-base
        "
      />
    </label>
  );
}


function StatCard({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-zinc-700
        bg-zinc-950
        px-3
        py-2
        text-center

        sm:px-4
        sm:py-3
        sm:text-right
      "
    >
      <p
        className="
          text-[8px]
          font-black
          uppercase
          tracking-wide
          text-zinc-500

          sm:text-xs
          sm:tracking-wider
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          font-mono
          text-base

          sm:text-lg
          font-black
        "
      >
        {value}
      </p>
    </div>
  );
}


function InfoBox({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-lg
        border
        border-zinc-800
        bg-black
        p-2

        sm:rounded-xl
        sm:p-4
      "
    >
      <p
        className="
          text-xs
          font-black
          uppercase
          tracking-wider
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          text-sm
          font-black

          sm:mt-2
          sm:text-xl
        "
      >
        {value}
      </p>
    </div>
  );
}


function AnimatedTimerText({
  seconds,
}: {
  seconds:
    number;
}) {
  const formatted =
    formatTime(
      seconds
    );

  const characterRefs =
    useRef<
      Array<
        HTMLSpanElement | null
      >
    >([]);

  const previousValueRef =
    useRef(
      formatted
    );


  useEffect(() => {
    const previous =
      previousValueRef.current;

    characterRefs.current.forEach(
      (
        element,
        index
      ) => {
        if (
          !element ||
          previous[index] ===
          formatted[index]
        ) {
          return;
        }

        element.animate(
          [
            {
              transform:
                "translateY(-28%)",
              opacity:
                0.15,
            },
            {
              transform:
                "translateY(10%)",
              opacity:
                0.72,
              offset:
                0.55,
            },
            {
              transform:
                "translateY(0)",
              opacity:
                1,
            },
          ],
          {
            duration:
              260,
            easing:
              "cubic-bezier(0.22, 1, 0.36, 1)",
          }
        );
      }
    );

    previousValueRef.current =
      formatted;
  }, [
    formatted,
  ]);


  const usesHours =
    formatted.length >
    5;


  return (
    <p
      className={`
        flex
        items-center
        justify-center
        whitespace-nowrap
        font-mono
        font-black
        tracking-[-0.06em]

        ${
          usesHours
            ? "text-[clamp(1.6rem,8vw,3rem)] sm:text-5xl"
            : "text-[clamp(2.25rem,11vw,4.5rem)] sm:text-7xl"
        }
      `}
      aria-label={
        formatted
      }
    >
      {formatted
        .split("")
        .map(
          (
            character,
            index
          ) => (
            <span
              key={
                index
              }
              ref={(
                element
              ) => {
                characterRefs.current[
                  index
                ] =
                  element;
              }}
              className={`
                inline-block
                min-w-[0.58em]
                text-center
                tabular-nums

                ${
                  character ===
                  ":"
                    ? "min-w-[0.34em] text-white/75"
                    : ""
                }
              `}
            >
              {character}
            </span>
          )
        )}
    </p>
  );
}


function formatTime(
  totalSeconds:
    number
) {
  const safe =
    Math.max(
      0,
      totalSeconds
    );

  const hours =
    Math.floor(
      safe /
        3600
    );

  const minutes =
    Math.floor(
      (
        safe %
        3600
      ) /
        60
    );

  const seconds =
    safe %
    60;

  const values =
    hours >
    0
      ? [
          hours,
          minutes,
          seconds,
        ]
      : [
          minutes,
          seconds,
        ];

  return values
    .map(
      (
        value
      ) =>
        String(
          value
        ).padStart(
          2,
          "0"
        )
    )
    .join(":");
}


function formatDuration(
  totalSeconds:
    number
) {
  const hours =
    Math.floor(
      totalSeconds /
        3600
    );

  const minutes =
    Math.floor(
      (
        totalSeconds %
        3600
      ) /
        60
    );

  return hours >
    0
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;
}
