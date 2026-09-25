"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import CharacterDisplay, {
  type CharacterDisplaySnapshot,
} from "@/components/CharacterDisplay";

import {
  CharacterIdentity,
  CharacterLoadout,
  defaultIdentity,
  defaultLoadout,
} from "@/data/characterOptions";

import {
  createClient,
} from "@/utils/supabase/client";


type AvatarData = {
  identity?:
    Partial<CharacterIdentity>;

  loadout?:
    Partial<CharacterLoadout>;
};


type FriendProfile = {
  id:
    string;

  username:
    string;

  display_name:
    string;

  avatar_data:
    AvatarData;

  equipped_title:
    string;

  level:
    number;

  daily_completed_today:
    number;

  daily_tasks_total:
    number;

  skill_nodes_completed:
    number;

  skill_nodes_total:
    number;

  friends_since:
    string;
};


function toSnapshot(
  profile:
    FriendProfile
):
  CharacterDisplaySnapshot {
  return {
    name:
      profile.display_name,

    title:
      profile.equipped_title,

    level:
      profile.level,

    identity: {
      ...defaultIdentity,
      ...profile.avatar_data
        ?.identity,
    },

    loadout: {
      ...defaultLoadout,
      ...profile.avatar_data
        ?.loadout,
    },
  };
}


