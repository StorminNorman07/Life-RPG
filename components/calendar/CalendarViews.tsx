"use client";

import {
  useMemo,
} from "react";

import {
  addDays,
  dateKey,
  formatEventTime,
  getDayPeriod,
  sameDay,
  startOfMonthGrid,
  startOfWeek,
} from "./dateUtils";

import {
  calendarColors,
  type CalendarEvent,
  type CalendarItem,
  type CalendarView,
} from "./types";


const weekdays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];


export default function CalendarViews({
  view,
  anchorDate,
  selectedDate,
  events,
  calendars,
  onSelectDate,
  onOpenEvent,
  onCreateEvent,
}: {
  view:
    CalendarView;

  anchorDate:
    Date;

  selectedDate:
    Date;

  events:
    CalendarEvent[];

  calendars:
    CalendarItem[];

  onSelectDate:
    (
      date:
        Date
    ) => void;

  onOpenEvent:
    (
      event:
        CalendarEvent
    ) => void;

  onCreateEvent:
    (
      date:
        Date
    ) => void;
}) {
  const calendarById =
    useMemo(
      () =>
        new Map(
          calendars.map(
            (
              calendar
            ) => [
              calendar.id,
              calendar,
            ]
          )
        ),
      [
        calendars,
      ]
    );


  if (
    view ===
    "month"
  ) {
    return (
      <MonthView
        anchorDate={
          anchorDate
        }
        selectedDate={
          selectedDate
        }
        events={
          events
        }
        calendarById={
          calendarById
        }
        onSelectDate={
          onSelectDate
        }
        onOpenEvent={
          onOpenEvent
        }
        onCreateEvent={
          onCreateEvent
        }
      />
    );
  }

  if (
    view ===
    "week"
  ) {
    return (
      <WeekView
        anchorDate={
          anchorDate
        }
        events={
          events
        }
        calendarById={
          calendarById
        }
        onSelectDate={
          onSelectDate
        }
        onOpenEvent={
          onOpenEvent
        }
        onCreateEvent={
          onCreateEvent
        }
      />
    );
  }

  return (
    <DayView
      anchorDate={
        anchorDate
      }
      events={
        events
      }
      calendarById={
        calendarById
      }
      onOpenEvent={
        onOpenEvent
      }
      onCreateEvent={
        onCreateEvent
      }
    />
  );
}


