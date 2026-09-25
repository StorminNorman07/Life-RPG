"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useAchievements,
} from "@/context/AchievementContext";

import {
  useGame,
} from "@/context/GameContext";

import {
  useCharacter,
} from "@/context/CharacterContext";

import {
  createClient,
} from "@/utils/supabase/client";


export default function ProfileSync() {
  const {
    completedTasks,
    completedSkills,
    todayTasks,
    skillNodes,
  } =
    useGame();

  const {
    selectedTitle,
  } =
    useAchievements();

  const {
    identity,
    loadout,
    currentLevel,
  } =
    useCharacter();

  const lastPayloadRef =
    useRef("");


  useEffect(() => {
    const payload = {
      avatar_data: {
        identity,
        loadout,
      },

      equipped_title:
        selectedTitle ||
        "No title equipped",

      level:
        currentLevel,

      daily_completed_today:
        completedTasks.length,

      daily_tasks_total:
        todayTasks.length,

      skill_nodes_completed:
        completedSkills.length,

      skill_nodes_total:
        skillNodes.length,
    };

    const serialized =
      JSON.stringify(
        payload
      );

    if (
      serialized ===
      lastPayloadRef.current
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        async () => {
          const supabase =
            createClient();

          const {
            data: {
              user,
            },
          } =
            await supabase.auth.getUser();

          if (
            !user
          ) {
            return;
          }

          const {
            error,
          } =
            await supabase
              .from(
                "profiles"
              )
              .update(
                payload
              )
              .eq(
                "id",
                user.id
              );

          if (
            error
          ) {
            console.error(
              "Profile sync failed:",
              error.message
            );

            return;
          }

          lastPayloadRef.current =
            serialized;
        },
        700
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    identity,
    loadout,
    currentLevel,
    selectedTitle,
    completedTasks.length,
    completedSkills.length,
    todayTasks.length,
    skillNodes.length,
  ]);


  return null;
}
