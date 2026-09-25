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


export default function LoginPage() {
  const router =
    useRouter();

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


    if (
      !cleanUsername ||
      !password
    ) {
      setError(
        "Enter your username and password."
      );

      return;
    }


    setLoading(
      true
    );

    const supabase =
      createClient();

    const {
      error:
        loginError,
    } =
      await supabase.auth.signInWithPassword({
        email:
          usernameToInternalEmail(
            cleanUsername
          ),

        password,
      });


    if (
      loginError
    ) {
      setError(
        "Incorrect username or password."
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
        flex
        min-h-screen
        items-center
        justify-center
        bg-black
        px-5
        py-12
        text-white
      "
    >
      <section
        className="
          w-full
          max-w-md
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
        <p
          className="
            text-xs
            font-black
            uppercase
            tracking-[0.25em]
            text-zinc-500
          "
        >
          Life RPG
        </p>

        <h1
          className="
            mt-3
            text-4xl
            font-black
          "
        >
          Welcome back
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-zinc-500
          "
        >
          Continue building your character.
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
              Username
            </span>

            <input
              value={
                username
              }
              onChange={(
                event
              ) =>
                setUsername(
                  event.target.value
                )
              }
              autoComplete="username"
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

                focus:border-white/30
                focus:ring-2
                focus:ring-white/10
              "
            />
          </label>


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
              Password
            </span>

            <input
              type="password"
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="current-password"
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

                focus:border-white/30
                focus:ring-2
                focus:ring-white/10
              "
            />
          </label>


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
              ? "Logging in…"
              : "Log in"}
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
          Need an account?{" "}
          <Link
            href="/signup"
            className="
              font-bold
              text-white
              hover:underline
            "
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
