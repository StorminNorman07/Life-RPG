import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function getSignedInUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user, error };
}

export async function GET() {
  const { supabase, user, error: authError } = await getSignedInUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to view Premium." }, { status: 401 });
  }

  const { error: trialError } = await supabase.rpc("start_premium_trial");
  if (trialError) {
    console.error("Premium trial initialization failed:", trialError.message);
    return NextResponse.json(
      { error: "Premium setup is not ready. Apply the premium shop database migration and try again." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("premium_entitlements")
    .select("trial_started_at, trial_expires_at, premium_until, premium_lifetime, premium_source, stripe_subscription_until, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    console.error("Premium status read failed:", error?.message);
    return NextResponse.json({ error: "Premium status could not be loaded." }, { status: 503 });
  }

  const isLifetime = Boolean(data.premium_lifetime);
  const entitlementDates = [
    data.premium_until as string | null,
    data.stripe_subscription_until as string | null,
  ].filter((date): date is string => Boolean(date));
  const premiumUntil = entitlementDates
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
  const subscriptionActive = Boolean(
    data.stripe_subscription_until &&
    Date.parse(data.stripe_subscription_until) > Date.now()
  );

  return NextResponse.json({
    isPremium: isLifetime || Boolean(premiumUntil && Date.parse(premiumUntil) > Date.now()),
    isLifetime,
    premiumUntil,
    trialStartedAt: data.trial_started_at,
    trialEndsAt: data.trial_expires_at,
    source: subscriptionActive ? "stripe" : data.premium_source,
    canManageBilling: Boolean(data.stripe_customer_id),
  });
}
