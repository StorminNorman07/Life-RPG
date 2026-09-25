export const MAX_LEVEL = 1000;
export const MAX_LEVEL_XP = 7_300_000;
export const LEVEL_CURVE_EXPONENT = 1.374;

export const DAILY_TASK_XP_BUDGET =
  Math.floor(MAX_LEVEL_XP / 2);

export const SKILL_TREE_XP_BUDGET =
  MAX_LEVEL_XP - DAILY_TASK_XP_BUDGET;

export const MIN_DAILY_TASK_XP = 100;


export function getTotalXPForLevel(
  level: number
): number {
  const cappedLevel =
    Math.max(
      1,
      Math.min(level, MAX_LEVEL)
    );

  const progress =
    (cappedLevel - 1) /
    (MAX_LEVEL - 1);

  return Math.round(
    MAX_LEVEL_XP *
      progress **
        LEVEL_CURVE_EXPONENT
  );
}


export function getLevel(
  xp: number
): number {
  const cappedXP =
    Math.max(
      0,
      Math.min(xp, MAX_LEVEL_XP)
    );

  if (
    cappedXP >=
    MAX_LEVEL_XP
  ) {
    return MAX_LEVEL;
  }

  let low = 1;
  let high = MAX_LEVEL;

  while (
    low <= high
  ) {
    const middle =
      Math.floor(
        (low + high) / 2
      );

    const required =
      getTotalXPForLevel(
        middle
      );

    if (
      required <= cappedXP
    ) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return Math.max(
    1,
    Math.min(high, MAX_LEVEL)
  );
}


export function getXPNeeded(
  level: number
): number {
  if (
    level >= MAX_LEVEL
  ) {
    return 0;
  }

  return (
    getTotalXPForLevel(
      level + 1
    ) -
    getTotalXPForLevel(
      level
    )
  );
}


export function getXPIntoLevel(
  xp: number
): number {
  const level =
    getLevel(xp);

  if (
    level >= MAX_LEVEL
  ) {
    return 0;
  }

  return Math.max(
    0,
    xp -
      getTotalXPForLevel(
        level
      )
  );
}


export function getProgress(
  xp: number
): number {
  const level =
    getLevel(xp);

  if (
    level >= MAX_LEVEL
  ) {
    return 100;
  }

  const needed =
    getXPNeeded(level);

  if (
    needed <= 0
  ) {
    return 100;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (
          getXPIntoLevel(xp) /
          needed
        ) *
          100
      )
    )
  );
}
