"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  toLocalDateTimeInput,
} from "./dateUtils";

import {
  calendarColors,
  type CalendarEvent,
  type CalendarItem,
} from "./types";


export default function EventModal({
  open,
  initialDate,
  event,
  calendars,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  open:
    boolean;

  initialDate:
    Date;

  event:
    CalendarEvent | null;

  calendars:
    CalendarItem[];

  saving:
    boolean;

  onClose:
    () => void;

  onSave:
    (
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
    ) => Promise<void>;

  onDelete:
    (
      eventId:
        string
    ) => Promise<void>;
}) {
  const [
    calendarIds,
    setCalendarIds
  ] =
    useState<
      string[]
    >([]);

  const [
    title,
    setTitle
  ] =
    useState("");

  const [
    description,
    setDescription
  ] =
    useState("");

  const [
    location,
    setLocation
  ] =
    useState("");

  const [
    startsAt,
    setStartsAt
  ] =
    useState("");

  const [
    endsAt,
    setEndsAt
  ] =
    useState("");

  const [
    isAllDay,
    setIsAllDay
  ] =
    useState(
      false
    );


  useEffect(() => {
    if (
      !open
    ) {
      return;
    }

    if (
      event
    ) {
      setCalendarIds(
        event.calendar_ids?.length
          ? event.calendar_ids
          : [
              event.calendar_id,
            ]
      );

      setTitle(
        event.title
      );

      setDescription(
        event.description
      );

      setLocation(
        event.location
      );

      setStartsAt(
        toLocalDateTimeInput(
          new Date(
            event.starts_at
          )
        )
      );

      setEndsAt(
        toLocalDateTimeInput(
          new Date(
            event.ends_at
          )
        )
      );

      setIsAllDay(
        event.is_all_day
      );

      return;
    }

    const start =
      new Date(
        initialDate
      );

    start.setHours(
      9,
      0,
      0,
      0
    );

    const end =
      new Date(
        start.getTime() +
          60 *
            60 *
            1000
      );

    setCalendarIds(
      calendars[0]?.id
        ? [
            calendars[0].id,
          ]
        : []
    );

    setTitle(
      ""
    );

    setDescription(
      ""
    );

    setLocation(
      ""
    );

    setStartsAt(
      toLocalDateTimeInput(
        start
      )
    );

    setEndsAt(
      toLocalDateTimeInput(
        end
      )
    );

    setIsAllDay(
      false
    );
  }, [
    open,
    event,
    initialDate,
    calendars,
  ]);


  if (
    !open
  ) {
    return null;
  }


  async function submit(
    formEvent:
      FormEvent<HTMLFormElement>
  ) {
    formEvent.preventDefault();

    if (
      calendarIds.length <
      1
    ) {
      return;
    }

    await onSave({
      id:
        event?.id,

      calendarIds,

      title:
        title.trim(),

      description:
        description.trim(),

      location:
        location.trim(),

      startsAt,

      endsAt,

      isAllDay,
    });
  }


  return (
    <ModalShell
      title={
        event
          ? "Edit Event"
          : "New Event"
      }
      onClose={
        onClose
      }
    >
      <form
        onSubmit={
          submit
        }
        className="
          space-y-4
        "
      >
        <Field
          label="Title"
          value={
            title
          }
          onChange={
            setTitle
          }
          placeholder="Dinner with family"
        />

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

        <div
          className="
            grid
            gap-4

            sm:grid-cols-2
          "
        >
          <Field
            label="Starts"
            value={
              startsAt
            }
            onChange={
              setStartsAt
            }
            type="datetime-local"
          />

          <Field
            label="Ends"
            value={
              endsAt
            }
            onChange={
              setEndsAt
            }
            type="datetime-local"
          />
        </div>

        <label
          className="
            flex
            items-center
            gap-3
            text-sm
            font-bold
          "
        >
          <input
            type="checkbox"
            checked={
              isAllDay
            }
            onChange={(
              changeEvent
            ) =>
              setIsAllDay(
                changeEvent.target.checked
              )
            }
          />

          All-day event
        </label>

        <Field
          label="Location"
          value={
            location
          }
          onChange={
            setLocation
          }
          placeholder="Optional"
          required={
            false
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
              font-black
            "
          >
            Notes
          </span>

          <textarea
            value={
              description
            }
            onChange={(
              changeEvent
            ) =>
              setDescription(
                changeEvent.target.value
              )
            }
            rows={
              4
            }
            className="
              mt-2
              w-full
              rounded-xl
              border
              border-white/10
              bg-black
              px-4
              py-3
            "
          />
        </label>

        {calendarIds.length <
          1 && (
          <p
            className="
              text-sm
              font-bold
              text-red-300
            "
          >
            Select at least one calendar.
          </p>
        )}

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
            pt-2
          "
        >
          <div>
            {event && (
              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  void onDelete(
                    event.id
                  )
                }
                className="
                  rounded-xl
                  border
                  border-red-500/25
                  bg-red-950/20
                  px-4
                  py-2
                  font-bold
                  text-red-200
                "
              >
                Delete
              </button>
            )}
          </div>

          <div
            className="
              flex
              gap-3
            "
          >
            <button
              type="button"
              onClick={
                onClose
              }
              className="
                rounded-xl
                border
                border-white/10
                px-4
                py-2
                font-bold
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                calendarIds.length <
                  1
              }
              className="
                rounded-xl
                bg-white
                px-4
                py-2
                font-black
                text-black

                disabled:opacity-50
              "
            >
              {saving
                ? "Saving…"
                : event
                ? "Save Changes"
                : "Create Event"}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}


