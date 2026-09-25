"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useGame,
} from "@/context/GameContext";

import SkillNode from "@/components/SkillNode";
import SkillPopup from "@/components/SkillPopup";

import {
  Path,
  SkillNode as SkillNodeType,
  Tier,
} from "@/data/skillMap";

import {
  SKILL_ATTRIBUTE_XP,
} from "@/data/categories";


type Position = {
  x: number;

  y: number;
};


const MAP_SIZE = 1000;

const CENTER =
  MAP_SIZE / 2;


const tierRadius:
  Record<Tier, number> = {
  Bronze: 400,

  Silver: 290,

  Gold: 180,

  Master: 75,
};


const pathOrder:
  Path[] = [
  "Body",
  "Spirit",
  "Life",
  "Mind",
];


const tierOrder:
  Tier[] = [
  "Bronze",
  "Silver",
  "Gold",
  "Master",
];


const pathLabelPositions:
  Record<
    Path,
    {
      left: string;
      top: string;
    }
  > = {
  Body: {
    left: "50%",
    top: "2%",
  },

  Spirit: {
    left: "103%",
    top: "50%",
  },

  Life: {
    left: "50%",
    top: "98%",
  },

  Mind: {
    left: "-3%",
    top: "50%",
  },
};


function roundCoordinate(
  value:
    number
): number {
  return Number(
    value.toFixed(
      3
    )
  );
}


