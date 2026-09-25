"use client";

export type AchievementCategory =
  | "general"
  | "daily"
  | "skills"
  | "budget"
  | "calendar"
  | "friends"
  | "focus"
  | "hidden";

export type AchievementMetric =
  | "totalXP"
  | "playerLevel"
  | "minimumAttributeXP"
  | "highestAttributeXP"
  | "dailyTasksCompleted"
  | "perfectDays"
  | "perfectDayStreak"
  | "forgivenessTasksCompleted"
  | "skillsCompleted"
  | "pathsStarted"
  | "pathsCompleted"
  | "bodyPathCompleted"
  | "mindPathCompleted"
  | "spiritPathCompleted"
  | "lifePathCompleted"
  | "allBronzeCompleted"
  | "allSilverCompleted"
  | "allGoldCompleted"
  | "paychecksLogged"
  | "paychecksFullyAllocated"
  | "savingsBalance"
  | "customAccountsCreated"
  | "fundedAccounts"
  | "monthsSavedMoreThanSpent"
  | "perfectDayBeforeEight"
  | "perfectDayAfterTen"
  | "daysWithoutSavingsWithdrawal"
  | "forgivenessRecoveryStreak"
  | "focusSessions"
  | "focusMinutes"
  | "focusLongestMinutes"
  | "focusDays"
  | "focusModesUsed"
  | "focusScenesUsed"
  | "friendCount"
  | "friendRequestsSent"
  | "friendRequestsAccepted"
  | "friendProfilesViewed"
  | "calendarEventsCreated"
  | "futureCalendarEvents"
  | "sharedCalendarsCreated"
  | "calendarInvitesSent"
  | "dailyTasksScheduled"
  | "skillDeadlinesSet"
  | "appTabsVisited";

export interface AchievementDefinition {
  id: string;

  title: string;

  description: string;

  category: AchievementCategory;

  icon: string;

  metric: AchievementMetric;

  target: number;

  rewardTitle?: string;

  hidden: boolean;

  roadOrder: number;
}

export interface AchievementRoadDefinition {
  id: AchievementCategory;

  title: string;

  description: string;

  environment:
    | "highway"
    | "mountain"
    | "forest"
    | "city"
    | "planner"
    | "social"
    | "focus"
    | "ice";

  achievements: string[];
}

