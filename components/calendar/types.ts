export type CalendarRole =
  | "owner"
  | "editor"
  | "viewer";


export type CalendarView =
  | "month"
  | "week"
  | "day";


export type CalendarItem = {
  id:
    string;

  owner_id:
    string;

  name:
    string;

  description:
    string;

  color:
    string;

  is_personal:
    boolean;

  role:
    CalendarRole;

  created_at:
    string;
};


export type CalendarEvent = {
  id:
    string;

  calendar_id:
    string;

  calendar_ids?:
    string[];

  created_by:
    string;

  title:
    string;

  description:
    string;

  location:
    string;

  starts_at:
    string;

  ends_at:
    string;

  is_all_day:
    boolean;

  recurrence_rule:
    string | null;
};


export type CalendarInvite = {
  invite_id:
    string;

  calendar_id:
    string;

  calendar_name:
    string;

  calendar_color:
    string;

  inviter_id:
    string;

  inviter_username:
    string;

  inviter_display_name:
    string;

  role:
    "editor" | "viewer";

  created_at:
    string;
};


export type FriendSummary = {
  id:
    string;

  username:
    string;

  display_name:
    string;
};


export type CalendarColorStyle = {
  dot:
    string;

  solid:
    string;

  soft:
    string;
};


export const calendarColors:
  Record<
    string,
    CalendarColorStyle
  > = {
  blue: {
    dot:
      "bg-blue-500",

    solid:
      "bg-blue-600",

    soft:
      "border-blue-500/25 bg-blue-500/15 text-blue-100",
  },

  green: {
    dot:
      "bg-green-500",

    solid:
      "bg-green-600",

    soft:
      "border-green-500/25 bg-green-500/15 text-green-100",
  },

  purple: {
    dot:
      "bg-purple-500",

    solid:
      "bg-purple-600",

    soft:
      "border-purple-500/25 bg-purple-500/15 text-purple-100",
  },

  orange: {
    dot:
      "bg-orange-500",

    solid:
      "bg-orange-600",

    soft:
      "border-orange-500/25 bg-orange-500/15 text-orange-100",
  },

  red: {
    dot:
      "bg-red-500",

    solid:
      "bg-red-600",

    soft:
      "border-red-500/25 bg-red-500/15 text-red-100",
  },

  pink: {
    dot:
      "bg-pink-500",

    solid:
      "bg-pink-600",

    soft:
      "border-pink-500/25 bg-pink-500/15 text-pink-100",
  },
};
