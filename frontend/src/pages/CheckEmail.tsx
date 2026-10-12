import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resendVerification } from '@/api/authApi';
import { getApiErrorMessage } from '@/lib/apiError';
import { readPendingEmail, shortenEmail, useCooldown } from '@/lib/authFlow';
import { usePageMeta } from '@/lib/usePageMeta';
import AuthLayout, { CardField, CardHeading, CardNote } from '@/components/cel/AuthLayout';
import { celButton } from '@/components/cel/celStyles';
import { TickMark } from '@/components/cel/Marks';

const RESEND_COOLDOWN_SECONDS = 60;

export default function CheckEmail() {
  usePageMeta('Check your email · Anveshak', 'Verify your email address to finish creating your Anveshak account.');
  const location = useLocation();
  const knownEmail = (location.state as { email?: string } | null)?.email || readPendingEmail() || '';

  const [email, setEmail] = useState(knownEmail);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<{ tone: 'ok' | 'problem'; text: string } | null>(null);
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS);

  const resend = async () => {
    if (!email.includes('@')) {
      setNote({ tone: 'problem', text: 'Enter the email address you signed up with.' });
      return;
    }
    setSending(true);
    setNote(null);
    try {
      await resendVerification(email);
      setNote({ tone: 'ok', text: 'A new link is on its way. It replaces the earlier one.' });
      cooldown.start();
    } catch (err) {
      setNote({ tone: 'problem', text: getApiErrorMessage(err, "That didn't send. Try again in a moment.") });
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthLayout
      title="One more step."
      intro="Open the link in your email to verify the address, then log in."
      aside={
        <ol className="space-y-5 text-cream text-lg">
          <li className="flex items-center gap-3">
            <TickMark className="w-6 h-6 text-butter shrink-0" title="Done" />
            Account created
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 shrink-0 rounded-full border-2 border-pink" aria-hidden="true" />
            Verify your email <span className="text-cream-dim">(you are here)</span>
          </li>
          <li className="flex items-center gap-3 text-cream-dim">
            <span className="w-6 h-6 shrink-0 inline-flex items-center justify-center" aria-hidden="true">
              <span className="w-2 h-2 rounded-full bg-cream-dim" />
            </span>
            Log in
          </li>
        </ol>
      }
    >
      <CardHeading>Check your email</CardHeading>

      <div className="space-y-5 text-[1.02rem] leading-relaxed text-ink">
        {knownEmail ? (
          <p>
            We sent a verification link to{' '}
            <strong className="font-semibold break-all" title={knownEmail}>
              {shortenEmail(knownEmail)}
            </strong>
            . It can take a minute to arrive; check spam if it doesn't.
          </p>
        ) : (
          <>
            <p>We sent a verification link to the address you signed up with. Need a new one? Enter it below.</p>
            <CardField
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </>
        )}

        {note && <CardNote tone={note.tone}>{note.text}</CardNote>}

        <button
          type="button"
          onClick={resend}
          disabled={sending || cooldown.left > 0}
          className={celButton.cardOutline}
        >
          {sending
            ? 'Sending…'
            : cooldown.left > 0
              ? `Send another link in ${cooldown.left}s`
              : 'Send a new link'}
        </button>
        <Link to="/login" className={celButton.card}>
          I've verified, log in
        </Link>
      </div>

      <p className="mt-8 text-[0.95rem] text-ink-soft">
        Wrong address?{' '}
        <Link to="/signup" className={celButton.cardLink}>
          Sign up again
        </Link>
      </p>
    </AuthLayout>
  );
}
