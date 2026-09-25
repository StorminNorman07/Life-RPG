export type Weekday =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";


export const weekdayKeys:
  Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];


export const weekdayLabels:
  Record<Weekday, string> = {
  sun: "S",
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
};


export type TaskReward = {
  category: string;

  // category stores an editable attribute ID.

  attribute?: string;

  // Retained for compatibility. Journey XP is calculated adaptively.
  xp: number;
};


export type DailyTask = {
  id: number;

  name: string;

  description: string;

  categories: string[];

  rewards: TaskReward[];

  scheduledDays: Weekday[];
};


const everyDay:
  Weekday[] = [
  ...weekdayKeys,
];


export const dailyTasks:
  DailyTask[] = [
  {
    id: 1,

    name: "Workout",

    description:
      "Complete a workout",

    categories: [
      "health",
      "discipline",
    ],

    rewards: [
      {
        category: "health",
        xp: 0,
      },

      {
        category: "discipline",
        xp: 0,
      },
    ],

    scheduledDays: [
      "mon",
      "tue",
      "wed",
      "thu",
      "fri",
    ],
  },

  {
    id: 2,

    name: "Read",

    description:
      "Read for 30 minutes",

    categories: [
      "knowledge",
      "discipline",
    ],

    rewards: [
      {
        category: "knowledge",
        xp: 0,
      },

      {
        category: "discipline",
        xp: 0,
      },
    ],

    scheduledDays: [
      ...everyDay,
    ],
  },

  {
    id: 3,

    name: "Bible Study",

    description:
      "Spend time studying scripture",

    categories: [
      "faith",
      "discipline",
    ],

    rewards: [
      {
        category: "faith",
        xp: 0,
      },

      {
        category: "discipline",
        xp: 0,
      },
    ],

    scheduledDays: [
      ...everyDay,
    ],
  },
];


export const initialDailyTasks =
  dailyTasks;
