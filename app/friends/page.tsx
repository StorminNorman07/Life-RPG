import { redirect } from "next/navigation";
import FriendsClient from "./FriendsClient";
import { createClient } from "@/utils/supabase/server";

export default async function FriendsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-black p-6 pb-20 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
              Social
            </p>

            <h1 className="mt-2 text-4xl font-black">👥 Friends</h1>

            <p className="mt-3 text-zinc-400">
              Signed in as{" "}
              <strong className="text-white">
                {profile?.display_name ?? "Player"}
              </strong>{" "}
              @{profile?.username}
            </p>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 font-bold transition hover:border-zinc-500"
            >
              Log out
            </button>
          </form>
        </div>

        <FriendsClient />
      </div>
    </main>
  );
}
