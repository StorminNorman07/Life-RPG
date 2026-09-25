"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  useGame,
} from "@/context/GameContext";

import {
  DailyTask,
  Weekday,
  weekdayKeys,
  weekdayLabels,
} from "@/data/dailyTasks";


import { useAppDialog } from "@/components/ui/AppDialogProvider";

function getCountdownToMidnight():
  string {
  const now =
    new Date();

  const midnight =
    new Date(now);

  midnight.setHours(
    24,
    0,
    0,
    0
  );

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        (
          midnight.getTime() -
          now.getTime()
        ) /
          1000
      )
    );

  const hours =
    Math.floor(
      totalSeconds /
        3600
    );

  const minutes =
    Math.floor(
      (
        totalSeconds %
        3600
      ) /
        60
    );

  const seconds =
    totalSeconds %
    60;

  return [
    hours,
    minutes,
    seconds,
  ]
    .map(
      (
        value
      ) =>
        String(value).padStart(
          2,
          "0"
        )
    )
    .join(":");
}


function formatDate(
  dateKey:
    string
): string {
  return new Date(
    `${dateKey}T12:00:00`
  ).toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}


export default function DailyTasks() {
  const {
    player,
    attributes,
    tasks,
    todayTasks,
    completedTasks,
    graceTasks,
    journeyPlan,
    currentDailyTaskXP,
    remainingTaskOpportunities,
    expectedRemainingCompletions,
    journeyDaysRemaining,
    startJourney,
    resetJourney,
    addReward,
    removeReward,
    addTask,
    deleteTask,
    updateTaskDetails,
    updateTaskSchedule,
    updateTaskAttributes,
    completeGraceTask,
    missGraceTask,
  } =
    useGame();


  const {
    confirm,
  } =
    useAppDialog();


  const [
    countdown,
    setCountdown
  ] =
    useState("--:--:--");

  const [
    showCreate,
    setShowCreate
  ] =
    useState(false);

  const [
    taskName,
    setTaskName
  ] =
    useState("");

  const [
    description,
    setDescription
  ] =
    useState("");

  const [
    selectedCategories,
    setSelectedCategories
  ] =
    useState<string[]>([]);

  const [
    selectedDays,
    setSelectedDays
  ] =
    useState<Weekday[]>([
      ...weekdayKeys,
    ]);

  const [
    journeyMonths,
    setJourneyMonths
  ] =
    useState(12);

  const [
    consistency,
    setConsistency
  ] =
    useState(90);

  const [
    resetText,
    setResetText
  ] =
    useState("");

  const [
    showReset,
    setShowReset
  ] =
    useState(false);


  const [
    editingTask,
    setEditingTask
  ] =
    useState<DailyTask | null>(
      null
    );

  const [
    editName,
    setEditName
  ] =
    useState("");

  const [
    editDescription,
    setEditDescription
  ] =
    useState("");

  const [
    editCategories,
    setEditCategories
  ] =
    useState<string[]>([]);

  const [
    editDays,
    setEditDays
  ] =
    useState<Weekday[]>([]);


  useEffect(() => {
    function updateCountdown() {
      setCountdown(
        getCountdownToMidnight()
      );
    }

    updateCountdown();

    const interval =
      window.setInterval(
        updateCountdown,
        1000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);


  const journeyOptions =
    useMemo(
      () => [
        ...Array.from(
          {
            length: 11,
          },
          (
            _,
            index
          ) => ({
            months:
              index + 1,

            label:
              `${index + 1} ${
                index === 0
                  ? "month"
                  : "months"
              }`,
          })
        ),

        ...Array.from(
          {
            length: 10,
          },
          (
            _,
            index
          ) => ({
            months:
              (
                index + 1
              ) *
              12,

            label:
              `${index + 1} ${
                index === 0
                  ? "year"
                  : "years"
              }`,
          })
        ),
      ],
      []
    );


  function toggleCategory(
    category:
      string
  ) {
    setSelectedCategories(
      (
        old
      ) =>
        old.includes(
          category
        )
          ? old.filter(
              (
                item
              ) =>
                item !==
                category
            )
          : [
              ...old,
              category,
            ]
    );
  }


  function toggleDay(
    day:
      Weekday
  ) {
    setSelectedDays(
      (
        old
      ) => {
        if (
          old.includes(
            day
          )
        ) {
          if (
            old.length ===
            1
          ) {
            return old;
          }

          return old.filter(
            (
              current
            ) =>
              current !==
              day
          );
        }

        return [
          ...old,
          day,
        ];
      }
    );
  }


  function createTask() {
    if (
      !taskName.trim() ||
      selectedDays.length ===
        0
    ) {
      return;
    }

    const task:
      DailyTask = {
      id:
        Date.now(),

      name:
        taskName.trim(),

      description:
        description.trim(),

      categories: [
        ...selectedCategories,
      ],

      rewards:
        selectedCategories.map(
          (
            category
          ) => ({
            category,
            xp: 0,
          })
        ),

      scheduledDays: [
        ...selectedDays,
      ],
    };

    addTask(
      task
    );

    setTaskName("");

    setDescription("");

    setSelectedCategories([]);

    setSelectedDays([
      ...weekdayKeys,
    ]);

    setShowCreate(false);
  }


  function openTaskEditor(
    task:
      DailyTask
  ) {
    setShowCreate(
      false
    );

    setEditingTask(
      task
    );

    setEditName(
      task.name
    );

    setEditDescription(
      task.description ?? ""
    );

    setEditCategories([
      ...(task.categories ?? []),
    ]);

    setEditDays([
      ...(task.scheduledDays?.length
        ? task.scheduledDays
        : weekdayKeys),
    ]);
  }


  function toggleEditCategory(
    attributeId:
      string
  ) {
    setEditCategories(
      (
        old
      ) => {
        if (
          old.includes(
            attributeId
          )
        ) {
          return old.filter(
            (
              id
            ) =>
              id !==
              attributeId
          );
        }

        return [
          ...old,
          attributeId,
        ];
      }
    );
  }


  function toggleEditDay(
    day:
      Weekday
  ) {
    setEditDays(
      (
        old
      ) => {
        if (
          old.includes(
            day
          )
        ) {
          if (
            old.length ===
            1
          ) {
            return old;
          }

          return old.filter(
            (
              current
            ) =>
              current !==
              day
          );
        }

        return [
          ...old,
          day,
        ];
      }
    );
  }


  function saveTaskEdits() {
    if (
      !editingTask ||
      !editName.trim() ||
      editDays.length ===
        0
    ) {
      return;
    }

    updateTaskDetails(
      editingTask.id,
      editName,
      editDescription
    );

    updateTaskAttributes(
      editingTask.id,
      editCategories
    );

    updateTaskSchedule(
      editingTask.id,
      editDays
    );

    setEditingTask(
      null
    );
  }


  function toggleTask(
    task:
      DailyTask
  ) {
    const completed =
      completedTasks.includes(
        task.name
      );

    if (completed) {
      removeReward(
        task.rewards,
        task.name
      );
    } else {
      addReward(
        task.rewards,
        task.name
      );
    }
  }


  return (
    <main
      className="
        min-h-screen
        bg-black
        p-6
        text-white

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
            <h1
              className="
                text-4xl
                font-black
              "
            >
              Daily Tasks
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-relaxed
                text-zinc-400

                sm:text-base
              "
            >
              Only tasks scheduled for today count toward today’s completion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTask(
                null
              );

              setShowCreate(
                true
              );
            }}
            className="
              rounded-xl
              border
              border-zinc-600
              px-5
              py-3
              font-bold

              hover:bg-zinc-900
            "
          >
            + New Task
          </button>
        </div>


        <section
          className="
            mt-6
            grid
            grid-cols-2
            gap-3

            md:gap-4
          "
        >
          <CountdownCard
            icon="⏳"
            title="Daily Reset"
            value={
              countdown
            }
            description="Tasks reset at local midnight."
            mono
          />

          <CountdownCard
            icon="🗓️"
            title="Journey Remaining"
            value={
              journeyPlan
                ? journeyDaysRemaining ===
                  0
                  ? "Final day"
                  : `${journeyDaysRemaining.toLocaleString()} days`
                : "No journey set"
            }
            description={
              journeyPlan
                ? `Ends ${formatDate(
                    journeyPlan.targetDate
                  )}`
                : "Choose your journey below."
            }
          />
        </section>


        {!journeyPlan ? (
          <JourneySetup
            journeyOptions={
              journeyOptions
            }
            journeyMonths={
              journeyMonths
            }
            setJourneyMonths={
              setJourneyMonths
            }
            consistency={
              consistency
            }
            setConsistency={
              setConsistency
            }
            onStart={async () => {
              const confirmed =
                await confirm({
                  title: "Start this journey?",
                  description:
                    "Journey length and consistency cannot be changed later without resetting all XP, task history, skill-tree progress, streaks, achievements, and progression unlocks.",
                  confirmLabel: "Start journey",
                  tone: "warning",
                });

              if (confirmed) {
                startJourney(
                  journeyMonths,
                  consistency
                );
              }
            }}
          />
        ) : (
          <JourneySummary
            durationMonths={
              journeyPlan.durationMonths
            }
            consistency={
              journeyPlan.consistencyPercent
            }
            startDate={
              journeyPlan.startDate
            }
            targetDate={
              journeyPlan.targetDate
            }
            currentXP={
              currentDailyTaskXP
            }
            remainingOpportunities={
              remainingTaskOpportunities
            }
            expectedCompletions={
              expectedRemainingCompletions
            }
            showReset={
              showReset
            }
            setShowReset={
              setShowReset
            }
            resetText={
              resetText
            }
            setResetText={
              setResetText
            }
            onReset={() => {
              if (
                resetText !==
                "RESET"
              ) {
                return;
              }

              resetJourney();

              setResetText("");

              setShowReset(false);
            }}
          />
        )}


        {showCreate && (
          <CreateTaskModal
            taskName={
              taskName
            }
            description={
              description
            }
            selectedDays={
              selectedDays
            }
            selectedCategories={
              selectedCategories
            }
            attributes={
              attributes
            }
            onNameChange={
              setTaskName
            }
            onDescriptionChange={
              setDescription
            }
            onToggleDay={
              toggleDay
            }
            onToggleCategory={
              toggleCategory
            }
            onClose={() =>
              setShowCreate(
                false
              )
            }
            onCreate={
              createTask
            }
          />
        )}


        {editingTask && (
          <EditTaskModal
            editingTask={
              editingTask
            }
            journeyPlanActive={
              Boolean(
                journeyPlan
              )
            }
            currentDailyTaskXP={
              currentDailyTaskXP
            }
            editName={
              editName
            }
            editDescription={
              editDescription
            }
            editDays={
              editDays
            }
            editCategories={
              editCategories
            }
            attributes={
              attributes
            }
            onNameChange={
              setEditName
            }
            onDescriptionChange={
              setEditDescription
            }
            onToggleDay={
              toggleEditDay
            }
            onToggleCategory={
              toggleEditCategory
            }
            onClose={() =>
              setEditingTask(
                null
              )
            }
            onDelete={async () => {
              await deleteTask(
                editingTask.id
              );

              setEditingTask(
                null
              );
            }}
            onSave={
              saveTaskEdits
            }
          />
        )}


        <section
          className="
            mt-8
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
                Due Today
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-zinc-500
                "
              >
                {todayTasks.length} scheduled task
                {todayTasks.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <p
              className="
                max-w-[46%]
                shrink-0
                break-words
                text-right
                text-[11px]
                font-bold
                leading-tight
                text-yellow-300

                sm:max-w-none
                sm:text-sm
              "
            >
              {journeyPlan
                ? `${currentDailyTaskXP.toLocaleString()} XP each`
                : "Start a journey to earn XP"}
            </p>
          </div>

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
            {todayTasks.length ===
            0 ? (
              <EmptyState
                text="Nothing is scheduled today."
              />
            ) : (
              todayTasks.map(
                (
                  task
                ) => (
                  <TaskCard
                    key={
                      task.id
                    }
                    task={
                      task
                    }
                    attributes={
                      attributes
                    }
                    completed={
                      completedTasks.includes(
                        task.name
                      )
                    }
                    xp={
                      currentDailyTaskXP
                    }
                    journeyActive={
                      Boolean(
                        journeyPlan
                      )
                    }
                    onToggle={() =>
                      toggleTask(
                        task
                      )
                    }
                    onEdit={() =>
                      openTaskEditor(
                        task
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </section>


        <section
          className="
            mt-10
          "
        >
          <h2
            className="
              text-2xl
              font-black
            "
          >
            Full Weekly Schedule
          </h2>

          <div
            className="
              mt-4
              space-y-4
            "
          >
            {tasks.map(
              (
                task
              ) => (
                <TaskScheduleRow
                  key={
                    task.id
                  }
                  task={
                    task
                  }
                  onChange={(
                    days
                  ) =>
                    updateTaskSchedule(
                      task.id,
                      days
                    )
                  }
                  onEdit={() =>
                    openTaskEditor(
                      task
                    )
                  }
                />
              )
            )}
          </div>
        </section>


        {graceTasks.length >
          0 && (
          <section
            className="
              mt-12
              rounded-2xl
              border
              border-red-800
              bg-red-950/30
              p-6
            "
          >
            <h2
              className="
                text-2xl

          md:text-3xl
                font-black
                text-red-300
              "
            >
              Yesterday’s Tasks
            </h2>

            <p
              className="
                mt-2
                text-red-200/70
              "
            >
              Complete these late today or mark them missed.
            </p>

            <div
              className="
                mt-6
                space-y-4
              "
            >
              {graceTasks.map(
                (
                  task
                ) => (
                  <div
                    key={
                      task.id
                    }
                    className="
                      rounded-xl
                      border
                      border-red-800
                      bg-black/50
                      p-5
                    "
                  >
                    <h3
                      className="
                        text-xl
                        font-black
                      "
                    >
                      {task.name}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-zinc-400
                      "
                    >
                      {task.description}
                    </p>

                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        gap-3
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          completeGraceTask(
                            task.id
                          )
                        }
                        className="
                          rounded-lg
                          bg-white
                          px-4
                          py-3
                          font-black
                          text-black
                        "
                      >
                        Completed Late
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          missGraceTask(
                            task.id
                          )
                        }
                        className="
                          rounded-lg
                          border
                          border-red-700
                          px-4
                          py-3
                          font-black
                          text-red-300
                        "
                      >
                        Missed
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}


function ModalFrame({
  title,
  eyebrow,
  children,
  footer,
  onClose,
  onSubmit,
}: {
  title:
    string;

  eyebrow:
    string;

  children:
    ReactNode;

  footer:
    ReactNode;

  onClose:
    () => void;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>
    ) => void;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/80
        p-4
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={
          onSubmit
        }
        className="
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/15
          bg-zinc-950
          shadow-2xl
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-white/10
            p-5
          "
        >
          <div>
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.18em]
                text-zinc-500
              "
            >
              {eyebrow}
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-black
              "
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              text-xl
              font-black
              text-zinc-300
            "
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <div
          className="
            flex-1
            space-y-5
            overflow-y-auto
            p-5
          "
        >
          {children}
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
            border-t
            border-white/10
            p-5
          "
        >
          {footer}
        </div>
      </form>
    </div>
  );
}


function CreateTaskModal({
  taskName,
  description,
  selectedDays,
  selectedCategories,
  attributes,
  onNameChange,
  onDescriptionChange,
  onToggleDay,
  onToggleCategory,
  onClose,
  onCreate,
}: {
  taskName:
    string;

  description:
    string;

  selectedDays:
    Weekday[];

  selectedCategories:
    string[];

  attributes:
    {
      id: string;
      name: string;
    }[];

  onNameChange:
    (
      value: string
    ) => void;

  onDescriptionChange:
    (
      value: string
    ) => void;

  onToggleDay:
    (
      day: Weekday
    ) => void;

  onToggleCategory:
    (
      attributeId: string
    ) => void;

  onClose:
    () => void;

  onCreate:
    () => void;
}) {
  const canCreate =
    taskName.trim().length >
      0 &&
    selectedDays.length >
      0;

  return (
    <ModalFrame
      eyebrow="Daily Task"
      title="Create Task"
      onClose={
        onClose
      }
      onSubmit={(event) => {
        event.preventDefault();

        onCreate();
      }}
      footer={
        <>
          <button
            type="button"
            onClick={
              onClose
            }
            className="
              rounded-xl
              border
              border-white/10
              px-5
              py-3
              font-bold
              text-zinc-300
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              !canCreate
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
            Create Task
          </button>
        </>
      }
    >
      <input
        value={
          taskName
        }
        onChange={(
          event
        ) =>
          onNameChange(
            event.target.value
          )
        }
        placeholder="Task name"
        className="
          w-full
          rounded-xl
          border
          border-zinc-700
          bg-black
          p-3
        "
      />

      <input
        value={
          description
        }
        onChange={(
          event
        ) =>
          onDescriptionChange(
            event.target.value
          )
        }
        placeholder="Description"
        className="
          w-full
          rounded-xl
          border
          border-zinc-700
          bg-black
          p-3
        "
      />

      <div>
        <h3
          className="
            font-black
          "
        >
          Scheduled Days
        </h3>

        <WeekdayButtons
          selectedDays={
            selectedDays
          }
          onToggle={
            onToggleDay
          }
        />
      </div>

      <div>
        <h3
          className="
            font-black
          "
        >
          Attributes optional
        </h3>

        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-3

            md:grid-cols-4
          "
        >
          {attributes.map(
            (
              attribute
            ) => (
              <button
                type="button"
                key={
                  attribute.id
                }
                onClick={() =>
                  onToggleCategory(
                    attribute.id
                  )
                }
                className={`
                  rounded-xl
                  border
                  p-3
                  font-bold

                  ${
                    selectedCategories.includes(
                      attribute.id
                    )
                      ? "border-green-500 bg-green-950"
                      : "border-zinc-700 bg-black"
                  }
                `}
              >
                {attribute.name}
              </button>
            )
          )}
        </div>
      </div>
    </ModalFrame>
  );
}


function EditTaskModal({
  editingTask,
  journeyPlanActive,
  currentDailyTaskXP,
  editName,
  editDescription,
  editDays,
  editCategories,
  attributes,
  onNameChange,
  onDescriptionChange,
  onToggleDay,
  onToggleCategory,
  onClose,
  onDelete,
  onSave,
}: {
  editingTask:
    DailyTask;

  journeyPlanActive:
    boolean;

  currentDailyTaskXP:
    number;

  editName:
    string;

  editDescription:
    string;

  editDays:
    Weekday[];

  editCategories:
    string[];

  attributes:
    {
      id: string;
      name: string;
    }[];

  onNameChange:
    (
      value: string
    ) => void;

  onDescriptionChange:
    (
      value: string
    ) => void;

  onToggleDay:
    (
      day: Weekday
    ) => void;

  onToggleCategory:
    (
      attributeId: string
    ) => void;

  onClose:
    () => void;

  onDelete:
    () => Promise<void>;

  onSave:
    () => void;
}) {
  const canSave =
    editName.trim().length >
      0 &&
    editDays.length >
      0;

  return (
    <ModalFrame
      eyebrow="Task Editor"
      title="Edit Task"
      onClose={
        onClose
      }
      onSubmit={(event) => {
        event.preventDefault();

        onSave();
      }}
      footer={
        <>
          <button
            type="button"
            onClick={() =>
              void onDelete()
            }
            className="
              rounded-xl
              border
              border-red-500/25
              bg-red-950/25
              px-4
              py-3
              text-sm
              font-black
              text-red-300
            "
          >
            Delete Task
          </button>

          <button
            type="submit"
            disabled={
              !canSave
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
            Save Changes
          </button>
        </>
      }
    >
      <input
        value={
          editName
        }
        onChange={(
          event
        ) =>
          onNameChange(
            event.target.value
          )
        }
        aria-label="Task name"
        className="
          w-full
          rounded-xl
          border
          border-zinc-700
          bg-black
          p-3
        "
      />

      <input
        value={
          editDescription
        }
        onChange={(
          event
        ) =>
          onDescriptionChange(
            event.target.value
          )
        }
        aria-label="Task description"
        className="
          w-full
          rounded-xl
          border
          border-zinc-700
          bg-black
          p-3
        "
      />

      <div>
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <h3
            className="
              font-black
            "
          >
            Journey XP
          </h3>

          <span
            className="
              rounded-full
              border
              border-yellow-500/30
              bg-yellow-950/30
              px-3
              py-1
              text-xs
              font-black
              text-yellow-300
            "
          >
            {journeyPlanActive
              ? `${currentDailyTaskXP.toLocaleString()} XP`
              : "Not started"}
          </span>
        </div>
      </div>

      <div>
        <h3
          className="
            font-black
          "
        >
          Scheduled Days
        </h3>

        <WeekdayButtons
          selectedDays={
            editDays
          }
          onToggle={
            onToggleDay
          }
        />
      </div>

      <div>
        <h3
          className="
            font-black
          "
        >
          Attributes optional
        </h3>

        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-3

            md:grid-cols-4
          "
        >
          {attributes.map(
            (
              attribute
            ) => {
              const selected =
                editCategories.includes(
                  attribute.id
                );

              return (
                <button
                  type="button"
                  key={
                    attribute.id
                  }
                  onClick={() =>
                    onToggleCategory(
                      attribute.id
                    )
                  }
                  className={`
                    rounded-xl
                    border
                    p-3
                    text-sm
                    font-bold

                    ${
                      selected
                        ? "border-green-500 bg-green-950 text-green-100"
                        : "border-zinc-700 bg-black text-zinc-400"
                    }
                  `}
                >
                  {attribute.name}
                </button>
              );
            }
          )}
        </div>
      </div>

      <input
        type="hidden"
        value={
          editingTask.id
        }
        readOnly
      />
    </ModalFrame>
  );
}


function JourneySetup({
  journeyOptions,
  journeyMonths,
  setJourneyMonths,
  consistency,
  setConsistency,
  onStart,
}: {
  journeyOptions:
    {
      months: number;
      label: string;
    }[];

  journeyMonths:
    number;

  setJourneyMonths:
    (
      months: number
    ) => void;

  consistency:
    number;

  setConsistency:
    (
      value: number
    ) => void;

  onStart:
    () => void;
}) {
  return (
    <section
      className="
        mt-6
        rounded-2xl
        border
        border-yellow-500/40
        bg-yellow-950/20
        p-6
      "
    >
      <p
        className="
          text-xs
          font-black
          uppercase
          tracking-[0.2em]
          text-yellow-300
        "
      >
        Journey Setup
      </p>

      <h2
        className="
          mt-2
          text-3xl
          font-black
        "
      >
        Choose your Level 1000 target
      </h2>

      <p
        className="
          mt-3
          max-w-3xl
          text-zinc-300
        "
      >
        Daily tasks provide half of Level 1000 XP. The full skill tree provides the other half. Future task XP automatically adapts when tasks or schedules change.
      </p>

      <div
        className="
          mt-6
          grid
          gap-5

          md:grid-cols-2
        "
      >
        <label>
          <span
            className="
              font-black
            "
          >
            Journey length
          </span>

          <select
            value={
              journeyMonths
            }
            onChange={(
              event
            ) =>
              setJourneyMonths(
                Number(
                  event.target.value
                )
              )
            }
            className="
              mt-2
              w-full
              rounded-xl
              border
              border-zinc-700
              bg-black
              p-3
            "
          >
            {journeyOptions.map(
              (
                option
              ) => (
                <option
                  key={
                    option.months
                  }
                  value={
                    option.months
                  }
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          <span
            className="
              font-black
            "
          >
            Completion target: {consistency}%
          </span>

          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={
              consistency
            }
            onChange={(
              event
            ) =>
              setConsistency(
                Number(
                  event.target.value
                )
              )
            }
            className="
              mt-4
              w-full
            "
          />

          <div
            className="
              mt-1
              flex
              justify-between
              text-xs
              text-zinc-500
            "
          >
            <span>
              50%
            </span>

            <span>
              100%
            </span>
          </div>
        </label>
      </div>

      <div
        className="
          mt-6
          rounded-xl
          border
          border-red-800/70
          bg-red-950/30
          p-4
          text-sm
          text-red-200
        "
      >
        <strong>
          Locked after starting:
        </strong>{" "}
        changing journey length or completion percentage requires a full journey reset.
      </div>

      <button
        type="button"
        onClick={
          onStart
        }
        className="
          mt-6
          rounded-xl
          bg-white
          px-6
          py-3
          font-black
          text-black
        "
      >
        Start Journey
      </button>
    </section>
  );
}


function JourneySummary({
  durationMonths,
  consistency,
  startDate,
  targetDate,
  currentXP,
  remainingOpportunities,
  expectedCompletions,
  showReset,
  setShowReset,
  resetText,
  setResetText,
  onReset,
}: {
  durationMonths:
    number;

  consistency:
    number;

  startDate:
    string;

  targetDate:
    string;

  currentXP:
    number;

  remainingOpportunities:
    number;

  expectedCompletions:
    number;

  showReset:
    boolean;

  setShowReset:
    (
      value: boolean
    ) => void;

  resetText:
    string;

  setResetText:
    (
      value: string
    ) => void;

  onReset:
    () => void;
}) {
  return (
    <section
      className="
        mt-6
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-950
        p-6
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
              tracking-[0.2em]
              text-green-300
            "
          >
            Journey Locked
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
            "
          >
            {durationMonths <
            12
              ? `${durationMonths} month journey`
              : `${durationMonths /
                  12} ${
                  durationMonths ===
                  12
                    ? "year"
                    : "years"
                } journey`}
          </h2>

          <p
            className="
              mt-2
              text-zinc-400
            "
          >
            {consistency}% completion target · {formatDate(startDate)} through {formatDate(targetDate)}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowReset(
              !showReset
            )
          }
          className="
            rounded-xl
            border
            border-red-800
            px-4
            py-3
            font-bold
            text-red-300
          "
        >
          Reset Journey
        </button>
      </div>

      <div
        className="
          mt-6
          grid
          gap-4

          sm:grid-cols-3
        "
      >
        <Metric
          label="Current Task Reward"
          value={`${currentXP.toLocaleString()} XP`}
        />

        <Metric
          label="Remaining Opportunities"
          value={
            remainingOpportunities
              .toLocaleString()
          }
        />

        <Metric
          label="Expected Completions"
          value={
            Math.round(
              expectedCompletions
            ).toLocaleString()
          }
        />
      </div>

      {showReset && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-red-800
            bg-red-950/30
            p-5
          "
        >
          <p
            className="
              font-black
              text-red-200
            "
          >
            This permanently resets XP, task history, skill-tree progress, streaks, achievements, and progression unlocks. Your task list and schedules remain.
          </p>

          <label
            className="
              mt-4
              block
            "
          >
            <span
              className="
                text-sm
                text-zinc-400
              "
            >
              Type RESET to continue
            </span>

            <input
              value={
                resetText
              }
              onChange={(
                event
              ) =>
                setResetText(
                  event.target.value
                )
              }
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-red-800
                bg-black
                p-3
              "
            />
          </label>

          <button
            type="button"
            disabled={
              resetText !==
              "RESET"
            }
            onClick={
              onReset
            }
            className="
              mt-4
              rounded-xl
              bg-red-600
              px-5
              py-3
              font-black
              text-white

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Permanently Reset Journey
          </button>
        </div>
      )}
    </section>
  );
}


function TaskCard({
  task,
  attributes,
  completed,
  xp,
  journeyActive,
  onToggle,
  onEdit,
}: {
  task:
    DailyTask;

  attributes:
    {
      id: string;
      name: string;
    }[];

  completed:
    boolean;

  xp:
    number;

  journeyActive:
    boolean;

  onToggle:
    () => void;

  onEdit:
    () => void;
}) {
  const taskAttributeNames =
    attributes
      .filter(
        (
          attribute
        ) =>
          task.categories.includes(
            attribute.id
          )
      )
      .map(
        (
          attribute
        ) =>
          attribute.name
      );

  return (
    <article
      className={`
        min-w-0
        rounded-lg
        border
        p-2.5

        sm:rounded-xl
        sm:p-3

        md:p-4

        ${
          completed
            ? "border-green-700 bg-green-950"
            : "border-zinc-700 bg-black"
        }
      `}
    >
      <button
        type="button"
        onClick={
          onToggle
        }
        className="
          block
          w-full
          min-w-0
          text-left
        "
      >
        <h3
          className="
            w-full
            truncate
            text-[11px]
            font-black
            leading-tight

            min-[390px]:text-xs

            sm:text-sm
            md:text-lg
          "
          title={
            task.name
          }
        >
          {task.name}
        </h3>

        {task.description && (
          <p
            className="
              mt-0.5
              line-clamp-2
              text-[8px]
              leading-[1.25]
              text-zinc-400

              min-[390px]:text-[9px]

              sm:text-[10px]
              md:mt-1
              md:text-xs
              md:leading-relaxed
            "
          >
            {task.description}
          </p>
        )}
      </button>

      <div
        className="
          mt-2
          flex
          items-center
          justify-between
          gap-1.5

          sm:gap-2
        "
      >
        <span
          className="
            min-w-0
            truncate
            whitespace-nowrap
            rounded-full
            border
            border-yellow-500/30
            bg-yellow-950/30
            px-1.5
            py-0.5
            text-[7px]
            font-black
            leading-none
            text-yellow-300

            min-[390px]:text-[8px]

            sm:px-2
            sm:py-1
            sm:text-[9px]

            md:text-[10px]
          "
        >
          {journeyActive
            ? `+${xp.toLocaleString()} XP`
            : "Locked"}
        </span>

        <button
          type="button"
          onClick={
            onEdit
          }
          className="
            shrink-0
            rounded-md
            border
            border-white/10
            bg-zinc-950
            px-1.5
            py-1
            text-[8px]
            font-black
            leading-none
            text-zinc-300

            min-[390px]:text-[9px]

            sm:rounded-lg
            sm:px-2
            sm:py-1.5
            sm:text-[10px]

            md:px-3
            md:py-2
            md:text-xs
          "
        >
          Edit
        </button>
      </div>

      <button
        type="button"
        onClick={
          onToggle
        }
        className="
          mt-2
          block
          w-full
          text-left
        "
      >
        <div
          className="
            flex
            min-w-0
            flex-wrap
            gap-1

            sm:gap-1.5
            md:mt-3
          "
        >
          <span
            className={`
              whitespace-nowrap
              rounded-full
              border
              px-1.5
              py-0.5
              text-[7px]
              font-black
              leading-none

              min-[390px]:text-[8px]

              sm:px-2
              sm:py-1
              sm:text-[9px]

              md:text-[10px]

              ${
                completed
                  ? "border-green-500/40 bg-green-500/10 text-green-200"
                  : "border-white/10 bg-zinc-950 text-zinc-400"
              }
            `}
          >
            {completed
              ? "✓ Complete"
              : "Tap to complete"}
          </span>

          <span
            className="
              max-w-full
              truncate
              rounded-full
              border
              border-white/10
              bg-zinc-950
              px-1.5
              py-0.5
              text-[7px]
              font-bold
              leading-none
              text-zinc-400

              min-[390px]:text-[8px]

              sm:px-2
              sm:py-1
              sm:text-[9px]

              md:text-[10px]
            "
          >
            {task.scheduledDays
              .map(
                (
                  day
                ) =>
                  weekdayLabels[
                    day
                  ]
              )
              .join(" ")}
          </span>

          {taskAttributeNames
            .slice(
              0,
              2
            )
            .map(
              (
                name
              ) => (
                <span
                  key={
                    name
                  }
                  className="
                    max-w-full
                    truncate
                    rounded-full
                    border
                    border-white/10
                    bg-zinc-950
                    px-1.5
                    py-0.5
                    text-[7px]
                    font-bold
                    leading-none
                    text-zinc-500

                    min-[390px]:text-[8px]

                    sm:px-2
                    sm:py-1
                    sm:text-[9px]

                    md:text-[10px]
                  "
                >
                  {name}
                </span>
              )
            )}
        </div>
      </button>
    </article>
  );
}

function TaskScheduleRow({
  task,
  onChange,
  onEdit,
}: {
  task:
    DailyTask;

  onChange:
    (
      days:
        Weekday[]
    ) => void;

  onEdit:
    () => void;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        p-3

        sm:p-4
      "
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
            flex-1
          "
        >
          <p
            className="
              truncate
              text-sm
              font-black

              sm:text-base
            "
            title={
              task.name
            }
          >
            {task.name}
          </p>

          <p
            className="
              mt-0.5
              text-[10px]
              text-zinc-500

              sm:mt-1
              sm:text-xs
            "
          >
            {task.scheduledDays.length} day
            {task.scheduledDays.length ===
            1
              ? ""
              : "s"}{" "}
            per week
          </p>
        </div>

        <button
          type="button"
          onClick={
            onEdit
          }
          className="
            shrink-0
            rounded-md
            border
            border-white/10
            px-2
            py-1.5
            text-[9px]
            font-black
            text-zinc-300

            sm:rounded-lg
            sm:px-3
            sm:py-2
            sm:text-xs
          "
        >
          Edit
        </button>
      </div>

      <div
        className="
          mt-3
          grid
          grid-cols-7
          gap-1.5

          sm:gap-2
        "
      >
        {weekdayKeys.map(
          (
            day
          ) => {
            const selected =
              task.scheduledDays.includes(
                day
              );

            return (
              <button
                key={
                  day
                }
                type="button"
                onClick={() => {
                  const next =
                    selected
                      ? task.scheduledDays.filter(
                          (
                            current
                          ) =>
                            current !==
                            day
                        )
                      : [
                          ...task.scheduledDays,
                          day,
                        ];

                  if (
                    next.length >
                    0
                  ) {
                    onChange(
                      next
                    );
                  }
                }}
                className={`
                  flex
                  aspect-square
                  w-full
                  min-w-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  text-[9px]
                  font-black
                  uppercase
                  leading-none

                  min-[390px]:text-[10px]

                  sm:text-xs

                  ${
                    selected
                      ? "border-white bg-white text-black"
                      : "border-zinc-700 bg-black text-zinc-400"
                  }
                `}
                title={
                  day
                }
              >
                {weekdayLabels[
                  day
                ]}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}

function WeekdayButtons({
  selectedDays,
  onToggle,
}: {
  selectedDays:
    Weekday[];

  onToggle:
    (
      day:
        Weekday
    ) => void;
}) {
  return (
    <div
      className="
        mt-3
        flex
        flex-wrap
        gap-2
      "
    >
      {weekdayKeys.map(
        (
          day
        ) => (
          <button
            key={
              day
            }
            type="button"
            onClick={() =>
              onToggle(
                day
              )
            }
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              text-sm
              font-black
              uppercase

              ${
                selectedDays.includes(
                  day
                )
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 bg-black text-zinc-400"
              }
            `}
            title={
              day
            }
          >
            {weekdayLabels[
              day
            ]}
          </button>
        )
      )}
    </div>
  );
}


function CountdownCard({
  icon,
  title,
  value,
  description,
  mono = false,
}: {
  icon:
    string;

  title:
    string;

  value:
    string;

  description:
    string;

  mono?:
    boolean;
}) {
  return (
    <div
      className="
        flex
        flex-col
        items-start
        gap-2
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-950
        p-3

        md:flex-row
        md:items-center
        md:gap-4
        md:p-5
      "
    >
      <span
        className="
          text-3xl
        "
      >
        {icon}
      </span>

      <div>
        <p
          className="
            text-xs
            font-black
            uppercase
            tracking-wider
            text-zinc-500
          "
        >
          {title}
        </p>

        <p
          className={`
            mt-1
            text-lg

            md:text-2xl
            font-black

            ${
              mono
                ? "font-mono"
                : ""
            }
          `}
        >
          {value}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-4
            text-zinc-500

            md:text-sm
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}


function Metric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        border
        border-zinc-800
        bg-black
        p-3

        sm:p-4
      "
    >
      <p
        className="
          break-words
          text-[9px]
          font-black
          uppercase
          leading-tight
          tracking-wide
          text-zinc-500

          min-[390px]:text-[10px]

          sm:text-xs
          sm:tracking-wider
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          break-words
          text-base
          font-black
          leading-tight

          min-[390px]:text-lg

          sm:text-xl
        "
      >
        {value}
      </p>
    </div>
  );
}


function EmptyState({
  text,
}: {
  text:
    string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-dashed
        border-zinc-700
        p-8
        text-center
        text-zinc-500
      "
    >
      {text}
    </div>
  );
}
