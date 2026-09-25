export type AttributeDefinition = {
  id: string;

  name: string;
};


export const MAX_ATTRIBUTES = 100;

export const ATTRIBUTE_XP_PER_LEVEL = 1_000;

export const DAILY_ATTRIBUTE_XP = 200;


export const SKILL_ATTRIBUTE_XP = {
  Bronze: 1_000,

  Silver: 2_500,

  Gold: 5_000,

  Master: 10_000,
} as const;


export const defaultAttributes:
  AttributeDefinition[] = [
  {
    id: "health",
    name: "Health",
  },

  {
    id: "discipline",
    name: "Discipline",
  },

  {
    id: "knowledge",
    name: "Knowledge",
  },

  {
    id: "creativity",
    name: "Creativity",
  },

  {
    id: "faith",
    name: "Faith",
  },

  {
    id: "character",
    name: "Character",
  },

  {
    id: "social",
    name: "Social",
  },

  {
    id: "wealth",
    name: "Wealth",
  },
];


export function getAttributeLevel(
  xp: number
): number {
  return (
    Math.floor(
      Math.max(
        0,
        xp
      ) /
        ATTRIBUTE_XP_PER_LEVEL
    ) + 1
  );
}


export function getAttributeProgress(
  xp: number
): number {
  return (
    Math.max(
      0,
      xp
    ) %
    ATTRIBUTE_XP_PER_LEVEL
  );
}


// Kept temporarily for older imports.
// New task and skill-tree interfaces use
// the editable attribute list from GameContext.
export const categories =
  defaultAttributes.map(
    (
      attribute
    ) => ({
      name:
        attribute.name,

      xp: 0,
    })
  );
