import { Readable } from "node:stream";
import csvParser from "csv-parser";
import { RawExpenseRecord } from "@/lib/types";

function toNumber(raw: unknown): number {
  if (typeof raw === "number") {
    return raw;
  }

  if (typeof raw !== "string") {
    return 0;
  }

  const cleaned = raw.replace(/[$,\s]/g, "");
  const parsed = Number.parseFloat(cleaned);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

function findField(row: Record<string, unknown>, aliases: string[]): unknown {
  const entries = Object.entries(row);

  for (const [key, value] of entries) {
    const normalized = key.toLowerCase().trim();
    if (aliases.some((alias) => normalized.includes(alias))) {
      return value;
    }
  }

  return undefined;
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return new Date().toISOString().slice(0, 10);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return value.trim();
}

function normalizeDescription(row: Record<string, unknown>): string {
  const candidate =
    findField(row, ["description", "merchant", "payee", "name", "memo", "details"]) ??
    Object.values(row)
      .map((value) => String(value ?? "").trim())
      .find((value) => value.length > 3) ??
    "Unknown transaction";

  return String(candidate).trim();
}

function normalizeAmount(row: Record<string, unknown>): number {
  const amountField = findField(row, ["amount", "debit", "withdrawal", "charge", "spent"]);
  const creditField = findField(row, ["credit", "deposit", "refund"]);

  const amount = toNumber(amountField);
  const credit = toNumber(creditField);

  if (amount !== 0) {
    return Math.abs(amount);
  }

  if (credit !== 0) {
    return 0;
  }

  const fallback = Object.values(row)
    .map(toNumber)
    .find((value) => value > 0);

  return fallback ?? 0;
}

export async function parseCsvExpenses(buffer: Buffer): Promise<RawExpenseRecord[]> {
  const rows: RawExpenseRecord[] = [];

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(csvParser())
      .on("data", (row: Record<string, unknown>) => {
        const dateRaw = findField(row, ["date", "posted", "transaction date"]);

        rows.push({
          date: normalizeDate(dateRaw),
          description: normalizeDescription(row),
          amount: normalizeAmount(row),
          source: "csv",
          memo: JSON.stringify(row)
        });
      })
      .on("end", () => resolve())
      .on("error", (error) => reject(error));
  });

  return rows.filter((row) => row.amount > 0 && row.description.length > 0);
}
