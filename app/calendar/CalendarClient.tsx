"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import CalendarSidebar from "@/components/calendar/CalendarSidebar";
import CalendarToolbar from "@/components/calendar/CalendarToolbar";
import CalendarViews from "@/components/calendar/CalendarViews";
import EventModal from "@/components/calendar/EventModal";
import PlanningModal, {
  type SkillGoalDeadline,
  type TaskCalendarSchedule,
} from "@/components/calendar/PlanningModal";

import {
  InviteFriendModal,
  NewCalendarModal,
} from "@/components/calendar/CalendarManagerModal";

import {
  getVisibleRange,
} from "@/components/calendar/dateUtils";

import {
  type CalendarEvent,
  type CalendarInvite,
  type CalendarItem,
  type CalendarView,
  type FriendSummary,
} from "@/components/calendar/types";

import {
  useGame,
} from "@/context/GameContext";

import {
  createClient,
} from "@/utils/supabase/client";


const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];


function isTaskDueOnWeekday(
  scheduledDays:
    unknown[],

  fullWeekday:
    string,

  weekdayIndex:
    number
) {
  if (
    scheduledDays.length ===
    0
  ) {
    return true;
  }

  const shortWeekday =
    fullWeekday.slice(
      0,
      3
    ).toLowerCase();

  const normalizedFull =
    fullWeekday.toLowerCase();

  return scheduledDays.some(
    (
      value
    ) => {
      if (
        typeof value ===
        "number"
      ) {
        return value ===
          weekdayIndex;
      }

      const normalized =
        String(
          value
        )
          .trim()
          .toLowerCase();

      if (
        normalized ===
        String(
          weekdayIndex
        )
      ) {
        return true;
      }

      return (
        normalized ===
          normalizedFull ||
        normalized ===
          shortWeekday ||
        normalized.startsWith(
          shortWeekday
        )
      );
    }
  );
}

function reportAchievementMetric(metric: string, value: number, mode: "set" | "increment" | "max" = "set") {
  window.dispatchEvent(new CustomEvent("achievement-metric", { detail: { metric, value, mode } }));
}

