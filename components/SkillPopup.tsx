"use client";

import {
  useEffect,
  useState
} from "react";

import {
  SkillNode
} from "@/data/skillMap";


interface Props {
  node: SkillNode;

  displayNumber: number;

  unlocked: boolean;

  completed: boolean;

  onComplete: () => void;

  onUpdate: (
    name: string,
    description: string
  ) => void;

  onClose: () => void;
}


export default function SkillPopup({
  node,
  displayNumber,
  unlocked,
  completed,
  onComplete,
  onUpdate,
  onClose,
}: Props) {
  const [editing, setEditing] =
    useState(false);

  const [name, setName] =
    useState(node.name);

  const [
    description,
    setDescription
  ] = useState(node.description);


  useEffect(() => {
    setName(node.name);
    setDescription(
      node.description
    );
    setEditing(false);
  }, [node]);


  function saveChanges() {
    const cleanedName =
      name.trim();

    if (!cleanedName) {
      return;
    }

    onUpdate(
      cleanedName,
      description.trim()
    );

    setEditing(false);
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-50

        flex
        items-center
        justify-center

        bg-black/75
        p-4
      "
      onMouseDown={onClose}
    >
      <div
        className="
          w-full
          max-w-md

          rounded-2xl
          border
          border-zinc-700

          bg-zinc-950
          p-6

          text-white

          shadow-[0_0_50px_rgba(0,0,0,0.8)]
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {!editing ? (
          <>
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    uppercase
                    tracking-widest
                    text-zinc-400
                  "
                >
                  {node.path} · {node.tier}
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-bold
                  "
                >
                  {displayNumber}. {node.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditing(true)
                }
                className="
                  rounded-lg
                  border
                  border-zinc-600
                  px-3
                  py-2
                  text-sm

                  hover:bg-zinc-800
                "
              >
                Edit
              </button>
            </div>


            <p
              className="
                mt-5
                min-h-12
                text-zinc-300
              "
            >
              {node.description ||
                "No description has been added yet."}
            </p>


            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >
              <div
                className="
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-900
                  p-3
                "
              >
                <p
                  className="
                    text-xs
                    uppercase
                    text-zinc-500
                  "
                >
                  Reward
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                  "
                >
                  +{node.xp} XP
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-900
                  p-3
                "
              >
                <p
                  className="
                    text-xs
                    uppercase
                    text-zinc-500
                  "
                >
                  Status
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                  "
                >
                  {completed
                    ? "Completed"
                    : unlocked
                    ? "Available"
                    : "Locked"}
                </p>
              </div>
            </div>


            {!unlocked &&
              !completed && (
                <p
                  className="
                    mt-4
                    rounded-lg
                    border
                    border-zinc-800
                    bg-zinc-900
                    p-3
                    text-sm
                    text-zinc-400
                  "
                >
                  Complete the previous challenge in this path to unlock this one.
                </p>
              )}


            <div
              className="
                mt-6
                flex
                gap-3
              "
            >
              {(unlocked ||
                completed) && (
                <button
                  type="button"
                  onClick={onComplete}
                  className="
                    flex-1
                    rounded-lg
                    border
                    border-white
                    bg-white
                    px-4
                    py-3
                    font-bold
                    text-black

                    hover:bg-zinc-200
                  "
                >
                  {completed
                    ? "Undo"
                    : "Complete"}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="
                  flex-1
                  rounded-lg
                  border
                  border-zinc-600
                  px-4
                  py-3
                  font-bold

                  hover:bg-zinc-800
                "
              >
                Back
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className="
                text-sm
                uppercase
                tracking-widest
                text-zinc-400
              "
            >
              Edit challenge
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-bold
              "
            >
              {node.path} {displayNumber}
            </h2>


            <label
              className="
                mt-5
                block
                text-sm
                font-semibold
              "
            >
              Title
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              className="
                mt-2
                w-full
                rounded-lg
                border
                border-zinc-700
                bg-black
                p-3
                outline-none

                focus:border-white
              "
            />


            <label
              className="
                mt-4
                block
                text-sm
                font-semibold
              "
            >
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={5}
              className="
                mt-2
                w-full
                resize-none
                rounded-lg
                border
                border-zinc-700
                bg-black
                p-3
                outline-none

                focus:border-white
              "
            />


            <div
              className="
                mt-6
                flex
                gap-3
              "
            >
              <button
                type="button"
                onClick={saveChanges}
                disabled={!name.trim()}
                className="
                  flex-1
                  rounded-lg
                  bg-white
                  px-4
                  py-3
                  font-bold
                  text-black

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setName(node.name);
                  setDescription(
                    node.description
                  );
                  setEditing(false);
                }}
                className="
                  flex-1
                  rounded-lg
                  border
                  border-zinc-600
                  px-4
                  py-3
                  font-bold

                  hover:bg-zinc-800
                "
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}