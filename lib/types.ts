export type RawExpenseRecord = {
  date: string;
  description: string;
  amount: number;
  source: string;
  merchant?: string;
  memo?: string;
};

export type CategorizedExpense = RawExpenseRecord & {
  category: string;
  confidence: number;
  deductible: boolean;
  reasoning: string;
};

export type CategorySummary = {
  category: string;
  total: number;
  count: number;
};
