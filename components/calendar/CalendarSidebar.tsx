"use client";

import {
  calendarColors,
  type CalendarItem,
} from "./types";


export default function CalendarSidebar({
  calendars,
  visibleCalendarIds,
  onToggleCalendar,
  onDeleteCalendar,
}: {
  calendars:
    CalendarItem[];

  visibleCalendarIds:
    Set<string>;

  onToggleCalendar:
    (
      calendarId:
        string
    ) => void;

  onDeleteCalendar:
    (
      calendar:
        CalendarItem
    ) => void;
}) {
  return (
    <aside
      className="
        rounded-2xl
        border
        border-white/10
        bg-zinc-950/75
        p-4
      "
    >
      <h2
        className="
          text-sm
          font-black
          uppercase
          tracking-[0.18em]
          text-zinc-500
        "
      >
        My Calendars
      </h2>

      <div
        className="
          mt-4
          space-y-2
        "
      >
        {calendars.map(
          (
            calendar
          ) => {
            const color =
              calendarColors[
                calendar.color
              ] ??
              calendarColors.blue;

            return (
              <div
                key={
                  calendar.id
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  p-2
                  transition

                  hover:bg-white/[0.04]
                "
              >
                <label
                  className="
                    flex
                    min-w-0
                    flex-1
                    cursor-pointer
                    items-center
                    gap-3
                  "
                >
                  <input
                    type="checkbox"
                    checked={
                      visibleCalendarIds.has(
                        calendar.id
                      )
                    }
                    onChange={() =>
                      onToggleCalendar(
                        calendar.id
                      )
                    }
                  />

                  <span
                    className={`
                      h-3
                      w-3
                      shrink-0
                      rounded-full

                      ${
                        color.dot
                      }
                    `}
                  />

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                      "
                    >
                      {calendar.name}
                    </p>

                    <p
                      className="
                        text-xs
                        capitalize
                        text-zinc-600
                      "
                    >
                      {calendar.role}
                    </p>
                  </div>
                </label>

                {calendar.role ===
                  "owner" &&
                  !calendar.is_personal && (
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteCalendar(
                        calendar
                      )
                    }
                    title="Delete calendar"
                    className="
                      rounded-lg
                      border
                      border-red-500/15
                      px-2
                      py-1
                      text-sm
                      text-red-300
                      transition

                      hover:bg-red-950/30
                    "
                  >
                    🗑
                  </button>
                )}
              </div>
            );
          }
        )}
      </div>
    </aside>
  );
}
