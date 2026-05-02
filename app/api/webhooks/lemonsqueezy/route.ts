import { NextRequest, NextResponse } from "next/server";

import { upsertPurchase } from "@/lib/db";
import { parseStripeLikeEvent, verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");
  const isValid = verifyStripeWebhookSignature(payload, signatureHeader, process.env.STRIPE_WEBHOOK_SECRET);

  if (!isValid) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 401 });
  }

  const event = parseStripeLikeEvent(payload);

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const obj = event.data?.object;
  const email = obj?.customer_details?.email ?? obj?.customer_email;
  const sessionId = obj?.id;

  if (!email) {
    return NextResponse.json({ ok: false, error: "Missing customer email" }, { status: 400 });
  }

  await upsertPurchase({
    email,
    sessionId,
    source: "stripe",
    purchasedAt: new Date().toISOString(),
    status: "active"
  });

  return NextResponse.json({ ok: true });
}
