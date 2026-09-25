"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  initialPlayer,
  PlayerState,
} from "@/data/playerState";

import {
  dailyTasks,
  DailyTask,
  Weekday,
  weekdayKeys,
} from "@/data/dailyTasks";

import {
  Path,
  skillMap,
  SkillNode,
} from "@/data/skillMap";

import {
  DAILY_TASK_XP_BUDGET,
  MAX_LEVEL_XP,
  MIN_DAILY_TASK_XP,
  SKILL_TREE_XP_BUDGET,
} from "@/data/levels";

import {
  AttributeDefinition,
  DAILY_ATTRIBUTE_XP,
  defaultAttributes,
  MAX_ATTRIBUTES,
  SKILL_ATTRIBUTE_XP,
} from "@/data/categories";

import { useAppDialog } from "@/components/ui/AppDialogProvider";


interface Reward {
  category?: string;

  attribute?: string;

  xp: number;
}


export interface SkillPathConfig {
  name: string;

  attributeIds: string[];
}


export type SkillPathConfigs =
  Record<Path, SkillPathConfig>;


export interface JourneyPlan {
  durationMonths: number;

  consistencyPercent: number;

  startDate: string;

  targetDate: string;
}


export interface GraceTask {
  id: string;

  taskId: number;

  name: string;

  description: string;

  categories: string[];

  rewards: Reward[];

  scheduledDays: Weekday[];

  awardedXP: number;

  originalDate: string;
}


interface DailyAchievementDay {
  completedTaskNames: string[];

  completionTimes: string[];

  allTasksCompleted: boolean;
}


interface AchievementEventData {
  dailyTasksCompleted: number;

  perfectDays: number;

  perfectDayStreak: number;

  forgivenessTasksCompleted: number;

  perfectDayBeforeEight: number;

  perfectDayAfterTen: number;

  skillsCompletedInOneDay: number;

  daysWithoutSavingsWithdrawal: number;

  forgivenessRecoveryStreak: number;
}


type DailyAchievementHistory =
  Record<
    string,
    DailyAchievementDay
  >;


type SkillAchievementHistory =
  Record<string, number[]>;


interface GameContextType {
  player: PlayerState;

  attributes:
    AttributeDefinition[];

  skillPathConfigs:
    SkillPathConfigs;

  tasks: DailyTask[];

  todayTasks: DailyTask[];

  completedTasks: string[];

  completedTaskAwards:
    Record<string, number>;

  graceTasks: GraceTask[];

  skillNodes: SkillNode[];

  completedSkills: number[];

  journeyPlan:
    JourneyPlan | null;

  currentDailyTaskXP:
    number;

  remainingTaskOpportunities:
    number;

  expectedRemainingCompletions:
    number;

  journeyDaysRemaining:
    number;

  addAttribute: (
    name: string
  ) => void;

  renameAttribute: (
    id: string,
    name: string
  ) => void;

  deleteAttribute: (
    id: string
  ) => void;

  updateSkillPathConfig: (
    path: Path,
    name: string,
    attributeIds: string[]
  ) => void;

  startJourney: (
    durationMonths: number,
    consistencyPercent: number
  ) => void;

  resetJourney:
    () => void;

  addReward: (
    rewards: Reward[],
    taskName: string
  ) => void;

  removeReward: (
    rewards: Reward[],
    taskName: string
  ) => void;

  addTask: (
    task: DailyTask
  ) => void;

  deleteTask: (
    id: number
  ) => Promise<void>;

  updateTaskDetails: (
    id: number,
    name: string,
    description: string
  ) => void;

  updateTaskSchedule: (
    id: number,
    scheduledDays: Weekday[]
  ) => void;

  updateTaskAttributes: (
    id: number,
    attributeIds: string[]
  ) => void;

  completeGraceTask: (
    graceTaskId: string
  ) => void;

  missGraceTask: (
    graceTaskId: string
  ) => void;

  completeSkillNode: (
    nodeId: number
  ) => void;

  updateSkillNode: (
    nodeId: number,
    name: string,
    description: string
  ) => void;
}


const GameContext =
  createContext<
    GameContextType | undefined
  >(undefined);


const DEFAULT_ACHIEVEMENT_EVENTS:
  AchievementEventData = {
  dailyTasksCompleted: 0,
  perfectDays: 0,
  perfectDayStreak: 0,
  forgivenessTasksCompleted: 0,
  perfectDayBeforeEight: 0,
  perfectDayAfterTen: 0,
  skillsCompletedInOneDay: 0,
  daysWithoutSavingsWithdrawal: 0,
  forgivenessRecoveryStreak: 0,
};


/*
 * IMPORTANT:
 *
 * completedTasksDate is the authoritative date for the active
 * completedTasks / completedTaskAwards state.
 *
 * completedTasks itself is intentionally NOT used to determine
 * which calendar day the completions belong to.
 *
 * This prevents yesterday's "3/6 completed" from being treated
 * as today's "3/6 completed".
 */
const COMPLETED_TASKS_DATE_KEY =
  "completedTasksDate";


function getLocalDateKey(
  date = new Date()
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function parseLocalDate(
  dateKey: string
): Date {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day,
    12
  );
}


function addMonthsExact(
  startDate: Date,
  months: number
): Date {
  const target =
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      12
    );

  const originalDay =
    target.getDate();

  target.setDate(1);

  target.setMonth(
    target.getMonth() +
      months
  );

  const lastDay =
    new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0,
      12
    ).getDate();

  target.setDate(
    Math.min(
      originalDay,
      lastDay
    )
  );

  return target;
}


function getDayDifference(
  earlierDate: string,
  laterDate: string
): number {
  return Math.round(
    (
      parseLocalDate(
        laterDate
      ).getTime() -
      parseLocalDate(
        earlierDate
      ).getTime()
    ) /
      86_400_000
  );
}


function getWeekdayForDate(
  date:
    Date
): Weekday {
  return weekdayKeys[
    date.getDay()
  ];
}


function isTaskDueOnDate(
  task:
    DailyTask,

  date:
    Date
): boolean {
  return task
    .scheduledDays
    .includes(
      getWeekdayForDate(
        date
      )
    );
}


function countRemainingTaskOpportunities(
  tasks:
    DailyTask[],

  startDate:
    Date,

  targetDate:
    Date
): number {
  if (
    targetDate.getTime() <
    startDate.getTime()
  ) {
    return 0;
  }

  let total = 0;

  const cursor =
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      12
    );

  while (
    cursor.getTime() <=
    targetDate.getTime()
  ) {
    for (
      const task of tasks
    ) {
      if (
        isTaskDueOnDate(
          task,
          cursor
        )
      ) {
        total += 1;
      }
    }

    cursor.setDate(
      cursor.getDate() + 1
    );
  }

  return total;
}


