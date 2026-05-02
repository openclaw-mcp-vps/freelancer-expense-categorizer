import Link from "next/link";
import { ArrowRight, CheckCircle2, Receipt, ShieldCheck, Sparkles } from "lucide-react";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

const faqs = [
  {
    q: "What files can I upload?",
    a: "CSV exports from banks or bookkeeping tools, PDF statements, and plain-text receipt exports. The parser reads date, merchant/description, and amount fields."
  },
  {
    q: "How accurate is categorization?",
    a: "The app uses AI plus conservative tax heuristics aimed at freelancer Schedule C categories. Every row includes confidence and reasoning so you can review before filing."
  },
  {
    q: "How does payment unlock the app?",
    a: "Checkout runs on Stripe-hosted Payment Links. After purchase, your webhook marks the account active and unlocks access using a secure cookie."
  },
  {
    q: "Can I export for my CPA?",
    a: "Yes. Export the categorized report as CSV with category, deductible flag, and reasoning notes."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-10">
      <header className="mb-16 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Fintech for Freelancers</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-100">Freelancer Expense Categorizer</h1>
        </div>
        <Link
          href="/unlock"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Unlock Account
        </Link>
      </header>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI categorizes freelancer expenses for taxes
          </p>
          <h2 className="mt-6 text-4xl font-extrabold leading-tight text-slate-100 sm:text-5xl">
            Stop losing deductions to manual bookkeeping.
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Upload your statements and receipts, let AI classify each expense into tax-ready business categories,
            and export a clean report your CPA can use immediately.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={paymentLink}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start for $19/month
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Open Dashboard
            </Link>
          </div>
          <p className="mt-3 text-sm text-slate-400">Hosted checkout by Stripe. Cancel anytime.</p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold">What you get in minutes</h3>
          <ul className="mt-5 space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <Receipt className="mt-0.5 h-4 w-4 text-cyan-300" />
              Parse statement lines from CSV/PDF/TXT and normalize messy merchant data.
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
              Tax-focused categories with deductible vs non-deductible flags and confidence scores.
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
              Export formatted CSV reports for Schedule C prep and CPA handoff.
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold">The Problem</h3>
          <p className="mt-3 text-sm text-slate-300">
            Freelancers spend hours manually tagging transactions and still miss write-offs because statements are
            inconsistent across banks and payment processors.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold">The Solution</h3>
          <p className="mt-3 text-sm text-slate-300">
            AI maps each transaction into practical tax categories, adds confidence and rationale, and produces a
            review-ready export.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
          <h3 className="text-lg font-semibold">Pricing</h3>
          <p className="mt-3 text-sm text-slate-200">
            <span className="text-3xl font-extrabold text-cyan-300">$19</span>/month for independent contractors and
            solo freelancers.
          </p>
          <a
            href={paymentLink}
            className="mt-4 inline-flex rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Buy Now
          </a>
        </div>
      </section>

      <section className="mt-20">
        <h3 className="text-2xl font-bold">FAQ</h3>
        <div className="mt-6 grid gap-4">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
              <h4 className="font-semibold text-slate-100">{faq.q}</h4>
              <p className="mt-2 text-sm text-slate-300">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
