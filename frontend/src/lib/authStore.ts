// Lightweight auth token management using localStorage.
// Centralises all token read/write/clear logic so every module
// goes through a single source of truth.

import { queryClient } from '@/lib/queryClient';

const ACCESS_TOKEN_KEY = 'anveshak_access_token';
const REFRESH_TOKEN_KEY = 'anveshak_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Drop the signed-out user's cached data so the next login on this
  // browser can't see it while staleTime keeps it "fresh".
  queryClient.clear();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
