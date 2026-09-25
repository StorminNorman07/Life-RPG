"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";


export type ModeId =
  | "pomodoro"
  | "sprint"
  | "deep"
  | "marathon"
  | "custom";


export type SceneId =
  | "storm"
  | "beach"
  | "forest"
  | "cabin"
  | "space"
  | "lofi";


export type TimerState =
  | "idle"
  | "running"
  | "paused"
  | "break"
  | "complete";


type TimerPhase =
  | "focus"
  | "break";


type FocusTimerContextValue = {
  modeId: ModeId;
  setModeId: Dispatch<SetStateAction<ModeId>>;
  sceneId: SceneId;
  setSceneId: Dispatch<SetStateAction<SceneId>>;
  timerState: TimerState;
  customFocus: number;
  setCustomFocus: Dispatch<SetStateAction<number>>;
  customRest: number;
  setCustomRest: Dispatch<SetStateAction<number>>;
  secondsRemaining: number;
  sessions: number;
  focusedSeconds: number;
  focusMinutes: number;
  restMinutes: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  startBreak: () => void;
  finishSession: () => void;
};


type SavedTimer = {
  modeId?: ModeId;
  sceneId?: SceneId;
  timerState?: TimerState;
  phase?: TimerPhase;
  customFocus?: number;
  customRest?: number;
  secondsRemaining?: number;
  endAt?: number | null;
};


const TIMER_STORAGE_KEY =
  "life-rpg-focus-timer";


const modeLengths:
  Record<
    Exclude<ModeId, "custom">,
    {
      focus: number;
      rest: number;
    }
  > = {
  pomodoro: {
    focus: 25,
    rest: 5,
  },
  sprint: {
    focus: 45,
    rest: 15,
  },
  deep: {
    focus: 90,
    rest: 20,
  },
  marathon: {
    focus: 180,
    rest: 30,
  },
};


const FocusTimerContext =
  createContext<FocusTimerContextValue | null>(
    null
  );


function reportAchievementMetric(
  metric: string,
  value: number,
  mode:
    | "set"
    | "increment"
    | "max" =
    "set"
) {
  window.dispatchEvent(
    new CustomEvent(
      "achievement-metric",
      {
        detail: {
          metric,
          value,
          mode,
        },
      }
    )
  );
}


function isModeId(
  value:
    unknown
): value is ModeId {
  return [
    "pomodoro",
    "sprint",
    "deep",
    "marathon",
    "custom",
  ].includes(
    String(value)
  );
}


function isSceneId(
  value:
    unknown
): value is SceneId {
  return [
    "storm",
    "beach",
    "forest",
    "cabin",
    "space",
    "lofi",
  ].includes(
    String(value)
  );
}


function clampMinutes(
  value:
    unknown,
  fallback:
    number
) {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    return fallback;
  }

  return Math.max(
    1,
    Math.min(
      360,
      Math.round(parsed)
    )
  );
}


