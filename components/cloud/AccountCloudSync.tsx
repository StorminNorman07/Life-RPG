"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/utils/supabase/client";


type CloudState =
  Record<
    string,
    string
  >;


type CloudSaveRow = {
  state:
    CloudState;

  version:
    number;

  updated_at:
    string;
};


type ProfileRow = {
  username:
    string | null;

  display_name:
    string | null;
};


type SyncStatus =
  | "loading"
  | "synced"
  | "syncing"
  | "offline"
  | "signed-out"
  | "error";


const CLOUD_VERSION =
  1;

const SYNC_INTERVAL_MS =
  1800;

const SESSION_USER_KEY =
  "life-rpg-loaded-cloud-user";


const publicAuthRoutes = [
  "/login",
  "/signup",
  "/auth",
  "/forgot-password",
  "/reset-password",
];


function isPublicAuthRoute(
  pathname:
    string
) {
  return publicAuthRoutes.some(
    (route) =>
      pathname ===
        route ||
      pathname.startsWith(
        `${route}/`
      )
  );
}


function shouldExcludeKey(
  key:
    string
) {
  const normalized =
    key.toLowerCase();

  return (
    normalized.startsWith(
      "sb-"
    ) ||
    normalized.includes(
      "supabase"
    ) ||
    normalized ===
      "account-profile-cache" ||
    normalized ===
      "life-rpg-cloud-user" ||
    normalized ===
      "life-rpg-cloud-hash"
  );
}


function readLocalAppState():
  CloudState {
  const state:
    CloudState = {};

  for (
    let index = 0;
    index <
      localStorage.length;
    index += 1
  ) {
    const key =
      localStorage.key(
        index
      );

    if (
      !key ||
      shouldExcludeKey(
        key
      )
    ) {
      continue;
    }

    const value =
      localStorage.getItem(
        key
      );

    if (
      value !==
      null
    ) {
      state[key] =
        value;
    }
  }

  return state;
}


function writeLocalAppState(
  state:
    CloudState
) {
  const existingAppKeys:
    string[] = [];

  for (
    let index = 0;
    index <
      localStorage.length;
    index += 1
  ) {
    const key =
      localStorage.key(
        index
      );

    if (
      key &&
      !shouldExcludeKey(
        key
      )
    ) {
      existingAppKeys.push(
        key
      );
    }
  }

  existingAppKeys.forEach(
    (
      key
    ) => {
      if (
        !(key in state)
      ) {
        localStorage.removeItem(
          key
        );
      }
    }
  );

  Object.entries(
    state
  ).forEach(
    (
      [
        key,
        value,
      ]
    ) => {
      if (
        !shouldExcludeKey(
          key
        )
      ) {
        localStorage.setItem(
          key,
          value
        );
      }
    }
  );
}


function applyDisplayNameToPlayer(
  displayName:
    string
) {
  const cleanName =
    displayName.trim();

  if (
    !cleanName
  ) {
    return;
  }

  try {
    const savedPlayer =
      localStorage.getItem(
        "player"
      );

    const player =
      savedPlayer
        ? JSON.parse(
            savedPlayer
          ) as
            Record<
              string,
              unknown
            >
        : {};

    if (
      player.name ===
      cleanName
    ) {
      return;
    }

    localStorage.setItem(
      "player",
      JSON.stringify({
        ...player,
        name:
          cleanName,
      })
    );
  } catch {
    localStorage.setItem(
      "player",
      JSON.stringify({
        name:
          cleanName,
      })
    );
  }
}


function stableSerialize(
  state:
    CloudState
) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(
        state
      ).sort(
        (
          [
            firstKey,
          ],
          [
            secondKey,
          ]
        ) =>
          firstKey.localeCompare(
            secondKey
          )
      )
    )
  );
}


