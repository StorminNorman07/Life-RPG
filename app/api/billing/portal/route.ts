import Stripe from "stripe";
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
    return NextResponse.json({ error: "Sign in to manage billing." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("premium_entitlements")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.stripe_customer_id) {
    return NextResponse.json({ error: "There is no Stripe billing profile to manage yet." }, { status: 404 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Billing management is not configured yet." }, { status: 503 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${appUrl}/shop`,
    });
    return NextResponse.json({ url: session.url });
  } catch (cause) {
    console.error("Stripe billing portal could not be opened:", cause);
    return NextResponse.json({ error: "Billing management could not be opened. Try again." }, { status: 502 });
  }
}
