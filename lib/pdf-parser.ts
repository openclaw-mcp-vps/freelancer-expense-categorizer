import pdf from "pdf-parse";
import { RawExpenseRecord } from "@/lib/types";

const linePattern =
  /(?<date>\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?)\s+(?<description>.+?)\s+(?<amount>-?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*$/;

function normalizeDate(value: string): string {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return value;
}

function normalizeAmount(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "");
  const parsed = Number.parseFloat(cleaned);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.abs(parsed);
}

export async function parsePdfExpenses(buffer: Buffer): Promise<RawExpenseRecord[]> {
  const parsed = await pdf(buffer);
  const text = parsed.text ?? "";
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const output: RawExpenseRecord[] = [];

  for (const line of lines) {
    const match = line.match(linePattern);
    if (!match?.groups) {
      continue;
    }

    const amount = normalizeAmount(match.groups.amount);
    if (amount <= 0) {
      continue;
    }

    output.push({
      date: normalizeDate(match.groups.date),
      description: match.groups.description.trim(),
      amount,
      source: "pdf"
    });
  }

  return output;
}
