import Link from "next/link";

import { UploadZone } from "@/components/UploadZone";

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Categorize Expenses</p>
          <h1 className="mt-2 text-3xl font-bold">Upload Statements and Receipts</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            The categorizer reads your transactions, classifies each line into freelancer tax categories, and generates
            an export-ready report.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          Back to Dashboard
        </Link>
      </header>

      <UploadZone />
    </main>
  );
}