export default function SkillMap() {
  const {
    attributes,

    skillPathConfigs,

    skillNodes,

    completedSkills,

    completeSkillNode,

    updateSkillNode,

    updateSkillPathConfig,
  } =
    useGame();


  const [
    selectedNodeId,
    setSelectedNodeId
  ] =
    useState<
      number | null
    >(null);

  const [
    showPathEditor,
    setShowPathEditor
  ] =
    useState(false);


  const selectedNode =
    selectedNodeId ===
    null
      ? null
      : skillNodes.find(
          (
            node
          ) =>
            node.id ===
            selectedNodeId
        ) ??
        null;


  function isCompleted(
    nodeId:
      number
  ) {
    return completedSkills.includes(
      nodeId
    );
  }


  function isUnlocked(
    node:
      SkillNodeType
  ) {
    if (
      node.requires.length ===
      0
    ) {
      return true;
    }

    return node.requires.every(
      (
        requiredId
      ) =>
        completedSkills.includes(
          requiredId
        )
    );
  }


  function getPathNodes(
    path:
      Path
  ) {
    return skillNodes
      .filter(
        (
          node
        ) =>
          node.path ===
          path
      )
      .sort(
        (
          first,
          second
        ) =>
          first.id -
          second.id
      );
  }


  function getDisplayNumber(
    node:
      SkillNodeType
  ) {
    const pathNodes =
      getPathNodes(
        node.path
      );

    const index =
      pathNodes.findIndex(
        (
          current
        ) =>
          current.id ===
          node.id
      );

    return index + 1;
  }


  function getPathTierNodes(
    path:
      Path,

    tier:
      Tier
  ) {
    const nodes =
      skillNodes
        .filter(
          (
            node
          ) =>
            node.path ===
              path &&
            node.tier ===
              tier
        )
        .sort(
          (
            first,
            second
          ) =>
            first.id -
            second.id
        );

    if (
      tier ===
      "Silver"
    ) {
      return [
        ...nodes,
      ].reverse();
    }

    return nodes;
  }


  function getOrderedTierNodes(
    tier:
      Tier
  ) {
    return pathOrder.flatMap(
      (
        path
      ) =>
        getPathTierNodes(
          path,
          tier
        )
    );
  }


  function getPosition(
    node:
      SkillNodeType
  ): Position {
    const nodesOnRing =
      getOrderedTierNodes(
        node.tier
      );

    const index =
      nodesOnRing.findIndex(
        (
          current
        ) =>
          current.id ===
          node.id
      );

    const count =
      nodesOnRing.length;

    const angle =
      -Math.PI /
        2 +
      (
        index /
        count
      ) *
        Math.PI *
        2;

    const radius =
      tierRadius[
        node.tier
      ];

    return {
      x:
        roundCoordinate(
          CENTER +
            Math.cos(
              angle
            ) *
              radius
        ),

      y:
        roundCoordinate(
          CENTER +
            Math.sin(
              angle
            ) *
              radius
        ),
    };
  }


  function getLineColor(
    node:
      SkillNodeType,

    nextNode:
      SkillNodeType
  ) {
    if (
      isCompleted(
        node.id
      ) &&
      isCompleted(
        nextNode.id
      )
    ) {
      return "#e4e4e7";
    }

    if (
      isCompleted(
        node.id
      ) &&
      isUnlocked(
        nextNode
      )
    ) {
      return "#a1a1aa";
    }

    return "#3f3f46";
  }


  return (
    <>
      <div
        className="
          relative
          mx-auto
          origin-top-left
          overflow-visible
          [zoom:.5]

          md:[zoom:1]
        "
        style={{
          width:
            `${MAP_SIZE}px`,

          height:
            `${MAP_SIZE}px`,
        }}
      >
        <button
          type="button"
          onClick={() =>
            setShowPathEditor(
              true
            )
          }
          className="
            absolute
            right-0
            top-0
            z-40

            rounded-xl
            border
            border-zinc-600

            bg-zinc-950

            px-5
            py-3

            font-black

            shadow-lg

            hover:border-white
          "
        >
          ✏️ Edit Paths & Attributes
        </button>


        {pathOrder.map(
          (
            path
          ) => (
            <div
              key={
                path
              }
              className="
                absolute
                z-30

                -translate-x-1/2
                -translate-y-1/2

                rounded-full
                border
                border-zinc-700

                bg-black/90

                px-4
                py-2

                text-sm
                font-black

                shadow-lg
              "
              style={
                pathLabelPositions[
                  path
                ]
              }
            >
              {skillPathConfigs[
                path
              ].name}
            </div>
          )
        )}


        <svg
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
          "
          viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`}
        >
          {skillNodes.flatMap(
            (
              node
            ) =>
              node.next.map(
                (
                  nextId
                ) => {
                  const nextNode =
                    skillNodes.find(
                      (
                        candidate
                      ) =>
                        candidate.id ===
                        nextId
                    );

                  if (
                    !nextNode
                  ) {
                    return null;
                  }

                  const start =
                    getPosition(
                      node
                    );

                  const end =
                    getPosition(
                      nextNode
                    );

                  return (
                    <line
                      key={`${node.id}-${nextId}`}
                      x1={
                        start.x
                      }
                      y1={
                        start.y
                      }
                      x2={
                        end.x
                      }
                      y2={
                        end.y
                      }
                      stroke={
                        getLineColor(
                          node,
                          nextNode
                        )
                      }
                      strokeWidth={
                        isCompleted(
                          node.id
                        )
                          ? 5
                          : 3
                      }
                      strokeLinecap="round"
                    />
                  );
                }
              )
          )}
        </svg>


        <div
          className="
            absolute
            left-1/2
            top-1/2
            z-10

            flex
            h-10
            w-10

            -translate-x-1/2
            -translate-y-1/2

            items-center
            justify-center

            rounded-full
            border
            border-zinc-700

            bg-zinc-950
            text-base
          "
        >
          ⭐
        </div>


        {tierOrder.flatMap(
          (
            tier
          ) =>
            getOrderedTierNodes(
              tier
            ).map(
              (
                node
              ) => {
                const position =
                  getPosition(
                    node
                  );

                return (
                  <div
                    key={
                      node.id
                    }
                    className="
                      absolute
                      z-20
                    "
                    style={{
                      left:
                        `${position.x}px`,

                      top:
                        `${position.y}px`,

                      transform:
                        "translate(-50%, -50%)",
                    }}
                  >
                    <SkillNode
                      node={
                        node
                      }
                      displayNumber={
                        getDisplayNumber(
                          node
                        )
                      }
                      unlocked={
                        isUnlocked(
                          node
                        )
                      }
                      completed={
                        isCompleted(
                          node.id
                        )
                      }
                      onClick={() =>
                        setSelectedNodeId(
                          node.id
                        )
                      }
                    />
                  </div>
                );
              }
            )
        )}
      </div>


      {selectedNode && (
        <SkillPopup
          node={
            selectedNode
          }
          displayNumber={
            getDisplayNumber(
              selectedNode
            )
          }
          unlocked={
            isUnlocked(
              selectedNode
            )
          }
          completed={
            isCompleted(
              selectedNode.id
            )
          }
          onComplete={() => {
            completeSkillNode(
              selectedNode.id
            );

            setSelectedNodeId(
              null
            );
          }}
          onUpdate={(
            name,
            description
          ) => {
            updateSkillNode(
              selectedNode.id,
              name,
              description
            );
          }}
          onClose={() =>
            setSelectedNodeId(
              null
            )
          }
        />
      )}


      {showPathEditor && (
        <PathEditor
          attributes={
            attributes
          }
          configs={
            skillPathConfigs
          }
          onUpdate={
            updateSkillPathConfig
          }
          onClose={() =>
            setShowPathEditor(
              false
            )
          }
        />
      )}
    </>
  );
}


function PathEditor({
  attributes,
  configs,
  onUpdate,
  onClose,
}: {
  attributes:
    {
      id: string;
      name: string;
    }[];

  configs:
    Record<
      Path,
      {
        name: string;
        attributeIds: string[];
      }
    >;

  onUpdate:
    (
      path: Path,
      name: string,
      attributeIds: string[]
    ) => void;

  onClose:
    () => void;
}) {
  const [
    drafts,
    setDrafts
  ] =
    useState(
      configs
    );


  useEffect(() => {
    const bodyOverflow =
      document.body.style.overflow;

    const htmlOverflow =
      document.documentElement.style.overflow;

    const bodyOverscroll =
      document.body.style.overscrollBehavior;

    const htmlOverscroll =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overscrollBehavior =
      "none";

    document.documentElement.style.overscrollBehavior =
      "none";

    return () => {
      document.body.style.overflow =
        bodyOverflow;

      document.documentElement.style.overflow =
        htmlOverflow;

      document.body.style.overscrollBehavior =
        bodyOverscroll;

      document.documentElement.style.overscrollBehavior =
        htmlOverscroll;
    };
  }, []);


  function toggleAttribute(
    path:
      Path,

    attributeId:
      string
  ) {
    setDrafts(
      (
        old
      ) => {
        const selected =
          old[
            path
          ].attributeIds;

        return {
          ...old,

          [path]: {
            ...old[
              path
            ],

            attributeIds:
              selected.includes(
                attributeId
              )
                ? selected.filter(
                    (
                      id
                    ) =>
                      id !==
                      attributeId
                  )
                : [
                    ...selected,
                    attributeId,
                  ],
          },
        };
      }
    );
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[1400]

        flex
        items-stretch
        justify-center

        overflow-hidden

        bg-black/90

        p-0

        sm:items-center
        sm:p-4
      "
      onMouseDown={
        onClose
      }
    >
      <div
        className="
          flex

          h-[100dvh]
          max-h-[100dvh]

          w-full
          max-w-5xl

          flex-col

          overflow-hidden

          rounded-none
          border-0
          border-zinc-700

          bg-zinc-950

          sm:h-[92dvh]
          sm:max-h-[900px]
          sm:rounded-3xl
          sm:border
        "
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            gap-4

            border-b
            border-zinc-800

            p-4
            pr-5

            pt-[max(1rem,env(safe-area-inset-top))]

            sm:p-6
          "
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            <h2
              className="
                text-3xl
                font-black
              "
            >
              Edit Skill Paths
            </h2>

            <p
              className="
                mt-2
                max-w-3xl
                text-zinc-400
              "
            >
              Rename each main path and choose which custom attributes receive XP whenever a node in that path is completed.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center

              rounded-full
              border
              border-zinc-600
              font-black
            "
          >
            ✕
          </button>
        </div>


        <div
          className="
            min-h-0
            flex-1

            grid
            content-start
            gap-4

            overflow-y-auto
            overflow-x-hidden
            overscroll-contain
            touch-pan-y

            p-4

            [-webkit-overflow-scrolling:touch]

            md:grid-cols-2

            sm:p-6
          "
        >
          {pathOrder.map(
            (
              path
            ) => (
              <section
                key={
                  path
                }
                className="
                  rounded-2xl
                  border
                  border-zinc-700
                  bg-black
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
                  Original path: {path}
                </p>

                <input
                  value={
                    drafts[
                      path
                    ].name
                  }
                  onChange={(
                    event
                  ) =>
                    setDrafts(
                      (
                        old
                      ) => ({
                        ...old,

                        [path]: {
                          ...old[
                            path
                          ],

                          name:
                            event
                              .target
                              .value,
                        },
                      })
                    )
                  }
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-zinc-700
                    bg-zinc-950
                    p-3
                    text-lg
                    font-black
                  "
                />

                <p
                  className="
                    mt-4
                    text-sm
                    font-black
                  "
                >
                  Attribute rewards
                </p>

                <div
                  className="
                    mt-3
                    space-y-2

                    md:max-h-56
                    md:overflow-y-auto
                    md:pr-1
                  "
                >
                  {attributes.length ===
                  0 ? (
                    <p
                      className="
                        text-sm
                        text-zinc-500
                      "
                    >
                      Create attributes from the Daily Tasks page first.
                    </p>
                  ) : (
                    attributes.map(
                      (
                        attribute
                      ) => {
                        const selected =
                          drafts[
                            path
                          ].attributeIds.includes(
                            attribute.id
                          );

                        return (
                          <button
                            type="button"
                            key={
                              attribute.id
                            }
                            onClick={() =>
                              toggleAttribute(
                                path,
                                attribute.id
                              )
                            }
                            className={`
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-3

                              rounded-xl
                              border
                              px-3
                              py-2

                              text-left
                              font-bold

                              ${
                                selected
                                  ? "border-green-500 bg-green-950/50"
                                  : "border-zinc-800 bg-zinc-950"
                              }
                            `}
                          >
                            <span>
                              {attribute.name}
                            </span>

                            <span>
                              {selected
                                ? "✓"
                                : ""}
                            </span>
                          </button>
                        );
                      }
                    )
                  )}
                </div>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-2
                    text-xs
                  "
                >
                  {(
                    Object.entries(
                      SKILL_ATTRIBUTE_XP
                    ) as
                      [
                        Tier,
                        number,
                      ][]
                  ).map(
                    (
                      [
                        tier,
                        xp,
                      ]
                    ) => (
                      <span
                        key={
                          tier
                        }
                        className="
                          rounded-lg
                          border
                          border-zinc-800
                          px-2
                          py-2
                          text-zinc-400
                        "
                      >
                        {tier}: +{xp.toLocaleString()}
                      </span>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>


        <div
          className="
            flex
            shrink-0
            justify-end
            gap-3

            border-t
            border-zinc-800

            bg-black/50

            px-4
            py-3

            pb-[max(0.75rem,env(safe-area-inset-bottom))]

            sm:px-6
            sm:py-4
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
              border-zinc-700
              px-5
              py-3
              font-bold
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              pathOrder.forEach(
                (
                  path
                ) =>
                  onUpdate(
                    path,
                    drafts[
                      path
                    ].name,
                    drafts[
                      path
                    ].attributeIds
                  )
              );

              onClose();
            }}
            className="
              rounded-xl
              bg-white
              px-5
              py-3
              font-black
              text-black
            "
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
