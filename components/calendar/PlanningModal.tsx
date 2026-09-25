"use client";

import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import {
  useGame,
} from "@/context/GameContext";

import {
  CalendarChecklist,
  ModalShell,
} from "@/components/calendar/EventModal";

import {
  type CalendarItem,
} from "@/components/calendar/types";


export type TaskCalendarSchedule = {
  user_id:
    string;

  task_id:
    number;

  enabled:
    boolean;

  start_time:
    string | null;

  duration_minutes:
    number | null;

  calendar_id:
    string | null;

  calendar_ids?:
    string[];
};


export type SkillGoalDeadline = {
  user_id:
    string;

  skill_node_id:
    number;

  enabled:
    boolean;

  target_at:
    string;

  notes:
    string;

  calendar_id:
    string | null;

  calendar_ids?:
    string[];
};


type CalendarOption =
  CalendarItem;


export default function PlanningModal({
  open,
  calendars,
  taskSchedules,
  skillDeadlines,
  saving,
  onClose,
  onSaveTask,
  onRemoveTask,
  onSaveSkill,
  onRemoveSkill,
}: {
  open:
    boolean;

  calendars:
    CalendarOption[];

  taskSchedules:
    TaskCalendarSchedule[];

  skillDeadlines:
    SkillGoalDeadline[];

  saving:
    boolean;

  onClose:
    () => void;

  onSaveTask:
    (
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
    ) => Promise<void>;

  onRemoveTask:
    (
      taskId:
        number
    ) => Promise<void>;

  onSaveSkill:
    (
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
    ) => Promise<void>;

  onRemoveSkill:
    (
      skillNodeId:
        number
    ) => Promise<void>;
}) {
  const {
    tasks,
    skillNodes,
    completedSkills,
  } =
    useGame();

  const [
    tab,
    setTab
  ] =
    useState<
      "tasks" | "skills"
    >(
      "tasks"
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

  const defaultCalendarId =
    writableCalendars.find(
      (
        calendar
      ) =>
        calendar.is_personal
    )?.id ??
    writableCalendars[0]?.id ??
    "";


  if (
    !open
  ) {
    return null;
  }


  return (
    <ModalShell
      title="Plan Tasks & Goals"
      onClose={
        onClose
      }
    >
      <div
        className="
          flex
          rounded-xl
          border
          border-white/10
          bg-black
          p-1
        "
      >
        <TabButton
          active={
            tab ===
            "tasks"
          }
          onClick={() =>
            setTab(
              "tasks"
            )
          }
        >
          Daily Tasks
        </TabButton>

        <TabButton
          active={
            tab ===
            "skills"
          }
          onClick={() =>
            setTab(
              "skills"
            )
          }
        >
          Skill Tree
        </TabButton>
      </div>


      <div
        className="
          mt-5
          max-h-[65vh]
          space-y-3
          overflow-y-auto
          pr-1
        "
      >
        {tab ===
          "tasks"
          ? tasks.map(
              (
                task
              ) => (
                <TaskSwitchCard
                  key={
                    task.id
                  }
                  task={{
                    id:
                      task.id,

                    name:
                      task.name,

                    scheduledDays:
                      task.scheduledDays ??
                      [],
                  }}
                  existing={
                    taskSchedules.find(
                      (
                        schedule
                      ) =>
                        Number(
                          schedule.task_id
                        ) ===
                        Number(
                          task.id
                        )
                    ) ??
                    null
                  }
                  calendars={
                    writableCalendars
                  }
                  defaultCalendarId={
                    defaultCalendarId
                  }
                  saving={
                    saving
                  }
                  onSave={
                    onSaveTask
                  }
                  onRemove={
                    onRemoveTask
                  }
                />
              )
            )
          : skillNodes.map(
              (
                node
              ) => (
                <SkillSwitchCard
                  key={
                    node.id
                  }
                  node={{
                    id:
                      node.id,

                    name:
                      node.name,
                  }}
                  completed={
                    completedSkills.includes(
                      node.id
                    )
                  }
                  existing={
                    skillDeadlines.find(
                      (
                        deadline
                      ) =>
                        Number(
                          deadline.skill_node_id
                        ) ===
                        Number(
                          node.id
                        )
                    ) ??
                    null
                  }
                  calendars={
                    writableCalendars
                  }
                  defaultCalendarId={
                    defaultCalendarId
                  }
                  saving={
                    saving
                  }
                  onSave={
                    onSaveSkill
                  }
                  onRemove={
                    onRemoveSkill
                  }
                />
              )
            )}
      </div>
    </ModalShell>
  );
}


function TaskSwitchCard({
  task,
  existing,
  calendars,
  defaultCalendarId,
  saving,
  onSave,
  onRemove,
}: {
  task: {
    id:
      number;

    name:
      string;

    scheduledDays:
      unknown[];
  };

  existing:
    TaskCalendarSchedule | null;

  calendars:
    CalendarOption[];

  defaultCalendarId:
    string;

  saving:
    boolean;

  onSave:
    (
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
    ) => Promise<void>;

  onRemove:
    (
      taskId:
        number
    ) => Promise<void>;
}) {
  const [
    enabled,
    setEnabled
  ] =
    useState(
      Boolean(
        existing
      )
    );

  const [
    mode,
    setMode
  ] =
    useState<
      "all-day" | "time"
    >(
      existing?.start_time
        ? "time"
        : "all-day"
    );

  const [
    time,
    setTime
  ] =
    useState(
      existing?.start_time?.slice(
        0,
        5
      ) ??
      "09:00"
    );

  const [
    duration,
    setDuration
  ] =
    useState(
      String(
        existing?.duration_minutes ??
        30
      )
    );

  const [
    calendarIds,
    setCalendarIds
  ] =
    useState<
      string[]
    >(
      existing?.calendar_ids?.length
        ? existing.calendar_ids
        : existing?.calendar_id
        ? [
            existing.calendar_id,
          ]
        : defaultCalendarId
        ? [
            defaultCalendarId,
          ]
        : []
    );


  useEffect(() => {
    setEnabled(
      Boolean(
        existing
      )
    );

    setMode(
      existing?.start_time
        ? "time"
        : "all-day"
    );

    setTime(
      existing?.start_time?.slice(
        0,
        5
      ) ??
      "09:00"
    );

    setDuration(
      String(
        existing?.duration_minutes ??
        30
      )
    );

    setCalendarIds(
      existing?.calendar_ids?.length
        ? existing.calendar_ids
        : existing?.calendar_id
        ? [
            existing.calendar_id,
          ]
        : defaultCalendarId
        ? [
            defaultCalendarId,
          ]
        : []
    );
  }, [
    existing,
    defaultCalendarId,
  ]);


  async function saveCurrent() {
    if (
      calendarIds.length <
      1
    ) {
      return;
    }

    await onSave({
      taskId:
        task.id,

      startTime:
        mode ===
          "time"
          ? time
          : null,

      durationMinutes:
        mode ===
          "time"
          ? Number(
              duration
            ) ||
            30
          : null,

      calendarIds,
    });
  }


  async function toggle() {
    if (
      saving
    ) {
      return;
    }

    if (
      enabled
    ) {
      setEnabled(
        false
      );

      await onRemove(
        task.id
      );

      return;
    }

    if (
      calendarIds.length <
        1
    ) {
      return;
    }

    setEnabled(
      true
    );

    await saveCurrent();
  }


  return (
    <SwitchCard
      enabled={
        enabled
      }
      title={`✅ ${task.name}`}
      subtitle={
        formatScheduledDays(
          task.scheduledDays
        )
      }
      activeClass="border-cyan-500/30 bg-cyan-950/15"
      saving={
        saving
      }
      onToggle={
        toggle
      }
    >
      <ModeSelector
        value={
          mode
        }
        onChange={
          setMode
        }
      />

      {mode ===
        "time" && (
        <div
          className="
            grid
            gap-3

            sm:grid-cols-2
          "
        >
          <InputField
            label="Start time"
            type="time"
            value={
              time
            }
            onChange={
              setTime
            }
          />

          <InputField
            label="Duration in minutes"
            type="number"
            value={
              duration
            }
            onChange={
              setDuration
            }
          />
        </div>
      )}

      <CalendarChecklist
        calendars={
          calendars
        }
        selectedIds={
          calendarIds
        }
        onChange={
          setCalendarIds
        }
      />

      <button
        type="button"
        disabled={
          saving ||
          calendarIds.length <
            1 ||
          (
            mode ===
              "time" &&
            !time
          )
        }
        onClick={() =>
          void saveCurrent()
        }
        className="
          w-full
          rounded-xl
          bg-white
          px-4
          py-2
          text-sm
          font-black
          text-black

          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        Save schedule
      </button>
    </SwitchCard>
  );
}


function SkillSwitchCard({
  node,
  completed,
  existing,
  calendars,
  defaultCalendarId,
  saving,
  onSave,
  onRemove,
}: {
  node: {
    id:
      number;

    name:
      string;
  };

  completed:
    boolean;

  existing:
    SkillGoalDeadline | null;

  calendars:
    CalendarOption[];

  defaultCalendarId:
    string;

  saving:
    boolean;

  onSave:
    (
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
    ) => Promise<void>;

  onRemove:
    (
      skillNodeId:
        number
    ) => Promise<void>;
}) {
  const [
    enabled,
    setEnabled
  ] =
    useState(
      Boolean(
        existing
      )
    );

  const [
    targetMode,
    setTargetMode
  ] =
    useState<
      "all-day" | "time"
    >(
      existing &&
      !isMidnight(
        existing.target_at
      )
        ? "time"
        : "all-day"
    );

  const [
    targetDate,
    setTargetDate
  ] =
    useState(
      existing
        ? toLocalDate(
            existing.target_at
          )
        : ""
    );

  const [
    targetTime,
    setTargetTime
  ] =
    useState(
      existing
        ? toLocalTime(
            existing.target_at
          )
        : "09:00"
    );

  const [
    notes,
    setNotes
  ] =
    useState(
      existing?.notes ??
      ""
    );

  const [
    calendarIds,
    setCalendarIds
  ] =
    useState<
      string[]
    >(
      existing?.calendar_ids?.length
        ? existing.calendar_ids
        : existing?.calendar_id
        ? [
            existing.calendar_id,
          ]
        : defaultCalendarId
        ? [
            defaultCalendarId,
          ]
        : []
    );


  useEffect(() => {
    setEnabled(
      Boolean(
        existing
      )
    );

    setTargetMode(
      existing &&
      !isMidnight(
        existing.target_at
      )
        ? "time"
        : "all-day"
    );

    setTargetDate(
      existing
        ? toLocalDate(
            existing.target_at
          )
        : ""
    );

    setTargetTime(
      existing
        ? toLocalTime(
            existing.target_at
          )
        : "09:00"
    );

    setNotes(
      existing?.notes ??
      ""
    );

    setCalendarIds(
      existing?.calendar_ids?.length
        ? existing.calendar_ids
        : existing?.calendar_id
        ? [
            existing.calendar_id,
          ]
        : defaultCalendarId
        ? [
            defaultCalendarId,
          ]
        : []
    );
  }, [
    existing,
    defaultCalendarId,
  ]);


  function buildTargetAt() {
    if (
      !targetDate
    ) {
      return "";
    }

    return targetMode ===
      "time"
      ? `${targetDate}T${targetTime}`
      : `${targetDate}T00:00`;
  }


  async function saveCurrent() {
    const targetAt =
      buildTargetAt();

    if (
      !targetAt ||
      calendarIds.length <
        1
    ) {
      return;
    }

    await onSave({
      skillNodeId:
        node.id,

      targetAt,

      notes,

      calendarIds,
    });
  }


  async function toggle() {
    if (
      saving
    ) {
      return;
    }

    if (
      enabled
    ) {
      setEnabled(
        false
      );

      await onRemove(
        node.id
      );

      return;
    }

    const targetAt =
      buildTargetAt();

    if (
      !targetAt ||
      calendarIds.length <
        1
    ) {
      setEnabled(
        true
      );

      return;
    }

    setEnabled(
      true
    );

    await saveCurrent();
  }


  return (
    <SwitchCard
      enabled={
        enabled
      }
      title={`🌳 ${node.name}`}
      subtitle={
        completed
          ? "Completed"
          : existing
          ? "Goal scheduled"
          : "No goal date set"
      }
      activeClass={
        completed
          ? "border-green-500/30 bg-green-950/15"
          : "border-emerald-500/30 bg-emerald-950/15"
      }
      saving={
        saving
      }
      onToggle={
        toggle
      }
    >
      <ModeSelector
        value={
          targetMode
        }
        onChange={
          setTargetMode
        }
        allDayLabel="Goal day"
        timeLabel="Goal day & time"
      />

      <div
        className={`
          grid
          gap-3

          ${
            targetMode ===
              "time"
              ? "sm:grid-cols-2"
              : ""
          }
        `}
      >
        <InputField
          label="Goal date"
          type="date"
          value={
            targetDate
          }
          onChange={
            setTargetDate
          }
        />

        {targetMode ===
          "time" && (
          <InputField
            label="Goal time"
            type="time"
            value={
              targetTime
            }
            onChange={
              setTargetTime
            }
          />
        )}
      </div>

      <CalendarChecklist
        calendars={
          calendars
        }
        selectedIds={
          calendarIds
        }
        onChange={
          setCalendarIds
        }
      />

      <label
        className="
          block
        "
      >
        <span
          className="
            text-sm
            font-bold
          "
        >
          Notes (optional)
        </span>

        <textarea
          value={
            notes
          }
          onChange={(
            event
          ) =>
            setNotes(
              event.target.value
            )
          }
          rows={
            2
          }
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-white/10
            bg-black
            px-3
            py-2
          "
        />
      </label>

      <button
        type="button"
        disabled={
          saving ||
          !targetDate ||
          calendarIds.length <
            1 ||
          (
            targetMode ===
              "time" &&
            !targetTime
          )
        }
        onClick={() =>
          void saveCurrent()
        }
        className="
          w-full
          rounded-xl
          bg-white
          px-4
          py-2
          text-sm
          font-black
          text-black

          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        Save goal
      </button>
    </SwitchCard>
  );
}


function TabButton({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        flex-1
        rounded-lg
        px-3
        py-2
        text-sm
        font-bold
        transition

        ${
          active
            ? "bg-white text-black"
            : "text-zinc-500 hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}


function SwitchCard({
  enabled,
  title,
  subtitle,
  activeClass,
  saving,
  onToggle,
  children,
}: {
  enabled:
    boolean;

  title:
    string;

  subtitle:
    string;

  activeClass:
    string;

  saving:
    boolean;

  onToggle:
    () => Promise<void>;

  children:
    React.ReactNode;
}) {
  function stopPropagation(
    event:
      MouseEvent<HTMLElement>
  ) {
    event.stopPropagation();
  }


  function handleKeyDown(
    event:
      KeyboardEvent<HTMLElement>
  ) {
    if (
      event.key ===
        "Enter" ||
      event.key ===
        " "
    ) {
      event.preventDefault();

      void onToggle();
    }
  }


  return (
    <section
      role="button"
      tabIndex={
        0
      }
      aria-pressed={
        enabled
      }
      onClick={() =>
        void onToggle()
      }
      onKeyDown={
        handleKeyDown
      }
      className={`
        cursor-pointer
        rounded-2xl
        border
        p-4
        transition

        ${
          enabled
            ? activeClass
            : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.03]"
        }
      `}
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <h3
            className="
              truncate
              font-black
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-xs
              text-zinc-600
            "
          >
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          disabled={
            saving
          }
          aria-label={
            enabled
              ? "Remove from calendar"
              : "Add to calendar"
          }
          aria-pressed={
            enabled
          }
          onClick={(
            event
          ) => {
            event.stopPropagation();

            void onToggle();
          }}
          className={`
            flex
            h-8
            w-14
            shrink-0
            items-center
            rounded-full
            p-1
            transition

            ${
              enabled
                ? "justify-end bg-white"
                : "justify-start bg-zinc-800"
            }
          `}
        >
          <span
            className={`
              h-6
              w-6
              rounded-full
              transition

              ${
                enabled
                  ? "bg-black"
                  : "bg-zinc-400"
              }
            `}
          />
        </button>
      </div>


      {enabled && (
        <div
          onClick={
            stopPropagation
          }
          onKeyDown={(
            event
          ) =>
            event.stopPropagation()
          }
          className="
            mt-4
            space-y-4
          "
        >
          {children}
        </div>
      )}
    </section>
  );
}


function ModeSelector({
  value,
  onChange,
  allDayLabel =
    "All day",
  timeLabel =
    "Specific time",
}: {
  value:
    "all-day" | "time";

  onChange:
    (
      value:
        "all-day" | "time"
    ) => void;

  allDayLabel?:
    string;

  timeLabel?:
    string;
}) {
  return (
    <div
      className="
        grid
        grid-cols-2
        rounded-xl
        border
        border-white/10
        bg-black
        p-1
      "
    >
      <button
        type="button"
        onClick={() =>
          onChange(
            "all-day"
          )
        }
        className={`
          rounded-lg
          px-3
          py-2
          text-sm
          font-bold

          ${
            value ===
              "all-day"
              ? "bg-white text-black"
              : "text-zinc-500"
          }
        `}
      >
        {allDayLabel}
      </button>

      <button
        type="button"
        onClick={() =>
          onChange(
            "time"
          )
        }
        className={`
          rounded-lg
          px-3
          py-2
          text-sm
          font-bold

          ${
            value ===
              "time"
              ? "bg-white text-black"
              : "text-zinc-500"
          }
        `}
      >
        {timeLabel}
      </button>
    </div>
  );
}


function InputField({
  label,
  type,
  value,
  onChange,
}: {
  label:
    string;

  type:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          text-sm
          font-bold
        "
      >
        {label}
      </span>

      <input
        type={
          type
        }
        value={
          value
        }
        min={
          type ===
            "number"
            ? "5"
            : undefined
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-white/10
          bg-black
          px-3
          py-2
        "
      />
    </label>
  );
}


function formatScheduledDays(
  days:
    unknown[]
) {
  if (
    days.length ===
    0
  ) {
    return "Every day";
  }

  return days
    .map(
      (
        day
      ) =>
        String(
          day
        )
    )
    .join(
      ", "
    );
}


function toLocalDate(
  iso:
    string
) {
  const date =
    new Date(
      iso
    );

  const adjusted =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60_000
    );

  return adjusted
    .toISOString()
    .slice(
      0,
      10
    );
}


function toLocalTime(
  iso:
    string
) {
  const date =
    new Date(
      iso
    );

  const hours =
    String(
      date.getHours()
    ).padStart(
      2,
      "0"
    );

  const minutes =
    String(
      date.getMinutes()
    ).padStart(
      2,
      "0"
    );

  return `${hours}:${minutes}`;
}


function isMidnight(
  iso:
    string
) {
  const date =
    new Date(
      iso
    );

  return (
    date.getHours() ===
      0 &&
    date.getMinutes() ===
      0
  );
}