export default function FriendProfileClient() {
  const params =
    useParams<{
      friendId:
        string;
    }>();

  const router =
    useRouter();

  const [
    profile,
    setProfile
  ] =
    useState<
      FriendProfile | null
    >(
      null
    );

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    error,
    setError
  ] =
    useState("");

  const [
    removeOpen,
    setRemoveOpen
  ] =
    useState(false);

  const [
    removing,
    setRemoving
  ] =
    useState(false);


  useEffect(() => {
    async function loadProfile() {
      const supabase =
        createClient();

      const {
        data,
        error:
          profileError,
      } =
        await supabase.rpc(
          "get_friend_profile",
          {
            target_user_id:
              params.friendId,
          }
        );

      if (
        profileError
      ) {
        setError(
          profileError.message
        );

        setLoading(
          false
        );

        return;
      }

      const firstProfile =
        (
          data ??
          []
        )[0] as
          FriendProfile | undefined;

      if (
        !firstProfile
      ) {
        setError(
          "This profile is unavailable or this person is no longer your friend."
        );

        setLoading(
          false
        );

        return;
      }

      setProfile(
        firstProfile
      );

      setLoading(
        false
      );
    }

    void loadProfile();
  }, [
    params.friendId,
  ]);


  async function removeFriend() {
    if (
      !profile
    ) {
      return;
    }

    setRemoving(
      true
    );

    setError(
      ""
    );

    const supabase =
      createClient();

    const {
      error:
        removeError,
    } =
      await supabase.rpc(
        "remove_friend",
        {
          target_user_id:
            profile.id,
        }
      );

    if (
      removeError
    ) {
      setError(
        removeError.message
      );

      setRemoving(
        false
      );

      return;
    }

    router.replace(
      "/friends"
    );

    router.refresh();
  }


  if (
    loading
  ) {
    return (
      <main
        className="
          min-h-screen
          bg-black
          p-8
          text-white
        "
      >
        Loading player profile…
      </main>
    );
  }


  if (
    !profile
  ) {
    return (
      <main
        className="
          min-h-screen
          bg-black
          p-8
          text-white
        "
      >
        <div
          className="
            mx-auto
            max-w-2xl
            rounded-3xl
            border
            border-red-500/20
            bg-red-950/10
            p-8
          "
        >
          <h1
            className="
              text-3xl
              font-black
            "
          >
            Profile unavailable
          </h1>

          <p
            className="
              mt-3
              text-zinc-400
            "
          >
            {error}
          </p>

          <Link
            href="/friends"
            className="
              mt-6
              inline-flex
              rounded-xl
              bg-white
              px-5
              py-3
              font-black
              text-black
            "
          >
            Back to Friends
          </Link>
        </div>
      </main>
    );
  }


  const joinedDate =
    new Date(
      profile.friends_since
    ).toLocaleDateString(
      undefined,
      {
        year:
          "numeric",

        month:
          "long",

        day:
          "numeric",
      }
    );


  return (
    <main
      className="
        min-h-screen
        bg-black
        p-6
        pb-20
        text-white

        md:p-10
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
            items-center
            justify-between
            gap-4
          "
        >
          <Link
            href="/friends"
            className="
              rounded-xl
              border
              border-white/10
              bg-zinc-950
              px-4
              py-2
              font-bold
              text-zinc-300
            "
          >
            ← Friends
          </Link>

          <button
            type="button"
            onClick={() =>
              setRemoveOpen(
                true
              )
            }
            className="
              rounded-xl
              border
              border-red-500/25
              bg-red-950/20
              px-4
              py-2
              font-bold
              text-red-200
            "
          >
            Remove Friend
          </button>
        </div>


        {error && (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-red-900
              bg-red-950/35
              p-3
              text-sm
              text-red-200
            "
          >
            {error}
          </div>
        )}


        <section
          className="
            mt-6
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-gradient-to-b
            from-zinc-900
            to-black
            p-6

            md:p-10
          "
        >
          <div
            className="
              grid
              items-center
              gap-8

              lg:grid-cols-[440px_1fr]
            "
          >
            <div
              className="
                flex
                justify-center
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-black/35
                py-5
              "
            >
              <CharacterDisplay
                snapshot={
                  toSnapshot(
                    profile
                  )
                }
                scale={
                  0.82
                }
                showName={
                  false
                }
                showTitle={
                  false
                }
                showLevel={
                  false
                }
              />
            </div>


            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-zinc-500
                "
              >
                @{profile.username}
              </p>

              <h1
                className="
                  mt-3
                  text-5xl
                  font-black

                  md:text-7xl
                "
              >
                {profile.display_name}
              </h1>

              <p
                className="
                  mt-3
                  text-xl
                  font-semibold
                  text-yellow-300
                "
              >
                {profile.equipped_title
                  ? `“${profile.equipped_title}”`
                  : "No title equipped"}
              </p>

              <div
                className="
                  mt-5
                  inline-flex
                  rounded-full
                  bg-white
                  px-4
                  py-2
                  font-black
                  text-black
                "
              >
                Level {profile.level}
              </div>

              <p
                className="
                  mt-5
                  text-sm
                  text-zinc-500
                "
              >
                Friends since {joinedDate}
              </p>


              <div
                className="
                  mt-8
                  grid
                  grid-cols-2
                  gap-3

                  sm:gap-4
                "
              >
                <ProfileProgress
                  label="Daily tasks today"
                  completed={
                    profile.daily_completed_today
                  }
                  total={
                    profile.daily_tasks_total
                  }
                  icon="✅"
                />

                <ProfileProgress
                  label="Skill tree"
                  completed={
                    profile.skill_nodes_completed
                  }
                  total={
                    profile.skill_nodes_total
                  }
                  icon="🌳"
                />
              </div>


              <section
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-5
                "
              >
                <p
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-zinc-500
                  "
                >
                  Privacy
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-zinc-400
                  "
                >
                  You can see this player’s public character and summary progress. Their task names, skill-node details, calendar, budgets, and private journey data remain hidden.
                </p>
              </section>
            </div>
          </div>
        </section>
      </div>


      {removeOpen && (
        <div
          className="
            fixed
            inset-0
            z-[500]
            flex
            items-center
            justify-center
            bg-black/80
            p-5
            backdrop-blur-md
          "
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setRemoveOpen(
                false
              );
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-red-500/25
              bg-zinc-950
              p-6
              shadow-[0_30px_100px_rgba(0,0,0,.65)]
            "
          >
            <h2
              className="
                text-2xl
                font-black
              "
            >
              Remove {profile.display_name}?
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-zinc-400
              "
            >
              You will both disappear from each other’s friends lists. Either person can send a new request later.
            </p>

            <div
              className="
                mt-6
                flex
                justify-end
                gap-3
              "
            >
              <button
                type="button"
                onClick={() =>
                  setRemoveOpen(
                    false
                  )
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
                type="button"
                onClick={
                  removeFriend
                }
                disabled={
                  removing
                }
                className="
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2
                  font-black

                  disabled:opacity-50
                "
              >
                {removing
                  ? "Removing…"
                  : "Remove Friend"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}


function ProfileProgress({
  label,
  completed,
  total,
  icon,
}: {
  label:
    string;

  completed:
    number;

  total:
    number;

  icon:
    string;
}) {
  const safeTotal =
    Math.max(
      0,
      total
    );

  const safeCompleted =
    Math.max(
      0,
      completed
    );

  const percent =
    safeTotal >
      0
      ? Math.min(
          100,
          Math.round(
            (
              safeCompleted /
              safeTotal
            ) *
              100
          )
        )
      : 0;

  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.035]
        p-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <span
          className="
            text-2xl
          "
        >
          {icon}
        </span>

        <span
          className="
            text-sm
            font-bold
            text-zinc-500
          "
        >
          {safeCompleted} / {safeTotal}
        </span>
      </div>

      <p
        className="
          mt-4
          font-black
        "
      >
        {label}
      </p>

      <div
        className="
          mt-3
          h-3
          overflow-hidden
          rounded-full
          border
          border-white/10
          bg-zinc-900
          p-0.5
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-violet-600
            via-fuchsia-500
            to-white
          "
          style={{
            width:
              `${percent}%`,
          }}
        />
      </div>

      <p
        className="
          mt-2
          text-xs
          text-zinc-600
        "
      >
        {percent}% complete
      </p>
    </div>
  );
}
