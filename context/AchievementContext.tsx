"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AchievementDefinition,
  AchievementMetric,
  achievements,
} from "@/data/achievements";

import { useGame } from "@/context/GameContext";


import { useAppDialog } from "@/components/ui/AppDialogProvider";

type AccountType =
  | "savings"
  | "spending";


interface BudgetAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  allocationPercent: number;
}


interface BudgetAllocation {
  accountId: number;
  accountName: string;
  accountType: AccountType;
  amount: number;
}


interface BudgetTransaction {
  id: number;

  type:
    | "paycheck"
    | "deposit"
    | "purchase"
    | "transfer";

  amount: number;

  description: string;

  date: string;

  accountType?: AccountType;

  allocations?: BudgetAllocation[];
}


interface BudgetData {
  allocationMode:
    | "percentage"
    | "manual";

  accounts: BudgetAccount[];

  transactions: BudgetTransaction[];
}


interface AchievementEventData {
  dailyTasksCompleted: number;

  perfectDays: number;

  perfectDayStreak: number;

  forgivenessTasksCompleted: number;

  perfectDayBeforeEight: number;

  perfectDayAfterTen: number;

  daysWithoutSavingsWithdrawal: number;

  forgivenessRecoveryStreak: number;
}

interface AppAchievementMetrics {
  focusSessions: number;
  focusMinutes: number;
  focusLongestMinutes: number;
  focusDays: number;
  focusModesUsed: number;
  focusScenesUsed: number;
  friendCount: number;
  friendRequestsSent: number;
  friendRequestsAccepted: number;
  friendProfilesViewed: number;
  calendarEventsCreated: number;
  futureCalendarEvents: number;
  sharedCalendarsCreated: number;
  calendarInvitesSent: number;
  dailyTasksScheduled: number;
  skillDeadlinesSet: number;
  appTabsVisited: number;
}

interface AchievementMetricEventDetail {
  metric: keyof AppAchievementMetrics;
  value: number;
  mode?: "set" | "increment" | "max";
}

export interface AchievementProgress {
  current: number;

  target: number;

  percentage: number;

  complete: boolean;
}


interface AchievementContextType {
  unlockedAchievementIds: string[];

  unlockDates:
    Record<string, string>;

  earnedTitles: string[];

  selectedTitle:
    string | null;

  eventData:
    AchievementEventData;

  unlockedCount: number;

  totalVisibleAchievements: number;

  getProgress: (
    achievement:
      AchievementDefinition
  ) => AchievementProgress;

  isUnlocked: (
    achievementId: string
  ) => boolean;

  selectTitle: (
    title: string | null
  ) => void;

  recordDailyTaskCompletion:
    () => void;

  recordPerfectDay: (
    completedAt?: Date
  ) => void;

  recordForgivenessCompletion:
    () => void;

  setDaysWithoutSavingsWithdrawal: (
    days: number
  ) => void;

  resetPerfectDayStreak:
    () => void;

  resetAchievementData:
    () => Promise<void>;
}


interface PlayerWithOptionalLevel {
  level?: number;
}


const DEFAULT_EVENT_DATA:
  AchievementEventData = {
  dailyTasksCompleted: 0,

  perfectDays: 0,

  perfectDayStreak: 0,

  forgivenessTasksCompleted: 0,

  perfectDayBeforeEight: 0,

  perfectDayAfterTen: 0,

  daysWithoutSavingsWithdrawal: 0,

  forgivenessRecoveryStreak: 0,
};

const DEFAULT_APP_METRICS: AppAchievementMetrics = {
  focusSessions: 0, focusMinutes: 0, focusLongestMinutes: 0, focusDays: 0, focusModesUsed: 0, focusScenesUsed: 0,
  friendCount: 0, friendRequestsSent: 0, friendRequestsAccepted: 0, friendProfilesViewed: 0,
  calendarEventsCreated: 0, futureCalendarEvents: 0, sharedCalendarsCreated: 0, calendarInvitesSent: 0,
  dailyTasksScheduled: 0, skillDeadlinesSet: 0, appTabsVisited: 0,
};

