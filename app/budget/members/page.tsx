import {
  redirect,
} from "next/navigation";

import BudgetMembersClient from "./BudgetMembersClient";

import {
  createClient,
} from "@/utils/supabase/server";


export default async function BudgetMembersPage({
  searchParams,
}: {
  searchParams:
    Promise<{
      budget?:
        string;
    }>;
}) {
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

  const params =
    await searchParams;

  if (
    !params.budget
  ) {
    redirect(
      "/budget"
    );
  }

  return (
    <BudgetMembersClient
      budgetId={
        params.budget
      }
      currentUserId={
        user.id
      }
    />
  );
}
