import Stripe from "stripe";
import { NextResponse } from "next/server";

import { coinPacks } from "@/data/shopCatalog";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const priceIds: Record<string, string | undefined> = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  premium_lifetime: process.env.STRIPE_PRICE_PREMIUM_LIFETIME,
  coins_50: process.env.STRIPE_PRICE_COINS_50,
  coins_800: process.env.STRIPE_PRICE_COINS_800,
  coins_2000: process.env.STRIPE_PRICE_COINS_2000,
};

const subscriptionProducts = new Set([
  "premium_monthly",
  "premium_yearly",
]);

const premiumProducts = new Set([
  "premium_monthly",
  "premium_yearly",
  "premium_lifetime",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in before checking out." }, { status: 401 });
  }

  let productKey = "";
  try {
    const body = await request.json();
    productKey = typeof body.productKey === "string" ? body.productKey : "";
  } catch {
    return NextResponse.json({ error: "Choose a valid shop product." }, { status: 400 });
  }

  if (!Object.prototype.hasOwnProperty.call(priceIds, productKey)) {
    return NextResponse.json({ error: "That shop product is not available." }, { status: 400 });
  }

  const priceId = priceIds[productKey];
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;

  if (!secretKey || !priceId) {
    return NextResponse.json(
      { error: "Secure checkout is not configured yet. Add the Stripe secret and price IDs to the app settings." },
      { status: 503 }
    );
  }

  if (premiumProducts.has(productKey)) {
    const { error } = await supabase.rpc("start_premium_trial");
    if (error) {
      return NextResponse.json({ error: "Premium account setup is not ready." }, { status: 503 });
    }

    const { data: entitlement, error: entitlementError } = await supabase
      .from("premium_entitlements")
      .select("premium_lifetime, stripe_subscription_id, stripe_subscription_until")
      .eq("user_id", user.id)
      .single();

    if (entitlementError || !entitlement) {
      return NextResponse.json({ error: "Premium account status could not be loaded." }, { status: 503 });
    }

    if (entitlement.premium_lifetime) {
      return NextResponse.json({ error: "Your account already has lifetime Premium." }, { status: 409 });
    }

    const subscriptionActive = Boolean(
      entitlement.stripe_subscription_id &&
      entitlement.stripe_subscription_until &&
      Date.parse(entitlement.stripe_subscription_until) > Date.now()
    );
    if (subscriptionActive) {
      return NextResponse.json({ error: "Your account already has an active Premium subscription. Manage that plan before starting another." }, { status: 409 });
    }
  }

  const stripe = new Stripe(secretKey);
  const mode = subscriptionProducts.has(productKey) ? "subscription" : "payment";
  const productLabel = coinPacks.find((pack) => pack.id === productKey)?.coins
    ? `${coinPacks.find((pack) => pack.id === productKey)?.coins} Coins`
    : productKey;

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email?.endsWith("@users.life-rpg.invalid")
        ? undefined
        : user.email ?? undefined,
      ...(mode === "payment" ? { customer_creation: "always" as const } : {}),
      metadata: {
        app_user_id: user.id,
        product_key: productKey,
        product_label: productLabel,
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                app_user_id: user.id,
                product_key: productKey,
              },
            },
          }
        : {
            payment_intent_data: {
              metadata: {
                app_user_id: user.id,
                product_key: productKey,
              },
            },
          }),
      success_url: `${appUrl}/shop?purchase=success`,
      cancel_url: `${appUrl}/shop?purchase=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout could not be opened. Try again." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return NextResponse.json({ error: "Checkout could not be opened. Try again." }, { status: 502 });
  }
}
