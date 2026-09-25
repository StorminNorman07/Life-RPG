"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  ModalShell,
} from "./EventModal";

import {
  calendarColors,
  type CalendarItem,
  type FriendSummary,
} from "./types";


export function NewCalendarModal({
  open,
  saving,
  onClose,
  onCreate,
}: {
  open:
    boolean;

  saving:
    boolean;

  onClose:
    () => void;

  onCreate:
    (
      values: {
        name:
          string;

        description:
          string;

        color:
          string;
      }
    ) => Promise<void>;
}) {
  const [
    name,
    setName
  ] =
    useState("");

  const [
    description,
    setDescription
  ] =
    useState("");

  const [
    color,
    setColor
  ] =
    useState(
      "purple"
    );

  if (
    !open
  ) {
    return null;
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await onCreate({
      name:
        name.trim(),

      description:
        description.trim(),

      color,
    });
  }

  return (
    <ModalShell
      title="Create Shared Calendar"
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
            Calendar name
          </span>

          <input
            value={
              name
            }
            onChange={(
              event
            ) =>
              setName(
                event.target.value
              )
            }
            required
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
            Description
          </span>

          <textarea
            value={
              description
            }
            onChange={(
              event
            ) =>
              setDescription(
                event.target.value
              )
            }
            rows={
              3
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

        <div>
          <p
            className="
              text-sm
              font-black
            "
          >
            Color
          </p>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-3
            "
          >
            {Object.entries(
              calendarColors
            ).map(
              (
                [
                  key,
                  style,
                ]
              ) => (
                <button
                  key={
                    key
                  }
                  type="button"
                  onClick={() =>
                    setColor(
                      key
                    )
                  }
                  className={`
                    h-9
                    w-9
                    rounded-full

                    ${
                      style.solid
                    }

                    ${
                      color ===
                      key
                        ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950"
                        : ""
                    }
                  `}
                />
              )
            )}
          </div>
        </div>

        <Actions
          saving={
            saving
          }
          onClose={
            onClose
          }
          label="Create Calendar"
          disabled={
            !name.trim()
          }
        />
      </form>
    </ModalShell>
  );
}


export function InviteFriendModal({
  open,
  saving,
  calendars,
  friends,
  onClose,
  onInvite,
}: {
  open:
    boolean;

  saving:
    boolean;

  calendars:
    CalendarItem[];

  friends:
    FriendSummary[];

  onClose:
    () => void;

  onInvite:
    (
      values: {
        calendarId:
          string;

        friendId:
          string;

        role:
          "editor" | "viewer";
      }
    ) => Promise<void>;
}) {
  const [
    calendarId,
    setCalendarId
  ] =
    useState("");

  const [
    friendId,
    setFriendId
  ] =
    useState("");

  const [
    role,
    setRole
  ] =
    useState<
      "editor" | "viewer"
    >(
      "editor"
    );


  useEffect(() => {
    if (
      open
    ) {
      setCalendarId(
        calendars[0]?.id ??
        ""
      );

      setFriendId(
        ""
      );
    }
  }, [
    open,
    calendars,
  ]);


  if (
    !open
  ) {
    return null;
  }


  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !calendarId ||
      !friendId
    ) {
      return;
    }

    await onInvite({
      calendarId,

      friendId,

      role,
    });
  }


  const canSubmit =
    Boolean(
      calendarId &&
      friendId
    );


  return (
    <ModalShell
      title="Invite a Friend"
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
        <SelectField
          label="Calendar"
          value={
            calendarId
          }
          onChange={
            setCalendarId
          }
          options={
            calendars.map(
              (
                calendar
              ) => ({
                value:
                  calendar.id,

                label:
                  calendar.name,
              })
            )
          }
        />

        <SelectField
          label="Friend"
          value={
            friendId
          }
          onChange={
            setFriendId
          }
          options={[
            {
              value:
                "",

              label:
                "Select a friend",
            },

            ...friends.map(
              (
                friend
              ) => ({
                value:
                  friend.id,

                label:
                  `${friend.display_name} (@${friend.username})`,
              })
            ),
          ]}
        />

        <SelectField
          label="Permission"
          value={
            role
          }
          onChange={(
            value
          ) =>
            setRole(
              value as
                "editor" | "viewer"
            )
          }
          options={[
            {
              value:
                "editor",

              label:
                "Editor — can manage events",
            },

            {
              value:
                "viewer",

              label:
                "Viewer — read only",
            },
          ]}
        />

        <Actions
          saving={
            saving
          }
          onClose={
            onClose
          }
          label="Send Invitation"
          disabled={
            !canSubmit
          }
        />
      </form>
    </ModalShell>
  );
}


function SelectField({
  label,
  value,
  onChange,
  options,
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

  options:
    {
      value:
        string;

      label:
        string;
    }[];
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

      <select
        value={
          value
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
          px-4
          py-3
        "
      >
        {options.map(
          (
            option
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          )
        )}
      </select>
    </label>
  );
}


function Actions({
  saving,
  onClose,
  label,
  disabled,
}: {
  saving:
    boolean;

  onClose:
    () => void;

  label:
    string;

  disabled:
    boolean;
}) {
  return (
    <div
      className="
        flex
        justify-end
        gap-3
        pt-2
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
          disabled
        }
        className="
          rounded-xl
          bg-white
          px-4
          py-2
          font-black
          text-black

          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        {saving
          ? "Saving…"
          : label}
      </button>
    </div>
  );
}
