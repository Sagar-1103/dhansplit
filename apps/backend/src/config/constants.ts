export const EXPENSE_CATEGORIES = [
  "general",
  "food",
  "drinks",
  "groceries",
  "transport",
  "entertainment",
  "shopping",
  "rent",
  "utilities",
  "insurance",
  "medical",
  "education",
  "travel",
  "sports",
  "clothing",
  "gifts",
  "electronics",
  "pets",
  "taxes",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
