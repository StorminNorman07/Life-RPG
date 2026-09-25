import {
  redirect,
} from "next/navigation";

import FriendProfileClient from "./FriendProfileClient";

import {
  createClient,
} from "@/utils/supabase/server";


export default async function FriendProfilePage() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (
    !user
  ) {
    redirect(
      "/login"
    );
  }

  return (
    <FriendProfileClient />
  );
}