function readAppAchievementMetrics(): AppAchievementMetrics {
  if (typeof window === "undefined") return { ...DEFAULT_APP_METRICS };
  try {
    const saved = localStorage.getItem("lifeRpgAchievementMetrics");
    return saved ? { ...DEFAULT_APP_METRICS, ...JSON.parse(saved) } : { ...DEFAULT_APP_METRICS };
  } catch { return { ...DEFAULT_APP_METRICS }; }
}

const EMPTY_BUDGET_DATA:
  BudgetData = {
  allocationMode:
    "percentage",

  accounts: [],

  transactions: [],
};


const AchievementContext =
  createContext<
    AchievementContextType | undefined
  >(undefined);


function clampProgress(
  value: number,
  target: number
): AchievementProgress {
  const safeValue =
    Number.isFinite(value)
      ? Math.max(
          0,
          value
        )
      : 0;

  const safeTarget =
    Math.max(
      1,
      target
    );

  return {
    current:
      safeValue,

    target:
      safeTarget,

    percentage:
      Math.min(
        100,
        (
          safeValue /
          safeTarget
        ) *
          100
      ),

    complete:
      safeValue >=
      safeTarget,
  };
}


function readAchievementEvents():
  AchievementEventData {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      ...DEFAULT_EVENT_DATA,
    };
  }

  try {
    const saved =
      localStorage.getItem(
        "achievementEventData"
      );

    if (!saved) {
      return {
        ...DEFAULT_EVENT_DATA,
      };
    }

    return {
      ...DEFAULT_EVENT_DATA,

      ...JSON.parse(
        saved
      ),
    };
  } catch {
    return {
      ...DEFAULT_EVENT_DATA,
    };
  }
}


function readBudgetData():
  BudgetData {
  if (
    typeof window ===
    "undefined"
  ) {
    return {
      ...EMPTY_BUDGET_DATA,
    };
  }

  try {
    const saved =
      localStorage.getItem(
        "budgetAccountsData"
      );

    if (!saved) {
      return {
        ...EMPTY_BUDGET_DATA,
      };
    }

    const parsed =
      JSON.parse(
        saved
      ) as
        Partial<BudgetData>;

    return {
      allocationMode:
        parsed.allocationMode ??
        "percentage",

      accounts:
        Array.isArray(
          parsed.accounts
        )
          ? parsed.accounts
          : [],

      transactions:
        Array.isArray(
          parsed.transactions
        )
          ? parsed.transactions
          : [],
    };
  } catch {
    return {
      ...EMPTY_BUDGET_DATA,
    };
  }
}


function arraysMatch(
  first: string[],
  second: string[]
) {
  if (
    first.length !==
    second.length
  ) {
    return false;
  }

  const secondSet =
    new Set(second);

  return first.every(
    (item) =>
      secondSet.has(item)
  );
}


function recordsMatch(
  first:
    Record<string, string>,
  second:
    Record<string, string>
) {
  const firstKeys =
    Object.keys(first);

  const secondKeys =
    Object.keys(second);

  if (
    firstKeys.length !==
    secondKeys.length
  ) {
    return false;
  }

  return firstKeys.every(
    (key) =>
      first[key] ===
      second[key]
  );
}


