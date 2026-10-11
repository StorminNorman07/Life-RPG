import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to purchase character items." }, { status: 401 });
  }

  let cosmeticId = "";
  try {
    const body = await request.json();
    cosmeticId = typeof body.cosmeticId === "string" ? body.cosmeticId.trim() : "";
  } catch {
    return NextResponse.json({ error: "Choose a valid character item." }, { status: 400 });
  }

  if (!cosmeticId || cosmeticId.length > 100) {
    return NextResponse.json({ error: "Choose a valid character item." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("purchase_shop_cosmetic", {
    input_cosmetic_id: cosmeticId,
  });

  if (error) {
    const message = error.message.toLowerCase();
    const expectedIssue =
      message.includes("not enough coins") ||
      message.includes("already own") ||
      message.includes("already unlocked") ||
      message.includes("not available in the shop");

    return NextResponse.json(
      {
        error: expectedIssue
          ? error.message
          : "That item could not be purchased right now.",
      },
      { status: expectedIssue ? 409 : 503 }
    );
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