export default function CalendarClient() {
  const { confirm } = useAppDialog();
  const {
    tasks,
    skillNodes,
    completedTasks,
    completedSkills,
  } =
    useGame();

  const [
    anchorDate,
    setAnchorDate
  ] =
    useState(
      new Date()
    );

  const [
    selectedDate,
    setSelectedDate
  ] =
    useState(
      new Date()
    );

  const [
    view,
    setView
  ] =
    useState<
      CalendarView
    >(
      "month"
    );

  const [
    calendars,
    setCalendars
  ] =
    useState<
      CalendarItem[]
    >([]);

  const [
    databaseEvents,
    setDatabaseEvents
  ] =
    useState<
      CalendarEvent[]
    >([]);

  const [
    invites,
    setInvites
  ] =
    useState<
      CalendarInvite[]
    >([]);

  const [
    friends,
    setFriends
  ] =
    useState<
      FriendSummary[]
    >([]);

  const [
    taskSchedules,
    setTaskSchedules
  ] =
    useState<
      TaskCalendarSchedule[]
    >([]);

  const [
    skillDeadlines,
    setSkillDeadlines
  ] =
    useState<
      SkillGoalDeadline[]
    >([]);

  const [
    visibleCalendarIds,
    setVisibleCalendarIds
  ] =
    useState<
      Set<string>
    >(
      new Set()
    );

  const [
    eventModalOpen,
    setEventModalOpen
  ] =
    useState(
      false
    );

  const [
    planningOpen,
    setPlanningOpen
  ] =
    useState(
      false
    );

  const [
    editingEvent,
    setEditingEvent
  ] =
    useState<
      CalendarEvent | null
    >(
      null
    );

  const [
    calendarModalOpen,
    setCalendarModalOpen
  ] =
    useState(
      false
    );

  const [
    inviteModalOpen,
    setInviteModalOpen
  ] =
    useState(
      false
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    saving,
    setSaving
  ] =
    useState(
      false
    );

  const [
    notice,
    setNotice
  ] =
    useState<{
      type:
        "success" | "error";

      text:
        string;
    } | null>(
      null
    );


  const writableCalendars =
    useMemo(
      () =>
        calendars.filter(
          (
            calendar
          ) =>
            calendar.role ===
              "owner" ||
            calendar.role ===
              "editor"
        ),
      [
        calendars,
      ]
    );

  const ownedSharedCalendars =
    useMemo(
      () =>
        calendars.filter(
          (
            calendar
          ) =>
            calendar.role ===
              "owner" &&
            !calendar.is_personal
        ),
      [
        calendars,
      ]
    );


  function showNotice(
    type:
      "success" | "error",

    text:
      string
  ) {
    setNotice({
      type,
      text,
    });

    window.setTimeout(
      () =>
        setNotice(
          null
        ),
      3500
    );
  }


  const loadShell =
    useCallback(
      async () => {
        const supabase =
          createClient();

        const [
          calendarsResponse,
          invitesResponse,
          friendsResponse,
          taskResponse,
          skillResponse,
        ] =
          await Promise.all([
            supabase.rpc(
              "get_my_calendars"
            ),

            supabase.rpc(
              "get_calendar_invites"
            ),

            supabase.rpc(
              "get_friend_summaries"
            ),

            supabase.rpc(
              "get_my_task_schedules_multi"
            ),

            supabase.rpc(
              "get_my_skill_goals_multi"
            ),
          ]);

        const error =
          calendarsResponse.error ??
          invitesResponse.error ??
          friendsResponse.error ??
          taskResponse.error ??
          skillResponse.error;

        if (
          error
        ) {
          showNotice(
            "error",
            error.message
          );

          setLoading(
            false
          );

          return;
        }

        const nextCalendars =
          (
            calendarsResponse.data ??
            []
          ) as
            CalendarItem[];

        setCalendars(nextCalendars);
        reportAchievementMetric("sharedCalendarsCreated", nextCalendars.filter((calendar) => calendar.role === "owner" && !calendar.is_personal).length);

        setInvites(
          (
            invitesResponse.data ??
            []
          ) as
            CalendarInvite[]
        );

        setFriends(
          (
            friendsResponse.data ??
            []
          ) as
            FriendSummary[]
        );

        const nextTaskSchedules = (taskResponse.data ?? []) as TaskCalendarSchedule[];
        setTaskSchedules(nextTaskSchedules);
        reportAchievementMetric("dailyTasksScheduled", nextTaskSchedules.filter((item) => item.enabled).length);

        const nextSkillDeadlines = (skillResponse.data ?? []) as SkillGoalDeadline[];
        setSkillDeadlines(nextSkillDeadlines);
        reportAchievementMetric("skillDeadlinesSet", nextSkillDeadlines.filter((item) => item.enabled).length);

        setVisibleCalendarIds(
          (
            current
          ) =>
            current.size
              ? current
              : new Set(
                  nextCalendars.map(
                    (
                      calendar
                    ) =>
                      calendar.id
                  )
                )
        );

        setLoading(
          false
        );
      },
      []
    );


  const loadEvents =
    useCallback(
      async () => {
        const supabase =
          createClient();

        const range =
          getVisibleRange(
            anchorDate,
            view
          );

        const {
          data,
          error,
        } =
          await supabase.rpc(
            "get_calendar_events_for_range",
            {
              range_start:
                range.start.toISOString(),

              range_end:
                range.end.toISOString(),
            }
          );

        if (
          error
        ) {
          showNotice(
            "error",
            error.message
          );

          return;
        }

        const nextEvents = (data ?? []) as CalendarEvent[];
        setDatabaseEvents(nextEvents);
        reportAchievementMetric("futureCalendarEvents", nextEvents.filter((event) => new Date(event.starts_at) > new Date()).length);
      },
      [
        anchorDate,
        view,
      ]
    );


  useEffect(() => {
    void loadShell();
  }, [
    loadShell,
  ]);


  useEffect(() => {
    void loadEvents();
  }, [
    loadEvents,
  ]);


  const virtualEvents =
    useMemo(
      () => {
        const range =
          getVisibleRange(
            anchorDate,
            view
          );

        const next:
          CalendarEvent[] = [];


        taskSchedules.forEach(
          (
            schedule
          ) => {
            const task =
              tasks.find(
                (
                  item
                ) =>
                  Number(
                    item.id
                  ) ===
                  Number(
                    schedule.task_id
                  )
              );

            if (
              !task ||
              !schedule.enabled
            ) {
              return;
            }

            const cursor =
              new Date(
                range.start
              );

            cursor.setHours(
              0,
              0,
              0,
              0
            );

            while (
              cursor <=
              range.end
            ) {
              const weekday =
                weekdayNames[
                  cursor.getDay()
                ];

              const scheduledDays =
                task.scheduledDays ??
                [];

              const due =
                isTaskDueOnWeekday(
                  scheduledDays,
                  weekday,
                  cursor.getDay()
                );

              if (
                due
              ) {
                const start =
                  new Date(
                    cursor
                  );

                if (
                  schedule.start_time
                ) {
                  const [
                    hours,
                    minutes,
                  ] =
                    schedule.start_time
                      .split(":")
                      .map(Number);

                  start.setHours(
                    hours,
                    minutes,
                    0,
                    0
                  );
                }

                const end =
                  new Date(
                    start
                  );

                end.setMinutes(
                  end.getMinutes() +
                    (
                      schedule.duration_minutes ??
                      30
                    )
                );

                const now =
                  new Date();

                const completed =
                  start.toDateString() ===
                    now.toDateString() &&
                  completedTasks.includes(
                    task.name
                  );

                next.push({
                  id:
                    `planned-task-${task.id}-${start.toISOString()}`,

                  calendar_id:
                    schedule.calendar_ids?.[0] ??
                    schedule.calendar_id ??
                    "",

                  calendar_ids:
                    schedule.calendar_ids ??
                    (
                      schedule.calendar_id
                        ? [
                            schedule.calendar_id,
                          ]
                        : []
                    ),

                  created_by:
                    "__planned__",

                  title:
                    `${completed ? "✓ " : "✅ "}${task.name}`,

                  description:
                    task.description ??
                    "",

                  location:
                    "",

                  starts_at:
                    start.toISOString(),

                  ends_at:
                    end.toISOString(),

                  is_all_day:
                    !schedule.start_time,

                  recurrence_rule:
                    "daily-task",
                });
              }

              cursor.setDate(
                cursor.getDate() +
                  1
              );
            }
          }
        );


        skillDeadlines.forEach(
          (
            deadline
          ) => {
            const node =
              skillNodes.find(
                (
                  item
                ) =>
                  Number(
                    item.id
                  ) ===
                  Number(
                    deadline.skill_node_id
                  )
              );

            if (
              !node ||
              !deadline.enabled
            ) {
              return;
            }

            const start =
              new Date(
                deadline.target_at
              );

            if (
              start <
                range.start ||
              start >
                range.end
            ) {
              return;
            }

            const completed =
              completedSkills.includes(
                node.id
              );

            next.push({
              id:
                `planned-skill-${node.id}`,

              calendar_id:
                deadline.calendar_ids?.[0] ??
                deadline.calendar_id ??
                "",

              calendar_ids:
                deadline.calendar_ids ??
                (
                  deadline.calendar_id
                    ? [
                        deadline.calendar_id,
                      ]
                    : []
                ),

              created_by:
                "__planned__",

              title:
                `${completed ? "✓ " : "🌳 "}${node.name}`,

              description:
                deadline.notes ||
                node.description ||
                "",

              location:
                "",

              starts_at:
                start.toISOString(),

              ends_at:
                new Date(
                  start.getTime() +
                    60 *
                      60 *
                      1000
                ).toISOString(),

              is_all_day:
                false,

              recurrence_rule:
                "skill-goal",
            });
          }
        );


        return next;
      },
      [
        anchorDate,
        view,
        taskSchedules,
        skillDeadlines,
        tasks,
        skillNodes,
        completedTasks,
        completedSkills,
      ]
    );


  const visibleEvents =
    useMemo(
      () =>
        [
          ...databaseEvents,
          ...virtualEvents,
        ].filter(
          (
            event
          ) =>
            (
              event.calendar_ids?.length
                ? event.calendar_ids.some(
                    (
                      calendarId
                    ) =>
                      visibleCalendarIds.has(
                        calendarId
                      )
                  )
                : !event.calendar_id ||
                  visibleCalendarIds.has(
                    event.calendar_id
                  )
            )
        ),
      [
        databaseEvents,
        virtualEvents,
        visibleCalendarIds,
      ]
    );


  function openNewEvent(
    date:
      Date
  ) {
    setSelectedDate(
      date
    );

    setEditingEvent(
      null
    );

    setEventModalOpen(
      true
    );
  }


  function openExistingEvent(
    event:
      CalendarEvent
  ) {
    if (
      event.created_by ===
      "__planned__"
    ) {
      setPlanningOpen(
        true
      );

      return;
    }

    setEditingEvent(
      event
    );

    setSelectedDate(
      new Date(
        event.starts_at
      )
    );

    setEventModalOpen(
      true
    );
  }


  async function saveTaskSchedule(
    values: {
      taskId:
        number;

      startTime:
        string | null;

      durationMinutes:
        number | null;

      calendarIds:
        string[];
    }
  ) {
    if (
      values.calendarIds.length <
      1
    ) {
      showNotice(
        "error",
        "Select at least one calendar."
      );

      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "save_task_schedule_multi",
        {
          target_task_id:
            values.taskId,

          target_start_time:
            values.startTime,

          target_duration_minutes:
            values.durationMinutes,

          target_calendar_ids:
            values.calendarIds,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Daily task schedule saved."
      );

      await loadShell();
    }

    setSaving(
      false
    );
  }

  async function removeTaskSchedule(
    taskId:
      number
  ) {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "remove_task_schedule_multi",
        {
          target_task_id:
            taskId,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );

      return;
    }

    showNotice(
      "success",
      "Daily task removed from calendar."
    );

    await loadShell();
  }

  async function saveSkillDeadline(
    values: {
      skillNodeId:
        number;

      targetAt:
        string;

      notes:
        string;

      calendarIds:
        string[];
    }
  ) {
    if (
      values.calendarIds.length <
      1
    ) {
      showNotice(
        "error",
        "Select at least one calendar."
      );

      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "save_skill_goal_multi",
        {
          target_skill_node_id:
            values.skillNodeId,

          target_target_at:
            new Date(
              values.targetAt
            ).toISOString(),

          target_notes:
            values.notes,

          target_calendar_ids:
            values.calendarIds,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Skill goal saved."
      );

      await loadShell();
    }

    setSaving(
      false
    );
  }

  async function removeSkillDeadline(
    skillNodeId:
      number
  ) {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "remove_skill_goal_multi",
        {
          target_skill_node_id:
            skillNodeId,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );

      return;
    }

    showNotice(
      "success",
      "Skill goal removed."
    );

    await loadShell();
  }

  async function saveEvent(
    values: {
      id?:
        string;

      calendarIds:
        string[];

      title:
        string;

      description:
        string;

      location:
        string;

      startsAt:
        string;

      endsAt:
        string;

      isAllDay:
        boolean;
    }
  ) {
    const start =
      new Date(
        values.startsAt
      );

    const end =
      new Date(
        values.endsAt
      );

    if (
      !values.title ||
      values.calendarIds.length <
        1 ||
      end <=
        start
    ) {
      showNotice(
        "error",
        "Choose at least one calendar and enter a valid event."
      );

      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "save_calendar_event_multi",
        {
          target_event_id:
            values.id ??
            null,

          target_calendar_ids:
            values.calendarIds,

          target_title:
            values.title,

          target_description:
            values.description,

          target_location:
            values.location,

          target_starts_at:
            start.toISOString(),

          target_ends_at:
            end.toISOString(),

          target_is_all_day:
            values.isAllDay,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        values.id
          ? "Event updated."
          : "Event created."
      );
      if (!values.id) reportAchievementMetric("calendarEventsCreated", 1, "increment");

      await loadEvents();

      setEventModalOpen(
        false
      );

      setEditingEvent(
        null
      );
    }

    setSaving(
      false
    );
  }

  async function deleteEvent(
    eventId:
      string
  ) {
    const confirmed =
      await confirm({
        title: "Delete event?",
        description:
          "This event will be permanently removed from every calendar it appears on.",
        confirmLabel: "Delete event",
        tone: "danger",
      });

    if (!confirmed) {
      return;
    }

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "delete_calendar_event_multi",
        {
          target_event_id:
            eventId,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Event deleted."
      );

      await loadEvents();

      setEventModalOpen(
        false
      );
    }
  }

  async function createCalendar(
    values: {
      name:
        string;

      description:
        string;

      color:
        string;
    }
  ) {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "create_shared_calendar",
        {
          calendar_name:
            values.name,

          calendar_description:
            values.description,

          calendar_color:
            values.color,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Calendar created."
      );
      reportAchievementMetric("sharedCalendarsCreated", 1, "increment");

      await loadShell();

      setCalendarModalOpen(
        false
      );
    }
  }


  async function inviteFriend(
    values: {
      calendarId:
        string;

      friendId:
        string;

      role:
        "editor" | "viewer";
    }
  ) {
    if (
      !values.calendarId ||
      !values.friendId
    ) {
      showNotice(
        "error",
        "Choose a calendar and friend."
      );

      return;
    }

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "invite_friend_to_calendar",
        {
          target_calendar_id:
            values.calendarId,

          target_friend_id:
            values.friendId,

          target_role:
            values.role,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Calendar invitation sent."
      );
      reportAchievementMetric("calendarInvitesSent", 1, "increment");

      setInviteModalOpen(
        false
      );
    }
  }


  async function respondToInvite(
    inviteId:
      string,

    accept:
      boolean
  ) {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        accept
          ? "accept_calendar_invite"
          : "decline_calendar_invite",
        {
          invite_id:
            inviteId,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        accept
          ? "Invitation accepted."
          : "Invitation declined."
      );

      await loadShell();

      await loadEvents();
    }
  }


  async function deleteCalendar(
    calendar:
      CalendarItem
  ) {
    const confirmed =
      await confirm({
        title: `Delete "${calendar.name}"?`,
        description:
          "This permanently deletes the calendar, its events, member access, and invitations.",
        confirmLabel: "Delete calendar",
        tone: "danger",
      });

    if (!confirmed) {
      return;
    }

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "delete_calendar",
        {
          target_calendar_id:
            calendar.id,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Calendar deleted."
      );

      await loadShell();

      await loadEvents();
    }
  }


  if (
    loading
  ) {
    return (
      <main
        className="
          min-h-screen
          bg-black
          p-8
          text-white
        "
      >
        Loading calendar…
      </main>
    );
  }


  return (
    <main
      className="
        min-h-screen
        bg-black
        px-5
        pb-20
        text-white

        md:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-[1600px]
        "
      >
        <header
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
            pb-5
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
              Schedule
            </p>

            <h1
              className="
                mt-2
                text-4xl
                font-black
              "
            >
              📅 Calendar
            </h1>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                setPlanningOpen(
                  true
                )
              }
              className="
                rounded-xl
                border
                border-white/10
                bg-zinc-950
                px-4
                py-2
                font-bold
              "
            >
              Plan Tasks & Goals
            </button>

            <button
              type="button"
              onClick={() =>
                setCalendarModalOpen(
                  true
                )
              }
              className="
                rounded-xl
                border
                border-white/10
                bg-zinc-950
                px-4
                py-2
                font-bold
              "
            >
              New Calendar
            </button>

            {ownedSharedCalendars.length >
              0 && (
              <button
                type="button"
                onClick={() =>
                  setInviteModalOpen(
                    true
                  )
                }
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-zinc-950
                  px-4
                  py-2
                  font-bold
                "
              >
                Invite Friend
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                openNewEvent(
                  selectedDate
                )
              }
              className="
                rounded-xl
                bg-white
                px-4
                py-2
                font-black
                text-black
              "
            >
              + New Event
            </button>
          </div>
        </header>


        {invites.length >
          0 && (
          <section
            className="
              mb-5
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-950/10
              p-4
            "
          >
            <h2
              className="
                font-black
              "
            >
              Calendar Invitations
            </h2>

            <div
              className="
                mt-3
                space-y-3
              "
            >
              {invites.map(
                (
                  invite
                ) => (
                  <div
                    key={
                      invite.invite_id
                    }
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/10
                      bg-black/30
                      p-3
                    "
                  >
                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          font-black
                        "
                      >
                        {invite.calendar_name}
                      </p>

                      <p
                        className="
                          text-sm
                          text-zinc-500
                        "
                      >
                        {invite.inviter_display_name} invited you as {invite.role}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void respondToInvite(
                          invite.invite_id,
                          true
                        )
                      }
                      className="
                        rounded-lg
                        bg-white
                        px-3
                        py-2
                        text-sm
                        font-black
                        text-black
                      "
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void respondToInvite(
                          invite.invite_id,
                          false
                        )
                      }
                      className="
                        rounded-lg
                        border
                        border-white/10
                        px-3
                        py-2
                        text-sm
                        font-bold
                      "
                    >
                      Decline
                    </button>
                  </div>
                )
              )}
            </div>
          </section>
        )}


        <div
          className="
            grid
            gap-5

            xl:grid-cols-[260px_minmax(0,1fr)]
          "
        >
          <CalendarSidebar
            calendars={
              calendars
            }
            visibleCalendarIds={
              visibleCalendarIds
            }
            onToggleCalendar={(
              calendarId
            ) =>
              setVisibleCalendarIds(
                (
                  current
                ) => {
                  const next =
                    new Set(
                      current
                    );

                  if (
                    next.has(
                      calendarId
                    )
                  ) {
                    next.delete(
                      calendarId
                    );
                  } else {
                    next.add(
                      calendarId
                    );
                  }

                  return next;
                }
              )
            }
            onDeleteCalendar={(
              calendar
            ) =>
              void deleteCalendar(
                calendar
              )
            }
          />


          <section
            className="
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-zinc-950/60
            "
          >
            <CalendarToolbar
              anchorDate={
                anchorDate
              }
              view={
                view
              }
              onAnchorDateChange={(
                date
              ) => {
                setAnchorDate(
                  date
                );

                setSelectedDate(
                  date
                );
              }}
              onViewChange={
                setView
              }
            />

            <CalendarViews
              view={
                view
              }
              anchorDate={
                anchorDate
              }
              selectedDate={
                selectedDate
              }
              events={
                visibleEvents
              }
              calendars={
                calendars
              }
              onSelectDate={(
                date
              ) => {
                setSelectedDate(
                  date
                );

                setAnchorDate(
                  date
                );
              }}
              onOpenEvent={
                openExistingEvent
              }
              onCreateEvent={
                openNewEvent
              }
            />
          </section>
        </div>
      </div>


      <PlanningModal
        open={
          planningOpen
        }
        calendars={
          calendars
        }
        taskSchedules={
          taskSchedules
        }
        skillDeadlines={
          skillDeadlines
        }
        saving={
          saving
        }
        onClose={() =>
          setPlanningOpen(
            false
          )
        }
        onSaveTask={
          saveTaskSchedule
        }
        onRemoveTask={
          removeTaskSchedule
        }
        onSaveSkill={
          saveSkillDeadline
        }
        onRemoveSkill={
          removeSkillDeadline
        }
      />


      <EventModal
        open={
          eventModalOpen
        }
        initialDate={
          selectedDate
        }
        event={
          editingEvent
        }
        calendars={
          writableCalendars
        }
        saving={
          saving
        }
        onClose={() =>
          setEventModalOpen(
            false
          )
        }
        onSave={
          saveEvent
        }
        onDelete={
          deleteEvent
        }
      />


      <NewCalendarModal
        open={
          calendarModalOpen
        }
        saving={
          saving
        }
        onClose={() =>
          setCalendarModalOpen(
            false
          )
        }
        onCreate={
          createCalendar
        }
      />


      <InviteFriendModal
        open={
          inviteModalOpen
        }
        saving={
          saving
        }
        calendars={
          ownedSharedCalendars
        }
        friends={
          friends
        }
        onClose={() =>
          setInviteModalOpen(
            false
          )
        }
        onInvite={
          inviteFriend
        }
      />


      {notice && (
        <div
          className={`
            fixed
            bottom-5
            right-5
            z-[600]
            max-w-sm
            rounded-2xl
            border
            px-4
            py-3
            text-sm
            font-bold
            shadow-2xl
            backdrop-blur-xl

            ${
              notice.type ===
                "error"
                ? "border-red-500/25 bg-red-950/90 text-red-100"
                : "border-green-500/25 bg-green-950/90 text-green-100"
            }
          `}
        >
          {notice.text}
        </div>
      )}
    </main>
  );
}

import { useAppDialog } from "@/components/ui/AppDialogProvider";
