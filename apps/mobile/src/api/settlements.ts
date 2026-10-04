import { request } from '@/lib/api';
import type { User } from '@/lib/auth-store';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'PAYPAL' | 'VENMO' | 'OTHER';

export interface Settlement {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  notes?: string | null;
  payerId: string;
  payeeId: string;
  payer: User;
  payee: User;
  groupId?: string | null;
  createdAt: string;
}

export interface CreateSettlementPayload {
  amount: number;
  currency?: string;
  method?: PaymentMethod;
  notes?: string;
  payeeId: string;
  groupId?: string;
}

export async function listSettlements(groupId?: string): Promise<Settlement[]> {
  const query = groupId ? `?groupId=${encodeURIComponent(groupId)}` : '';
  return request<Settlement[]>(`/settlements${query}`);
}

export async function createSettlement(data: CreateSettlementPayload): Promise<Settlement> {
  return request<Settlement>('/settlements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getSettlement(id: string): Promise<Settlement> {
  return request<Settlement>(`/settlements/${id}`);
}

export async function deleteSettlement(id: string): Promise<void> {
  await request(`/settlements/${id}`, { method: 'DELETE' });
}
