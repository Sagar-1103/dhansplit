import { request } from '@/lib/api';
import type { User } from '@/lib/auth-store';

export type BalanceDirection = 'OWED_TO_YOU' | 'YOU_OWE';

export interface UserBalance {
  user: User;
  amount: number;
  direction: BalanceDirection;
}

export interface TotalBalance {
  total: number;
}

export interface SimplifiedDebt {
  from: User;
  to: User;
  amount: number;
}

export interface GroupBalance {
  userId: string;
  netBalance: number;
  user: User;
}

export async function getOverallBalances(): Promise<UserBalance[]> {
  return request<UserBalance[]>('/balances');
}

export async function getTotalBalance(): Promise<TotalBalance> {
  return request<TotalBalance>('/balances/total');
}

export async function getGroupBalances(groupId: string): Promise<GroupBalance[]> {
  return request<GroupBalance[]>(`/balances/group/${groupId}`);
}

export async function getSimplifiedDebts(groupId: string): Promise<SimplifiedDebt[]> {
  return request<SimplifiedDebt[]>(`/balances/group/${groupId}/simplified`);
}
