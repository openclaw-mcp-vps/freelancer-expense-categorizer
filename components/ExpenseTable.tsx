"use client";

import { format } from "date-fns";
import { Download } from "lucide-react";

import { CategoryBadge } from "@/components/CategoryBadge";
import type { CategorySummary, CategorizedExpense } from "@/lib/types";

type ExpenseTableProps = {
  expenses: CategorizedExpense[];
  summary: CategorySummary[];
  deductibleTotal: number;
  totalSpent: number;
};

function toCsv(rows: CategorizedExpense[]): string {
  const header = [
    "date",
    "description",
    "amount",
    "category",
    "deductible",
    "confidence",
    "reasoning",
    "source"
  ];

  const lines = rows.map((row) => {
    const fields = [
      row.date,
      row.description,
      row.amount.toFixed(2),
      row.category,
      row.deductible ? "yes" : "no",
      row.confidence.toFixed(2),
      row.reasoning,
      row.source
    ];

    return fields
      .map((field) => `"${String(field).replaceAll('"', '""')}"`)
      .join(",");
  });

  return `${header.join(",")}\n${lines.join("\n")}`;
}

function downloadCsv(content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expense-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExpenseTable({ expenses, summary, deductibleTotal, totalSpent }: ExpenseTableProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase text-slate-400">Transactions</p>
          <p className="mt-1 text-2xl font-semibold">{expenses.length}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase text-slate-400">Total Spend</p>
          <p className="mt-1 text-2xl font-semibold">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase text-slate-400">Likely Deductible</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">${deductibleTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Category Breakdown</h3>
          <button
            type="button"
            onClick={() => downloadCsv(toCsv(expenses))}
            className="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <div key={item.category} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
              <p className="text-sm text-slate-300">{item.category}</p>
              <p className="mt-1 text-lg font-semibold">${item.total.toFixed(2)}</p>
              <p className="text-xs text-slate-400">{item.count} transactions</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/60">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {expenses.map((expense, index) => {
              const date = new Date(expense.date);
              const displayDate = Number.isNaN(date.getTime()) ? expense.date : format(date, "MMM d, yyyy");

              return (
                <tr key={`${expense.description}-${index}`} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">{displayDate}</td>
                  <td className="max-w-sm px-4 py-3 text-slate-200">
                    <p>{expense.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{expense.reasoning}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">${expense.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={expense.category} deductible={expense.deductible} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {Math.round(expense.confidence * 100)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
