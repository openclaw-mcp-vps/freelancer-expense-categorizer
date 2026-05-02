import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, FileStack, ShieldCheck, Zap } from "lucide-react";

import { ACCESS_COOKIE_NAME, getEmailFromAccessCookie } from "@/lib/paywall";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const email = getEmailFromAccessCookie(access);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Paid Workspace</p>
          <h1 className="mt-2 text-3xl font-bold">Expense Categorization Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            {email ? `Unlocked for ${email}` : "Access active"} · AI-powered business expense classification.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Upload Transactions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <Zap className="h-5 w-5 text-cyan-300" />
          <h2 className="mt-4 font-semibold">Fast Categorization</h2>
          <p className="mt-2 text-sm text-slate-300">
            Upload statements and classify up to 300 transactions per run with AI confidence scoring.
          </p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <ShieldCheck className="h-5 w-5 text-cyan-300" />
          <h2 className="mt-4 font-semibold">Tax-Focused Labels</h2>
          <p className="mt-2 text-sm text-slate-300">
            Categories are tuned for freelancer deduction workflows, including personal/non-deductible detection.
          </p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
          <FileStack className="h-5 w-5 text-cyan-300" />
          <h2 className="mt-4 font-semibold">Export Ready Reports</h2>
          <p className="mt-2 text-sm text-slate-300">
            Download categorized rows in CSV format for accounting software imports or CPA review packets.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900/70 p-6">
        <h3 className="text-lg font-semibold">Recommended Workflow</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Export last month’s transactions from your bank as CSV or PDF.</li>
          <li>Upload file in the categorizer and review low-confidence items.</li>
          <li>Export CSV and store it with your monthly tax folder.</li>
        </ol>
      </section>
    </main>
  );
}
