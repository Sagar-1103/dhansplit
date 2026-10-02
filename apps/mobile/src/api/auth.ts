import { request } from '@/lib/api';
import { authStore, type User } from '@/lib/auth-store';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  photoUri?: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (data?.user && data?.accessToken) {
    authStore.setAuth(data.user, data.accessToken, data.refreshToken);
  }

  return data;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }),
  });

  if (data?.user && data?.accessToken) {
    authStore.setAuth(
      { ...data.user, photoUri: payload.photoUri },
      data.accessToken,
      data.refreshToken
    );
  }

  return data;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
  return request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
  return request('/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
}

export async function refreshTokens(): Promise<AuthTokens> {
  const refreshToken = authStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const tokens = await request<AuthTokens>('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const currentUser = authStore.getState().user;
  if (currentUser && tokens.accessToken) {
    authStore.setAuth(currentUser, tokens.accessToken, tokens.refreshToken);
  }

  return tokens;
}

export async function logout(): Promise<void> {
  const refreshToken = authStore.getState().refreshToken;
  try {
    if (refreshToken) {
      await request('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    authStore.logout();
  }
}
