"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

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


type SearchProfile = {
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
};


type IncomingRequest =
  SearchProfile & {
    request_id:
      string;

    sender_id:
      string;

    created_at:
      string;
  };


type OutgoingRequest = {
  request_id:
    string;

  receiver_id:
    string;

  username:
    string;

  display_name:
    string;

  avatar_data:
    AvatarData;

  created_at:
    string;
};


type FriendSummary =
  SearchProfile & {
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


function toCharacterSnapshot(
  profile:
    SearchProfile
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

function reportAchievementMetric(metric: string, value: number, mode: "set" | "increment" | "max" = "set") {
  window.dispatchEvent(new CustomEvent("achievement-metric", { detail: { metric, value, mode } }));
}

export default function FriendsClient() {
  const [
    query,
    setQuery
  ] =
    useState("");

  const [
    results,
    setResults
  ] =
    useState<
      SearchProfile[]
    >([]);

  const [
    incoming,
    setIncoming
  ] =
    useState<
      IncomingRequest[]
    >([]);

  const [
    outgoing,
    setOutgoing
  ] =
    useState<
      OutgoingRequest[]
    >([]);

  const [
    friends,
    setFriends
  ] =
    useState<
      FriendSummary[]
    >([]);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    searching,
    setSearching
  ] =
    useState(false);

  const [
    message,
    setMessage
  ] =
    useState("");

  const [
    error,
    setError
  ] =
    useState("");


  const refreshSocialData =
    useCallback(
      async () => {
        const supabase =
          createClient();

        const [
          friendResponse,
          incomingResponse,
          outgoingResponse,
        ] =
          await Promise.all([
            supabase.rpc(
              "get_friend_summaries"
            ),

            supabase.rpc(
              "get_incoming_friend_requests"
            ),

            supabase.rpc(
              "get_outgoing_friend_requests"
            ),
          ]);

        const firstError =
          friendResponse.error ??
          incomingResponse.error ??
          outgoingResponse.error;

        if (
          firstError
        ) {
          setError(
            firstError.message
          );

          setLoading(
            false
          );

          return;
        }

        const nextFriends = (friendResponse.data ?? []) as FriendSummary[];
        setFriends(nextFriends);
        reportAchievementMetric("friendCount", nextFriends.length);

        setIncoming(
          (
            incomingResponse.data ??
            []
          ) as
            IncomingRequest[]
        );

        setOutgoing(
          (
            outgoingResponse.data ??
            []
          ) as
            OutgoingRequest[]
        );

        setLoading(
          false
        );
      },
      []
    );


  useEffect(() => {
    void refreshSocialData();
  }, [
    refreshSocialData,
  ]);


  async function searchUsers(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanQuery =
      query.trim();

    setMessage(
      ""
    );

    setError(
      ""
    );

    if (
      cleanQuery.length <
      2
    ) {
      setError(
        "Enter at least two characters."
      );

      return;
    }

    setSearching(
      true
    );

    const supabase =
      createClient();

    const {
      data,
      error:
        searchError,
    } =
      await supabase.rpc(
        "search_profiles",
        {
          search_text:
            cleanQuery,
        }
      );

    if (
      searchError
    ) {
      setError(
        searchError.message
      );

      setSearching(
        false
      );

      return;
    }

    setResults(
      (
        data ??
        []
      ) as
        SearchProfile[]
    );

    setSearching(
      false
    );
  }


  async function sendRequest(
    receiverId:
      string
  ) {
    setMessage(
      ""
    );

    setError(
      ""
    );

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
      setError(
        "You are no longer signed in."
      );

      return;
    }

    const {
      error:
        requestError,
    } =
      await supabase
        .from(
          "friend_requests"
        )
        .insert({
          sender_id:
            user.id,

          receiver_id:
            receiverId,
        });

    if (
      requestError
    ) {
      setError(
        requestError.code ===
          "23505"
          ? "A pending request already exists between these accounts."
          : requestError.message
      );

      return;
    }

    setMessage(
      "Friend request sent."
    );
    reportAchievementMetric("friendRequestsSent", 1, "increment");

    await refreshSocialData();
  }


  async function acceptRequest(
    requestId:
      string
  ) {
    setMessage(
      ""
    );

    setError(
      ""
    );

    const supabase =
      createClient();

    const {
      error:
        acceptError,
    } =
      await supabase.rpc(
        "accept_friend_request",
        {
          request_id:
            requestId,
        }
      );

    if (
      acceptError
    ) {
      setError(
        acceptError.message
      );

      return;
    }

    setMessage(
      "Friend request accepted."
    );
    reportAchievementMetric("friendRequestsAccepted", 1, "increment");

    await refreshSocialData();
  }


  async function declineRequest(
    requestId:
      string
  ) {
    setMessage(
      ""
    );

    setError(
      ""
    );

    const supabase =
      createClient();

    const {
      error:
        declineError,
    } =
      await supabase.rpc(
        "decline_friend_request",
        {
          request_id:
            requestId,
        }
      );

    if (
      declineError
    ) {
      setError(
        declineError.message
      );

      return;
    }

    setMessage(
      "Friend request declined."
    );

    await refreshSocialData();
  }


  function isAlreadyFriend(
    profileId:
      string
  ) {
    return friends.some(
      (
        friend
      ) =>
        friend.id ===
        profileId
    );
  }


  function hasPendingRequest(
    profileId:
      string
  ) {
    return (
      outgoing.some(
        (
          request
        ) =>
          request.receiver_id ===
          profileId
      ) ||
      incoming.some(
        (
          request
        ) =>
          request.sender_id ===
          profileId
      )
    );
  }


  return (
    <div
      className="
        mt-8
        space-y-7
      "
    >
      <section
        className="
          rounded-3xl
          border
          border-white/10
          bg-zinc-950/75
          p-5
          backdrop-blur-xl

          md:p-7
        "
      >
        <p
          className="
            text-xs
            font-black
            uppercase
            tracking-[0.2em]
            text-zinc-500
          "
        >
          Find players
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-black
          "
        >
          Search by username
        </h2>

        <form
          onSubmit={
            searchUsers
          }
          className="
            mt-5
            flex
            flex-col
            gap-3

            sm:flex-row
          "
        >
          <input
            value={
              query
            }
            onChange={(
              event
            ) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search @username"
            className="
              min-w-0
              flex-1
              rounded-xl
              border
              border-white/10
              bg-black
              px-4
              py-3
              outline-none

              focus:border-white/30
              focus:ring-2
              focus:ring-white/10
            "
          />

          <button
            type="submit"
            disabled={
              searching
            }
            className="
              rounded-xl
              bg-white
              px-5
              py-3
              font-black
              text-black

              disabled:opacity-50
            "
          >
            {searching
              ? "Searching…"
              : "Search"}
          </button>
        </form>

        {results.length >
          0 && (
          <div
            className="
              mt-5
              grid
              gap-3
            "
          >
            {results.map(
              (
                profile
              ) => {
                const friend =
                  isAlreadyFriend(
                    profile.id
                  );

                const pending =
                  hasPendingRequest(
                    profile.id
                  );

                return (
                  <div
                    key={
                      profile.id
                    }
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-white/10
                      bg-black/45
                      p-4
                    "
                  >
                    <MiniAvatar
                      name={
                        profile.display_name
                      }
                    />

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          truncate
                          font-black
                        "
                      >
                        {profile.display_name}
                      </p>

                      <p
                        className="
                          truncate
                          text-sm
                          text-zinc-500
                        "
                      >
                        @{profile.username} · {profile.equipped_title} · Level {profile.level}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        friend ||
                        pending
                      }
                      onClick={() =>
                        void sendRequest(
                          profile.id
                        )
                      }
                      className="
                        rounded-xl
                        border
                        border-white/15
                        px-4
                        py-2
                        text-sm
                        font-black

                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {friend
                        ? "Friends"
                        : pending
                        ? "Pending"
                        : "Add friend"}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>


      {(message ||
        error) && (
        <div
          className={`
            rounded-xl
            border
            p-3
            text-sm

            ${
              error
                ? "border-red-900 bg-red-950/35 text-red-200"
                : "border-green-900 bg-green-950/35 text-green-200"
            }
          `}
        >
          {error ||
            message}
        </div>
      )}


      {incoming.length >
        0 && (
        <section
          className="
            rounded-3xl
            border
            border-amber-500/15
            bg-amber-950/10
            p-5

            md:p-7
          "
        >
          <h2
            className="
              text-2xl
              font-black
            "
          >
            Incoming requests
          </h2>

          <div
            className="
              mt-5
              grid
              gap-3
            "
          >
            {incoming.map(
              (
                request
              ) => (
                <div
                  key={
                    request.request_id
                  }
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/45
                    p-4
                  "
                >
                  <MiniAvatar
                    name={
                      request.display_name
                    }
                  />

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <p
                      className="
                        font-black
                      "
                    >
                      {request.display_name}
                    </p>

                    <p
                      className="
                        text-sm
                        text-zinc-500
                      "
                    >
                      @{request.username} · {request.equipped_title} · Level {request.level}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      gap-2
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void acceptRequest(
                          request.request_id
                        )
                      }
                      className="
                        rounded-xl
                        bg-white
                        px-4
                        py-2
                        text-sm
                        font-black
                        text-black
                      "
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void declineRequest(
                          request.request_id
                        )
                      }
                      className="
                        rounded-xl
                        border
                        border-white/10
                        px-4
                        py-2
                        text-sm
                        font-black
                      "
                    >
                      Deny
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}


      <section>
        <div
          className="
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-zinc-500
              "
            >
              Accountability
            </p>

            <h2
              className="
                mt-2
                text-3xl
                font-black
              "
            >
              Your friends
            </h2>
          </div>

          <span
            className="
              rounded-full
              border
              border-white/10
              bg-zinc-950
              px-3
              py-1
              text-sm
              font-bold
              text-zinc-400
            "
          >
            {friends.length}
          </span>
        </div>


        {loading ? (
          <p
            className="
              mt-5
              text-zinc-500
            "
          >
            Loading friends…
          </p>
        ) : friends.length ===
          0 ? (
          <div
            className="
              mt-5
              rounded-3xl
              border
              border-dashed
              border-white/10
              bg-zinc-950/45
              p-10
              text-center
            "
          >
            <p
              className="
                text-4xl
              "
            >
              👥
            </p>

            <h3
              className="
                mt-4
                text-xl
                font-black
              "
            >
              No friends added yet
            </h3>

            <p
              className="
                mt-2
                text-zinc-500
              "
            >
              Search for a username and send your first request.
            </p>
          </div>
        ) : (
          <div
            className="
              mt-5
              grid
              gap-5

              xl:grid-cols-2
            "
          >
            {friends.map(
              (
                friend
              ) => (
                <article
                  key={
                    friend.id
                  }
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/10
                    bg-gradient-to-b
                    from-zinc-900
                    to-black
                    p-5
                    shadow-[0_20px_60px_rgba(0,0,0,.3)]
                  "
                >
                  <div
                    className="
                      grid
                      items-center
                      gap-5

                      md:grid-cols-[175px_1fr]
                    "
                  >
                    <div
                      className="
                        flex
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-black/35
                        py-3
                      "
                    >
                      <CharacterDisplay
                        snapshot={
                          toCharacterSnapshot(
                            friend
                          )
                        }
                        scale={
                          0.38
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
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.18em]
                          text-zinc-500
                        "
                      >
                        @{friend.username}
                      </p>

                      <h3
                        className="
                          mt-2
                          truncate
                          text-3xl
                          font-black
                        "
                      >
                        {friend.display_name}
                      </h3>

                      <p
                        className="
                          mt-1
                          truncate
                          font-semibold
                          text-yellow-300
                        "
                      >
                        {friend.equipped_title
                          ? `“${friend.equipped_title}”`
                          : "No title equipped"}
                      </p>

                      <div
                        className="
                          mt-4
                          inline-flex
                          rounded-full
                          bg-white
                          px-3
                          py-1
                          text-sm
                          font-black
                          text-black
                        "
                      >
                        Level {friend.level}
                      </div>


                      <div
                        className="
                          mt-5
                          space-y-4
                        "
                      >
                        <ProgressBar
                          label="Daily tasks today"
                          completed={
                            friend.daily_completed_today
                          }
                          total={
                            friend.daily_tasks_total
                          }
                        />

                        <ProgressBar
                          label="Skill tree"
                          completed={
                            friend.skill_nodes_completed
                          }
                          total={
                            friend.skill_nodes_total
                          }
                        />
                      </div>


                      <Link
                        href={`/friends/${friend.id}`}
                        onClick={() => reportAchievementMetric("friendProfilesViewed", 1, "increment")}
                        className="
                          mt-5
                          inline-flex
                          w-full
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-white/15
                          bg-white/[0.04]
                          px-4
                          py-3
                          font-black
                          transition

                          hover:border-white/30
                          hover:bg-white/[0.08]
                        "
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}


function MiniAvatar({
  name,
}: {
  name:
    string;
}) {
  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "?";

  return (
    <div
      className="
        flex
        h-14
        w-14
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-white/10
        bg-gradient-to-br
        from-indigo-700
        via-violet-700
        to-fuchsia-700
        text-xl
        font-black
      "
    >
      {initial}
    </div>
  );
}


function ProgressBar({
  label,
  completed,
  total,
}: {
  label:
    string;

  completed:
    number;

  total:
    number;
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
    <div>
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          text-sm
        "
      >
        <span
          className="
            font-bold
            text-zinc-300
          "
        >
          {label}
        </span>

        <span
          className="
            text-zinc-500
          "
        >
          {safeCompleted} / {safeTotal}
        </span>
      </div>

      <div
        className="
          mt-2
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
            transition-all
            duration-500
          "
          style={{
            width:
              `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}
