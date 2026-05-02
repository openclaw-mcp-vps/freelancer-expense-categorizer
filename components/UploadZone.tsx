"use client";

import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";

import { ExpenseTable } from "@/components/ExpenseTable";
import type { CategorySummary, CategorizedExpense } from "@/lib/types";

type ApiResponse = {
  expenses: CategorizedExpense[];
  summary: CategorySummary[];
  metrics: {
    totalTransactions: number;
    totalSpent: number;
    deductibleTotal: number;
  };
};

export function UploadZone() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  const onDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/categorize", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as ApiResponse | { error?: string };

      if (!response.ok) {
        throw new Error((data as { error?: string }).error ?? "Categorization failed.");
      }

      setResult(data as ApiResponse);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Upload failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"]
    }
  });

  const helper = useMemo(
    () =>
      isDragActive
        ? "Drop your file to start AI categorization"
        : "Drag a CSV/PDF/TXT bank statement or receipt export, or click to choose a file.",
    [isDragActive]
  );

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-2xl border border-dashed border-cyan-500/40 bg-slate-900/70 p-8 text-center transition hover:border-cyan-400 hover:bg-slate-900"
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10">
          <FileUp className="h-6 w-6 text-cyan-300" />
        </div>
        <h2 className="text-xl font-semibold">Upload Statement or Receipt Batch</h2>
        <p className="mt-2 text-sm text-slate-400">{helper}</p>
        <p className="mt-3 text-xs text-slate-500">
          Best results: include transaction date, description/merchant, and amount columns.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Running AI categorization and tax rule scoring...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <ExpenseTable
          expenses={result.expenses}
          summary={result.summary}
          deductibleTotal={result.metrics.deductibleTotal}
          totalSpent={result.metrics.totalSpent}
        />
      )}
    </div>
  );
}
