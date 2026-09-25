"use client";

import {
  Suspense,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  createClient,
} from "@/utils/supabase/client";


function getSafeReturnPath(
  value:
    string | null
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/settings") ||
    value.startsWith("/login") ||
    value.startsWith("/signup")
  ) {
    return "/";
  }

  return value;
}


function SettingsPageContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const returnPath =
    getSafeReturnPath(
      searchParams.get(
        "from"
      )
    );

  const [
    username,
    setUsername
  ] =
    useState("");

  const [
    displayName,
    setDisplayName
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState("");

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    savingProfile,
    setSavingProfile
  ] =
    useState(false);

  const [
    savingPassword,
    setSavingPassword
  ] =
    useState(false);

  const [
    profileMessage,
    setProfileMessage
  ] =
    useState("");

  const [
    passwordMessage,
    setPasswordMessage
  ] =
    useState("");

  const [
    error,
    setError
  ] =
    useState("");

  const [
    deleteOpen,
    setDeleteOpen
  ] =
    useState(false);

  const [
    deleteConfirmation,
    setDeleteConfirmation
  ] =
    useState("");

  const [
    deleting,
    setDeleting
  ] =
    useState(false);


  useEffect(() => {
    async function loadProfile() {
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
        router.replace(
          "/login"
        );

        return;
      }


      const {
        data:
          profile,
      } =
        await supabase
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
          .single();


      if (
        profile
      ) {
        setUsername(
          profile.username
        );

        setDisplayName(
          profile.display_name
        );
      }


      setLoading(
        false
      );
    }


    void loadProfile();
  }, [
    router,
  ]);


  async function saveProfile(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(
      ""
    );

    setProfileMessage(
      ""
    );

    setSavingProfile(
      true
    );


    const response =
      await fetch(
        "/api/account/profile",
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              username,

              displayName,
            }),
        }
      );


    const result =
      await response.json();


    if (
      !response.ok
    ) {
      setError(
        result.error ??
          "Profile update failed."
      );

      setSavingProfile(
        false
      );

      return;
    }


    setUsername(
      result.username
    );

    setDisplayName(
      result.displayName
    );

    setProfileMessage(
      "Profile updated."
    );

    const updatedAccount = {
      username:
        result.username,

      displayName:
        result.displayName,
    };

    localStorage.setItem(
      "account-profile-cache",
      JSON.stringify(
        updatedAccount
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        "account-profile-updated",
        {
          detail:
            updatedAccount,
        }
      )
    );

    setSavingProfile(
      false
    );

    router.refresh();
  }


  async function savePassword(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(
      ""
    );

    setPasswordMessage(
      ""
    );


    if (
      newPassword.length <
      6
    ) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "The passwords do not match."
      );

      return;
    }


    setSavingPassword(
      true
    );

    const supabase =
      createClient();

    const {
      error:
        passwordError,
    } =
      await supabase.auth.updateUser({
        password:
          newPassword,
      });


    if (
      passwordError
    ) {
      setError(
        passwordError.message
      );

      setSavingPassword(
        false
      );

      return;
    }


    setNewPassword(
      ""
    );

    setConfirmPassword(
      ""
    );

    setPasswordMessage(
      "Password changed."
    );

    setSavingPassword(
      false
    );
  }


  async function logOut() {
    const supabase =
      createClient();

    await supabase.auth.signOut();

    router.replace(
      "/login"
    );

    router.refresh();
  }


  async function deleteAccount() {
    setError(
      ""
    );

    setDeleting(
      true
    );


    const response =
      await fetch(
        "/api/account/delete",
        {
          method:
            "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              confirmation:
                deleteConfirmation,
            }),
        }
      );


    const result =
      await response.json();


    if (
      !response.ok
    ) {
      setError(
        result.error ??
          "Account deletion failed."
      );

      setDeleting(
        false
      );

      return;
    }


    const supabase =
      createClient();

    await supabase.auth.signOut();

    localStorage.clear();

    router.replace(
      "/signup"
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
        Loading settings…
      </main>
    );
  }


  return (
    <main
      className="
        min-h-screen
        bg-black
        px-6
        pb-20
        pt-[max(1.5rem,env(safe-area-inset-top))]
        text-white

        md:p-10
      "
    >
      <div
        className="
          mx-auto
          max-w-4xl
        "
      >
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
                text-xs
                font-black
                uppercase
                tracking-[0.22em]
                text-zinc-500
              "
            >
              Account
            </p>

            <h1
              className="
                mt-2
                text-4xl
                font-black
              "
            >
              ⚙️ Settings
            </h1>

            <p
              className="
                mt-3
                text-zinc-400
              "
            >
              Manage how friends identify you and control your account.
            </p>
          </div>


          <button
            type="button"
            onClick={() =>
              router.replace(
                returnPath
              )
            }
            aria-label="Close settings"
            title="Close settings"
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-zinc-950
              text-xl
              font-black
              text-zinc-300
              transition

              hover:border-white/25
              hover:bg-zinc-900
              hover:text-white
            "
          >
            ×
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


        <div
          className="
            mt-8
            grid
            gap-6
          "
        >
          <SettingsCard
            title="Public profile"
            description="Your display name appears on your character and friend card. Friends search for your unique username."
          >
            <form
              onSubmit={
                saveProfile
              }
              className="
                space-y-5
              "
            >
              <SettingsField
                label="Display name"
                value={
                  displayName
                }
                onChange={
                  setDisplayName
                }
                autoComplete="name"
              />

              <SettingsField
                label="Username"
                value={
                  username
                }
                onChange={(
                  value
                ) =>
                  setUsername(
                    value
                      .toLowerCase()
                      .replace(
                        /[^a-z0-9_]/g,
                        ""
                      )
                  )
                }
                autoComplete="username"
              />

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <button
                  type="submit"
                  disabled={
                    savingProfile
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
                  {savingProfile
                    ? "Saving…"
                    : "Save profile"}
                </button>

                {profileMessage && (
                  <span
                    className="
                      text-sm
                      font-bold
                      text-green-300
                    "
                  >
                    {profileMessage}
                  </span>
                )}
              </div>
            </form>
          </SettingsCard>


          <SettingsCard
            title="Password"
            description="Changing your password signs future logins over to the new password immediately."
          >
            <form
              onSubmit={
                savePassword
              }
              className="
                space-y-5
              "
            >
              <SettingsField
                label="New password"
                value={
                  newPassword
                }
                onChange={
                  setNewPassword
                }
                type="password"
                autoComplete="new-password"
              />

              <SettingsField
                label="Confirm new password"
                value={
                  confirmPassword
                }
                onChange={
                  setConfirmPassword
                }
                type="password"
                autoComplete="new-password"
              />

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <button
                  type="submit"
                  disabled={
                    savingPassword
                  }
                  className="
                    rounded-xl
                    border
                    border-white/15
                    bg-zinc-950
                    px-5
                    py-3
                    font-black

                    disabled:opacity-50
                  "
                >
                  {savingPassword
                    ? "Changing…"
                    : "Change password"}
                </button>

                {passwordMessage && (
                  <span
                    className="
                      text-sm
                      font-bold
                      text-green-300
                    "
                  >
                    {passwordMessage}
                  </span>
                )}
              </div>
            </form>
          </SettingsCard>


          <SettingsCard
            title="Session"
            description="Log out of this browser without deleting your character or account."
          >
            <button
              type="button"
              onClick={
                logOut
              }
              className="
                rounded-xl
                border
                border-white/15
                bg-zinc-950
                px-5
                py-3
                font-black
              "
            >
              Log out
            </button>
          </SettingsCard>


          <section
            className="
              rounded-3xl
              border
              border-red-500/20
              bg-red-950/10
              p-6

              md:p-8
            "
          >
            <h2
              className="
                text-2xl
                font-black
                text-red-200
              "
            >
              Danger zone
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-zinc-500
              "
            >
              Deleting your account permanently removes your login, social profile, friendships, and cloud data. This cannot be undone.
            </p>

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmation(
                  ""
                );

                setDeleteOpen(
                  true
                );
              }}
              className="
                mt-5
                rounded-xl
                border
                border-red-500/30
                bg-red-950/35
                px-5
                py-3
                font-black
                text-red-200
                transition

                hover:bg-red-900/40
              "
            >
              Delete account
            </button>
          </section>
        </div>
      </div>


      {deleteOpen && (
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
              setDeleteOpen(
                false
              );
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
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
              id="delete-account-title"
              className="
                text-2xl
                font-black
                text-red-200
              "
            >
              Permanently delete account?
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-zinc-400
              "
            >
              This removes the account and all linked social data. Your browser’s locally stored game data will also be cleared.
            </p>

            <label
              className="
                mt-5
                block
              "
            >
              <span
                className="
                  text-sm
                  font-black
                "
              >
                Type DELETE to confirm
              </span>

              <input
                value={
                  deleteConfirmation
                }
                onChange={(
                  event
                ) =>
                  setDeleteConfirmation(
                    event.target.value
                  )
                }
                autoFocus
                className="
                  mt-2
                  w-full
                  rounded-xl
                  border
                  border-red-500/25
                  bg-black
                  px-4
                  py-3
                  outline-none

                  focus:border-red-400
                  focus:ring-2
                  focus:ring-red-500/15
                "
              />
            </label>

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
                  setDeleteOpen(
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
                  deleteAccount
                }
                disabled={
                  deleting ||
                  deleteConfirmation
                    .trim()
                    .toUpperCase() !==
                    "DELETE"
                }
                className="
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2
                  font-black
                  text-white

                  disabled:cursor-not-allowed
                  disabled:opacity-35
                "
              >
                {deleting
                  ? "Deleting…"
                  : "Delete forever"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}


export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <main
          className="
            min-h-screen
            bg-black
            p-8
            text-white
          "
        >
          Loading settings…
        </main>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}


function SettingsCard({
  title,
  description,
  children,
}: {
  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-white/10
        bg-zinc-950/75
        p-6
        backdrop-blur-xl

        md:p-8
      "
    >
      <h2
        className="
          text-2xl
          font-black
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-2
          max-w-2xl
          text-sm
          leading-6
          text-zinc-500
        "
      >
        {description}
      </p>

      <div
        className="
          mt-6
        "
      >
        {children}
      </div>
    </section>
  );
}


function SettingsField({
  label,
  value,
  onChange,
  type =
    "text",
  autoComplete,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  type?:
    string;

  autoComplete:
    string;
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          text-sm
          font-black
        "
      >
        {label}
      </span>

      <input
        type={
          type
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        autoComplete={
          autoComplete
        }
        required
        className="
          mt-2
          w-full
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
    </label>
  );
}
