import crypto from "node:crypto";

export type StripeLikeEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      customer_details?: {
        email?: string;
      };
      customer_email?: string;
    };
  };
};

function timingSafeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyStripeWebhookSignature(
  payload: string,
  headerValue: string | null,
  secret: string | undefined
): boolean {
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  if (!headerValue) {
    return false;
  }

  const entries = headerValue.split(",").map((item) => item.trim());
  const timestamp = entries.find((entry) => entry.startsWith("t="))?.split("=")[1];
  const signature = entries.find((entry) => entry.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  return timingSafeEqual(expected, signature);
}

export function parseStripeLikeEvent(payload: string): StripeLikeEvent {
  return JSON.parse(payload) as StripeLikeEvent;
}
