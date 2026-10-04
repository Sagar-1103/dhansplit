import { request } from '@/lib/api';
import type { User } from '@/lib/auth-store';

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: 'ADMIN' | 'MEMBER';
  user: User;
  balance?: number;
}

export interface Group {
  id: string;
  name: string;
  type: 'HOME' | 'TRIP' | 'COUPLE' | 'OTHER';
  defaultCurrency: string;
  simplifyDebts: boolean;
  coverImageUrl?: string | null;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupPayload {
  name: string;
  type?: 'HOME' | 'TRIP' | 'COUPLE' | 'OTHER';
  defaultCurrency?: string;
  simplifyDebts?: boolean;
  memberIds?: string[];
}

export interface UpdateGroupPayload {
  name?: string;
  type?: 'HOME' | 'TRIP' | 'COUPLE' | 'OTHER';
  defaultCurrency?: string;
  simplifyDebts?: boolean;
  coverImageUrl?: string;
}

export async function listGroups(): Promise<Group[]> {
  return request<Group[]>('/groups');
}

export async function getGroup(id: string): Promise<Group> {
  return request<Group>(`/groups/${id}`);
}

export async function createGroup(data: CreateGroupPayload): Promise<Group> {
  return request<Group>('/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateGroup(id: string, data: UpdateGroupPayload): Promise<Group> {
  return request<Group>(`/groups/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteGroup(id: string): Promise<void> {
  await request(`/groups/${id}`, { method: 'DELETE' });
}

export async function addGroupMembers(id: string, userIds: string[]): Promise<Group> {
  return request<Group>(`/groups/${id}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  });
}

export async function removeGroupMember(id: string, userId: string): Promise<void> {
  await request(`/groups/${id}/members/${userId}`, { method: 'DELETE' });
}
