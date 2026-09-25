"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useGame,
} from "@/context/GameContext";

import {
  ATTRIBUTE_XP_PER_LEVEL,
  DAILY_ATTRIBUTE_XP,
  getAttributeLevel,
  getAttributeProgress,
  MAX_ATTRIBUTES,
  SKILL_ATTRIBUTE_XP,
} from "@/data/categories";


import { useAppDialog } from "@/components/ui/AppDialogProvider";

export default function AttributesPage() {
  const { confirm } = useAppDialog();
  const {
    player,

    attributes,

    tasks,

    skillPathConfigs,

    addAttribute,

    renameAttribute,

    deleteAttribute,
  } =
    useGame();


  const [
    newAttributeName,
    setNewAttributeName
  ] =
    useState("");


  const sortedAttributes =
    useMemo(
      () =>
        [...attributes].sort(
          (
            first,
            second
          ) => {
            const firstXP =
              player.attributes[
                first.id
              ] ??
              0;

            const secondXP =
              player.attributes[
                second.id
              ] ??
              0;

            return (
              secondXP -
                firstXP ||
              first.name.localeCompare(
                second.name
              )
            );
          }
        ),
      [
        attributes,
        player.attributes,
      ]
    );


  function createAttribute() {
    addAttribute(
      newAttributeName
    );

    setNewAttributeName("");
  }


  return (
    <main
      className="
        min-h-screen
        bg-black
        p-4
        text-white

        sm:p-5
        md:p-8
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-start
            justify-between
            gap-5
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
              Character Development
            </p>

            <h1
              className="
                mt-2
                text-4xl
                font-black
              "
            >
              Attributes
            </h1>

            <p
              className="
                mt-3
                max-w-3xl
                text-zinc-400
              "
            >
              Create the skills and qualities you actually want to develop. Daily tasks and skill-tree paths both pull from this same list.
            </p>
          </div>

          <div
            className="
              rounded-full
              border
              border-zinc-700
              bg-zinc-950
              px-4
              py-2
              text-sm
              font-black
            "
          >
            {attributes.length}/{MAX_ATTRIBUTES}
          </div>
        </div>


        <section
          className="
            mt-7
            grid
            gap-4

            md:grid-cols-3
          "
        >
          <InfoCard
            label="Attribute Level"
            value={`${ATTRIBUTE_XP_PER_LEVEL.toLocaleString()} XP`}
            description="Every attribute level uses the same requirement with no level cap."
          />

          <InfoCard
            label="Daily Task Reward"
            value={`+${DAILY_ATTRIBUTE_XP} XP`}
            description="Awarded to every attribute selected on a completed task."
          />

          <InfoCard
            label="Skill Tree Rewards"
            value="1K–10K XP"
            description="One-time rewards increase sharply from Bronze through Master."
          />
        </section>


        <section
          className="
            mt-7
            rounded-2xl
            border
            border-zinc-700
            bg-zinc-950
            p-5
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-2xl
                  font-black
                "
              >
                Attribute Settings
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-zinc-400
                "
              >
                Add, rename, or delete attributes here. Deleting one also removes it from every task and skill path.
              </p>
            </div>

            <div
              className="
                flex
                min-w-0
                flex-1
                gap-3

                sm:max-w-xl
              "
            >
              <input
                value={
                  newAttributeName
                }
                onChange={(
                  event
                ) =>
                  setNewAttributeName(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    createAttribute();
                  }
                }}
                placeholder="New attribute name"
                className="
                  min-w-0
                  flex-1
                  rounded-xl
                  border
                  border-zinc-700
                  bg-black
                  p-3
                "
              />

              <button
                type="button"
                onClick={
                  createAttribute
                }
                disabled={
                  !newAttributeName.trim() ||
                  attributes.length >=
                    MAX_ATTRIBUTES
                }
                className="
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  font-black
                  text-black

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Add
              </button>
            </div>
          </div>
        </section>


        <section
          className="
            mt-7
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-2xl
                  font-black
                "
              >
                Your Attributes
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-zinc-500
                "
              >
                Sorted by total XP.
              </p>
            </div>
          </div>

          {sortedAttributes.length ===
          0 ? (
            <div
              className="
                mt-4
                rounded-2xl
                border
                border-dashed
                border-zinc-700
                p-10
                text-center
                text-zinc-500
              "
            >
              Create your first attribute above.
            </div>
          ) : (
            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-2.5

                sm:gap-3
                md:gap-4
              "
            >
              {sortedAttributes.map(
                (
                  attribute
                ) => {
                  const xp =
                    player.attributes[
                      attribute.id
                    ] ??
                    0;

                  const taskCount =
                    tasks.filter(
                      (
                        task
                      ) =>
                        task.categories.includes(
                          attribute.id
                        )
                    ).length;

                  const pathCount =
                    Object.values(
                      skillPathConfigs
                    ).filter(
                      (
                        path
                      ) =>
                        path.attributeIds.includes(
                          attribute.id
                        )
                    ).length;

                  return (
                    <AttributeCard
                      key={
                        attribute.id
                      }
                      id={
                        attribute.id
                      }
                      name={
                        attribute.name
                      }
                      xp={
                        xp
                      }
                      taskCount={
                        taskCount
                      }
                      pathCount={
                        pathCount
                      }
                      onRename={
                        renameAttribute
                      }
                      onDelete={async (
                        id
                      ) => {
                        const confirmed =
                          await confirm({
                            title: "Delete attribute?",
                            description:
                              "Its XP history and all task and path assignments will be permanently removed.",
                            confirmLabel: "Delete attribute",
                            tone: "danger",
                          });

                        if (confirmed) {
                          deleteAttribute(
                            id
                          );
                        }
                      }}
                    />
                  );
                }
              )}
            </div>
          )}
        </section>


        <section
          className="
            mt-8
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-5
          "
        >
          <h2
            className="
              text-xl
              font-black
            "
          >
            Skill-tree attribute rewards
          </h2>

          <div
            className="
              mt-4
              grid
              grid-cols-2
              gap-3

              lg:grid-cols-4
            "
          >
            {Object.entries(
              SKILL_ATTRIBUTE_XP
            ).map(
              (
                [
                  tier,
                  xp,
                ]
              ) => (
                <div
                  key={
                    tier
                  }
                  className="
                    rounded-xl
                    border
                    border-zinc-800
                    bg-black
                    p-4
                  "
                >
                  <p
                    className="
                      text-sm
                      font-black
                      text-zinc-400
                    "
                  >
                    {tier}
                  </p>

                  <p
                    className="
                      mt-2
                      text-2xl
                      font-black
                    "
                  >
                    +{xp.toLocaleString()}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-zinc-500
                    "
                  >
                    per selected path attribute
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}


function AttributeCard({
  id,
  name,
  xp,
  taskCount,
  pathCount,
  onRename,
  onDelete,
}: {
  id:
    string;

  name:
    string;

  xp:
    number;

  taskCount:
    number;

  pathCount:
    number;

  onRename:
    (
      id: string,
      name: string
    ) => void;

  onDelete:
    (
      id: string
    ) => void;
}) {
  const [
    draft,
    setDraft
  ] =
    useState(
      name
    );

  const level =
    getAttributeLevel(
      xp
    );

  const progress =
    getAttributeProgress(
      xp
    );

  const percent =
    (
      progress /
      ATTRIBUTE_XP_PER_LEVEL
    ) *
    100;


  return (
    <article
      className="
        min-w-0
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        p-2.5

        sm:p-3
        md:rounded-2xl
        md:p-5
      "
    >
      <input
        value={
          draft
        }
        onChange={(
          event
        ) =>
          setDraft(
            event.target.value
          )
        }
        onBlur={() =>
          onRename(
            id,
            draft
          )
        }
        onKeyDown={(
          event
        ) => {
          if (
            event.key ===
            "Enter"
          ) {
            onRename(
              id,
              draft
            );

            event.currentTarget.blur();
          }
        }}
        className="
          w-full
          min-w-0
          rounded-lg
          border
          border-zinc-700
          bg-black
          px-2
          py-1.5
          text-[10px]
          font-black
          leading-none

          min-[390px]:text-[11px]

          sm:px-2.5
          sm:py-2
          sm:text-xs

          md:rounded-xl
          md:px-3
          md:text-lg
        "
      />

      <button
        type="button"
        onClick={() =>
          onDelete(
            id
          )
        }
        className="
          mt-1.5
          w-full
          rounded-lg
          border
          border-red-900
          px-2
          py-1.5
          text-[8px]
          font-bold
          leading-none
          text-red-400

          min-[390px]:text-[9px]

          sm:mt-2
          sm:px-2.5
          sm:py-2
          sm:text-[10px]

          md:rounded-xl
          md:px-3
          md:text-sm
        "
      >
        Delete
      </button>


      <div
        className="
          mt-3
          flex
          min-w-0
          items-end
          justify-between
          gap-1.5

          sm:mt-4
          sm:gap-2

          md:mt-5
          md:gap-4
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-[7px]
              font-black
              uppercase
              leading-tight
              tracking-wide
              text-zinc-500

              min-[390px]:text-[8px]

              sm:text-[9px]

              md:text-xs
              md:tracking-wider
            "
          >
            Attribute Level
          </p>

          <p
            className="
              mt-0.5
              text-xl
              font-black
              leading-none

              min-[390px]:text-2xl

              md:mt-1
              md:text-3xl
            "
          >
            {level}
          </p>
        </div>

        <div
          className="
            min-w-0
            text-right
          "
        >
          <p
            className="
              whitespace-nowrap
              text-[9px]
              font-black
              leading-none

              min-[390px]:text-[10px]

              sm:text-xs
              md:text-base
            "
          >
            {progress.toLocaleString()} / {ATTRIBUTE_XP_PER_LEVEL.toLocaleString()}
          </p>

          <p
            className="
              mt-1
              whitespace-nowrap
              text-[7px]
              leading-none
              text-zinc-500

              min-[390px]:text-[8px]

              sm:text-[9px]
              md:text-xs
            "
          >
            {xp.toLocaleString()} lifetime XP
          </p>
        </div>
      </div>


      <div
        className="
          mt-3
          h-1.5
          overflow-hidden
          rounded-full
          bg-zinc-800

          sm:h-2
          md:mt-4
          md:h-3
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-cyan-500
            to-white
            transition-all
          "
          style={{
            width:
              `${percent}%`,
          }}
        />
      </div>


      <div
        className="
          mt-3
          grid
          grid-cols-2
          gap-1.5

          sm:gap-2
          md:mt-4
        "
      >
        <span
          className="
            min-w-0
            truncate
            whitespace-nowrap
            rounded-full
            border
            border-zinc-700
            px-1.5
            py-1
            text-center
            text-[8px]
            font-bold
            leading-none
            text-zinc-400

            min-[390px]:text-[9px]

            sm:px-2
            sm:text-[10px]

            md:px-3
            md:text-xs
          "
        >
          {taskCount} task
          {taskCount ===
          1
            ? ""
            : "s"}
        </span>

        <span
          className="
            min-w-0
            truncate
            whitespace-nowrap
            rounded-full
            border
            border-zinc-700
            px-1.5
            py-1
            text-center
            text-[8px]
            font-bold
            leading-none
            text-zinc-400

            min-[390px]:text-[9px]

            sm:px-2
            sm:text-[10px]

            md:px-3
            md:text-xs
          "
        >
          {pathCount} skill path
          {pathCount ===
          1
            ? ""
            : "s"}
        </span>
      </div>
    </article>
  );
}

function InfoCard({
  label,
  value,
  description,
}: {
  label:
    string;

  value:
    string;

  description:
    string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        p-5
      "
    >
      <p
        className="
          text-xs
          font-black
          uppercase
          tracking-wider
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-2xl
          font-black
        "
      >
        {value}
      </p>

      <p
        className="
          mt-2
          text-sm
          text-zinc-500
        "
      >
        {description}
      </p>
    </div>
  );
}