function normalizeTask(
  task:
    DailyTask
): DailyTask {
  return {
    ...task,

    scheduledDays:
      task.scheduledDays &&
      task.scheduledDays.length >
        0
        ? task.scheduledDays
        : [
            ...weekdayKeys,
          ],

    rewards:
      task.rewards.map(
        (
          reward
        ) => ({
          ...reward,

          xp: 0,
        })
      ),
  };
}


function migratePlayer(
  saved:
    Partial<PlayerState> | null
): PlayerState {
  if (!saved) {
    return {
      ...initialPlayer,

      attributes: {
        ...initialPlayer.attributes,
      },
    };
  }

  const dailyTaskXP =
    Math.max(
      0,
      saved.dailyTaskXP ??
        0
    );

  const skillTreeXP =
    Math.max(
      0,
      saved.skillTreeXP ??
        0
    );

  return {
    ...initialPlayer,

    ...saved,

    dailyTaskXP:
      Math.min(
        DAILY_TASK_XP_BUDGET,
        dailyTaskXP
      ),

    skillTreeXP:
      Math.min(
        SKILL_TREE_XP_BUDGET,
        skillTreeXP
      ),

    totalXP:
      Math.min(
        MAX_LEVEL_XP,
        dailyTaskXP +
          skillTreeXP
      ),

    attributes: {
      ...initialPlayer.attributes,

      ...saved.attributes,
    },
  };
}


function getSkillAward(
  node:
    SkillNode
): number {
  switch (
    node.xp
  ) {
    case 25:
      return 11_406;

    case 50:
      return 45_625;

    case 100:
      return 136_875;

    case 250:
      return 456_251;

    default:
      return Math.max(
        1,
        node.xp
      );
  }
}


function readJSON<
  Value
>(
  key:
    string,

  fallback:
    Value
): Value {
  if (
    typeof window ===
    "undefined"
  ) {
    return fallback;
  }

  try {
    const saved =
      localStorage.getItem(
        key
      );

    return saved
      ? JSON.parse(saved)
      : fallback;
  } catch {
    return fallback;
  }
}


function notifyAchievements() {
  window.dispatchEvent(
    new Event(
      "achievement-data-updated"
    )
  );
}


function rebuildAchievementEvents(
  history:
    DailyAchievementHistory
) {
  const existing =
    readJSON<AchievementEventData>(
      "achievementEventData",
      DEFAULT_ACHIEVEMENT_EVENTS
    );

  const days =
    Object.values(
      history
    );

  const perfectDates =
    Object.entries(
      history
    )
      .filter(
        (
          [
            ,
            day,
          ]
        ) =>
          day.allTasksCompleted
      )
      .map(
        (
          [
            date,
          ]
        ) =>
          date
      )
      .sort();

  let longestStreak = 0;
  let currentStreak = 0;
  let previousDate:
    string | null = null;

  perfectDates.forEach(
    (
      date
    ) => {
      if (
        previousDate &&
        getDayDifference(
          previousDate,
          date
        ) === 1
      ) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }

      longestStreak =
        Math.max(
          longestStreak,
          currentStreak
        );

      previousDate = date;
    }
  );

  const events:
    AchievementEventData = {
    ...existing,

    dailyTasksCompleted:
      days.reduce(
        (
          total,
          day
        ) =>
          total +
          day
            .completedTaskNames
            .length,
        0
      ),

    perfectDays:
      days.filter(
        (
          day
        ) =>
          day.allTasksCompleted
      ).length,

    perfectDayStreak:
      longestStreak,

    perfectDayBeforeEight:
      days.filter(
        (
          day
        ) =>
          day.allTasksCompleted &&
          day.completionTimes.length >
            0 &&
          day.completionTimes.every(
            (
              timestamp
            ) =>
              new Date(
                timestamp
              ).getHours() <
              8
          )
      ).length,

    perfectDayAfterTen:
      days.filter(
        (
          day
        ) =>
          day.allTasksCompleted &&
          day.completionTimes.length >
            0 &&
          day.completionTimes.every(
            (
              timestamp
            ) =>
              new Date(
                timestamp
              ).getHours() >=
              22
          )
      ).length,
  };

  localStorage.setItem(
    "achievementEventData",
    JSON.stringify(events)
  );

  notifyAchievements();
}


function recordDailyAchievement(
  taskName:
    string,

  allTasksCompleted:
    boolean,

  remove =
    false
) {
  const today =
    getLocalDateKey();

  const history =
    readJSON<
      DailyAchievementHistory
    >(
      "achievementDailyHistory",
      {}
    );

  const day =
    history[today] ?? {
      completedTaskNames: [],
      completionTimes: [],
      allTasksCompleted: false,
    };

  const existingIndex =
    day.completedTaskNames
      .indexOf(
        taskName
      );

  if (
    remove &&
    existingIndex >= 0
  ) {
    day.completedTaskNames =
      day.completedTaskNames.filter(
        (
          _,
          index
        ) =>
          index !==
          existingIndex
      );

    day.completionTimes =
      day.completionTimes.filter(
        (
          _,
          index
        ) =>
          index !==
          existingIndex
      );
  } else if (
    !remove &&
    existingIndex < 0
  ) {
    day.completedTaskNames = [
      ...day.completedTaskNames,
      taskName,
    ];

    day.completionTimes = [
      ...day.completionTimes,
      new Date().toISOString(),
    ];
  }

  day.allTasksCompleted =
    allTasksCompleted;

  history[today] =
    day;

  localStorage.setItem(
    "achievementDailyHistory",
    JSON.stringify(history)
  );

  rebuildAchievementEvents(
    history
  );
}


function recordSkillAchievement(
  nodeId:
    number
) {
  const today =
    getLocalDateKey();

  const history =
    readJSON<
      SkillAchievementHistory
    >(
      "achievementSkillHistory",
      {}
    );

  const completedToday =
    history[today] ?? [];

  if (
    !completedToday.includes(
      nodeId
    )
  ) {
    history[today] = [
      ...completedToday,
      nodeId,
    ];
  }

  localStorage.setItem(
    "achievementSkillHistory",
    JSON.stringify(history)
  );

  const events =
    readJSON<AchievementEventData>(
      "achievementEventData",
      DEFAULT_ACHIEVEMENT_EVENTS
    );

  events.skillsCompletedInOneDay =
    Math.max(
      events.skillsCompletedInOneDay,
      history[today].length
    );

  localStorage.setItem(
    "achievementEventData",
    JSON.stringify(events)
  );

  notifyAchievements();
}