export const achievements: AchievementDefinition[] = [
  // ==================================================
  // GENERAL
  // ==================================================

  {
    id: "general-level-up",

    title: "Level Up",

    description:
      "Reach player level 2.",

    category: "general",

    icon: "⬆️",

    metric: "playerLevel",

    target: 2,

    rewardTitle:
      "Rising Adventurer",

    hidden: false,

    roadOrder: 1,
  },

  {
    id: "general-rising-hero",

    title: "Rising Hero",

    description:
      "Earn 500 total XP.",

    category: "general",

    icon: "🌟",

    metric: "totalXP",

    target: 500,

    rewardTitle:
      "Rising Hero",

    hidden: false,

    roadOrder: 2,
  },

  {
    id: "general-balanced-build",

    title: "Balanced Build",

    description:
      "Earn at least 100 XP in every attribute.",

    category: "general",

    icon: "⚖️",

    metric:
      "minimumAttributeXP",

    target: 100,

    rewardTitle:
      "Well Rounded",

    hidden: false,

    roadOrder: 3,
  },

  {
    id: "general-seasoned",

    title: "Seasoned",

    description:
      "Earn 2,500 total XP.",

    category: "general",

    icon: "⚔️",

    metric: "totalXP",

    target: 2500,

    rewardTitle:
      "Seasoned",

    hidden: false,

    roadOrder: 4,
  },

  {
    id: "general-specialist",

    title: "Specialist",

    description:
      "Earn 1,000 XP in a single attribute.",

    category: "general",

    icon: "🎯",

    metric:
      "highestAttributeXP",

    target: 1000,

    rewardTitle:
      "Specialist",

    hidden: false,

    roadOrder: 5,
  },

  {
    id: "general-veteran",

    title: "Veteran",

    description:
      "Earn 10,000 total XP.",

    category: "general",

    icon: "🏆",

    metric: "totalXP",

    target: 10000,

    rewardTitle:
      "Veteran",

    hidden: false,

    roadOrder: 6,
  },

  {
    id: "general-completionist",

    title: "Completionist",

    description:
      "Unlock every non-hidden achievement.",

    category: "general",

    icon: "👑",

    metric: "totalXP",

    target: 1,

    rewardTitle:
      "Completionist",

    hidden: false,

    roadOrder: 7,
  },

  // ==================================================
  // DAILY
  // ==================================================

  {
    id: "daily-first-step",

    title: "First Step",

    description:
      "Complete your first daily task.",

    category: "daily",

    icon: "🌱",

    metric:
      "dailyTasksCompleted",

    target: 1,

    rewardTitle:
      "First Step",

    hidden: false,

    roadOrder: 1,
  },

  {
    id: "daily-perfect-day",

    title: "Perfect Day",

    description:
      "Complete every active daily task in one day.",

    category: "daily",

    icon: "✅",

    metric:
      "perfectDays",

    target: 1,

    rewardTitle:
      "Perfect Day",

    hidden: false,

    roadOrder: 2,
  },

  {
    id: "daily-second-chance",

    title: "Second Chance",

    description:
      "Complete a missed task during its forgiveness period.",

    category: "daily",

    icon: "❤️",

    metric:
      "forgivenessTasksCompleted",

    target: 1,

    rewardTitle:
      "Second Chance",

    hidden: false,

    roadOrder: 3,
  },

  {
    id: "daily-locked-in",

    title: "Locked In",

    description:
      "Complete every daily task for 7 consecutive days.",

    category: "daily",

    icon: "🔥",

    metric:
      "perfectDayStreak",

    target: 7,

    rewardTitle:
      "Locked In",

    hidden: false,

    roadOrder: 4,
  },

  {
    id: "daily-unbreakable",

    title: "Unbreakable",

    description:
      "Complete every daily task for 30 consecutive days.",

    category: "daily",

    icon: "👑",

    metric:
      "perfectDayStreak",

    target: 30,

    rewardTitle:
      "Unbreakable",

    hidden: false,

    roadOrder: 5,
  },

  // ==================================================
  // SKILLS
  // ==================================================

  {
    id: "skills-path-chosen",

    title: "Path Chosen",

    description:
      "Complete your first skill challenge.",

    category: "skills",

    icon: "🌱",

    metric:
      "skillsCompleted",

    target: 1,

    rewardTitle:
      "Pathfinder",

    hidden: false,

    roadOrder: 1,
  },

  {
    id: "skills-well-rounded",

    title: "Well Rounded",

    description:
      "Complete at least one challenge in all four paths.",

    category: "skills",

    icon: "🌎",

    metric:
      "pathsStarted",

    target: 4,

    rewardTitle:
      "Well Rounded",

    hidden: false,

    roadOrder: 2,
  },

  {
    id: "skills-bronze-collector",

    title: "Bronze Collector",

    description:
      "Complete every Bronze challenge across all four paths.",

    category: "skills",

    icon: "🥉",

    metric:
      "allBronzeCompleted",

    target: 1,

    rewardTitle:
      "Bronze Collector",

    hidden: false,

    roadOrder: 3,
  },

  {
    id: "skills-silver-collector",

    title: "Silver Collector",

    description:
      "Complete every Silver challenge across all four paths.",

    category: "skills",

    icon: "🥈",

    metric:
      "allSilverCompleted",

    target: 1,

    rewardTitle:
      "Silver Collector",

    hidden: false,

    roadOrder: 4,
  },

  {
    id: "skills-gold-collector",

    title: "Gold Collector",

    description:
      "Complete every Gold challenge across all four paths.",

    category: "skills",

    icon: "🥇",

    metric:
      "allGoldCompleted",

    target: 1,

    rewardTitle:
      "Gold Collector",

    hidden: false,

    roadOrder: 5,
  },

  {
    id: "skills-body-master",

    title: "Body Master",

    description:
      "Complete the entire Body path.",

    category: "skills",

    icon: "💪",

    metric:
      "bodyPathCompleted",

    target: 1,

    rewardTitle:
      "Body Master",

    hidden: false,

    roadOrder: 6,
  },

  {
    id: "skills-mind-master",

    title: "Mind Master",

    description:
      "Complete the entire Mind path.",

    category: "skills",

    icon: "🧠",

    metric:
      "mindPathCompleted",

    target: 1,

    rewardTitle:
      "Mind Master",

    hidden: false,

    roadOrder: 7,
  },

  {
    id: "skills-spirit-master",

    title: "Spirit Master",

    description:
      "Complete the entire Spirit path.",

    category: "skills",

    icon: "✝️",

    metric:
      "spiritPathCompleted",

    target: 1,

    rewardTitle:
      "Spirit Master",

    hidden: false,

    roadOrder: 8,
  },

  {
    id: "skills-life-master",

    title: "Life Master",

    description:
      "Complete the entire Life path.",

    category: "skills",

    icon: "🌍",

    metric:
      "lifePathCompleted",

    target: 1,

    rewardTitle:
      "Life Master",

    hidden: false,

    roadOrder: 9,
  },

  {
    id: "skills-dual-mastery",

    title: "Dual Mastery",

    description:
      "Complete two entire skill paths.",

    category: "skills",

    icon: "⚔️",

    metric:
      "pathsCompleted",

    target: 2,

    rewardTitle:
      "Dual Master",

    hidden: false,

    roadOrder: 10,
  },

  {
    id: "skills-almost-there",

    title: "Almost There",

    description:
      "Complete three entire skill paths.",

    category: "skills",

    icon: "⏳",

    metric:
      "pathsCompleted",

    target: 3,

    rewardTitle:
      "Almost There",

    hidden: false,

    roadOrder: 11,
  },

  {
    id: "skills-complete-character",

    title: "Complete Character",

    description:
      "Complete all four skill paths.",

    category: "skills",

    icon: "⭐",

    metric:
      "pathsCompleted",

    target: 4,

    rewardTitle:
      "Complete Character",

    hidden: false,

    roadOrder: 12,
  },

  // ==================================================
  // BUDGET
  // ==================================================

  {
    id: "budget-first-paycheck",

    title: "First Paycheck",

    description:
      "Log your first paycheck.",

    category: "budget",

    icon: "💵",

    metric:
      "paychecksLogged",

    target: 1,

    rewardTitle:
      "Working Man",

    hidden: false,

    roadOrder: 1,
  },

  {
    id: "budget-every-dollar-assigned",

    title: "Every Dollar Assigned",

    description:
      "Fully allocate an entire paycheck across your accounts.",

    category: "budget",

    icon: "📊",

    metric:
      "paychecksFullyAllocated",

    target: 1,

    rewardTitle:
      "Every Dollar Assigned",

    hidden: false,

    roadOrder: 2,
  },

  {
    id: "budget-organizer",

    title: "Organizer",

    description:
      "Create your first custom budget account.",

    category: "budget",

    icon: "📂",

    metric:
      "customAccountsCreated",

    target: 1,

    rewardTitle:
      "Organizer",

    hidden: false,

    roadOrder: 3,
  },

  {
    id: "budget-first-hundred",

    title: "First Hundred",

    description:
      "Reach $100 across all savings accounts.",

    category: "budget",

    icon: "💯",

    metric:
      "savingsBalance",

    target: 100,

    rewardTitle:
      "First Hundred",

    hidden: false,

    roadOrder: 4,
  },

  {
    id: "budget-prepared",

    title: "Prepared",

    description:
      "Maintain at least three accounts with money in them.",

    category: "budget",

    icon: "🛡️",

    metric:
      "fundedAccounts",

    target: 3,

    rewardTitle:
      "Prepared",

    hidden: false,

    roadOrder: 5,
  },

  {
    id: "budget-four-figures",

    title: "Four Figures",

    description:
      "Reach $1,000 across all savings accounts.",

    category: "budget",

    icon: "💰",

    metric:
      "savingsBalance",

    target: 1000,

    rewardTitle:
      "Four Figures",

    hidden: false,

    roadOrder: 6,
  },

  {
    id: "budget-save-more-than-spend",

    title:
      "Save More Than You Spend",

    description:
      "Finish a month with more money added to savings than spent.",

    category: "budget",

    icon: "📈",

    metric:
      "monthsSavedMoreThanSpent",

    target: 1,

    rewardTitle:
      "Financially Disciplined",

    hidden: false,

    roadOrder: 7,
  },

  {
    id: "budget-five-figures",

    title: "Five Figures",

    description:
      "Reach $10,000 across all savings accounts.",

    category: "budget",

    icon: "🏦",

    metric:
      "savingsBalance",

    target: 10000,

    rewardTitle:
      "Five Figures",

    hidden: false,

    roadOrder: 8,
  },


  // ==================================================
  // CALENDAR
  // ==================================================

  { id: "calendar-first-event", title: "On the Books", description: "Create your first calendar event.", category: "calendar", icon: "📅", metric: "calendarEventsCreated", target: 1, rewardTitle: "Planner", hidden: false, roadOrder: 1 },
  { id: "calendar-getting-organized", title: "Getting Organized", description: "Create 10 calendar events.", category: "calendar", icon: "🗓️", metric: "calendarEventsCreated", target: 10, rewardTitle: "Getting Organized", hidden: false, roadOrder: 2 },
  { id: "calendar-task-planner", title: "Routine Architect", description: "Schedule your first daily task on a calendar.", category: "calendar", icon: "✅", metric: "dailyTasksScheduled", target: 1, rewardTitle: "Routine Architect", hidden: false, roadOrder: 3 },
  { id: "calendar-deadline-setter", title: "Deadline Setter", description: "Set a target date for a skill-tree goal.", category: "calendar", icon: "🎯", metric: "skillDeadlinesSet", target: 1, rewardTitle: "Deadline Setter", hidden: false, roadOrder: 4 },
  { id: "calendar-shared-space", title: "Shared Space", description: "Create your first shared calendar.", category: "calendar", icon: "🤝", metric: "sharedCalendarsCreated", target: 1, rewardTitle: "Coordinator", hidden: false, roadOrder: 5 },
  { id: "calendar-team-planner", title: "Team Planner", description: "Invite someone to a shared calendar.", category: "calendar", icon: "📨", metric: "calendarInvitesSent", target: 1, rewardTitle: "Team Planner", hidden: false, roadOrder: 6 },
  { id: "calendar-ahead-of-time", title: "Ahead of Time", description: "Have 25 future events on your calendars.", category: "calendar", icon: "🔭", metric: "futureCalendarEvents", target: 25, rewardTitle: "Ahead of Time", hidden: false, roadOrder: 7 },

  // ==================================================
  // FRIENDS
  // ==================================================

  { id: "friends-first-friend", title: "First Ally", description: "Add your first friend.", category: "friends", icon: "🤝", metric: "friendCount", target: 1, rewardTitle: "Friendly", hidden: false, roadOrder: 1 },
  { id: "friends-small-circle", title: "Party Formed", description: "Build a circle of 5 friends.", category: "friends", icon: "🧑‍🤝‍🧑", metric: "friendCount", target: 5, rewardTitle: "Party Leader", hidden: false, roadOrder: 2 },
  { id: "friends-connected", title: "Connected", description: "Build a circle of 10 friends.", category: "friends", icon: "🌐", metric: "friendCount", target: 10, rewardTitle: "Connected", hidden: false, roadOrder: 3 },
  { id: "friends-reach-out", title: "Reach Out", description: "Send your first friend request.", category: "friends", icon: "📨", metric: "friendRequestsSent", target: 1, rewardTitle: "Reach Out", hidden: false, roadOrder: 4 },
  { id: "friends-welcoming", title: "Welcoming", description: "Accept 5 friend requests.", category: "friends", icon: "🙌", metric: "friendRequestsAccepted", target: 5, rewardTitle: "Welcoming", hidden: false, roadOrder: 5 },
  { id: "friends-accountability", title: "Accountability", description: "Visit a friend's profile.", category: "friends", icon: "👀", metric: "friendProfilesViewed", target: 1, rewardTitle: "Accountability", hidden: false, roadOrder: 6 },

  // ==================================================
  // FOCUS
  // ==================================================

  { id: "focus-first-session", title: "Lock In", description: "Complete your first focus session.", category: "focus", icon: "🍅", metric: "focusSessions", target: 1, rewardTitle: "Locked In", hidden: false, roadOrder: 1 },
  { id: "focus-one-hour", title: "One Focused Hour", description: "Complete 60 focused minutes total.", category: "focus", icon: "⏳", metric: "focusMinutes", target: 60, rewardTitle: "One Focused Hour", hidden: false, roadOrder: 2 },
  { id: "focus-deep-work", title: "Deep Work", description: "Complete a focus session lasting at least 90 minutes.", category: "focus", icon: "🧠", metric: "focusLongestMinutes", target: 90, rewardTitle: "Deep Worker", hidden: false, roadOrder: 3 },
  { id: "focus-ten-sessions", title: "Momentum", description: "Complete 10 focus sessions.", category: "focus", icon: "⚡", metric: "focusSessions", target: 10, rewardTitle: "Momentum", hidden: false, roadOrder: 4 },
  { id: "focus-ten-hours", title: "Ten Hours In", description: "Complete 600 focused minutes total.", category: "focus", icon: "⌛", metric: "focusMinutes", target: 600, rewardTitle: "Focused", hidden: false, roadOrder: 5 },
  { id: "focus-seven-days", title: "Focus Habit", description: "Complete focus sessions on 7 different days.", category: "focus", icon: "🔥", metric: "focusDays", target: 7, rewardTitle: "Focus Habit", hidden: false, roadOrder: 6 },
  { id: "focus-marathon", title: "The Long Haul", description: "Complete a focus session lasting 180 minutes.", category: "focus", icon: "🏔️", metric: "focusLongestMinutes", target: 180, rewardTitle: "The Long Haul", hidden: false, roadOrder: 7 },
  { id: "focus-century", title: "Century of Focus", description: "Complete 100 focus sessions.", category: "focus", icon: "💯", metric: "focusSessions", target: 100, rewardTitle: "Unshakable", hidden: false, roadOrder: 8 },

  // ==================================================
  // HIDDEN
  // ==================================================

  {
    id: "hidden-early-bird",

    title: "Early Bird",

    description:
      "Complete every daily task before 8:00 a.m.",

    category: "hidden",

    icon: "🌅",

    metric:
      "perfectDayBeforeEight",

    target: 1,

    rewardTitle:
      "Early Bird",

    hidden: true,

    roadOrder: 1,
  },

  {
    id: "hidden-night-owl",

    title: "Night Owl",

    description:
      "Complete every daily task after 10:00 p.m.",

    category: "hidden",

    icon: "🦉",

    metric:
      "perfectDayAfterTen",

    target: 1,

    rewardTitle:
      "Night Owl",

    hidden: true,

    roadOrder: 2,
  },

  {
    id: "hidden-momentum",

    title: "Momentum",

    description:
      "Have four skill challenges completed at the same time.",

    category: "hidden",

    icon: "⚡",

    metric:
      "skillsCompleted",

    target: 4,

    rewardTitle:
      "Momentum",

    hidden: true,

    roadOrder: 3,
  },

  {
    id: "hidden-self-control",

    title: "Self-Control",

    description:
      "Go 30 consecutive days without moving money out of a savings account.",

    category: "hidden",

    icon: "🧊",

    metric:
      "daysWithoutSavingsWithdrawal",

    target: 30,

    rewardTitle:
      "Self-Control",

    hidden: true,

    roadOrder: 4,
  },

  {
    id: "hidden-phoenix",

    title: "Phoenix",

    description:
      "Recover a missed task during forgiveness and then complete every daily task for 30 consecutive days.",

    category: "hidden",

    icon: "🔥",

    metric:
      "forgivenessRecoveryStreak",

    target: 30,

    rewardTitle:
      "Phoenix",

    hidden: true,

    roadOrder: 5,
  },
];