function MonthView({
  anchorDate,
  selectedDate,
  events,
  calendarById,
  onSelectDate,
  onOpenEvent,
  onCreateEvent,
}: {
  anchorDate:
    Date;

  selectedDate:
    Date;

  events:
    CalendarEvent[];

  calendarById:
    Map<
      string,
      CalendarItem
    >;

  onSelectDate:
    (
      date:
        Date
    ) => void;

  onOpenEvent:
    (
      event:
        CalendarEvent
    ) => void;

  onCreateEvent:
    (
      date:
        Date
    ) => void;
}) {
  const days =
    Array.from(
      {
        length:
          42,
      },
      (
        _,
        index
      ) =>
        addDays(
          startOfMonthGrid(
            anchorDate
          ),
          index
        )
    );

  const eventMap =
    new Map<
      string,
      CalendarEvent[]
    >();

  events.forEach(
    (
      event
    ) => {
      const key =
        dateKey(
          new Date(
            event.starts_at
          )
        );

      const existing =
        eventMap.get(
          key
        ) ??
        [];

      existing.push(
        event
      );

      eventMap.set(
        key,
        existing
      );
    }
  );


  return (
    <>
      <div
        className="
          grid
          grid-cols-7
          border-b
          border-white/10
          bg-black/30
        "
      >
        {weekdays.map(
          (
            weekday
          ) => (
            <div
              key={
                weekday
              }
              className="
                px-0.5
                py-2
                text-center
                text-[10px]

                sm:p-2
                sm:text-xs
                font-black
                uppercase
                tracking-[0.12em]
                text-zinc-600
              "
            >
              {weekday}
            </div>
          )
        )}
      </div>

      <div
        className="
          grid
          grid-cols-7
        "
      >
        {days.map(
          (
            day
          ) => {
            const dayEvents =
              eventMap.get(
                dateKey(
                  day
                )
              ) ??
              [];

            const isToday =
              sameDay(
                day,
                new Date()
              );

            const selected =
              sameDay(
                day,
                selectedDate
              );

            const inMonth =
              day.getMonth() ===
              anchorDate.getMonth();

            return (
              <div
                key={
                  day.toISOString()
                }
                onClick={() =>
                  onSelectDate(
                    day
                  )
                }
                onDoubleClick={() =>
                  onCreateEvent(
                    day
                  )
                }
                className={`
                  min-h-[74px]
                  min-w-0
                  border-b
                  border-r
                  border-white/[0.07]
                  p-1

                  sm:min-h-32
                  sm:p-2
                  transition

                  hover:bg-white/[0.035]

                  ${
                    selected
                      ? "bg-white/[0.05]"
                      : ""
                  }

                  ${
                    inMonth
                      ? "text-white"
                      : "text-zinc-700"
                  }
                `}
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className={`
                      inline-flex
                      h-6
                      w-6
                      items-center

                      sm:h-7
                      sm:w-7
                      justify-center
                      rounded-full
                      text-sm
                      font-bold

                      ${
                        isToday
                          ? "bg-red-500 text-white"
                          : ""
                      }
                    `}
                  >
                    {day.getDate()}
                  </span>

                  <button
                    type="button"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      onCreateEvent(
                        day
                      );
                    }}
                    className="
                      hidden
                      rounded-full
                      px-2
                      text-zinc-700

                      sm:block
                      transition

                      hover:bg-white/10
                      hover:text-white
                    "
                  >
                    +
                  </button>
                </div>

                <div
                  className="
                    mt-2
                  "
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      justify-center
                      gap-1

                      sm:hidden
                    "
                  >
                    {dayEvents
                      .slice(
                        0,
                        4
                      )
                      .map(
                        (
                          event
                        ) => {
                          const calendar =
                            calendarById.get(
                              event.calendar_id
                            );

                          const color =
                            calendarColors[
                              calendar?.color ??
                                "blue"
                            ] ??
                            calendarColors.blue;

                          return (
                            <button
                              key={
                                event.id
                              }
                              type="button"
                              onClick={(
                                clickEvent
                              ) => {
                                clickEvent.stopPropagation();

                                onOpenEvent(
                                  event
                                );
                              }}
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full

                                ${color.dot}
                              `}
                              aria-label={
                                event.title
                              }
                            />
                          );
                        }
                      )}
                  </div>

                  <div
                    className="
                      hidden
                      space-y-1.5

                      sm:block
                    "
                  >
                    {dayEvents
                      .slice(
                        0,
                        3
                      )
                      .map(
                        (
                          event
                        ) => (
                          <EventChip
                            key={
                              event.id
                            }
                            event={
                              event
                            }
                            calendar={
                              calendarById.get(
                                event.calendar_id
                              )
                            }
                            onClick={() =>
                              onOpenEvent(
                                event
                              )
                            }
                          />
                        )
                      )}

                    {dayEvents.length >
                      3 && (
                      <p
                        className="
                          px-1
                          text-xs
                          font-bold
                          text-zinc-500
                        "
                      >
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </>
  );
}


function WeekView({
  anchorDate,
  events,
  calendarById,
  onSelectDate,
  onOpenEvent,
  onCreateEvent,
}: {
  anchorDate:
    Date;

  events:
    CalendarEvent[];

  calendarById:
    Map<
      string,
      CalendarItem
    >;

  onSelectDate:
    (
      date:
        Date
    ) => void;

  onOpenEvent:
    (
      event:
        CalendarEvent
    ) => void;

  onCreateEvent:
    (
      date:
        Date
    ) => void;
}) {
  const weekStart =
    startOfWeek(
      anchorDate
    );

  const days =
    Array.from(
      {
        length:
          7,
      },
      (
        _,
        index
      ) =>
        addDays(
          weekStart,
          index
        )
    );


  return (
    <div
      className="
        grid
        gap-3
        p-4

        md:grid-cols-2
        xl:grid-cols-7
      "
    >
      {days.map(
        (
          day
        ) => {
          const dayEvents =
            events.filter(
              (
                event
              ) =>
                sameDay(
                  new Date(
                    event.starts_at
                  ),
                  day
                )
            );

          return (
            <section
              key={
                day.toISOString()
              }
              className="
                rounded-2xl
                border
                border-white/10
                bg-black/25
                p-3
              "
            >
              <button
                type="button"
                onClick={() =>
                  onSelectDate(
                    day
                  )
                }
                className="
                  w-full
                  text-left
                "
              >
                <p
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.15em]
                    text-zinc-600
                  "
                >
                  {day.toLocaleDateString(
                    undefined,
                    {
                      weekday:
                        "short",
                    }
                  )}
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                  "
                >
                  {day.getDate()}
                </p>
              </button>

              <div
                className="
                  mt-4
                  space-y-3
                "
              >
                {dayEvents.map(
                  (
                    event
                  ) => (
                    <EventCard
                      key={
                        event.id
                      }
                      event={
                        event
                      }
                      calendar={
                        calendarById.get(
                          event.calendar_id
                        )
                      }
                      onClick={() =>
                        onOpenEvent(
                          event
                        )
                      }
                    />
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    onCreateEvent(
                      day
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-dashed
                    border-white/10
                    px-3
                    py-4
                    text-sm
                    font-bold
                    text-zinc-600
                    transition

                    hover:border-white/25
                    hover:text-white
                  "
                >
                  + Add event
                </button>
              </div>
            </section>
          );
        }
      )}
    </div>
  );
}


function DayView({
  anchorDate,
  events,
  calendarById,
  onOpenEvent,
  onCreateEvent,
}: {
  anchorDate:
    Date;

  events:
    CalendarEvent[];

  calendarById:
    Map<
      string,
      CalendarItem
    >;

  onOpenEvent:
    (
      event:
        CalendarEvent
    ) => void;

  onCreateEvent:
    (
      date:
        Date
    ) => void;
}) {
  const dayEvents =
    events.filter(
      (
        event
      ) =>
        sameDay(
          new Date(
            event.starts_at
          ),
          anchorDate
        )
    );

  const allDay =
    dayEvents.filter(
      (
        event
      ) =>
        event.is_all_day
    );

  const timed =
    dayEvents.filter(
      (
        event
      ) =>
        !event.is_all_day
    );

  const periods = [
    "Morning",
    "Afternoon",
    "Evening",
  ] as const;


  return (
    <div
      className="
        p-5

        md:p-8
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-sm
              font-black
              uppercase
              tracking-[0.18em]
              text-zinc-600
            "
          >
            Daily agenda
          </p>

          <h3
            className="
              mt-2
              text-3xl
              font-black
            "
          >
            {anchorDate.toLocaleDateString(
              undefined,
              {
                weekday:
                  "long",

                month:
                  "long",

                day:
                  "numeric",
              }
            )}
          </h3>
        </div>

        <button
          type="button"
          onClick={() =>
            onCreateEvent(
              anchorDate
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


      {allDay.length >
        0 && (
        <section
          className="
            mt-8
          "
        >
          <h4
            className="
              text-sm
              font-black
              uppercase
              tracking-[0.15em]
              text-zinc-500
            "
          >
            All day
          </h4>

          <div
            className="
              mt-3
              grid
              gap-3

              md:grid-cols-2
            "
          >
            {allDay.map(
              (
                event
              ) => (
                <EventCard
                  key={
                    event.id
                  }
                  event={
                    event
                  }
                  calendar={
                    calendarById.get(
                      event.calendar_id
                    )
                  }
                  onClick={() =>
                    onOpenEvent(
                      event
                    )
                  }
                />
              )
            )}
          </div>
        </section>
      )}


      <div
        className="
          mt-8
          space-y-8
        "
      >
        {periods.map(
          (
            period
          ) => {
            const periodEvents =
              timed.filter(
                (
                  event
                ) =>
                  getDayPeriod(
                    new Date(
                      event.starts_at
                    )
                  ) ===
                  period
              );

            return (
              <section
                key={
                  period
                }
              >
                <h4
                  className="
                    text-sm
                    font-black
                    uppercase
                    tracking-[0.15em]
                    text-zinc-500
                  "
                >
                  {period}
                </h4>

                <div
                  className="
                    mt-3
                    grid
                    gap-3

                    md:grid-cols-2
                  "
                >
                  {periodEvents.length ===
                    0 ? (
                    <div
                      className="
                        rounded-2xl
                        border
                        border-dashed
                        border-white/10
                        p-5
                        text-sm
                        text-zinc-700
                      "
                    >
                      Nothing scheduled.
                    </div>
                  ) : (
                    periodEvents.map(
                      (
                        event
                      ) => (
                        <EventCard
                          key={
                            event.id
                          }
                          event={
                            event
                          }
                          calendar={
                            calendarById.get(
                              event.calendar_id
                            )
                          }
                          onClick={() =>
                            onOpenEvent(
                              event
                            )
                          }
                        />
                      )
                    )
                  )}
                </div>
              </section>
            );
          }
        )}
      </div>
    </div>
  );
}


function EventChip({
  event,
  calendar,
  onClick,
}: {
  event:
    CalendarEvent;

  calendar?:
    CalendarItem;

  onClick:
    () => void;
}) {
  const color =
    calendarColors[
      calendar?.color ??
      "blue"
    ] ??
    calendarColors.blue;

  return (
    <button
      type="button"
      onClick={(
        clickEvent
      ) => {
        clickEvent.stopPropagation();

        onClick();
      }}
      className={`
        block
        w-full
        truncate
        rounded-lg
        border
        px-2
        py-1.5
        text-left
        text-xs
        font-bold
        transition

        hover:brightness-125

        ${
          color.soft
        }
      `}
    >
      {!event.is_all_day &&
        `${formatEventTime(
          event.starts_at
        )} `}

      {event.title}
    </button>
  );
}


function EventCard({
  event,
  calendar,
  onClick,
}: {
  event:
    CalendarEvent;

  calendar?:
    CalendarItem;

  onClick:
    () => void;
}) {
  const color =
    calendarColors[
      calendar?.color ??
      "blue"
    ] ??
    calendarColors.blue;

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        w-full
        rounded-2xl
        border
        p-4
        text-left
        transition

        hover:-translate-y-0.5
        hover:brightness-110

        ${
          color.soft
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.12em]
              opacity-70
            "
          >
            {event.is_all_day
              ? "All day"
              : `${formatEventTime(
                  event.starts_at
                )} – ${formatEventTime(
                  event.ends_at
                )}`}
          </p>

          <h4
            className="
              mt-2
              text-lg
              font-black
            "
          >
            {event.title}
          </h4>

          {event.location && (
            <p
              className="
                mt-2
                text-sm
                opacity-75
              "
            >
              📍 {event.location}
            </p>
          )}
        </div>

        <span
          className={`
            mt-1
            h-3
            w-3
            shrink-0
            rounded-full

            ${
              color.dot
            }
          `}
        />
      </div>

      <p
        className="
          mt-3
          text-xs
          opacity-60
        "
      >
        {calendar?.name}
      </p>
    </button>
  );
}
