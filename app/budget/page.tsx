import {
  redirect,
} from "next/navigation";

import BudgetClient from "./BudgetClient";

import {
  createClient,
} from "@/utils/supabase/server";


export default async function BudgetPage() {
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
    <BudgetClient />
  );
}
