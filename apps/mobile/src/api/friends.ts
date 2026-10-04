import { request } from '@/lib/api';
import type { User } from '@/lib/auth-store';

export interface FriendItem {
  friendshipId: string;
  friend: User;
  createdAt: string;
}

export interface PendingFriendRequest {
  id: string;
  initiatorId: string;
  receiverId: string;
  status: 'PENDING';
  initiator: User;
  createdAt: string;
}

export interface SendFriendRequestPayload {
  email?: string;
  userId?: string;
}

export async function listFriends(): Promise<FriendItem[]> {
  return request<FriendItem[]>('/friends');
}

export async function listPendingFriendRequests(): Promise<PendingFriendRequest[]> {
  return request<PendingFriendRequest[]>('/friends/pending');
}

export async function sendFriendRequest(data: SendFriendRequestPayload): Promise<any> {
  return request('/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function acceptFriendRequest(friendshipId: string): Promise<any> {
  return request(`/friends/${friendshipId}/accept`, {
    method: 'POST',
  });
}

export async function rejectFriendRequest(friendshipId: string): Promise<any> {
  return request(`/friends/${friendshipId}/reject`, {
    method: 'POST',
  });
}

export async function removeFriend(friendshipId: string): Promise<void> {
  await request(`/friends/${friendshipId}`, { method: 'DELETE' });
}

export async function getSharedExpensesWithFriend(friendshipId: string): Promise<any> {
  return request(`/friends/${friendshipId}/expenses`);
}
