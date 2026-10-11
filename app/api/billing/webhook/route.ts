import Stripe from "stripe";
import { NextResponse } from "next/server";

import { admin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const coinPackAmounts: Record<string, number> = {
  coins_50: 50,
  coins_800: 800,
  coins_2000: 2000,
};

function getId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

async function applyCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return;
  }

  const userId = session.metadata?.app_user_id ?? session.client_reference_id;
  const productKey = session.metadata?.product_key;
  if (!userId || !productKey) {
    console.error("Stripe checkout session is missing its app metadata:", session.id);
    return;
  }

  const coinAmount = coinPackAmounts[productKey];
  if (coinAmount) {
    const { error } = await admin.rpc("grant_shop_coin_pack", {
      input_user_id: userId,
      input_coin_amount: coinAmount,
      input_checkout_session_id: session.id,
    });
    if (error) throw error;
    return;
  }

  if (!["premium_monthly", "premium_yearly", "premium_lifetime"].includes(productKey)) {
    console.error("Unknown Stripe product key:", productKey);
    return;
  }

  let subscriptionId: string | null = null;
  let subscriptionUntil: string | null = null;
  if (session.subscription) {
    subscriptionId = getId(session.subscription);
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = subscription.items.data[0]?.current_period_end;
      subscriptionUntil = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
    }
  }

  const { error } = await admin.rpc("apply_premium_checkout", {
    input_user_id: userId,
    input_product_key: productKey,
    input_checkout_session_id: session.id,
    input_customer_id: getId(session.customer),
    input_subscription_id: subscriptionId,
    input_subscription_until: subscriptionUntil,
  });
  if (error) throw error;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.app_user_id;
  if (!userId) return;

  const customerId = getId(subscription.customer);
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const subscriptionUntil = periodEnd
    ? new Date(periodEnd * 1000).toISOString()
    : null;

  const { error } = await admin.rpc("sync_premium_subscription", {
    input_user_id: userId,
    input_subscription_id: subscription.id,
    input_customer_id: customerId,
    input_subscription_until: subscriptionUntil,
  });
  if (error) throw error;
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secretKey || !webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature validation failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await applyCheckoutSession(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.created":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json({ error: "Payment could not be applied yet." }, { status: 500 });
  }
}
