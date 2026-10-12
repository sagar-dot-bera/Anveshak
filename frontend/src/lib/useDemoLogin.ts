import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoLogin } from '@/api/authApi';
import { setTokens } from '@/lib/authStore';
import { getApiErrorMessage, getApiStatus } from '@/lib/apiError';

// Free-tier services sleep; after this long we tell the visitor why it's slow.
const SLOW_AFTER_MS = 4000;

export type DemoLoginState = 'idle' | 'opening' | 'waking' | 'error';

/** Opens the seeded, read-only sample case and lands on the dashboard. */
export function useDemoLogin() {
  const navigate = useNavigate();
  const [state, setState] = useState<DemoLoginState>('idle');
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  const open = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setState('opening');
    const slowTimer = window.setTimeout(() => setState('waking'), SLOW_AFTER_MS);
    try {
      const res = await demoLogin();
      setTokens(res.accessToken, res.refreshToken);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = getApiStatus(err);
      setError(
        status === 404
          ? 'The sample case is closed right now. You can still create an account.'
          : status === 429
            ? 'Too many sample sessions from this network. Try again in a minute.'
            : getApiErrorMessage(err, 'The sample case would not open. Try again in a moment.'),
      );
      setState('error');
    } finally {
      window.clearTimeout(slowTimer);
      inFlight.current = false;
    }
  };

  return { open, state, error, busy: state === 'opening' || state === 'waking' };
}