function getCurrentMonthKey() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}`;
}


export function AchievementProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { confirm } = useAppDialog();
  const {
    player,

    completedTasks,

    skillNodes,

    completedSkills,
  } = useGame();


  const [
    unlockedAchievementIds,
    setUnlockedAchievementIds,
  ] =
    useState<string[]>([]);


  const [
    unlockDates,
    setUnlockDates,
  ] =
    useState<
      Record<string, string>
    >({});


  const [
    selectedTitle,
    setSelectedTitle,
  ] =
    useState<
      string | null
    >(null);


  const [
    eventData,
    setEventData,
  ] =
    useState<
      AchievementEventData
    >(
      DEFAULT_EVENT_DATA
    );


  const [
    budgetData,
    setBudgetData,
  ] =
    useState<BudgetData>(
      EMPTY_BUDGET_DATA
    );


  const [appMetrics, setAppMetrics] =
    useState<AppAchievementMetrics>(DEFAULT_APP_METRICS);

  const [notificationQueue, setNotificationQueue] =
    useState<AchievementDefinition[]>([]);

  const previousUnlockedRef = useRef<string[] | null>(null);

  const [
    hasLoaded,
    setHasLoaded,
  ] =
    useState(false);


  useEffect(() => {
    try {
      const savedUnlocked =
        localStorage.getItem(
          "unlockedAchievements"
        );

      const savedDates =
        localStorage.getItem(
          "achievementUnlockDates"
        );

      const savedTitle =
        localStorage.getItem(
          "selectedAchievementTitle"
        );


      if (savedUnlocked) {
        setUnlockedAchievementIds(
          JSON.parse(
            savedUnlocked
          )
        );
      }


      if (savedDates) {
        setUnlockDates(
          JSON.parse(
            savedDates
          )
        );
      }


      if (savedTitle) {
        setSelectedTitle(
          JSON.parse(
            savedTitle
          )
        );
      }


      setEventData(
        readAchievementEvents()
      );


      setBudgetData(
        readBudgetData()
      );

      setAppMetrics(
        readAppAchievementMetrics()
      );
    } catch (error) {
      console.error(
        "Failed to load achievement data:",
        error
      );
    } finally {
      setHasLoaded(
        true
      );
    }
  }, []);


  useEffect(() => {
    function refreshAchievementEvents() {
      setEventData(
        readAchievementEvents()
      );
    }

    window.addEventListener(
      "achievement-data-updated",
      refreshAchievementEvents
    );

    return () => {
      window.removeEventListener(
        "achievement-data-updated",
        refreshAchievementEvents
      );
    };
  }, []);



  useEffect(() => {
    function handleMetricEvent(event: Event) {
      const detail = (event as CustomEvent<AchievementMetricEventDetail>).detail;
      if (!detail || !(detail.metric in DEFAULT_APP_METRICS)) return;
      setAppMetrics((current) => {
        const oldValue = current[detail.metric];
        const nextValue = detail.mode === "increment" ? oldValue + detail.value : detail.mode === "max" ? Math.max(oldValue, detail.value) : detail.value;
        const next = { ...current, [detail.metric]: Math.max(0, nextValue) };
        localStorage.setItem("lifeRpgAchievementMetrics", JSON.stringify(next));
        return next;
      });
    }
    window.addEventListener("achievement-metric", handleMetricEvent);
    return () => window.removeEventListener("achievement-metric", handleMetricEvent);
  }, []);

  useEffect(() => {
    function refreshBudget() {
      setBudgetData(
        readBudgetData()
      );
    }

    const interval =
      window.setInterval(
        refreshBudget,
        1500
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);


  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    localStorage.setItem(
      "unlockedAchievements",
      JSON.stringify(
        unlockedAchievementIds
      )
    );
  }, [
    unlockedAchievementIds,
    hasLoaded,
  ]);


  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    localStorage.setItem(
      "achievementUnlockDates",
      JSON.stringify(
        unlockDates
      )
    );
  }, [
    unlockDates,
    hasLoaded,
  ]);


  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    localStorage.setItem(
      "selectedAchievementTitle",
      JSON.stringify(
        selectedTitle
      )
    );
  }, [
    selectedTitle,
    hasLoaded,
  ]);


  const numericAttributes =
    useMemo(() => {
      return Object.values(
        player.attributes as
          Record<
            string,
            number
          >
      ).filter(
        (value) =>
          typeof value ===
          "number"
      );
    }, [
      player.attributes,
    ]);


  const playerLevel =
    useMemo(() => {
      const savedLevel =
        (
          player as
            PlayerWithOptionalLevel
        ).level;

      if (
        typeof savedLevel ===
        "number"
      ) {
        return savedLevel;
      }

      return (
        Math.floor(
          player.totalXP /
            100
        ) + 1
      );
    }, [
      player,
    ]);


  const minimumAttributeXP =
    numericAttributes.length >
    0
      ? Math.min(
          ...numericAttributes
        )
      : 0;


  const highestAttributeXP =
    numericAttributes.length >
    0
      ? Math.max(
          ...numericAttributes
        )
      : 0;


  const completedSkillNodes =
    useMemo(() => {
      return skillNodes.filter(
        (node) =>
          completedSkills.includes(
            node.id
          )
      );
    }, [
      skillNodes,
      completedSkills,
    ]);


  const pathsStarted =
    useMemo(() => {
      return new Set(
        completedSkillNodes.map(
          (node) =>
            node.path
        )
      ).size;
    }, [
      completedSkillNodes,
    ]);


  const completedPathNames =
    useMemo(() => {
      const paths = [
        "Body",
        "Mind",
        "Spirit",
        "Life",
      ] as const;

      return paths.filter(
        (path) => {
          const pathNodes =
            skillNodes.filter(
              (node) =>
                node.path ===
                path
            );

          return (
            pathNodes.length >
              0 &&
            pathNodes.every(
              (node) =>
                completedSkills.includes(
                  node.id
                )
            )
          );
        }
      );
    }, [
      skillNodes,
      completedSkills,
    ]);


  const allBronzeCompleted =
    useMemo(() => {
      const nodes =
        skillNodes.filter(
          (node) =>
            node.tier ===
            "Bronze"
        );

      return (
        nodes.length > 0 &&
        nodes.every(
          (node) =>
            completedSkills.includes(
              node.id
            )
        )
      );
    }, [
      skillNodes,
      completedSkills,
    ]);


  const allSilverCompleted =
    useMemo(() => {
      const nodes =
        skillNodes.filter(
          (node) =>
            node.tier ===
            "Silver"
        );

      return (
        nodes.length > 0 &&
        nodes.every(
          (node) =>
            completedSkills.includes(
              node.id
            )
        )
      );
    }, [
      skillNodes,
      completedSkills,
    ]);


  const allGoldCompleted =
    useMemo(() => {
      const nodes =
        skillNodes.filter(
          (node) =>
            node.tier ===
            "Gold"
        );

      return (
        nodes.length > 0 &&
        nodes.every(
          (node) =>
            completedSkills.includes(
              node.id
            )
        )
      );
    }, [
      skillNodes,
      completedSkills,
    ]);


  const savingsBalance =
    useMemo(() => {
      return budgetData.accounts
        .filter(
          (account) =>
            account.type ===
            "savings"
        )
        .reduce(
          (
            total,
            account
          ) =>
            total +
            account.balance,

          0
        );
    }, [
      budgetData.accounts,
    ]);


  const fundedAccounts =
    useMemo(() => {
      return budgetData.accounts.filter(
        (account) =>
          account.balance >
          0
      ).length;
    }, [
      budgetData.accounts,
    ]);


  const paychecksLogged =
    useMemo(() => {
      return budgetData.transactions.filter(
        (transaction) =>
          transaction.type ===
          "paycheck"
      ).length;
    }, [
      budgetData.transactions,
    ]);


  const fullyAllocatedPaychecks =
    useMemo(() => {
      return budgetData.transactions.filter(
        (transaction) => {
          if (
            transaction.type !==
              "paycheck" ||
            !transaction.allocations
          ) {
            return false;
          }

          const allocated =
            transaction.allocations.reduce(
              (
                total,
                allocation
              ) =>
                total +
                allocation.amount,

              0
            );

          return (
            Math.abs(
              allocated -
              transaction.amount
            ) < 0.01
          );
        }
      ).length;
    }, [
      budgetData.transactions,
    ]);


  const customAccountsCreated =
    useMemo(() => {
      return Math.max(
        0,

        budgetData.accounts.length -
          2
      );
    }, [
      budgetData.accounts,
    ]);


  const monthsSavedMoreThanSpent =
    useMemo(() => {
      const currentMonth =
        getCurrentMonthKey();

      const monthTotals:
        Record<
          string,
          {
            saved: number;

            spent: number;
          }
        > = {};


      budgetData.transactions.forEach(
        (transaction) => {
          const month =
            transaction.date.slice(
              0,
              7
            );

          if (
            month ===
            currentMonth
          ) {
            return;
          }


          if (
            !monthTotals[
              month
            ]
          ) {
            monthTotals[
              month
            ] = {
              saved: 0,

              spent: 0,
            };
          }


          if (
            transaction.type ===
            "purchase"
          ) {
            monthTotals[
              month
            ].spent +=
              transaction.amount;
          }


          if (
            transaction.type ===
              "deposit" &&
            transaction.accountType ===
              "savings"
          ) {
            monthTotals[
              month
            ].saved +=
              transaction.amount;
          }


          if (
            transaction.type ===
              "paycheck" &&
            transaction.allocations
          ) {
            transaction.allocations.forEach(
              (allocation) => {
                if (
                  allocation.accountType ===
                  "savings"
                ) {
                  monthTotals[
                    month
                  ].saved +=
                    allocation.amount;
                }
              }
            );
          }
        }
      );


      return Object.values(
        monthTotals
      ).filter(
        (month) =>
          month.saved >
          month.spent
      ).length;
    }, [
      budgetData.transactions,
    ]);


  const getMetricValue =
    useCallback(
      (
        metric:
          AchievementMetric
      ): number => {
        switch (metric) {
          case "totalXP":
            return player.totalXP;


          case "playerLevel":
            return playerLevel;


          case "minimumAttributeXP":
            return minimumAttributeXP;


          case "highestAttributeXP":
            return highestAttributeXP;


          case "dailyTasksCompleted":
            return Math.max(
              eventData.dailyTasksCompleted,

              completedTasks.length
            );


          case "perfectDays":
            return eventData.perfectDays;


          case "perfectDayStreak":
            return eventData.perfectDayStreak;


          case "forgivenessTasksCompleted":
            return eventData.forgivenessTasksCompleted;


          case "skillsCompleted":
            return completedSkills.length;


          case "pathsStarted":
            return pathsStarted;


          case "pathsCompleted":
            return completedPathNames.length;


          case "bodyPathCompleted":
            return completedPathNames.includes(
              "Body"
            )
              ? 1
              : 0;


          case "mindPathCompleted":
            return completedPathNames.includes(
              "Mind"
            )
              ? 1
              : 0;


          case "spiritPathCompleted":
            return completedPathNames.includes(
              "Spirit"
            )
              ? 1
              : 0;


          case "lifePathCompleted":
            return completedPathNames.includes(
              "Life"
            )
              ? 1
              : 0;


          case "allBronzeCompleted":
            return allBronzeCompleted
              ? 1
              : 0;


          case "allSilverCompleted":
            return allSilverCompleted
              ? 1
              : 0;


          case "allGoldCompleted":
            return allGoldCompleted
              ? 1
              : 0;


          case "paychecksLogged":
            return paychecksLogged;


          case "paychecksFullyAllocated":
            return fullyAllocatedPaychecks;


          case "savingsBalance":
            return savingsBalance;


          case "customAccountsCreated":
            return customAccountsCreated;


          case "fundedAccounts":
            return fundedAccounts;


          case "monthsSavedMoreThanSpent":
            return monthsSavedMoreThanSpent;


          case "perfectDayBeforeEight":
            return eventData.perfectDayBeforeEight;


          case "perfectDayAfterTen":
            return eventData.perfectDayAfterTen;


          case "daysWithoutSavingsWithdrawal":
            return eventData.daysWithoutSavingsWithdrawal;


          case "forgivenessRecoveryStreak":
            return eventData.forgivenessRecoveryStreak;


          case "focusSessions": return appMetrics.focusSessions;
          case "focusMinutes": return appMetrics.focusMinutes;
          case "focusLongestMinutes": return appMetrics.focusLongestMinutes;
          case "focusDays": return appMetrics.focusDays;
          case "focusModesUsed": return appMetrics.focusModesUsed;
          case "focusScenesUsed": return appMetrics.focusScenesUsed;
          case "friendCount": return appMetrics.friendCount;
          case "friendRequestsSent": return appMetrics.friendRequestsSent;
          case "friendRequestsAccepted": return appMetrics.friendRequestsAccepted;
          case "friendProfilesViewed": return appMetrics.friendProfilesViewed;
          case "calendarEventsCreated": return appMetrics.calendarEventsCreated;
          case "futureCalendarEvents": return appMetrics.futureCalendarEvents;
          case "sharedCalendarsCreated": return appMetrics.sharedCalendarsCreated;
          case "calendarInvitesSent": return appMetrics.calendarInvitesSent;
          case "dailyTasksScheduled": return appMetrics.dailyTasksScheduled;
          case "skillDeadlinesSet": return appMetrics.skillDeadlinesSet;
          case "appTabsVisited": return appMetrics.appTabsVisited;

          default:
            return 0;
        }
      },

      [
        player.totalXP,

        playerLevel,

        minimumAttributeXP,

        highestAttributeXP,

        eventData,

        completedTasks.length,

        completedSkills.length,

        pathsStarted,

        completedPathNames,

        allBronzeCompleted,

        allSilverCompleted,

        allGoldCompleted,

        paychecksLogged,

        fullyAllocatedPaychecks,

        savingsBalance,

        customAccountsCreated,

        fundedAccounts,

        monthsSavedMoreThanSpent,
        appMetrics,
      ]
    );


  const getProgress =
    useCallback(
      (
        achievement:
          AchievementDefinition
      ): AchievementProgress => {
        if (
          achievement.id ===
          "general-completionist"
        ) {
          const requiredAchievements =
            achievements.filter(
              (item) =>
                !item.hidden &&
                item.id !==
                  "general-completionist"
            );

          const completedCount =
            requiredAchievements.filter(
              (item) =>
                clampProgress(
                  getMetricValue(
                    item.metric
                  ),

                  item.target
                ).complete
            ).length;

          return clampProgress(
            completedCount,

            requiredAchievements.length
          );
        }


        return clampProgress(
          getMetricValue(
            achievement.metric
          ),

          achievement.target
        );
      },

      [
        getMetricValue,
      ]
    );


  useEffect(() => {
    if (!hasLoaded) {
      return;
    }


    const reversibleAchievementMetrics =
      new Set<AchievementMetric>([
        "totalXP",
        "playerLevel",
        "minimumAttributeXP",
        "highestAttributeXP",
        "skillsCompleted",
        "pathsStarted",
        "pathsCompleted",
        "bodyPathCompleted",
        "mindPathCompleted",
        "spiritPathCompleted",
        "lifePathCompleted",
        "allBronzeCompleted",
        "allSilverCompleted",
        "allGoldCompleted",
        "fundedAccounts",
      ]);


    const completedNowIds =
      achievements
        .filter(
          (achievement) =>
            getProgress(
              achievement
            ).complete
        )
        .map(
          (achievement) =>
            achievement.id
        );


    const permanentPreviouslyUnlockedIds =
      unlockedAchievementIds.filter(
        (achievementId) => {
          const achievement =
            achievements.find(
              (item) =>
                item.id ===
                achievementId
            );

          if (!achievement) {
            return false;
          }

          return !reversibleAchievementMetrics.has(
            achievement.metric
          );
        }
      );


    const nextUnlockedIds =
      Array.from(
        new Set([
          ...completedNowIds,
          ...permanentPreviouslyUnlockedIds,
        ])
      );


    if (
      previousUnlockedRef.current ===
      null
    ) {
      previousUnlockedRef.current =
        nextUnlockedIds;
    } else {
      const newlyUnlocked =
        nextUnlockedIds
          .filter(
            (id) =>
              !previousUnlockedRef.current?.includes(
                id
              )
          )
          .map(
            (id) =>
              achievements.find(
                (achievement) =>
                  achievement.id ===
                  id
              )
          )
          .filter(
            (
              achievement
            ): achievement is AchievementDefinition =>
              Boolean(
                achievement
              )
          );

      if (
        newlyUnlocked.length
      ) {
        setNotificationQueue(
          (queue) => [
            ...queue,
            ...newlyUnlocked,
          ]
        );
      }

      previousUnlockedRef.current =
        nextUnlockedIds;
    }


    setUnlockedAchievementIds(
      (old) =>
        arraysMatch(
          old,
          nextUnlockedIds
        )
          ? old
          : nextUnlockedIds
    );


    setUnlockDates(
      (old) => {
        const next:
          Record<
            string,
            string
          > = {
          ...old,
        };


        nextUnlockedIds.forEach(
          (achievementId) => {
            next[
              achievementId
            ] =
              old[
                achievementId
              ] ??
              new Date()
                .toISOString();
          }
        );


        return recordsMatch(
          old,
          next
        )
          ? old
          : next;
      }
    );
  }, [
    hasLoaded,
    getProgress,
    unlockedAchievementIds,
  ]);


  const earnedTitles =
    useMemo(() => {
      return achievements
        .filter(
          (achievement) =>
            unlockedAchievementIds.includes(
              achievement.id
            ) &&
            achievement.rewardTitle
        )
        .map(
          (achievement) =>
            achievement.rewardTitle as string
        )
        .filter(
          (
            title,
            index,
            titles
          ) =>
            titles.indexOf(
              title
            ) === index
        );
    }, [
      unlockedAchievementIds,
    ]);


  useEffect(() => {
    if (
      selectedTitle &&
      !earnedTitles.includes(
        selectedTitle
      )
    ) {
      setSelectedTitle(
        null
      );
    }
  }, [
    selectedTitle,
    earnedTitles,
  ]);


  const visibleAchievements =
    useMemo(() => {
      return achievements.filter(
        (achievement) =>
          !achievement.hidden
      );
    }, []);


  const unlockedCount =
    visibleAchievements.filter(
      (achievement) =>
        unlockedAchievementIds.includes(
          achievement.id
        )
    ).length;


  function isUnlocked(
    achievementId: string
  ) {
    return unlockedAchievementIds.includes(
      achievementId
    );
  }


  function selectTitle(
    title: string | null
  ) {
    if (
      title !== null &&
      !earnedTitles.includes(
        title
      )
    ) {
      return;
    }

    setSelectedTitle(
      title
    );
  }


  function updateEventData(
    updater: (
      current:
        AchievementEventData
    ) => AchievementEventData
  ) {
    setEventData(
      (old) => {
        const updated =
          updater(old);

        localStorage.setItem(
          "achievementEventData",

          JSON.stringify(
            updated
          )
        );

        window.dispatchEvent(
          new Event(
            "achievement-data-updated"
          )
        );

        return updated;
      }
    );
  }


  function recordDailyTaskCompletion() {
    updateEventData(
      (old) => ({
        ...old,

        dailyTasksCompleted:
          old.dailyTasksCompleted +
          1,
      })
    );
  }


  function recordPerfectDay(
    completedAt =
      new Date()
  ) {
    const hour =
      completedAt.getHours();

    updateEventData(
      (old) => ({
        ...old,

        perfectDays:
          old.perfectDays +
          1,

        perfectDayStreak:
          old.perfectDayStreak +
          1,

        perfectDayBeforeEight:
          hour < 8
            ? old.perfectDayBeforeEight +
              1
            : old.perfectDayBeforeEight,

        perfectDayAfterTen:
          hour >= 22
            ? old.perfectDayAfterTen +
              1
            : old.perfectDayAfterTen,
      })
    );
  }


  function recordForgivenessCompletion() {
    updateEventData(
      (old) => ({
        ...old,

        forgivenessTasksCompleted:
          old.forgivenessTasksCompleted +
          1,

        forgivenessRecoveryStreak:
          0,
      })
    );
  }


  function setDaysWithoutSavingsWithdrawal(
    days: number
  ) {
    updateEventData(
      (old) => ({
        ...old,

        daysWithoutSavingsWithdrawal:
          Math.max(
            0,
            days
          ),
      })
    );
  }


  function resetPerfectDayStreak() {
    updateEventData(
      (old) => ({
        ...old,

        perfectDayStreak:
          0,

        forgivenessRecoveryStreak:
          0,
      })
    );
  }


  async function resetAchievementData() {
    const confirmed =
      await confirm({
        title: "Reset achievements?",
        description:
          "This permanently clears all achievement progress, unlock dates, earned titles, and achievement history.",
        confirmLabel: "Reset achievements",
        tone: "danger",
      });

    if (!confirmed) {
      return;
    }

    setUnlockedAchievementIds(
      []
    );

    setUnlockDates(
      {}
    );

    setSelectedTitle(
      null
    );

    setEventData(
      DEFAULT_EVENT_DATA
    );

    setAppMetrics(DEFAULT_APP_METRICS);
    localStorage.setItem("lifeRpgAchievementMetrics", JSON.stringify(DEFAULT_APP_METRICS));

    localStorage.setItem(
      "achievementEventData",

      JSON.stringify(
        DEFAULT_EVENT_DATA
      )
    );

    localStorage.removeItem(
      "achievementDailyHistory"
    );

    localStorage.removeItem(
      "achievementSkillHistory"
    );
  }


  return (
    <AchievementContext.Provider
      value={{
        unlockedAchievementIds,

        unlockDates,

        earnedTitles,

        selectedTitle,

        eventData,

        unlockedCount,

        totalVisibleAchievements:
          visibleAchievements.length,

        getProgress,

        isUnlocked,

        selectTitle,

        recordDailyTaskCompletion,

        recordPerfectDay,

        recordForgivenessCompletion,

        setDaysWithoutSavingsWithdrawal,

        resetPerfectDayStreak,

        resetAchievementData,
      }}
    >
      {children}

      {notificationQueue[0] && (
        <AchievementUnlockToast
          achievement={notificationQueue[0]}
          onClose={() => setNotificationQueue((queue) => queue.slice(1))}
        />
      )}
    </AchievementContext.Provider>
  );
}

function AchievementUnlockToast({ achievement, onClose }: { achievement: AchievementDefinition; onClose: () => void; }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5200);
    return () => window.clearTimeout(timer);
  }, [achievement.id, onClose]);

  return (
    <div className="fixed right-5 top-5 z-[1000] w-[min(380px,calc(100vw-40px))] animate-[achievementToast_.35s_ease-out] rounded-2xl border border-yellow-300/40 bg-zinc-950/95 p-5 text-white shadow-[0_20px_70px_rgba(250,204,21,.28)] backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-yellow-300/40 bg-yellow-400/10 text-3xl">{achievement.icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[.18em] text-yellow-300">Achievement Unlocked</p>
          <h2 className="mt-1 text-xl font-black">{achievement.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{achievement.description}</p>
          {achievement.rewardTitle && <p className="mt-3 text-xs font-bold text-yellow-200">Title earned: {achievement.rewardTitle}</p>}
        </div>
        <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white" aria-label="Dismiss achievement">✕</button>
      </div>
    </div>
  );
}

export function useAchievements() {
  const context =
    useContext(
      AchievementContext
    );

  if (!context) {
    throw new Error(
      "useAchievements must be used inside AchievementProvider"
    );
  }

  return context;
}