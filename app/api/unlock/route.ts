import { NextRequest, NextResponse } from "next/server";

import { getPurchaseBySession, hasActivePurchase } from "@/lib/db";
import { ACCESS_COOKIE_NAME, createAccessCookieValue } from "@/lib/paywall";

export const runtime = "nodejs";

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    sessionId?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const sessionId = body.sessionId?.trim();

  let unlockedEmail: string | null = null;

  if (sessionId) {
    const purchase = await getPurchaseBySession(sessionId);
    if (purchase?.status === "active") {
      unlockedEmail = purchase.email.toLowerCase();
    }
  }

  if (!unlockedEmail && email) {
    const hasPurchase = await hasActivePurchase(email);
    if (hasPurchase) {
      unlockedEmail = email;
    }
  }

  if (!unlockedEmail && process.env.NODE_ENV !== "production" && email) {
    unlockedEmail = email;
  }

  if (!unlockedEmail) {
    return json(
      {
        ok: false,
        message:
          "No active purchase found for this email yet. Complete checkout first, then retry unlock from your success page."
      },
      { status: 403 }
    );
  }

  const response = json({ ok: true, email: unlockedEmail });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: createAccessCookieValue(unlockedEmail),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 31,
    path: "/"
  });

  return response;
}
