import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import type { CategorySummary, CategorizedExpense, RawExpenseRecord } from "@/lib/types";

const MODEL = "gpt-4o-mini";

const TaxCategories = [
  "Advertising & Marketing",
  "Business Meals",
  "Contract Labor",
  "Education & Training",
  "Equipment & Software",
  "Home Office",
  "Insurance",
  "Internet & Phone",
  "Office Supplies",
  "Professional Services",
  "Rent",
  "Software Subscriptions",
  "Travel",
  "Vehicle",
  "Utilities",
  "Bank & Processing Fees",
  "Other Business Expense",
  "Personal / Non-Deductible"
] as const;

const AiResponseSchema = z.object({
  results: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
      category: z.enum(TaxCategories),
      confidence: z.number().min(0).max(1),
      deductible: z.boolean(),
      reasoning: z.string()
    })
  )
});

const keywordRules: Array<{ category: (typeof TaxCategories)[number]; keywords: string[]; deductible: boolean }> = [
  { category: "Software Subscriptions", keywords: ["figma", "notion", "slack", "github", "openai", "adobe", "canva", "dropbox", "aws"], deductible: true },
  { category: "Internet & Phone", keywords: ["verizon", "att", "at&t", "tmobile", "comcast", "xfinity", "internet", "phone"], deductible: true },
  { category: "Travel", keywords: ["airlines", "delta", "uber", "lyft", "hotel", "airbnb", "expedia"], deductible: true },
  { category: "Business Meals", keywords: ["restaurant", "cafe", "coffee", "doordash", "ubereats"], deductible: true },
  { category: "Office Supplies", keywords: ["staples", "office depot", "printer", "paper", "ink"], deductible: true },
  { category: "Advertising & Marketing", keywords: ["meta", "facebook ads", "google ads", "linkedin ads", "mailchimp"], deductible: true },
  { category: "Bank & Processing Fees", keywords: ["stripe fee", "processing fee", "wire fee", "bank fee", "paypal fee"], deductible: true },
  { category: "Personal / Non-Deductible", keywords: ["netflix", "spotify", "grocery", "walmart", "target", "costco"], deductible: false }
];

function heuristicCategory(expense: RawExpenseRecord): Pick<CategorizedExpense, "category" | "confidence" | "deductible" | "reasoning"> {
  const lower = `${expense.description} ${expense.memo ?? ""}`.toLowerCase();

  for (const rule of keywordRules) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      return {
        category: rule.category,
        confidence: 0.72,
        deductible: rule.deductible,
        reasoning: `Matched business keyword rule for ${rule.category}.`
      };
    }
  }

  return {
    category: "Other Business Expense",
    confidence: 0.45,
    deductible: true,
    reasoning: "Defaulted to Other Business Expense because no specific keyword rule matched."
  };
}

function safeJsonParse(raw: string): unknown {
  const withoutFence = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(withoutFence);
}

async function categorizeWithAi(expenses: RawExpenseRecord[]): Promise<CategorizedExpense[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = [
    "You are a tax-focused bookkeeping assistant for US freelancers.",
    "Categorize each expense into one of the provided categories.",
    "Return strict JSON with shape: {\"results\":[...]}",
    "Use confidence from 0 to 1.",
    "Mark deductible false for personal expenses.",
    `Allowed categories: ${TaxCategories.join(", ")}`,
    `Expenses: ${JSON.stringify(expenses)}`
  ].join("\n");

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You categorize freelancer expenses for IRS Schedule C tax prep. Be conservative about personal vs business use."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText) {
    return null;
  }

  const parsed = AiResponseSchema.safeParse(safeJsonParse(rawText));
  if (!parsed.success) {
    return null;
  }

  return expenses.map((expense, index) => {
    const ai = parsed.data.results[index] ?? {
      description: expense.description,
      amount: expense.amount,
      category: "Other Business Expense" as const,
      confidence: 0.4,
      deductible: true,
      reasoning: "AI response was incomplete for this row; applied fallback category."
    };

    return {
      ...expense,
      category: ai.category,
      confidence: ai.confidence,
      deductible: ai.deductible,
      reasoning: ai.reasoning
    };
  });
}

export async function categorizeExpenses(expenses: RawExpenseRecord[]): Promise<CategorizedExpense[]> {
  const aiResult = await categorizeWithAi(expenses).catch(() => null);

  if (aiResult) {
    return aiResult;
  }

  return expenses.map((expense) => {
    const rule = heuristicCategory(expense);
    return {
      ...expense,
      ...rule
    };
  });
}

export function buildCategorySummary(expenses: CategorizedExpense[]): CategorySummary[] {
  const map = new Map<string, { total: number; count: number }>();

  for (const expense of expenses) {
    const existing = map.get(expense.category) ?? { total: 0, count: 0 };
    existing.total += expense.amount;
    existing.count += 1;
    map.set(expense.category, existing);
  }

  return Array.from(map.entries())
    .map(([category, value]) => ({
      category,
      total: Number(value.total.toFixed(2)),
      count: value.count
    }))
    .sort((a, b) => b.total - a.total);
}
