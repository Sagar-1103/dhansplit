import { request } from '@/lib/api';
import { authStore, type User } from '@/lib/auth-store';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  defaultCurrency?: string;
}

export interface SearchedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export async function getProfile(): Promise<User> {
  const user = await request<User>('/users/me');
  if (user) {
    authStore.setUser(user);
  }
  return user;
}

export async function updateProfile(data: UpdateProfilePayload): Promise<User> {
  const updated = await request<User>('/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (updated) {
    authStore.setUser(updated);
  }
  return updated;
}

export async function searchUsers(query: string): Promise<SearchedUser[]> {
  return request<SearchedUser[]>(`/users/search?q=${encodeURIComponent(query)}`);
}

export async function deleteAccount(): Promise<void> {
  await request('/users/me', { method: 'DELETE' });
  authStore.logout();
}
