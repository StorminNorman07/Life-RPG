"use client";

import { useAchievements } from "@/context/AchievementContext";
import { useCharacter } from "@/context/CharacterContext";
import { useGame } from "@/context/GameContext";
import CresceraAvatar from "@/components/CresceraAvatar";
import {
  CharacterIdentity,
  CharacterLoadout,
  CosmeticCategory,
  CosmeticItem,
  defaultIdentity,
  defaultLoadout,
  getCosmeticById,
} from "@/data/characterOptions";
import { seasonalBackgrounds } from "@/data/seasonalBackgrounds";

export interface CharacterDisplaySnapshot {
  name: string;
  title: string;
  level: number;
  identity: CharacterIdentity;
  loadout: CharacterLoadout;
}

interface CharacterDisplayProps {
  compact?: boolean;
  scale?: number;
  showName?: boolean;
  showTitle?: boolean;
  showLevel?: boolean;
  snapshot?: CharacterDisplaySnapshot;
}

function snapshotItem(loadout: CharacterLoadout, category: CosmeticCategory): CosmeticItem | null {
  const id = loadout[category];
  if (!id || id === "none") return null;
  return seasonalBackgrounds.find((item) => item.id === id) ?? getCosmeticById(id) ?? null;
}

export default function CharacterDisplay(props: CharacterDisplayProps) {
  const { player } = useGame();
  const { selectedTitle } = useAchievements();
  const { identity, loadout, currentLevel, getEquippedCosmetic } = useCharacter();
  const snapshot = props.snapshot;
  const activeLoadout = snapshot?.loadout ?? loadout ?? defaultLoadout;
  const getItem = (category: CosmeticCategory) => snapshot
    ? snapshotItem(activeLoadout, category)
    : getEquippedCosmetic(category);

  return <CresceraAvatar
    identity={snapshot?.identity ?? identity ?? defaultIdentity}
    loadout={activeLoadout}
    cosmetics={{
      outfit: getItem("outfit"),
      background: getItem("background"),
      frame: getItem("frame"),
      accessory: getItem("accessory"),
      pose: getItem("pose"),
      aura: getItem("aura"),
      heldItem: getItem("heldItem"),
      sceneEffect: getItem("sceneEffect"),
    }}
    name={snapshot?.name ?? player.name}
    title={snapshot?.title ?? selectedTitle}
    level={snapshot?.level ?? currentLevel}
    compact={props.compact}
    scale={props.scale}
    showName={props.showName}
    showTitle={props.showTitle}
    showLevel={props.showLevel}
  />;
}
