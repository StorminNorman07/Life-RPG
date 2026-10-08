import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to redeem a Premium code." }, { status: 401 });
  }

  let code = "";
  try {
    const body = await request.json();
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    return NextResponse.json({ error: "Enter a valid code." }, { status: 400 });
  }

  if (!code || code.length > 64) {
    return NextResponse.json({ error: "Enter a valid code." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("redeem_premium_code", {
    input_code: code,
  });

  if (error) {
    const invalidCode = error.message.toLowerCase().includes("invalid premium code");
    if (!invalidCode) {
      console.error("Premium code redemption failed:", error.message);
    }
    return NextResponse.json(
      { error: invalidCode ? "That code wasn’t recognized. Check it and try again." : "Code redemption is temporarily unavailable." },
      { status: invalidCode ? 400 : 503 }
    );
  }

  const result = data as {
    is_premium?: boolean;
    is_lifetime?: boolean;
    premium_until?: string | null;
    trial_started_at?: string | null;
    trial_expires_at?: string | null;
    premium_source?: string | null;
  };

  return NextResponse.json({
    isPremium: Boolean(result.is_premium),
    isLifetime: Boolean(result.is_lifetime),
    premiumUntil: result.premium_until ?? null,
    trialStartedAt: result.trial_started_at ?? null,
    trialEndsAt: result.trial_expires_at ?? null,
    source: result.premium_source ?? null,
  });
}
