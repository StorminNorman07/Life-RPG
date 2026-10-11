import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to view your coin balance." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("get_shop_wallet_status");
  if (error) {
    console.error("Shop wallet could not be loaded:", error.message);
    return NextResponse.json({ error: "Your shop balance could not be loaded." }, { status: 503 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
