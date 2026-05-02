import { NextRequest, NextResponse } from "next/server";

import { buildCategorySummary, categorizeExpenses } from "@/lib/ai-categorizer";
import { parseCsvExpenses } from "@/lib/csv-parser";
import { parsePdfExpenses } from "@/lib/pdf-parser";
import { ACCESS_COOKIE_NAME, isAccessCookieValid } from "@/lib/paywall";
import type { RawExpenseRecord } from "@/lib/types";

export const runtime = "nodejs";

const textLinePattern =
  /(?<date>\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?)?\s*(?<description>[A-Za-z0-9\-\s&'.]{4,}?)\s+(?<amount>\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*$/;

function parseTextExpenses(text: string): RawExpenseRecord[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const records: RawExpenseRecord[] = [];

  for (const line of lines) {
    const match = line.match(textLinePattern);
    if (!match?.groups) {
      continue;
    }

    const amount = Number.parseFloat(match.groups.amount.replace(/[$,\s]/g, ""));
    if (Number.isNaN(amount) || amount <= 0) {
      continue;
    }

    const date = match.groups.date ? new Date(match.groups.date) : new Date();

    records.push({
      date: Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10),
      description: match.groups.description.trim(),
      amount,
      source: "text"
    });
  }

  return records;
}

function fileExt(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : "";
}

export async function POST(request: NextRequest) {
  const accessCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!isAccessCookieValid(accessCookie)) {
    return NextResponse.json(
      {
        error: "Paid access is required. Complete checkout, then unlock your account."
      },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Please upload a CSV, PDF, or TXT file." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = fileExt(file.name);

  let parsedExpenses: RawExpenseRecord[] = [];

  if (extension === "csv" || file.type.includes("csv")) {
    parsedExpenses = await parseCsvExpenses(buffer);
  } else if (extension === "pdf" || file.type.includes("pdf")) {
    parsedExpenses = await parsePdfExpenses(buffer);
  } else if (extension === "txt" || file.type.includes("text")) {
    parsedExpenses = parseTextExpenses(buffer.toString("utf-8"));
  } else {
    return NextResponse.json(
      {
        error: "Unsupported file type. Upload CSV, PDF, or TXT statements/receipts."
      },
      { status: 400 }
    );
  }

  if (parsedExpenses.length === 0) {
    return NextResponse.json(
      {
        error:
          "No expense rows were detected. Ensure your file includes transaction description and amount columns."
      },
      { status: 422 }
    );
  }

  const limited = parsedExpenses.slice(0, 300);
  const categorized = await categorizeExpenses(limited);
  const summary = buildCategorySummary(categorized);
  const total = Number(categorized.reduce((acc, row) => acc + row.amount, 0).toFixed(2));
  const deductibleTotal = Number(
    categorized.filter((row) => row.deductible).reduce((acc, row) => acc + row.amount, 0).toFixed(2)
  );

  return NextResponse.json({
    expenses: categorized,
    summary,
    metrics: {
      totalTransactions: categorized.length,
      totalSpent: total,
      deductibleTotal
    }
  });
}
