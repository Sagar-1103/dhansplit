import { ENV } from '@/constants/env';
import { authStore } from '@/lib/auth-store';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${ENV.API_URL}${path}`;
  const token = authStore.getState().accessToken;
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const json: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      message: 'Invalid JSON response from server',
    }));

    if (!res.ok || json.success === false) {
      throw new Error(json.message || json.error || `Request failed with status ${res.status}`);
    }

    return (json.data ?? json) as T;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('Network request failed')) {
      throw new Error(
        `Unable to connect to server at ${ENV.API_URL}. Make sure the backend is running.`
      );
    }
    throw err;
  }
}