export function CalendarChecklist({
  calendars,
  selectedIds,
  onChange,
}: {
  calendars:
    CalendarItem[];

  selectedIds:
    string[];

  onChange:
    (
      ids:
        string[]
    ) => void;
}) {
  function toggle(
    calendarId:
      string
  ) {
    onChange(
      selectedIds.includes(
        calendarId
      )
        ? selectedIds.filter(
            (
              id
            ) =>
              id !==
              calendarId
          )
        : [
            ...selectedIds,
            calendarId,
          ]
    );
  }

  return (
    <fieldset>
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <legend
          className="
            text-sm
            font-black
          "
        >
          Add to calendars
        </legend>

        <button
          type="button"
          onClick={() =>
            onChange(
              selectedIds.length ===
                calendars.length
                ? []
                : calendars.map(
                    (
                      calendar
                    ) =>
                      calendar.id
                  )
            )
          }
          className="
            text-xs
            font-bold
            text-zinc-400
            hover:text-white
          "
        >
          {selectedIds.length ===
            calendars.length
            ? "Clear all"
            : "Select all"}
        </button>
      </div>

      <div
        className="
          mt-3
          grid
          gap-2

          sm:grid-cols-2
        "
      >
        {calendars.map(
          (
            calendar
          ) => {
            const selected =
              selectedIds.includes(
                calendar.id
              );

            const color =
              calendarColors[
                calendar.color
              ] ??
              calendarColors.blue;

            return (
              <button
                key={
                  calendar.id
                }
                type="button"
                aria-pressed={
                  selected
                }
                onClick={() =>
                  toggle(
                    calendar.id
                  )
                }
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  p-3
                  text-left
                  transition

                  ${
                    selected
                      ? "border-white/30 bg-white/[0.08]"
                      : "border-white/10 bg-black hover:border-white/20"
                  }
                `}
              >
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

                <span
                  className="
                    min-w-0
                    flex-1
                    truncate
                    text-sm
                    font-bold
                  "
                >
                  {calendar.name}
                </span>

                <span
                  className={`
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-md
                    border
                    text-xs
                    font-black

                    ${
                      selected
                        ? "border-white bg-white text-black"
                        : "border-white/15 text-transparent"
                    }
                  `}
                >
                  ✓
                </span>
              </button>
            );
          }
        )}
      </div>
    </fieldset>
  );
}


export function ModalShell({
  title,
  onClose,
  children,
}: {
  title:
    string;

  onClose:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[1400]
        flex
        items-start
        justify-center
        overflow-hidden
        bg-black/80
        px-3
        pb-[max(0.75rem,env(safe-area-inset-bottom))]
        pt-[max(0.75rem,env(safe-area-inset-top))]
        backdrop-blur-md

        sm:items-center
        sm:p-5
      "
      onMouseDown={(
        mouseEvent
      ) => {
        if (
          mouseEvent.target ===
          mouseEvent.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="
          flex
          max-h-full
          w-full
          max-w-xl
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-zinc-950
        "
      >
        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-4
            border-b
            border-white/10
            bg-zinc-950
            px-5
            py-4

            sm:px-6
            sm:py-5
          "
        >
          <h2
            className="
              text-2xl
              font-black
            "
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close event window"
            className="
              flex
              shrink-0
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              text-xl
              font-black
            "
          >
            ×
          </button>
        </div>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            p-5
            pb-6

            [-webkit-overflow-scrolling:touch]

            sm:p-6
          "
        >
          {children}
        </div>
      </section>
    </div>
  );
}


function Field({
  label,
  value,
  onChange,
  placeholder,
  type =
    "text",
  required =
    true,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  placeholder?:
    string;

  type?:
    string;

  required?:
    boolean;
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
          font-black
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
        onChange={(
          changeEvent
        ) =>
          onChange(
            changeEvent.target.value
          )
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-white/10
          bg-black
          px-4
          py-3
        "
      />
    </label>
  );
}
