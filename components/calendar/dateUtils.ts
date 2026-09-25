import {
  type CalendarView,
} from "./types";


export function startOfDay(
  date:
    Date
) {
  const next =
    new Date(
      date
    );

  next.setHours(
    0,
    0,
    0,
    0
  );

  return next;
}


export function endOfDay(
  date:
    Date
) {
  const next =
    new Date(
      date
    );

  next.setHours(
    23,
    59,
    59,
    999
  );

  return next;
}


export function startOfMonth(
  date:
    Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}


export function startOfWeek(
  date:
    Date
) {
  const next =
    startOfDay(
      date
    );

  const day =
    next.getDay();

  const daysSinceMonday =
    day ===
      0
      ? 6
      : day -
        1;

  next.setDate(
    next.getDate() -
      daysSinceMonday
  );

  return next;
}


export function addDays(
  date:
    Date,

  amount:
    number
) {
  const next =
    new Date(
      date
    );

  next.setDate(
    next.getDate() +
      amount
  );

  return next;
}


export function addMonths(
  date:
    Date,

  amount:
    number
) {
  return new Date(
    date.getFullYear(),
    date.getMonth() +
      amount,
    1
  );
}


export function startOfMonthGrid(
  date:
    Date
) {
  return startOfWeek(
    startOfMonth(
      date
    )
  );
}


export function endOfMonthGrid(
  date:
    Date
) {
  return endOfDay(
    addDays(
      startOfMonthGrid(
        date
      ),
      41
    )
  );
}


export function getVisibleRange(
  anchorDate:
    Date,

  view:
    CalendarView
) {
  if (
    view ===
    "month"
  ) {
    return {
      start:
        startOfMonthGrid(
          anchorDate
        ),

      end:
        endOfMonthGrid(
          anchorDate
        ),
    };
  }

  if (
    view ===
    "week"
  ) {
    const start =
      startOfWeek(
        anchorDate
      );

    return {
      start,

      end:
        endOfDay(
          addDays(
            start,
            6
          )
        ),
    };
  }

  return {
    start:
      startOfDay(
        anchorDate
      ),

    end:
      endOfDay(
        anchorDate
      ),
  };
}


export function dateKey(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


export function sameDay(
  first:
    Date,

  second:
    Date
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}


export function toLocalDateTimeInput(
  date:
    Date
) {
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
      16
    );
}


export function formatEventTime(
  iso:
    string
) {
  return new Date(
    iso
  ).toLocaleTimeString(
    undefined,
    {
      hour:
        "numeric",

      minute:
        "2-digit",
    }
  );
}


export function getDayPeriod(
  date:
    Date
):
  "Morning" | "Afternoon" | "Evening" {
  const hour =
    date.getHours();

  if (
    hour <
    12
  ) {
    return "Morning";
  }

  if (
    hour <
    17
  ) {
    return "Afternoon";
  }

  return "Evening";
}
