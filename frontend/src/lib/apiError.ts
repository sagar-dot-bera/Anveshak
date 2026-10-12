import axios from 'axios';

/** HTTP status of a failed API call, or undefined when the request never got a response. */
export function getApiStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}

/** The backend's error message (ErrorResponse.msg / .error), or the fallback. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return 'Could not reach the server. Check your connection and try again.';
    }
    const data = err.response.data as { msg?: string; message?: string; error?: string } | undefined;
    return data?.msg || data?.message || data?.error || fallback;
  }
  return fallback;
}