function createGraceTasks(
  tasks:
    DailyTask[],

  completedTasks:
    string[],

  completedTaskAwards:
    Record<string, number>,

  originalDate:
    string
): GraceTask[] {
  const original =
    parseLocalDate(
      originalDate
    );

  return tasks
    .filter(
      (
        task
      ) =>
        isTaskDueOnDate(
          task,
          original
        ) &&
        !completedTasks.includes(
          task.name
        )
    )
    .map(
      (
        task
      ) => ({
        id:
          `${originalDate}-${task.id}`,

        taskId:
          task.id,

        name:
          task.name,

        description:
          task.description,

        categories: [
          ...task.categories,
        ],

        rewards:
          task.rewards.map(
            (
              reward
            ) => ({
              ...reward,
            })
          ),

        scheduledDays: [
          ...task.scheduledDays,
        ],

        awardedXP:
          completedTaskAwards[
            task.name
          ] ??
          0,

        originalDate,
      })
    );
}


const DEFAULT_SKILL_PATH_CONFIGS:
  SkillPathConfigs = {
  Body: {
    name: "Body",

    attributeIds: [
      "health",
      "discipline",
    ],
  },

  Mind: {
    name: "Mind",

    attributeIds: [
      "knowledge",
      "creativity",
    ],
  },

  Spirit: {
    name: "Spirit",

    attributeIds: [
      "faith",
      "character",
    ],
  },

  Life: {
    name: "Life",

    attributeIds: [
      "wealth",
      "social",
    ],
  },
};


const GameContextProvider =
  GameContext.Provider;


