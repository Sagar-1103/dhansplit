import { request } from '@/lib/api';
import type { User } from '@/lib/auth-store';

export interface ActivityUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ActivityGroup {
  id: string;
  name: string;
}

export interface ActivityExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
}

export interface Activity {
  id: string;
  type: string;
  action: string;
  user: ActivityUser;
  group?: ActivityGroup | null;
  expense?: ActivityExpense | null;
  createdAt: string;
}

export interface ActivitiesFeedResponse {
  activities: Activity[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function getGlobalActivities(params: { limit?: number; cursor?: string } = {}): Promise<ActivitiesFeedResponse> {
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', String(params.limit));
  if (params.cursor) query.append('cursor', params.cursor);

  const qs = query.toString();
  const res = await request<any>(`/activities${qs ? `?${qs}` : ''}`);

  if (Array.isArray(res)) {
    return { activities: res, hasMore: false };
  }
  return {
    activities: res.activities || res.data || [],
    nextCursor: res.nextCursor,
    hasMore: Boolean(res.hasMore),
  };
}

export async function getGroupActivities(groupId: string, params: { limit?: number; cursor?: string } = {}): Promise<ActivitiesFeedResponse> {
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', String(params.limit));
  if (params.cursor) query.append('cursor', params.cursor);

  const qs = query.toString();
  const res = await request<any>(`/activities/group/${groupId}${qs ? `?${qs}` : ''}`);

  if (Array.isArray(res)) {
    return { activities: res, hasMore: false };
  }
  return {
    activities: res.activities || res.data || [],
    nextCursor: res.nextCursor,
    hasMore: Boolean(res.hasMore),
  };
}
