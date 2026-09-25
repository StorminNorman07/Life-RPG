"use client";

import {
  SkillNode as SkillNodeType
} from "@/data/skillMap";


interface Props {
  node: SkillNodeType;

  displayNumber: number;

  unlocked: boolean;

  completed: boolean;

  onClick: () => void;
}


export default function SkillNode({
  node,
  displayNumber,
  unlocked,
  completed,
  onClick,
}: Props) {
  const tierStyle = {
    Bronze:
      "border-orange-500 bg-orange-950",

    Silver:
      "border-zinc-300 bg-zinc-700",

    Gold:
      "border-yellow-400 bg-yellow-800",

    Master:
      "border-purple-400 bg-purple-900",
  }[node.tier];


  const available =
    unlocked && !completed;


  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${node.path} skill ${displayNumber}: ${node.name}`}
      className={`
        relative

        flex
        h-[72px]
        w-[72px]
        items-center
        justify-center

        rounded-full
        border-4

        select-none
        outline-none

        transition-[box-shadow,opacity]
        duration-300

        ${tierStyle}

        ${
          available
            ? `
              cursor-pointer
              shadow-[0_0_22px_rgba(255,255,255,0.8)]
            `
            : ""
        }

        ${
          completed
            ? `
              cursor-pointer
              shadow-none
            `
            : ""
        }

        ${
          !unlocked && !completed
            ? `
              cursor-pointer
              border-zinc-700
              bg-zinc-950
              opacity-60
            `
            : ""
        }
      `}
    >
      <span
        className="
          relative
          z-20
          text-xl
          font-black
          text-white
        "
      >
        {displayNumber}
      </span>


      {!unlocked && !completed && (
        <span
          className="
            absolute
            bottom-1
            z-20
            text-sm
          "
        >
          🔒
        </span>
      )}
    </button>
  );
}