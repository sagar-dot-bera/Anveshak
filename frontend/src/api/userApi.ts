import apiClient from '@/lib/apiClient';
import type {
  UserProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserIdentityResponse,
  UserSessionResponse,
  GoogleLoginRequest,
} from '@/lib/types';

/** Get current user's profile info. */
export async function getProfile(): Promise<UserProfileResponse> {
  const { data } = await apiClient.get<UserProfileResponse>('/users/me');
  return data;
}

/** Update current user's profile info. */
export async function updateProfile(
  payload: UpdateProfileRequest,
): Promise<UserProfileResponse> {
  const { data } = await apiClient.patch<UserProfileResponse>(
    '/users/me',
    payload,
  );
  return data;
}

/** Change current user's password. */
export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<void> {
  await apiClient.patch('/users/me/password', payload);
}

/** List all social / linked identities for the current user. */
export async function getIdentities(): Promise<UserIdentityResponse[]> {
  const { data } = await apiClient.get<UserIdentityResponse[]>(
    '/users/me/identities',
  );
  return data;
}

/** Link a Google account. */
export async function linkGoogle(
  tokenId: string,
): Promise<UserIdentityResponse> {
  const payload: GoogleLoginRequest = { token_id: tokenId };
  const { data } = await apiClient.post<UserIdentityResponse>(
    '/users/me/link/google',
    payload,
  );
  return data;
}

/** Unlink the Google account. */
export async function unlinkGoogle(): Promise<void> {
  await apiClient.delete('/users/me/link/google');
}

/** List all active login sessions/devices for the current user. */
export async function getSessions(): Promise<UserSessionResponse[]> {
  const { data } = await apiClient.get<UserSessionResponse[]>('/users/me/sessions');
  return data;
}

/** Revoke/logout a specific session by its token ID. */
export async function revokeSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/users/me/sessions/${sessionId}`);
}
