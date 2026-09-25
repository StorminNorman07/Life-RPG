"use client";

import Link from "next/link";

import {
  useState,
  type FormEvent,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/utils/supabase/client";


function normalizeUsername(
  value:
    string
) {
  return value
    .trim()
    .toLowerCase();
}


function usernameToInternalEmail(
  username:
    string
) {
  return `${username}@users.life-rpg.invalid`;
}


export default function SignupPage() {
  const router =
    useRouter();

  const [
    displayName,
    setDisplayName
  ] =
    useState("");

  const [
    username,
    setUsername
  ] =
    useState("");

  const [
    password,
    setPassword
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState("");

  const [
    error,
    setError
  ] =
    useState("");

  const [
    loading,
    setLoading
  ] =
    useState(false);


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(
      ""
    );

    const cleanUsername =
      normalizeUsername(
        username
      );

    const cleanName =
      displayName.trim();


    if (
      !/^[a-z0-9_]{3,24}$/.test(
        cleanUsername
      )
    ) {
      setError(
        "Username must be 3–24 characters using lowercase letters, numbers, or underscores."
      );

      return;
    }


    if (
      cleanName.length <
      1 ||
      cleanName.length >
      40
    ) {
      setError(
        "Your display name must be between 1 and 40 characters."
      );

      return;
    }


    if (
      password.length <
      6
    ) {
      setError(
        "Your password must contain at least 6 characters."
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {
      setError(
        "The passwords do not match."
      );

      return;
    }


    setLoading(
      true
    );

    const supabase =
      createClient();

    const {
      data,
      error:
        signupError,
    } =
      await supabase.auth.signUp({
        email:
          usernameToInternalEmail(
            cleanUsername
          ),

        password,

        options: {
          data: {
            username:
              cleanUsername,

            display_name:
              cleanName,
          },
        },
      });


    if (
      signupError
    ) {
      const message =
        signupError.message
          .toLowerCase();

      if (
        message.includes(
          "already"
        ) ||
        message.includes(
          "duplicate"
        ) ||
        message.includes(
          "database error"
        )
      ) {
        setError(
          "That username is already taken."
        );
      } else {
        setError(
          signupError.message
        );
      }

      setLoading(
        false
      );

      return;
    }


    if (
      !data.session
    ) {
      setError(
        "The account was created, but Supabase email confirmation is still enabled. Disable Confirm Email in Authentication settings."
      );

      setLoading(
        false
      );

      return;
    }


    router.replace(
      "/"
    );

    router.refresh();
  }


  return (
    <main
      className="
        min-h-screen
        bg-black
        px-5
        py-12
        text-white
      "
    >
      <div
        className="
          mx-auto
          grid
          min-h-[calc(100vh-6rem)]
          max-w-6xl
          items-center
          gap-10

          lg:grid-cols-[1fr_460px]
        "
      >
        <section>
          <p
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.28em]
              text-zinc-500
            "
          >
            Life RPG
          </p>

          <h1
            className="
              mt-4
              max-w-2xl
              text-5xl
              font-black
              leading-tight

              sm:text-7xl
            "
          >
            Connect your existing character.
          </h1>

          <p
            className="
              mt-5
              max-w-xl
              text-lg
              leading-8
              text-zinc-400
            "
          >
            Your customized avatar, title, level, daily progress, and skill-tree summary will become your social profile. Your private goals stay private.
          </p>
        </section>


        <section
          className="
            rounded-[2rem]
            border
            border-white/10
            bg-zinc-950/80
            p-6
            shadow-[0_28px_100px_rgba(0,0,0,.5)]
            backdrop-blur-xl

            sm:p-8
          "
        >
          <h2
            className="
              text-3xl
              font-black
            "
          >
            Create account
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-zinc-500
            "
          >
            Your username is how friends will find you.
          </p>


          <form
            onSubmit={
              handleSubmit
            }
            className="
              mt-7
              space-y-5
            "
          >
            <AuthField
              label="Display name"
              value={
                displayName
              }
              onChange={
                setDisplayName
              }
              placeholder="Norman"
              autoComplete="name"
            />

            <AuthField
              label="Username"
              value={
                username
              }
              onChange={
                setUsername
              }
              placeholder="norman"
              autoComplete="username"
            />

            <AuthField
              label="Password"
              value={
                password
              }
              onChange={
                setPassword
              }
              placeholder="At least 6 characters"
              type="password"
              autoComplete="new-password"
            />

            <AuthField
              label="Confirm password"
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
              placeholder="Enter it again"
              type="password"
              autoComplete="new-password"
            />


            {error && (
              <p
                className="
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
              </p>
            )}


            <button
              type="submit"
              disabled={
                loading
              }
              className="
                w-full
                rounded-xl
                bg-white
                px-5
                py-3.5
                font-black
                text-black
                transition

                hover:bg-zinc-200
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Creating account…"
                : "Create account"}
            </button>
          </form>


          <p
            className="
              mt-6
              text-center
              text-sm
              text-zinc-500
            "
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="
                font-bold
                text-white
                hover:underline
              "
            >
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}


function AuthField({
  label,
  value,
  onChange,
  placeholder,
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

  placeholder:
    string;

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
        placeholder={
          placeholder
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
          transition

          placeholder:text-zinc-700
          focus:border-white/30
          focus:ring-2
          focus:ring-white/10
        "
      />
    </label>
  );
}
