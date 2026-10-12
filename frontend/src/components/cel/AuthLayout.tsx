import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { CelLogo } from './CelChrome';
import { Rooftops, Sun } from './Horizon';
import { StrikeMark, TickMark } from './Marks';

type AuthLayoutProps = {
  /** Large title-card heading beside the form. */
  title: string;
  intro?: ReactNode;
  /** A scene shown beside the form (hidden on small screens to keep the form first). */
  aside?: ReactNode;
  /** Re-keys the card so moving between steps pans it in. */
  stepKey?: string;
  children: ReactNode;
};

/** A dusk sky with one form card laid over it: every auth page uses this frame. */
export default function AuthLayout({ title, intro, aside, stepKey, children }: AuthLayoutProps) {
  return (
    <div className="cel-world sky-bands flex flex-col">
      <header className="mx-auto w-full max-w-[84rem] px-4 sm:px-8 lg:px-12 h-20 flex items-center">
        <CelLogo />
      </header>
      <main className="relative z-10 flex-1 mx-auto w-full max-w-[84rem] px-4 sm:px-8 lg:px-12 pb-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-20 items-start">
        <section className="pt-2 lg:pt-10 min-w-0" aria-label="About this step">
          <h1 className="title-card text-[2.3rem] sm:text-5xl lg:text-[3.4rem] leading-[1.08] text-balance max-w-[15ch]">
            {title}
          </h1>
          {intro && <div className="mt-5 text-lg text-cream-dim max-w-[34rem] leading-relaxed">{intro}</div>}
          {aside && <div className="hidden lg:block mt-14">{aside}</div>}
        </section>
        <div key={stepKey} className="cel-card cel-pan px-6 sm:px-9 pt-8 pb-9 lg:mt-6">
          {children}
        </div>
      </main>
      <div className="relative mt-auto" aria-hidden="true">
        <Sun className="absolute right-[12%] bottom-6 w-56 h-56" />
        <Rooftops className="relative" />
      </div>
    </div>
  );
}

/** The card's own heading, lettered like a title card in ink. */
export function CardHeading({ children }: { children: ReactNode }) {
  return <h2 className="title-card title-card--ink text-[1.75rem] leading-tight mb-7">{children}</h2>;
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

/** A field on the card. Errors are struck through in red ink, with words. */
export const CardField = forwardRef<HTMLInputElement, FieldProps>(function CardField(
  { label, error, hint, id, type = 'text', className = '', ...inputProps },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="block mb-1.5 text-sm font-bold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`block w-full min-h-12 rounded-[10px] border-2 bg-[#fff8fb] px-3.5 text-[1.05rem] text-ink placeholder:text-ink-soft/80 outline-none transition-[border-color,box-shadow,background-color] focus:bg-white focus:border-magenta focus:shadow-[0_0_0_3px_rgb(229_72_127/0.22)] focus-visible:outline-none ${
            error ? 'border-alert' : 'border-night/75'
          } ${isPassword ? 'pr-12' : ''}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 text-ink-soft hover:text-ink"
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
          >
            {reveal ? <EyeOff className="w-5 h-5" strokeWidth={1.75} /> : <Eye className="w-5 h-5" strokeWidth={1.75} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-semibold text-alert" role="alert">
          <StrikeMark className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <div id={`${fieldId}-hint`} className="mt-1.5 text-sm text-ink-soft">
          {hint}
        </div>
      )}
    </div>
  );
});

/** A rule the input must meet, ticked once it does. */
export function RuleCheck({ met, children }: { met: boolean; children: ReactNode }) {
  return (
    <li className={`flex items-center gap-1.5 ${met ? 'text-teal-deep font-semibold' : 'text-ink-soft'}`}>
      {met ? (
        <TickMark className="w-4 h-4 shrink-0" title="Met" />
      ) : (
        <span className="w-4 h-4 shrink-0 inline-flex items-center justify-center" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/70" />
        </span>
      )}
      <span>{children}</span>
      {!met && <span className="sr-only">(not yet)</span>}
    </li>
  );
}

/** A note written on the card: success, problem, or plain information. */
export function CardNote({ tone, children }: { tone: 'ok' | 'problem' | 'info'; children: ReactNode }) {
  const styles = {
    ok: 'text-teal-deep',
    problem: 'text-alert',
    info: 'text-ink-soft',
  }[tone];
  return (
    <div className={`flex items-start gap-2 text-[0.95rem] leading-relaxed ${styles}`} role={tone === 'problem' ? 'alert' : 'status'}>
      {tone === 'ok' && <TickMark className="w-5 h-5 mt-0.5 shrink-0" />}
      {tone === 'problem' && <StrikeMark className="w-5 h-5 mt-0.5 shrink-0" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Divider between the email form and Google sign-in. */
export function CardDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-6 text-sm text-ink-soft" role="separator">
      <span className="flex-1 border-t border-ink/20" />
      {children}
      <span className="flex-1 border-t border-ink/20" />
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.5 10.5 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