export function GameProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const { choose } =
    useAppDialog();

  const [
    player,
    setPlayer
  ] =
    useState<PlayerState>(
      () =>
        migratePlayer(
          readJSON<
            Partial<PlayerState> | null
          >(
            "player",
            null
          )
        )
    );

  const [
    attributes,
    setAttributes
  ] =
    useState<
      AttributeDefinition[]
    >(
      defaultAttributes
    );

  const [
    skillPathConfigs,
    setSkillPathConfigs
  ] =
    useState<
      SkillPathConfigs
    >(
      DEFAULT_SKILL_PATH_CONFIGS
    );

  const [
    tasks,
    setTasks
  ] =
    useState<DailyTask[]>(
      dailyTasks
    );

  const [
    completedTasks,
    setCompletedTasks
  ] =
    useState<string[]>([]);

  const [
    completedTaskAwards,
    setCompletedTaskAwards
  ] =
    useState<
      Record<string, number>
    >({});

  const [
    graceTasks,
    setGraceTasks
  ] =
    useState<GraceTask[]>([]);

  const [
    skillNodes,
    setSkillNodes
  ] =
    useState<SkillNode[]>(
      skillMap.nodes.map(
        (
          node
        ) => ({
          ...node,

          xp:
            getSkillAward(
              node
            ),
        })
      )
    );

  const [
    completedSkills,
    setCompletedSkills
  ] =
    useState<number[]>([]);

  const [
    journeyPlan,
    setJourneyPlan
  ] =
    useState<
      JourneyPlan | null
    >(null);

  const [
    lastDailyDate,
    setLastDailyDate
  ] =
    useState("");

  /*
   * This date is specifically for the active completion list.
   *
   * lastDailyDate tracks the app's current calendar day.
   * completedTasksDate tracks the day that completedTasks belong to.
   *
   * They normally match, but separating them makes rollover safe.
   */
  const [
    completedTasksDate,
    setCompletedTasksDate
  ] =
    useState("");

  const [
    hasLoaded,
    setHasLoaded
  ] =
    useState(false);


  /*
   * IMPORTANT:
   *
   * The real-world clock does not automatically cause React to
   * re-render at midnight.
   *
   * currentDateKey is state so the app can explicitly change the
   * active calendar date.
   */
  const [
    currentDateKey,
    setCurrentDateKey
  ] =
    useState(
      () =>
        getLocalDateKey()
    );


  const today =
    parseLocalDate(
      currentDateKey
    );

  const todayKey =
    currentDateKey;


  const todayTasks =
    useMemo(
      () =>
        tasks.filter(
          (
            task
          ) =>
            isTaskDueOnDate(
              task,
              today
            )
        ),
      [
        tasks,
        todayKey,
      ]
    );


  const remainingTaskOpportunities =
    useMemo(
      () => {
        if (
          !journeyPlan
        ) {
          return 0;
        }

        return countRemainingTaskOpportunities(
          tasks,
          today,
          parseLocalDate(
            journeyPlan.targetDate
          )
        );
      },
      [
        tasks,
        journeyPlan,
        todayKey,
      ]
    );


  const expectedRemainingCompletions =
    journeyPlan
      ? remainingTaskOpportunities *
        (
          journeyPlan
            .consistencyPercent /
          100
        )
      : 0;


  const remainingDailyBudget =
    Math.max(
      0,
      DAILY_TASK_XP_BUDGET -
        player.dailyTaskXP
    );


  const currentDailyTaskXP =
    journeyPlan &&
    expectedRemainingCompletions >
      0 &&
    remainingDailyBudget >
      0
      ? Math.min(
          remainingDailyBudget,
          Math.max(
            MIN_DAILY_TASK_XP,
            Math.round(
              remainingDailyBudget /
                expectedRemainingCompletions
            )
          )
        )
      : 0;


  const journeyDaysRemaining =
    journeyPlan
      ? Math.max(
          0,
          getDayDifference(
            todayKey,
            journeyPlan.targetDate
          )
        )
      : 0;


  /*
   * INITIAL LOAD
   *
   * The important part here is that completedTasksDate is now the
   * authoritative date for completedTasks.
   *
   * If that key does not exist, the old completion data is ambiguous.
   * We clear it once rather than incorrectly carrying yesterday's
   * completion markers into today.
   */
  useEffect(() => {
    try {
      const loadedPlayer =
        migratePlayer(
          readJSON<
            Partial<PlayerState> | null
          >(
            "player",
            null
          )
        );

      const loadedAttributes =
        readJSON<
          AttributeDefinition[]
        >(
          "attributes",
          defaultAttributes
        );

      const loadedSkillPathConfigs =
        readJSON<
          SkillPathConfigs
        >(
          "skillPathConfigs",
          DEFAULT_SKILL_PATH_CONFIGS
        );

      const attributeNameToId =
        new Map(
          loadedAttributes.map(
            (
              attribute
            ) => [
              attribute.name,
              attribute.id,
            ]
          )
        );


      const loadedTasks =
        readJSON<DailyTask[]>(
          "tasks",
          dailyTasks
        ).map(
          (
            task
          ) => {
            const normalized =
              normalizeTask(
                task
              );

            const categories =
              normalized.categories
                .map(
                  (
                    category
                  ) =>
                    loadedAttributes.some(
                      (
                        attribute
                      ) =>
                        attribute.id ===
                        category
                    )
                      ? category
                      : attributeNameToId.get(
                          category
                        )
                )
                .filter(
                  (
                    category
                  ): category is string =>
                    Boolean(
                      category
                    )
                );

            return {
              ...normalized,

              categories,

              rewards:
                categories.map(
                  (
                    category
                  ) => ({
                    category,
                    xp: 0,
                  })
                ),
            };
          }
        );


      const loadedCompletedTasks =
        readJSON<string[]>(
          "completedTasks",
          []
        );

      const loadedAwards =
        readJSON<
          Record<string, number>
        >(
          "completedTaskAwards",
          {}
        );

      const loadedGraceTasks =
        readJSON<GraceTask[]>(
          "graceTasks",
          []
        );

      const loadedCompletedSkills =
        readJSON<number[]>(
          "completedSkills",
          []
        );

      const loadedJourney =
        readJSON<
          JourneyPlan | null
        >(
          "journeyPlan",
          null
        );

      const loadedDailyDate =
        readJSON<string>(
          "lastDailyDate",
          ""
        );

      /*
       * NEW:
       *
       * This is the date attached specifically to completedTasks.
       *
       * If this is missing, old completedTasks data cannot safely be
       * assumed to belong to today.
       */
      const loadedCompletedTasksDate =
        readJSON<string>(
          COMPLETED_TASKS_DATE_KEY,
          ""
        );

      const savedSkillNodes =
        readJSON<
          SkillNode[] | null
        >(
          "skillNodes",
          null
        );


      const loadedTodayKey =
        getLocalDateKey();


      setPlayer(
        loadedPlayer
      );

      setAttributes(
        loadedAttributes.slice(
          0,
          MAX_ATTRIBUTES
        )
      );

      setSkillPathConfigs(
        loadedSkillPathConfigs
      );

      setTasks(
        loadedTasks
      );

      setCompletedSkills(
        loadedCompletedSkills
      );

      setJourneyPlan(
        loadedJourney
      );


      if (
        savedSkillNodes
      ) {
        setSkillNodes(
          skillMap.nodes.map(
            (
              rawDefaultNode
            ) => {
              const defaultNode = {
                ...rawDefaultNode,

                xp:
                  getSkillAward(
                    rawDefaultNode
                  ),
              };

              const savedNode =
                savedSkillNodes.find(
                  (
                    node
                  ) =>
                    node.id ===
                    defaultNode.id
                );

              return savedNode
                ? {
                    ...defaultNode,

                    name:
                      savedNode.name ??
                      defaultNode.name,

                    description:
                      savedNode.description ??
                      defaultNode.description,
                  }
                : defaultNode;
            }
          )
        );
      }


      /*
       * DAILY COMPLETION MIGRATION / ROLLOVER
       *
       * CASE 1:
       * No completedTasksDate exists.
       *
       * The existing completedTasks are ambiguous because older
       * versions did not explicitly bind them to a date.
       *
       * Clear them once and establish today as the new authoritative
       * date.
       *
       * CASE 2:
       * completedTasksDate === today.
       *
       * These completions belong to today, so restore them.
       *
       * CASE 3:
       * completedTasksDate is exactly yesterday.
       *
       * Today's active list starts empty.
       * Yesterday's incomplete tasks become today's grace tasks.
       *
       * CASE 4:
       * completedTasksDate is older than yesterday.
       *
       * Both the old active completions and old grace tasks expire.
       */
      if (
        !loadedCompletedTasksDate
      ) {
        setCompletedTasks([]);

        setCompletedTaskAwards({});

        setGraceTasks([]);
      } else if (
        loadedCompletedTasksDate ===
        loadedTodayKey
      ) {
        setCompletedTasks(
          loadedCompletedTasks
        );

        setCompletedTaskAwards(
          loadedAwards
        );

        /*
         * If the user reloads during the same day, preserve the
         * existing grace tasks for that day.
         */
        setGraceTasks(
          loadedGraceTasks
        );
      } else {
        const daysPassed =
          getDayDifference(
            loadedCompletedTasksDate,
            loadedTodayKey
          );

        if (
          daysPassed === 1
        ) {
          setGraceTasks(
            createGraceTasks(
              loadedTasks,
              loadedCompletedTasks,
              loadedAwards,
              loadedCompletedTasksDate
            )
          );
        } else {
          /*
           * More than one day has passed.
           *
           * Old grace tasks expire instead of stacking.
           */
          setGraceTasks([]);
        }

        /*
         * These belong to the previous calendar day.
         *
         * They are NOT subtracted from player XP.
         *
         * Only the UI completion markers are reset.
         */
        setCompletedTasks([]);

        setCompletedTaskAwards({});
      }


      setCurrentDateKey(
        loadedTodayKey
      );

      setLastDailyDate(
        loadedTodayKey
      );

      /*
       * From this point forward the active completion state is
       * explicitly associated with today's date.
       */
      setCompletedTasksDate(
        loadedTodayKey
      );

    } catch (
      error
    ) {
      console.error(
        "Failed to load game data:",
        error
      );

      const fallbackToday =
        getLocalDateKey();

      setCurrentDateKey(
        fallbackToday
      );

      setLastDailyDate(
        fallbackToday
      );

      setCompletedTasksDate(
        fallbackToday
      );

      setCompletedTasks([]);

      setCompletedTaskAwards({});

      setGraceTasks([]);
    } finally {
      setHasLoaded(true);
    }
  }, []);


  /*
   * MIDNIGHT / DATE CHANGE WATCHER
   *
   * Checks the real-world date every 15 seconds.
   *
   * If the calendar day changes:
   *
   * 1. The previous day's incomplete tasks are converted to grace
   *    tasks if exactly one day passed.
   *
   * 2. The active completedTasks list is cleared.
   *
   * 3. completedTaskAwards is cleared.
   *
   * 4. Player XP is NOT changed.
   *
   * 5. If more than one day was skipped, old grace tasks expire.
   *
   * 6. completedTasksDate becomes the new current date.
   */
  useEffect(() => {
    if (
      !hasLoaded ||
      !completedTasksDate
    ) {
      return;
    }


    function checkForDailyReset() {
      const actualCurrentDate =
        getLocalDateKey();


      /*
       * Always keep the reactive calendar date current.
       */
      setCurrentDateKey(
        actualCurrentDate
      );


      /*
       * completedTasksDate is authoritative for the active completion
       * markers. Do not let a stale lastDailyDate prevent rollover.
       */
      if (
        actualCurrentDate ===
        completedTasksDate
      ) {
        if (
          lastDailyDate !==
          actualCurrentDate
        ) {
          setLastDailyDate(
            actualCurrentDate
          );
        }

        return;
      }


      /*
       * IMPORTANT:
       *
       * Use completedTasksDate rather than relying solely on the
       * reactive lastDailyDate.
       *
       * This guarantees that the active completion list is tied to
       * the date it was actually created for.
       */
      const daysPassed =
        getDayDifference(
          completedTasksDate,
          actualCurrentDate
        );


      if (
        daysPassed === 1
      ) {
        /*
         * Yesterday's incomplete tasks become today's grace tasks.
         *
         * completedTasks contains only the tasks completed yesterday.
         * Therefore createGraceTasks automatically selects only the
         * incomplete tasks.
         */
        const newGraceTasks =
          createGraceTasks(
            tasks,
            completedTasks,
            completedTaskAwards,
            completedTasksDate
          );

        setGraceTasks(
          newGraceTasks
        );
      } else {
        /*
         * If the user skipped one or more entire calendar days,
         * yesterday's grace window has expired.
         *
         * Do not stack old grace tasks.
         */
        setGraceTasks([]);
      }


      /*
       * RESET ONLY THE ACTIVE DAILY COMPLETION MARKERS.
       *
       * This does NOT touch player.dailyTaskXP,
       * player.skillTreeXP, or player.totalXP.
       *
       * Therefore previously earned XP remains permanently earned.
       */
      setCompletedTasks([]);

      setCompletedTaskAwards({});


      /*
       * The active completion state now belongs to the new day.
       */
      setCompletedTasksDate(
        actualCurrentDate
      );

      setLastDailyDate(
        actualCurrentDate
      );
    }


    checkForDailyReset();


    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        checkForDailyReset();
      }
    }


    window.addEventListener(
      "focus",
      checkForDailyReset
    );

    window.addEventListener(
      "pageshow",
      checkForDailyReset
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    const interval =
      window.setInterval(
        checkForDailyReset,
        15_000
      );


    return () => {
      window.clearInterval(
        interval
      );
      window.removeEventListener(
        "focus",
        checkForDailyReset
      );
      window.removeEventListener(
        "pageshow",
        checkForDailyReset
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };

  }, [
    hasLoaded,
    lastDailyDate,
    completedTasksDate,
    tasks,
    completedTasks,
    completedTaskAwards,
  ]);


  /*
   * PERSIST ALL GAME STATE
   *
   * completedTasksDate is persisted separately so the next page load
   * knows exactly which calendar day the active completion markers
   * belong to.
   */
  useEffect(() => {
    if (!hasLoaded) {
      return;
    }


    localStorage.setItem(
      "player",
      JSON.stringify(player)
    );


    localStorage.setItem(
      "attributes",
      JSON.stringify(attributes)
    );


    localStorage.setItem(
      "skillPathConfigs",
      JSON.stringify(
        skillPathConfigs
      )
    );


    localStorage.setItem(
      "tasks",
      JSON.stringify(tasks)
    );


    localStorage.setItem(
      "completedTasks",
      JSON.stringify(
        completedTasks
      )
    );


    localStorage.setItem(
      "completedTaskAwards",
      JSON.stringify(
        completedTaskAwards
      )
    );


    localStorage.setItem(
      "graceTasks",
      JSON.stringify(
        graceTasks
      )
    );


    localStorage.setItem(
      "skillNodes",
      JSON.stringify(
        skillNodes
      )
    );


    localStorage.setItem(
      "completedSkills",
      JSON.stringify(
        completedSkills
      )
    );


    localStorage.setItem(
      "journeyPlan",
      JSON.stringify(
        journeyPlan
      )
    );


    localStorage.setItem(
      "lastDailyDate",
      lastDailyDate
    );


    /*
     * NEW:
     *
     * Persist the exact date associated with the active completion
     * markers.
     */
    localStorage.setItem(
      COMPLETED_TASKS_DATE_KEY,
      completedTasksDate
    );

  }, [
    player,
    attributes,
    skillPathConfigs,
    tasks,
    completedTasks,
    completedTaskAwards,
    graceTasks,
    skillNodes,
    completedSkills,
    journeyPlan,
    lastDailyDate,
    completedTasksDate,
    hasLoaded,
  ]);


  function getAttributesForPath(
    path:
      Path
  ): string[] {
    return (
      skillPathConfigs[
        path
      ]?.attributeIds ??
      []
    );
  }


  function updateDailyJourneyXP(
    xp:
      number,

    direction:
      1 | -1
  ) {
    setPlayer(
      (
        old
      ) => {
        const nextDailyTaskXP =
          Math.max(
            0,
            Math.min(
              DAILY_TASK_XP_BUDGET,
              old.dailyTaskXP +
                xp *
                  direction
            )
          );

        return {
          ...old,

          dailyTaskXP:
            nextDailyTaskXP,

          totalXP:
            Math.min(
              MAX_LEVEL_XP,
              nextDailyTaskXP +
                old.skillTreeXP
            ),
        };
      }
    );
  }


  function distributeAttributeXP(
    attributeIds:
      string[],

    xpPerAttribute:
      number,

    direction:
      1 | -1
  ) {
    setPlayer(
      (
        old
      ) => {
        const updatedAttributes = {
          ...old.attributes,
        };

        Array.from(
          new Set(
            attributeIds
          )
        ).forEach(
          (
            attributeId
          ) => {
            updatedAttributes[
              attributeId
            ] =
              Math.max(
                0,
                (
                  updatedAttributes[
                    attributeId
                  ] ??
                  0
                ) +
                  xpPerAttribute *
                    direction
              );
          }
        );

        return {
          ...old,

          attributes:
            updatedAttributes,
        };
      }
    );
  }


  function addAttribute(
    name:
      string
  ) {
    const cleanName =
      name.trim();

    if (
      !cleanName ||
      attributes.length >=
        MAX_ATTRIBUTES ||
      attributes.some(
        (
          attribute
        ) =>
          attribute.name
            .toLowerCase() ===
          cleanName.toLowerCase()
      )
    ) {
      return;
    }

    const id =
      `${cleanName
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-|-$/g,
          ""
        )}-${Date.now()}`;

    setAttributes(
      (
        old
      ) => [
        ...old,
        {
          id,
          name: cleanName,
        },
      ]
    );

    setPlayer(
      (
        old
      ) => ({
        ...old,

        attributes: {
          ...old.attributes,

          [id]: 0,
        },
      })
    );
  }


  function renameAttribute(
    id:
      string,

    name:
      string
  ) {
    const cleanName =
      name.trim();

    if (
      !cleanName ||
      attributes.some(
        (
          attribute
        ) =>
          attribute.id !==
            id &&
          attribute.name
            .toLowerCase() ===
          cleanName.toLowerCase()
      )
    ) {
      return;
    }

    setAttributes(
      (
        old
      ) =>
        old.map(
          (
            attribute
          ) =>
            attribute.id ===
            id
              ? {
                  ...attribute,

                  name:
                    cleanName,
                }
              : attribute
        )
    );
  }


  function deleteAttribute(
    id:
      string
  ) {
    setAttributes(
      (
        old
      ) =>
        old.filter(
          (
            attribute
          ) =>
            attribute.id !==
            id
        )
    );

    setTasks(
      (
        old
      ) =>
        old.map(
          (
            task
          ) => ({
            ...task,

            categories:
              task.categories.filter(
                (
                  category
                ) =>
                  category !==
                  id
              ),

            rewards:
              task.rewards.filter(
                (
                  reward
                ) =>
                  reward.category !==
                  id
              ),
          })
        )
    );

    setSkillPathConfigs(
      (
        old
      ) =>
        Object.fromEntries(
          Object.entries(
            old
          ).map(
            (
              [
                path,
                config,
              ]
            ) => [
              path,
              {
                ...config,

                attributeIds:
                  config.attributeIds.filter(
                    (
                      attributeId
                    ) =>
                      attributeId !==
                      id
                  ),
              },
            ]
          )
        ) as
          SkillPathConfigs
    );

    setPlayer(
      (
        old
      ) => {
        const nextAttributes = {
          ...old.attributes,
        };

        delete nextAttributes[
          id
        ];

        return {
          ...old,

          attributes:
            nextAttributes,
        };
      }
    );
  }


  function updateSkillPathConfig(
    path:
      Path,

    name:
      string,

    attributeIds:
      string[]
  ) {
    const cleanName =
      name.trim();

    setSkillPathConfigs(
      (
        old
      ) => ({
        ...old,

        [path]: {
          name:
            cleanName ||
            old[path].name,

          attributeIds:
            Array.from(
              new Set(
                attributeIds
              )
            ).filter(
              (
                attributeId
              ) =>
                attributes.some(
                  (
                    attribute
                  ) =>
                    attribute.id ===
                    attributeId
                )
            ),
        },
      })
    );
  }


  function startJourney(
    durationMonths:
      number,

    consistencyPercent:
      number
  ) {
    if (
      journeyPlan
    ) {
      return;
    }

    const safeMonths =
      Math.max(
        1,
        Math.min(
          120,
          Math.round(
            durationMonths
          )
        )
      );

    const safeConsistency =
      Math.max(
        50,
        Math.min(
          100,
          Math.round(
            consistencyPercent
          )
        )
      );

    const start =
      new Date();

    const target =
      addMonthsExact(
        start,
        safeMonths
      );

    setJourneyPlan({
      durationMonths:
        safeMonths,

      consistencyPercent:
        safeConsistency,

      startDate:
        getLocalDateKey(
          start
        ),

      targetDate:
        getLocalDateKey(
          target
        ),
    });

    setPlayer({
      ...initialPlayer,

      attributes: {
        ...initialPlayer.attributes,
      },
    });

    setCompletedTasks([]);

    setCompletedTaskAwards({});

    setGraceTasks([]);

    setCompletedSkills([]);

    setSkillNodes(
      skillMap.nodes.map(
        (
          node
        ) => ({
          ...node,

          xp:
            getSkillAward(
              node
            ),
        })
      )
    );

    const startDateKey =
      getLocalDateKey();

    setCurrentDateKey(
      startDateKey
    );

    setLastDailyDate(
      startDateKey
    );

    setCompletedTasksDate(
      startDateKey
    );
  }


  function resetJourney() {
    setJourneyPlan(null);

    setPlayer({
      ...initialPlayer,

      attributes: {
        ...initialPlayer.attributes,
      },
    });

    setCompletedTasks([]);

    setCompletedTaskAwards({});

    setGraceTasks([]);

    setCompletedSkills([]);

    setSkillNodes(
      skillMap.nodes.map(
        (
          node
        ) => ({
          ...node,

          xp:
            getSkillAward(
              node
            ),
        })
      )
    );

    const todayKey =
      getLocalDateKey();

    setCurrentDateKey(
      todayKey
    );

    setLastDailyDate(
      todayKey
    );

    setCompletedTasksDate(
      todayKey
    );

    localStorage.removeItem(
      "achievementDailyHistory"
    );

    localStorage.removeItem(
      "achievementSkillHistory"
    );

    localStorage.setItem(
      "achievementEventData",
      JSON.stringify(
        DEFAULT_ACHIEVEMENT_EVENTS
      )
    );

    notifyAchievements();
  }


  function addReward(
    rewards:
      Reward[],

    taskName:
      string
  ) {
    if (
      !journeyPlan ||
      currentDailyTaskXP <=
        0 ||
      completedTasks.includes(
        taskName
      )
    ) {
      return;
    }

    const task =
      tasks.find(
        (
          item
        ) =>
          item.name ===
          taskName
      );

    if (
      !task ||
      !isTaskDueOnDate(
        task,
        today
      )
    ) {
      return;
    }

    const awardedXP =
      Math.min(
        currentDailyTaskXP,
        DAILY_TASK_XP_BUDGET -
          player.dailyTaskXP
      );

    if (
      awardedXP <= 0
    ) {
      return;
    }

    const nextCompleted = [
      ...completedTasks,
      taskName,
    ];

    const allCompleted =
      todayTasks.length >
        0 &&
      todayTasks.every(
        (
          todayTask
        ) =>
          nextCompleted.includes(
            todayTask.name
          )
      );

    setCompletedTasks(
      nextCompleted
    );

    setCompletedTaskAwards(
      (
        old
      ) => ({
        ...old,

        [taskName]:
          awardedXP,
      })
    );

    /*
     * Make absolutely sure the completion state remains associated
     * with today's calendar date when a task is completed.
     */
    setCompletedTasksDate(
      todayKey
    );

    updateDailyJourneyXP(
      awardedXP,
      1
    );

    distributeAttributeXP(
      rewards.map(
        (
          reward
        ) =>
          reward.category ??
          reward.attribute ??
          ""
      ).filter(
        (
          attributeId
        ): attributeId is string =>
          Boolean(
            attributeId
          )
      ),
      DAILY_ATTRIBUTE_XP,
      1
    );

    recordDailyAchievement(
      taskName,
      allCompleted
    );
  }


  function removeReward(
    rewards:
      Reward[],

    taskName:
      string
  ) {
    if (
      !completedTasks.includes(
        taskName
      )
    ) {
      return;
    }

    const awardedXP =
      completedTaskAwards[
        taskName
      ] ??
      0;

    const nextCompleted =
      completedTasks.filter(
        (
          name
        ) =>
          name !==
          taskName
      );

    const allCompleted =
      todayTasks.length >
        0 &&
      todayTasks.every(
        (
          task
        ) =>
          nextCompleted.includes(
            task.name
          )
      );

    setCompletedTasks(
      nextCompleted
    );

    setCompletedTaskAwards(
      (
        old
      ) => {
        const next = {
          ...old,
        };

        delete next[
          taskName
        ];

        return next;
      }
    );

    updateDailyJourneyXP(
      awardedXP,
      -1
    );

    distributeAttributeXP(
      rewards.map(
        (
          reward
        ) =>
          reward.category ??
          reward.attribute ??
          ""
      ).filter(
        (
          attributeId
        ): attributeId is string =>
          Boolean(
            attributeId
          )
      ),
      DAILY_ATTRIBUTE_XP,
      -1
    );

    recordDailyAchievement(
      taskName,
      allCompleted,
      true
    );
  }


  function addTask(
    task:
      DailyTask
  ) {
    setTasks(
      (
        old
      ) => [
        ...old,
        normalizeTask(
          task
        ),
      ]
    );
  }


  async function deleteTask(
    id:
      number
  ) {
    const task =
      tasks.find(
        (
          currentTask
        ) =>
          currentTask.id ===
          id
      );

    if (!task) {
      return;
    }

    if (
      completedTasks.includes(
        task.name
      )
    ) {
      const choice =
        await choose({
          title: "Delete completed task?",
          description:
            "This task has already awarded XP. Choose what should happen to that XP.",
          choices: [
            {
              value: "keep-xp",
              label: "Delete task and keep XP",
            },
            {
              value: "remove-xp",
              label: "Delete task and remove XP",
              tone: "danger",
            },
          ],
          cancelLabel: "Keep task",
          tone: "warning",
        });

      if (choice === null) {
        return;
      }

      if (
        choice ===
        "remove-xp"
      ) {
        removeReward(
          task.rewards,
          task.name
        );
      }
    }

    setTasks(
      (
        old
      ) =>
        old.filter(
          (
            currentTask
          ) =>
            currentTask.id !==
            id
        )
    );
  }


  function updateTaskDetails(
    id:
      number,

    name:
      string,

    description:
      string
  ) {
    const trimmedName =
      name.trim();

    if (!trimmedName) {
      return;
    }

    const currentTask =
      tasks.find(
        (
          task
        ) =>
          task.id ===
          id
      );

    if (!currentTask) {
      return;
    }

    const oldName =
      currentTask.name;

    setTasks(
      (
        old
      ) =>
        old.map(
          (
            task
          ) =>
            task.id ===
            id
              ? {
                  ...task,

                  name:
                    trimmedName,

                  description:
                    description.trim(),
                }
              : task
        )
    );

    if (
      oldName !==
        trimmedName &&
      completedTasks.includes(
        oldName
      )
    ) {
      setCompletedTasks(
        (
          old
        ) =>
          old.map(
            (
              taskName
            ) =>
              taskName ===
              oldName
                ? trimmedName
                : taskName
          )
      );

      setCompletedTaskAwards(
        (
          old
        ) => {
          const oldAward =
            old[
              oldName
            ];

          if (
            oldAward ===
            undefined
          ) {
            return old;
          }

          const next = {
            ...old,
          };

          delete next[
            oldName
          ];

          next[
            trimmedName
          ] =
            oldAward;

          return next;
        }
      );
    }
  }


  function updateTaskSchedule(
    id:
      number,

    scheduledDays:
      Weekday[]
  ) {
    if (
      scheduledDays.length ===
      0
    ) {
      return;
    }

    setTasks(
      (
        old
      ) =>
        old.map(
          (
            task
          ) =>
            task.id === id
              ? {
                  ...task,

                  scheduledDays: [
                    ...scheduledDays,
                  ],
                }
              : task
        )
    );
  }


  function updateTaskAttributes(
    id:
      number,

    attributeIds:
      string[]
  ) {
    const validIds =
      Array.from(
        new Set(
          attributeIds
        )
      ).filter(
        (
          attributeId
        ) =>
          attributes.some(
            (
              attribute
            ) =>
              attribute.id ===
              attributeId
          )
      );

    if (
      validIds.length ===
      0
    ) {
      return;
    }

    setTasks(
      (
        old
      ) =>
        old.map(
          (
            task
          ) =>
            task.id === id
              ? {
                  ...task,

                  categories:
                    validIds,

                  rewards:
                    validIds.map(
                      (
                        attributeId
                      ) => ({
                        category:
                          attributeId,

                        xp: 0,
                      })
                    ),
                }
              : task
        )
    );
  }


  function completeGraceTask(
    graceTaskId:
      string
  ) {
    const graceTask =
      graceTasks.find(
        (
          task
        ) =>
          task.id ===
          graceTaskId
      );

    if (
      !graceTask ||
      !journeyPlan
    ) {
      return;
    }


    /*
     * Grace-task completion awards the same task XP mechanism as a
     * normal task, but it does not put the task into today's
     * completedTasks list.
     *
     * It is a late completion of yesterday's task.
     */
    const awardedXP =
      Math.min(
        currentDailyTaskXP,
        DAILY_TASK_XP_BUDGET -
          player.dailyTaskXP
      );

    if (
      awardedXP <= 0
    ) {
      return;
    }


    updateDailyJourneyXP(
      awardedXP,
      1
    );


    distributeAttributeXP(
      graceTask.categories,
      DAILY_ATTRIBUTE_XP,
      1
    );


    setGraceTasks(
      (
        old
      ) =>
        old.filter(
          (
            task
          ) =>
            task.id !==
            graceTaskId
        )
    );


    const events =
      readJSON<AchievementEventData>(
        "achievementEventData",
        DEFAULT_ACHIEVEMENT_EVENTS
      );


    events.forgivenessTasksCompleted +=
      1;


    localStorage.setItem(
      "achievementEventData",
      JSON.stringify(events)
    );


    notifyAchievements();
  }


  function missGraceTask(
    graceTaskId:
      string
  ) {
    /*
     * Missed means:
     *
     * - no XP
     * - no attribute XP
     * - remove from the grace list
     *
     * It does not alter today's completed tasks.
     */
    setGraceTasks(
      (
        old
      ) =>
        old.filter(
          (
            task
          ) =>
            task.id !==
            graceTaskId
        )
    );
  }


  function completeSkillNode(
    nodeId:
      number
  ) {
    const selectedNode =
      skillNodes.find(
        (
          node
        ) =>
          node.id ===
          nodeId
      );

    if (!selectedNode) {
      return;
    }

    const alreadyCompleted =
      completedSkills.includes(
        nodeId
      );


    if (!alreadyCompleted) {
      const unlocked =
        selectedNode.requires.every(
          (
            requirementId
          ) =>
            completedSkills.includes(
              requirementId
            )
        );

      if (
        selectedNode.requires.length >
          0 &&
        !unlocked
      ) {
        return;
      }

      const pathAttributes =
        getAttributesForPath(
          selectedNode.path
        );

      const attributeAward =
        SKILL_ATTRIBUTE_XP[
          selectedNode.tier
        ];

      setPlayer(
        (
          old
        ) => {
          const award =
            Math.min(
              Math.max(
                0,
                selectedNode.xp
              ),
              Math.max(
                0,
                SKILL_TREE_XP_BUDGET -
                  old.skillTreeXP
              )
            );

          const updatedAttributes = {
            ...old.attributes,
          };

          pathAttributes.forEach(
            (
              attributeId
            ) => {
              updatedAttributes[
                attributeId
              ] =
                (
                  updatedAttributes[
                    attributeId
                  ] ??
                  0
                ) +
                attributeAward;
            }
          );

          const nextSkillXP =
            Math.min(
              SKILL_TREE_XP_BUDGET,
              old.skillTreeXP +
                award
            );

          return {
            ...old,

            skillTreeXP:
              nextSkillXP,

            totalXP:
              Math.min(
                MAX_LEVEL_XP,
                old.dailyTaskXP +
                  nextSkillXP
              ),

            attributes:
              updatedAttributes,
          };
        }
      );

      setCompletedSkills(
        (
          old
        ) =>
          old.includes(
            nodeId
          )
            ? old
            : [
                ...old,
                nodeId,
              ]
      );

      recordSkillAchievement(
        nodeId
      );

      return;
    }


    const nodesToUndo =
      new Set<number>();


    function collectDescendants(
      currentId:
        number
    ) {
      if (
        nodesToUndo.has(
          currentId
        )
      ) {
        return;
      }

      nodesToUndo.add(
        currentId
      );

      const currentNode =
        skillNodes.find(
          (
            node
          ) =>
            node.id ===
            currentId
        );

      currentNode?.next.forEach(
        (
          nextId
        ) => {
          if (
            completedSkills.includes(
              nextId
            )
          ) {
            collectDescendants(
              nextId
            );
          }
        }
      );
    }


    collectDescendants(
      nodeId
    );


    const undoNodes =
      skillNodes.filter(
        (
          node
        ) =>
          nodesToUndo.has(
            node.id
          ) &&
          completedSkills.includes(
            node.id
          )
      );


    const totalToRemove =
      undoNodes.reduce(
        (
          total,
          node
        ) =>
          total +
          Math.max(
            0,
            node.xp
          ),
        0
      );


    const attributeXPToRemove:
      Record<string, number> = {};


    undoNodes.forEach(
      (
        node
      ) => {
        const nodeAttributeAward =
          SKILL_ATTRIBUTE_XP[
            node.tier
          ];

        getAttributesForPath(
          node.path
        ).forEach(
          (
            attributeId
          ) => {
            attributeXPToRemove[
              attributeId
            ] =
              (
                attributeXPToRemove[
                  attributeId
                ] ??
                0
              ) +
              nodeAttributeAward;
          }
        );
      }
    );


    setPlayer(
      (
        old
      ) => {
        const updatedAttributes = {
          ...old.attributes,
        };

        Object.entries(
          attributeXPToRemove
        ).forEach(
          (
            [
              attributeId,
              xp,
            ]
          ) => {
            updatedAttributes[
              attributeId
            ] =
              Math.max(
                0,
                (
                  updatedAttributes[
                    attributeId
                  ] ??
                  0
                ) -
                  xp
              );
          }
        );

        const nextSkillXP =
          Math.max(
            0,
            old.skillTreeXP -
              totalToRemove
          );

        return {
          ...old,

          skillTreeXP:
            nextSkillXP,

          totalXP:
            Math.min(
              MAX_LEVEL_XP,
              old.dailyTaskXP +
                nextSkillXP
            ),

          attributes:
            updatedAttributes,
        };
      }
    );


    setCompletedSkills(
      (
        old
      ) =>
        old.filter(
          (
            completedId
          ) =>
            !nodesToUndo.has(
              completedId
            )
        )
    );
  }


  function updateSkillNode(
    nodeId:
      number,

    name:
      string,

    description:
      string
  ) {
    setSkillNodes(
      (
        nodes
      ) =>
        nodes.map(
          (
            node
          ) =>
            node.id ===
            nodeId
              ? {
                  ...node,
                  name,
                  description,
                }
              : node
        )
    );
  }


  return (
    <GameContextProvider
      value={{
        player,
        attributes,
        skillPathConfigs,
        tasks,
        todayTasks,
        completedTasks,
        completedTaskAwards,
        graceTasks,
        skillNodes,
        completedSkills,
        journeyPlan,
        currentDailyTaskXP,
        remainingTaskOpportunities,
        expectedRemainingCompletions,
        journeyDaysRemaining,
        addAttribute,
        renameAttribute,
        deleteAttribute,
        updateSkillPathConfig,
        startJourney,
        resetJourney,
        addReward,
        removeReward,
        addTask,
        deleteTask,
        updateTaskDetails,
        updateTaskSchedule,
        updateTaskAttributes,
        completeGraceTask,
        missGraceTask,
        completeSkillNode,
        updateSkillNode,
      }}
    >
      {children}
    </GameContextProvider>
  );
}


export function useGame():
  GameContextType {
  const context =
    useContext(
      GameContext
    );

  if (!context) {
    throw new Error(
      "useGame must be used inside GameProvider"
    );
  }

  return context;
}
