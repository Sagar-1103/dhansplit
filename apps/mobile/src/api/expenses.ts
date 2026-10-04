import { request } from '@/lib/api';
import type { User } from '@/lib/auth-store';

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

export interface ExpenseShare {
  id: string;
  expenseId: string;
  userId: string;
  user?: User;
  amount: number;
  percentage?: number | null;
  shares?: number | null;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  notes?: string | null;
  splitType: SplitType;
  groupId?: string | null;
  paidById: string;
  paidBy: User;
  shares: ExpenseShare[];
  createdAt: string;
  updatedAt: string;
}

export interface SplitParticipantInput {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
}

export interface CreateExpensePayload {
  description: string;
  amount: number;
  currency?: string;
  category?: string;
  date?: string;
  notes?: string;
  splitType?: SplitType;
  groupId?: string;
  participants: SplitParticipantInput[];
}

export interface UpdateExpensePayload {
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  date?: string;
  notes?: string;
  splitType?: SplitType;
  participants?: SplitParticipantInput[];
}

export interface ListExpensesParams {
  groupId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string;
  limit?: number;
}

export interface ListExpensesResponse {
  expenses: Expense[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function listExpenses(params: ListExpensesParams = {}): Promise<ListExpensesResponse> {
  const query = new URLSearchParams();
  if (params.groupId) query.append('groupId', params.groupId);
  if (params.category) query.append('category', params.category);
  if (params.dateFrom) query.append('dateFrom', params.dateFrom);
  if (params.dateTo) query.append('dateTo', params.dateTo);
  if (params.cursor) query.append('cursor', params.cursor);
  if (params.limit) query.append('limit', String(params.limit));

  const qs = query.toString();
  const res = await request<any>(`/expenses${qs ? `?${qs}` : ''}`);

  if (Array.isArray(res)) {
    return { expenses: res, hasMore: false };
  }
  return {
    expenses: res.expenses || res.data || [],
    nextCursor: res.nextCursor,
    hasMore: Boolean(res.hasMore),
  };
}

export async function getExpense(id: string): Promise<Expense> {
  return request<Expense>(`/expenses/${id}`);
}

export async function createExpense(data: CreateExpensePayload): Promise<Expense> {
  return request<Expense>('/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateExpense(id: string, data: UpdateExpensePayload): Promise<Expense> {
  return request<Expense>(`/expenses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id: string): Promise<void> {
  await request(`/expenses/${id}`, { method: 'DELETE' });
}
