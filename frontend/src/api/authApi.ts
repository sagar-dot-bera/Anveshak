import axios from 'axios';
import apiClient from '@/lib/apiClient';
import type {
  AuthResponse,
  AuthMessageResponse,
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
} from '@/lib/types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/** Login with email + password. Does NOT use the shared apiClient
 *  (we don't want the interceptor to refresh on a login failure). */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/login`,
    credentials,
  );
  return data;
}

/** Register a new account. */
export async function register(
  payload: RegisterRequest,
): Promise<AuthMessageResponse> {
  const { data } = await axios.post<AuthMessageResponse>(
    `${API_BASE_URL}/auth/register`,
    payload,
  );
  return data;
}

/** Login / register via Google OAuth id_token. */
export async function googleLogin(
  payload: GoogleLoginRequest,
): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/google`,
    payload,
  );
  return data;
}

/** Exchange a Google auth code (from popup flow) for tokens. */
export async function googleCodeExchange(
  code: string,
  redirectUri?: string
): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/google/code`,
    { code, redirect_uri: redirectUri || 'postmessage' },
  );
  return data;
}

/** Refresh the access + refresh token pair. */
export async function refreshTokens(token: string): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/refresh`,
    { token },
  );
  return data;
}

/** Logout (revoke the given refresh token). */
export async function logout(token: string): Promise<void> {
  await axios.post(`${API_BASE_URL}/auth/logout`, { token });
}

/** Logout from all sessions (needs access token). */
export async function logoutAll(): Promise<void> {
  await apiClient.post('/auth/logout-all');
}

/** Request a password-reset email. */
export async function forgotPassword(
  email: string,
): Promise<AuthMessageResponse> {
  const { data } = await axios.post<AuthMessageResponse>(
    `${API_BASE_URL}/auth/forgot-password`,
    { email },
  );
  return data;
}

/** Reset password using the reset token. */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<AuthMessageResponse> {
  const { data } = await axios.post<AuthMessageResponse>(
    `${API_BASE_URL}/auth/reset-password`,
    { token, newPassword },
  );
  return data;
}

/** Resend the email-verification link. */
export async function resendVerification(
  email: string,
): Promise<AuthMessageResponse> {
  const { data } = await axios.post<AuthMessageResponse>(
    `${API_BASE_URL}/auth/resend-verification`,
    { email },
  );
  return data;
}
