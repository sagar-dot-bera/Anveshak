import { useEffect, useState } from 'react';

const PENDING_EMAIL_KEY = 'anveshak_pending_email';

/** Password rules shared by sign-up and reset, shown as ticks while typing. */
export const passwordRules = [
  { test: (v: string) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v: string) => /[0-9]/.test(v), label: 'At least one number' },
];

/** Keeps the just-registered address so "check your email" survives a refresh. */
export function rememberPendingEmail(email: string) {
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  } catch {
    // Storage can be unavailable (private mode); the router state still carries it.
  }
}

export function readPendingEmail(): string | null {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY);
  } catch {
    return null;
  }
}

/** Seconds left before an email can be re-sent; start() begins a new wait. */
export function useCooldown(seconds: number) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  return { left, start: () => setLeft(seconds) };
}

/** "averyverylongname@example.com" → "averyve…@example.com", keeping the domain readable. */
export function shortenEmail(email: string, max = 34): string {
  if (email.length <= max) return email;
  const at = email.lastIndexOf('@');
  if (at < 1) return `${email.slice(0, max - 1)}…`;
  const domain = email.slice(at);
  const keep = Math.max(3, max - domain.length - 1);
  return `${email.slice(0, keep)}…${domain}`;
}