const roadMeta:
  Record<
    AchievementCategory,
    Omit<
      AchievementRoadDefinition,
      "achievements"
    >
  > = {
  general: {
    id: "general",

    title:
      "The Main Highway",

    description:
      "Your overall journey through levels, XP, attributes, and total completion.",

    environment:
      "highway",
  },

  daily: {
    id: "daily",

    title:
      "The Daily Trail",

    description:
      "A mountain path built through consistency, recovery, and discipline.",

    environment:
      "mountain",
  },

  skills: {
    id: "skills",

    title:
      "The Mastery Path",

    description:
      "A forest road through Body, Mind, Spirit, and Life.",

    environment:
      "forest",
  },

  budget: {
    id: "budget",

    title:
      "The Financial District",

    description:
      "A city road built through earning, allocating, saving, and planning.",

    environment:
      "city",
  },


  calendar: { id: "calendar", title: "The Planning Parkway", description: "A road through events, deadlines, routines, and shared plans.", environment: "planner" },
  friends: { id: "friends", title: "The Social Avenue", description: "A road built through friendship, accountability, and community.", environment: "social" },
  focus: { id: "focus", title: "The Focus Route", description: "A road through deep work, consistency, and deliberate attention.", environment: "focus" },

  hidden: {
    id: "hidden",

    title:
      "The Frozen Road",

    description:
      "A hidden path revealed through unusual acts of discipline.",

    environment:
      "ice",
  },
};

export const achievementRoads:
  AchievementRoadDefinition[] =
  (
    [
      "general",
      "daily",
      "skills",
      "budget",
      "calendar",
      "friends",
      "focus",
      "hidden",
    ] as AchievementCategory[]
  ).map(
    (category) => ({
      ...roadMeta[
        category
      ],

      achievements:
        achievements
          .filter(
            (achievement) =>
              achievement.category ===
              category
          )
          .sort(
            (
              first,
              second
            ) =>
              first.roadOrder -
              second.roadOrder
          )
          .map(
            (achievement) =>
              achievement.id
          ),
    })
  );

export function getAchievementById(
  achievementId: string
) {
  return achievements.find(
    (achievement) =>
      achievement.id ===
      achievementId
  );
}

export function getAchievementsByCategory(
  category:
    AchievementCategory
) {
  return achievements
    .filter(
      (achievement) =>
        achievement.category ===
        category
    )
    .sort(
      (
        first,
        second
      ) =>
        first.roadOrder -
        second.roadOrder
    );
}