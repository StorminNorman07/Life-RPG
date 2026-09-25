"use client";

import {
  addDays,
  addMonths,
} from "./dateUtils";

import {
  type CalendarView,
} from "./types";


export default function CalendarToolbar({
  anchorDate,
  view,
  onAnchorDateChange,
  onViewChange,
}: {
  anchorDate:
    Date;

  view:
    CalendarView;

  onAnchorDateChange:
    (
      date:
        Date
    ) => void;

  onViewChange:
    (
      view:
        CalendarView
    ) => void;
}) {
  function move(
    direction:
      -1 | 1
  ) {
    if (
      view ===
      "month"
    ) {
      onAnchorDateChange(
        addMonths(
          anchorDate,
          direction
        )
      );

      return;
    }

    if (
      view ===
      "week"
    ) {
      onAnchorDateChange(
        addDays(
          anchorDate,
          direction *
            7
        )
      );

      return;
    }

    onAnchorDateChange(
      addDays(
        anchorDate,
        direction
      )
    );
  }


  const heading =
    view ===
    "month"
      ? anchorDate.toLocaleDateString(
          undefined,
          {
            month:
              "long",

            year:
              "numeric",
          }
        )
      : view ===
        "week"
      ? `Week of ${anchorDate.toLocaleDateString(
          undefined,
          {
            month:
              "short",

            day:
              "numeric",
          }
        )}`
      : anchorDate.toLocaleDateString(
          undefined,
          {
            weekday:
              "long",

            month:
              "long",

            day:
              "numeric",
          }
        );


  return (
    <div
      className="
        grid
        grid-cols-[auto_1fr]
        items-center
        gap-3
        border-b
        border-white/10
        p-3

        sm:flex
        sm:flex-wrap
        sm:justify-between
        sm:gap-4
        sm:p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          self-start
        "
      >
        <button
          type="button"
          onClick={() =>
            move(
              -1
            )
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-black
            text-xl
            font-black
          "
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() =>
            move(
              1
            )
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-black
            text-xl
            font-black
          "
        >
          ›
        </button>

        <button
          type="button"
          onClick={() =>
            onAnchorDateChange(
              new Date()
            )
          }
          className="
            rounded-xl
            border
            border-white/10
            bg-black
            px-4
            py-2
            text-sm
            font-bold
          "
        >
          Today
        </button>
      </div>


      <h2
        className="
          min-w-0
          truncate
          text-right
          text-lg
          font-black

          sm:text-left
          md:text-2xl
        "
      >
        {heading}
      </h2>


      <div
        className="
          col-span-2
          grid
          grid-cols-3
          rounded-xl
          border

          sm:flex
          border-white/10
          bg-black
          p-1
        "
      >
        {(
          [
            "month",
            "week",
            "day",
          ] as
            CalendarView[]
        ).map(
          (
            option
          ) => (
            <button
              key={
                option
              }
              type="button"
              onClick={() =>
                onViewChange(
                  option
                )
              }
              className={`
                rounded-lg
                px-3
                py-2
                text-sm
                font-bold
                capitalize
                transition

                ${
                  view ===
                  option
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:text-white"
                }
              `}
            >
              {option}
            </button>
          )
        )}
      </div>
    </div>
  );
}
