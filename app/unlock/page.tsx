"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

type UnlockResult = {
  ok: boolean;
  message?: string;
};

export default function UnlockPage() {
  const router = useRouter();

  const [nextPath, setNextPath] = useState("/dashboard");
  const [sessionId, setSessionId] = useState("");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") ?? "/dashboard");
    setSessionId(params.get("session_id") ?? "");
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          sessionId
        })
      });

      const body = (await response.json()) as UnlockResult;

      if (!response.ok || !body.ok) {
        throw new Error(body.message ?? "Unlock failed.");
      }

      router.push(nextPath);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unlock failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-8">
        <h1 className="text-2xl font-bold">Unlock Paid Access</h1>
        <p className="mt-3 text-sm text-slate-300">
          Complete checkout, then confirm your purchase email to activate the dashboard on this device.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Purchase email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/50 transition focus:ring-2"
              placeholder="you@freelancebusiness.com"
            />
          </label>

          {sessionId && (
            <p className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
              Session detected from Stripe success redirect. Submit to unlock instantly.
            </p>
          )}

          {error && (
            <p className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Verifying purchase..." : "Unlock Dashboard"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-700 pt-4 text-sm text-slate-300">
          <p>Need access first?</p>
          <a href={paymentLink} className="mt-2 inline-block font-semibold text-cyan-300 hover:text-cyan-200">
            Start subscription checkout ($19/month)
          </a>
          <p className="mt-3 text-xs text-slate-400">
            For automatic unlock, set your Stripe Payment Link success redirect to this page and append
            <code className="ml-1 rounded bg-slate-800 px-1 py-0.5">?session_id={'{CHECKOUT_SESSION_ID}'}</code>.
          </p>
          <Link href="/" className="mt-3 block text-xs text-slate-400 underline underline-offset-4">
            Back to landing page
          </Link>
        </div>
      </section>
    </main>
  );
}
