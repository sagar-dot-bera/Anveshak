import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { forgotPassword } from '@/api/authApi';
import { getApiErrorMessage, getApiStatus } from '@/lib/apiError';
import { shortenEmail, useCooldown } from '@/lib/authFlow';
import { usePageMeta } from '@/lib/usePageMeta';
import AuthLayout, { CardField, CardHeading, CardNote } from '@/components/cel/AuthLayout';
import { celButton } from '@/components/cel/celStyles';

const RESEND_COOLDOWN_SECONDS = 60;

const schema = z.object({
  email: z.string().min(1, 'Enter your email address.').email('That email address looks incomplete.'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  usePageMeta('Reset your password · Anveshak', 'Request a link to reset your Anveshak password.');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const cooldown = useCooldown(RESEND_COOLDOWN_SECONDS);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const send = async (email: string) => {
    setIsLoading(true);
    setProblem(null);
    try {
      await forgotPassword(email);
      setSentTo(email);
      cooldown.start();
    } catch (err) {
      // Don't reveal whether an account exists: an unknown address reads the same as a sent link.
      if (getApiStatus(err) === 404) {
        setSentTo(email);
        cooldown.start();
      } else {
        setProblem(getApiErrorMessage(err, "Couldn't send the link. Try again in a moment."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      stepKey={sentTo ? 'sent' : 'ask'}
      title={sentTo ? 'Look for the link.' : 'Locked out? Start over.'}
      intro={
        sentTo
          ? 'Open the link in the email to choose a new password. Your papers and chats stay as they are.'
          : "Enter your account's email and we'll send a link to set a new password."
      }
    >
      <CardHeading>{sentTo ? 'Check your email' : 'Reset your password'}</CardHeading>

      {sentTo ? (
        <div className="space-y-5 text-[1.02rem] leading-relaxed text-ink">
          <CardNote tone="ok">
            If an account exists for <strong className="font-semibold break-all">{shortenEmail(sentTo)}</strong>, a reset
            link is on its way. Check spam if it doesn't arrive in a few minutes.
          </CardNote>
          {problem && <CardNote tone="problem">{problem}</CardNote>}
          <button
            type="button"
            onClick={() => send(sentTo)}
            disabled={isLoading || cooldown.left > 0}
            className={celButton.cardOutline}
          >
            {isLoading ? 'Sending…' : cooldown.left > 0 ? `Send another link in ${cooldown.left}s` : 'Send another link'}
          </button>
          <button type="button" onClick={() => setSentTo(null)} className={`inline-flex min-h-11 items-center ${celButton.cardLink}`}>
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(() => send(getValues('email')))} noValidate className="space-y-6">
          {problem && <CardNote tone="problem">{problem}</CardNote>}
          <CardField
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <button type="submit" disabled={isLoading} className={celButton.card}>
            {isLoading ? <span className="blink">Sending the link…</span> : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-8 text-[0.95rem] text-ink-soft">
        Remembered it?{' '}
        <Link to="/login" className={celButton.cardLink}>
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
