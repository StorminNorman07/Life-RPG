import {
  redirect,
} from "next/navigation";

import CalendarClient from "./CalendarClient";

import {
  createClient,
} from "@/utils/supabase/server";


export default async function CalendarPage() {
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
    <CalendarClient />
  );
}