function LoadingScreen({
  message,
  error = false,
}: {
  message:
    string;

  error?:
    boolean;
}) {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-black
        px-6
        text-white
      "
    >
      <div
        className="
          w-full
          max-w-sm
          rounded-3xl
          border
          border-white/10
          bg-zinc-950
          p-8
          text-center
          shadow-2xl
        "
      >
        <div
          className={`
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            text-2xl

            ${
              error
                ? "bg-red-950 text-red-300"
                : "animate-pulse bg-white text-black"
            }
          `}
        >
          {error
            ? "!"
            : "⚔️"}
        </div>

        <p
          className="
            mt-5
            font-black
          "
        >
          {message}
        </p>

        {error && (
          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-5
              rounded-xl
              bg-white
              px-5
              py-3
              font-black
              text-black
            "
          >
            Try again
          </button>
        )}
      </div>
    </main>
  );
}


export default function AccountCloudSync({
  children,
  publicContent,
}: {
  children:
    ReactNode;

  publicContent:
    ReactNode;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const publicRoute =
    isPublicAuthRoute(
      pathname
    );

  const [
    status,
    setStatus
  ] =
    useState<SyncStatus>(
      "loading"
    );

  const [
    lastSyncedAt,
    setLastSyncedAt
  ] =
    useState<Date | null>(
      null
    );

  const [
    ready,
    setReady
  ] =
    useState(
      false
    );

  const activeUserIdRef =
    useRef<string | null>(
      null
    );

  const displayNameRef =
    useRef("");

  const usernameRef =
    useRef("");

  const lastUploadedHashRef =
    useRef("");

  const initializingRef =
    useRef(false);

  const intervalRef =
    useRef<number | null>(
      null
    );


  useEffect(() => {
    const supabase =
      createClient();

    let cancelled =
      false;


    function stopInterval() {
      if (
        intervalRef.current !==
        null
      ) {
        window.clearInterval(
          intervalRef.current
        );

        intervalRef.current =
          null;
      }
    }


    async function uploadCurrentState(
      force =
        false
    ) {
      const userId =
        activeUserIdRef.current;

      if (
        !userId
      ) {
        return false;
      }

      if (
        !navigator.onLine
      ) {
        setStatus(
          "offline"
        );

        return false;
      }

      applyDisplayNameToPlayer(
        displayNameRef.current
      );

      const localState =
        readLocalAppState();

      const serialized =
        stableSerialize(
          localState
        );

      if (
        !force &&
        serialized ===
          lastUploadedHashRef.current
      ) {
        setStatus(
          "synced"
        );

        return true;
      }

      setStatus(
        "syncing"
      );

      const {
        error,
      } =
        await supabase
          .from(
            "user_app_state"
          )
          .upsert(
            {
              user_id:
                userId,

              state:
                localState,

              version:
                CLOUD_VERSION,
            },
            {
              onConflict:
                "user_id",
            }
          );

      if (
        cancelled
      ) {
        return false;
      }

      if (
        error
      ) {
        console.error(
          "Cloud save upload failed:",
          error.message
        );

        setStatus(
          navigator.onLine
            ? "error"
            : "offline"
        );

        return false;
      }

      lastUploadedHashRef.current =
        serialized;

      setLastSyncedAt(
        new Date()
      );

      setStatus(
        "synced"
      );

      return true;
    }


    async function initializeForUser() {
      if (
        initializingRef.current
      ) {
        return;
      }

      initializingRef.current =
        true;

      setStatus(
        "loading"
      );

      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          cancelled
        ) {
          return;
        }

        const user =
          session?.user ??
          null;

        if (
          !user
        ) {
          setReady(
            false
          );

          activeUserIdRef.current =
            null;

          stopInterval();

          setStatus(
            "signed-out"
          );

          return;
        }

        const previousUserId =
          activeUserIdRef.current;

        if (
          previousUserId !==
            user.id
        ) {
          setReady(
            false
          );
        }

        activeUserIdRef.current =
          user.id;

        const [
          profileResponse,
          cloudResponse,
        ] =
          await Promise.all([
            supabase
              .from(
                "profiles"
              )
              .select(
                "username, display_name"
              )
              .eq(
                "id",
                user.id
              )
              .maybeSingle(),

            supabase
              .from(
                "user_app_state"
              )
              .select(
                "state, version, updated_at"
              )
              .eq(
                "user_id",
                user.id
              )
              .maybeSingle(),
          ]);

        if (
          cancelled
        ) {
          return;
        }

        const loadedUserId =
          sessionStorage.getItem(
            SESSION_USER_KEY
          );

        if (
          profileResponse.error ||
          cloudResponse.error
        ) {
          if (
            !navigator.onLine &&
            loadedUserId ===
              user.id
          ) {
            setReady(
              true
            );

            setStatus(
              "offline"
            );

            return;
          }

          console.error(
            "Account bootstrap failed:",
            profileResponse.error
              ?.message ??
              cloudResponse.error
                ?.message
          );

          setStatus(
            "error"
          );

          return;
        }

        const profile =
          profileResponse.data as
            ProfileRow | null;

        const displayName =
          profile?.display_name
            ?.trim() ||
          String(
            user.user_metadata
              ?.display_name ??
              ""
          ).trim() ||
          user.email
            ?.split("@")[0] ||
          "Player";

        const username =
          profile?.username
            ?.trim() ||
          String(
            user.user_metadata
              ?.username ??
              ""
          ).trim() ||
          user.email
            ?.split("@")[0] ||
          "player";

        displayNameRef.current =
          displayName;

        usernameRef.current =
          username;

        localStorage.setItem(
          "account-profile-cache",
          JSON.stringify({
            username,
            displayName,
          })
        );

        const cloudRow =
          cloudResponse.data as
            CloudSaveRow | null;

        const cloudState =
          cloudRow?.state ??
          null;

        const switchedAccounts =
          previousUserId !==
            null &&
          previousUserId !==
            user.id;

        const firstLoadForUser =
          loadedUserId !==
          user.id;

        sessionStorage.setItem(
          SESSION_USER_KEY,
          user.id
        );

        if (
          cloudState
        ) {
          if (
            firstLoadForUser ||
            switchedAccounts
          ) {
            writeLocalAppState(
              cloudState
            );
          }

          applyDisplayNameToPlayer(
            displayName
          );

          lastUploadedHashRef.current =
            stableSerialize(
              cloudState
            );

          if (
            cloudRow?.updated_at
          ) {
            setLastSyncedAt(
              new Date(
                cloudRow.updated_at
              )
            );
          }
        } else {
          if (
            firstLoadForUser ||
            switchedAccounts
          ) {
            /*
             * A brand-new account must start from a clean
             * local state. Never upload the previous user's
             * browser snapshot into this account.
             */
            writeLocalAppState(
              {}
            );
          }

          applyDisplayNameToPlayer(
            displayName
          );

          const uploaded =
            await uploadCurrentState(
              true
            );

          if (
            cancelled
          ) {
            return;
          }

          if (
            !uploaded &&
            navigator.onLine
          ) {
            setReady(
              false
            );

            return;
          }
        }

        setStatus(
          navigator.onLine
            ? "synced"
            : "offline"
        );

        setReady(
          true
        );

        stopInterval();

        intervalRef.current =
          window.setInterval(
            () => {
              void uploadCurrentState();
            },
            SYNC_INTERVAL_MS
          );
      } finally {
        initializingRef.current =
          false;
      }
    }


    function handleOnline() {
      void initializeForUser();
    }


    function handleOffline() {
      if (
        activeUserIdRef.current
      ) {
        setStatus(
          "offline"
        );
      }
    }


    function handleProfileUpdated(
      event:
        Event
    ) {
      const customEvent =
        event as
          CustomEvent<{
            displayName?:
              string;

            username?:
              string;
          }>;

      const nextDisplayName =
        customEvent.detail
          ?.displayName;

      if (
        nextDisplayName
      ) {
        displayNameRef.current =
          nextDisplayName;

        applyDisplayNameToPlayer(
          nextDisplayName
        );
      }

      if (
        customEvent.detail
      ) {
        const nextUsername =
          customEvent.detail
            .username ??
          usernameRef.current;

        usernameRef.current =
          nextUsername;

        localStorage.setItem(
          "account-profile-cache",
          JSON.stringify({
            username:
              nextUsername,

            displayName:
              nextDisplayName ??
              displayNameRef.current,
          })
        );
      }

      void uploadCurrentState(
        true
      );
    }


    function handlePageHide() {
      void uploadCurrentState(
        true
      );
    }


    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    window.addEventListener(
      "account-profile-updated",
      handleProfileUpdated
    );

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session
        ) => {
          if (
            event ===
              "SIGNED_OUT"
          ) {
            sessionStorage.removeItem(
              SESSION_USER_KEY
            );

            activeUserIdRef.current =
              null;

            lastUploadedHashRef.current =
              "";

            stopInterval();

            writeLocalAppState(
              {}
            );

            localStorage.removeItem(
              "account-profile-cache"
            );

            setReady(
              false
            );

            setStatus(
              "signed-out"
            );

            return;
          }

          const sessionUserId =
            session?.user.id ??
            null;

          if (
            sessionUserId &&
            sessionUserId ===
              activeUserIdRef.current
          ) {
            return;
          }

          if (
            event ===
              "SIGNED_IN" ||
            event ===
              "USER_UPDATED" ||
            event ===
              "TOKEN_REFRESHED"
          ) {
            window.setTimeout(
              () => {
                void initializeForUser();
              },
              0
            );
          }
        }
      );

    void initializeForUser();


    return () => {
      cancelled =
        true;

      stopInterval();

      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.removeEventListener(
        "pagehide",
        handlePageHide
      );

      window.removeEventListener(
        "account-profile-updated",
        handleProfileUpdated
      );

      subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    if (
      status ===
        "signed-out" &&
      !publicRoute
    ) {
      const next =
        pathname ===
          "/"
          ? ""
          : `?next=${encodeURIComponent(
              pathname
            )}`;

      router.replace(
        `/login${next}`
      );
    }

    if (
      (
        status ===
          "synced" ||
        status ===
          "offline"
      ) &&
      publicRoute
    ) {
      router.replace(
        "/"
      );
    }
  }, [
    pathname,
    publicRoute,
    router,
    status,
  ]);


  if (
    status ===
      "signed-out" &&
    publicRoute
  ) {
    return (
      <>
        {publicContent}
      </>
    );
  }


  if (
    status ===
      "error" &&
    !ready
  ) {
    return (
      <LoadingScreen
        message="We couldn't load your account safely."
        error
      />
    );
  }


  if (
    !ready &&
    (
      status ===
        "loading" ||
      status ===
        "syncing"
    )
  ) {
    return (
      <LoadingScreen
        message="Loading your Life RPG…"
      />
    );
  }


  if (
    status ===
      "signed-out"
  ) {
    return (
      <LoadingScreen
        message="Taking you to sign in…"
      />
    );
  }


  if (
    publicRoute
  ) {
    return (
      <LoadingScreen
        message="Opening your character…"
      />
    );
  }


  const label =
    status ===
      "syncing"
      ? "Saving…"
      : status ===
        "offline"
      ? "Offline · saved locally"
      : status ===
        "error"
      ? "Cloud save error"
      : "Synced";


  return (
    <>
      {children}

      <div
        className="
          fixed
          bottom-4
          right-4
          z-[400]
          rounded-full
          border
          border-white/10
          bg-black/80
          px-3
          py-2
          text-xs
          font-bold
          text-zinc-400
          shadow-[0_12px_40px_rgba(0,0,0,.35)]
          backdrop-blur-xl
        "
        title={
          lastSyncedAt
            ? `Last synced ${lastSyncedAt.toLocaleTimeString()}`
            : label
        }
      >
        <span
          className="
            mr-2
          "
        >
          {status ===
            "synced"
            ? "●"
            : status ===
              "offline"
            ? "○"
            : status ===
              "error"
            ? "!"
            : "↻"}
        </span>

        {label}
      </div>
    </>
  );
}