export function FocusTimerProvider({
  children,
}: {
  children:
    ReactNode;
}) {
  const [
    modeId,
    setModeId,
  ] =
    useState<ModeId>(
      "pomodoro"
    );

  const [
    sceneId,
    setSceneId,
  ] =
    useState<SceneId>(
      "storm"
    );

  const [
    timerState,
    setTimerState,
  ] =
    useState<TimerState>(
      "idle"
    );

  const [
    phase,
    setPhase,
  ] =
    useState<TimerPhase>(
      "focus"
    );

  const [
    customFocus,
    setCustomFocus,
  ] =
    useState(30);

  const [
    customRest,
    setCustomRest,
  ] =
    useState(10);

  const [
    secondsRemaining,
    setSecondsRemaining,
  ] =
    useState(
      25 * 60
    );

  const [
    endAt,
    setEndAt,
  ] =
    useState<number | null>(
      null
    );

  const [
    sessions,
    setSessions,
  ] =
    useState(0);

  const [
    focusedSeconds,
    setFocusedSeconds,
  ] =
    useState(0);

  const [
    hydrated,
    setHydrated,
  ] =
    useState(false);

  const completionHandledRef =
    useRef(false);


  const focusMinutes =
    modeId ===
    "custom"
      ? customFocus
      : modeLengths[
          modeId
        ].focus;


  const restMinutes =
    modeId ===
    "custom"
      ? customRest
      : modeLengths[
          modeId
        ].rest;


  useEffect(() => {
    try {
      const savedTimer =
        JSON.parse(
          localStorage.getItem(
            TIMER_STORAGE_KEY
          ) ??
            "{}"
        ) as SavedTimer;

      const savedStats =
        JSON.parse(
          localStorage.getItem(
            "focusAchievementStats"
          ) ??
            "{}"
        ) as {
          sessions?: number;
          focusedSeconds?: number;
        };

      if (
        isModeId(
          savedTimer.modeId
        )
      ) {
        setModeId(
          savedTimer.modeId
        );
      }

      if (
        isSceneId(
          savedTimer.sceneId
        )
      ) {
        setSceneId(
          savedTimer.sceneId
        );
      }

      const nextCustomFocus =
        clampMinutes(
          savedTimer.customFocus,
          30
        );

      const nextCustomRest =
        clampMinutes(
          savedTimer.customRest,
          10
        );

      setCustomFocus(
        nextCustomFocus
      );

      setCustomRest(
        nextCustomRest
      );

      const savedPhase:
        TimerPhase =
        savedTimer.phase ===
        "break"
          ? "break"
          : "focus";

      setPhase(
        savedPhase
      );

      const savedState =
        savedTimer.timerState;

      const validState:
        TimerState =
        savedState ===
          "running" ||
        savedState ===
          "paused" ||
        savedState ===
          "break" ||
        savedState ===
          "complete"
          ? savedState
          : "idle";

      setTimerState(
        validState
      );

      const savedEndAt =
        typeof savedTimer.endAt ===
          "number"
          ? savedTimer.endAt
          : null;

      if (
        (
          validState ===
            "running" ||
          validState ===
            "break"
        ) &&
        savedEndAt
      ) {
        setEndAt(
          savedEndAt
        );

        setSecondsRemaining(
          Math.max(
            0,
            Math.ceil(
              (
                savedEndAt -
                Date.now()
              ) /
                1000
            )
          )
        );
      } else {
        setEndAt(
          null
        );

        setSecondsRemaining(
          Math.max(
            0,
            Number(
              savedTimer.secondsRemaining
            ) ||
              25 * 60
          )
        );
      }

      setSessions(
        Number(
          savedStats.sessions
        ) ||
          0
      );

      setFocusedSeconds(
        Number(
          savedStats.focusedSeconds
        ) ||
          0
      );
    } catch {
      // Keep defaults if saved state is damaged.
    } finally {
      setHydrated(
        true
      );
    }
  }, []);


  useEffect(() => {
    if (
      !hydrated
    ) {
      return;
    }

    const saved:
      SavedTimer = {
      modeId,
      sceneId,
      timerState,
      phase,
      customFocus,
      customRest,
      secondsRemaining,
      endAt,
    };

    localStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify(
        saved
      )
    );
  }, [
    modeId,
    sceneId,
    timerState,
    phase,
    customFocus,
    customRest,
    secondsRemaining,
    endAt,
    hydrated,
  ]);


  useEffect(() => {
    if (
      !hydrated ||
      (
        timerState !==
          "running" &&
        timerState !==
          "break"
      ) ||
      !endAt
    ) {
      return;
    }

    function finishFocusBlock() {
      if (
        completionHandledRef.current
      ) {
        return;
      }

      completionHandledRef.current =
        true;

      const completedSeconds =
        focusMinutes *
        60;

      setSessions(
        (
          previousSessions
        ) => {
          const nextSessions =
            previousSessions +
            1;

          setFocusedSeconds(
            (
              previousSeconds
            ) => {
              const nextSeconds =
                previousSeconds +
                completedSeconds;

              localStorage.setItem(
                "focusAchievementStats",
                JSON.stringify({
                  sessions:
                    nextSessions,
                  focusedSeconds:
                    nextSeconds,
                })
              );

              return nextSeconds;
            }
          );

          return nextSessions;
        }
      );

      reportAchievementMetric(
        "focusSessions",
        1,
        "increment"
      );

      reportAchievementMetric(
        "focusMinutes",
        focusMinutes,
        "increment"
      );

      reportAchievementMetric(
        "focusLongestMinutes",
        focusMinutes,
        "max"
      );

      const days =
        new Set<string>(
          JSON.parse(
            localStorage.getItem(
              "focusAchievementDays"
            ) ??
              "[]"
          )
        );

      days.add(
        new Date()
          .toISOString()
          .slice(
            0,
            10
          )
      );

      localStorage.setItem(
        "focusAchievementDays",
        JSON.stringify(
          [
            ...days,
          ]
        )
      );

      reportAchievementMetric(
        "focusDays",
        days.size
      );

      const usedModes =
        new Set<string>(
          JSON.parse(
            localStorage.getItem(
              "focusAchievementModes"
            ) ??
              "[]"
          )
        );

      usedModes.add(
        modeId
      );

      localStorage.setItem(
        "focusAchievementModes",
        JSON.stringify(
          [
            ...usedModes,
          ]
        )
      );

      reportAchievementMetric(
        "focusModesUsed",
        usedModes.size
      );

      const usedScenes =
        new Set<string>(
          JSON.parse(
            localStorage.getItem(
              "focusAchievementScenes"
            ) ??
              "[]"
          )
        );

      usedScenes.add(
        sceneId
      );

      localStorage.setItem(
        "focusAchievementScenes",
        JSON.stringify(
          [
            ...usedScenes,
          ]
        )
      );

      reportAchievementMetric(
        "focusScenesUsed",
        usedScenes.size
      );

      setSecondsRemaining(
        0
      );

      setEndAt(
        null
      );

      setTimerState(
        "complete"
      );
    }


    function updateTimer() {
      const remaining =
        Math.max(
          0,
          Math.ceil(
            (
              endAt! -
              Date.now()
            ) /
              1000
          )
        );

      setSecondsRemaining(
        remaining
      );

      if (
        remaining >
        0
      ) {
        return;
      }

      if (
        phase ===
        "break"
      ) {
        completionHandledRef.current =
          false;

        setPhase(
          "focus"
        );

        setTimerState(
          "idle"
        );

        setEndAt(
          null
        );

        setSecondsRemaining(
          focusMinutes *
            60
        );

        return;
      }

      finishFocusBlock();
    }


    updateTimer();

    const interval =
      window.setInterval(
        updateTimer,
        250
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    hydrated,
    timerState,
    endAt,
    phase,
    focusMinutes,
    modeId,
    sceneId,
  ]);


  useEffect(() => {
    if (
      !hydrated ||
      timerState !==
        "idle"
    ) {
      return;
    }

    setPhase(
      "focus"
    );

    setSecondsRemaining(
      focusMinutes *
        60
    );
  }, [
    hydrated,
    modeId,
    customFocus,
    focusMinutes,
    timerState,
  ]);


  function startTimer() {
    completionHandledRef.current =
      false;

    if (
      timerState ===
      "paused"
    ) {
      setEndAt(
        Date.now() +
          secondsRemaining *
            1000
      );

      setTimerState(
        phase ===
          "break"
          ? "break"
          : "running"
      );

      return;
    }

    const nextSeconds =
      focusMinutes *
      60;

    setPhase(
      "focus"
    );

    setSecondsRemaining(
      nextSeconds
    );

    setEndAt(
      Date.now() +
        nextSeconds *
          1000
    );

    setTimerState(
      "running"
    );
  }


  function pauseTimer() {
    if (
      timerState !==
        "running" &&
      timerState !==
        "break"
    ) {
      return;
    }

    if (
      endAt
    ) {
      setSecondsRemaining(
        Math.max(
          0,
          Math.ceil(
            (
              endAt -
              Date.now()
            ) /
              1000
          )
        )
      );
    }

    setEndAt(
      null
    );

    setTimerState(
      "paused"
    );
  }


  function resetTimer() {
    completionHandledRef.current =
      false;

    setPhase(
      "focus"
    );

    setTimerState(
      "idle"
    );

    setEndAt(
      null
    );

    setSecondsRemaining(
      focusMinutes *
        60
    );
  }


  function startBreak() {
    completionHandledRef.current =
      false;

    const nextSeconds =
      restMinutes *
      60;

    setPhase(
      "break"
    );

    setSecondsRemaining(
      nextSeconds
    );

    setEndAt(
      Date.now() +
        nextSeconds *
          1000
    );

    setTimerState(
      "break"
    );
  }


  function finishSession() {
    completionHandledRef.current =
      false;

    setPhase(
      "focus"
    );

    setTimerState(
      "idle"
    );

    setEndAt(
      null
    );

    setSecondsRemaining(
      focusMinutes *
        60
    );
  }


  const value =
    useMemo<FocusTimerContextValue>(
      () => ({
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
      }),
      [
        modeId,
        sceneId,
        timerState,
        customFocus,
        customRest,
        secondsRemaining,
        sessions,
        focusedSeconds,
        focusMinutes,
        restMinutes,
        endAt,
        phase,
      ]
    );


  return (
    <FocusTimerContext.Provider
      value={
        value
      }
    >
      {children}
    </FocusTimerContext.Provider>
  );
}


export function useFocusTimer() {
  const context =
    useContext(
      FocusTimerContext
    );

  if (
    !context
  ) {
    throw new Error(
      "useFocusTimer must be used inside FocusTimerProvider."
    );
  }

  return context;
}
