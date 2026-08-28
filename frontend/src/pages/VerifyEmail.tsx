import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { verifyEmail } from '@/api/authApi';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing a token. Please use the link from your email.');
      return;
    }

    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (cancelled) return;
        setStatus('success');
      })
      .catch((err: any) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          err.response?.data?.msg ||
            err.response?.data?.error ||
            'This verification link is invalid or has expired.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4 md:p-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-[#f7f9fb] to-indigo-50/30">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_12px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden p-8 md:p-10 flex flex-col items-center text-center space-y-6">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Anveshak Logo" className="w-7 h-7 rounded-md object-cover shadow-sm" />
          <span className="font-hanken font-bold text-lg tracking-wide text-slate-900">Anveshak</span>
        </div>

        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 text-vibrant-blue animate-spin" />
            <div className="space-y-1.5">
              <h1 className="font-hanken font-bold text-xl text-slate-900">Verifying your email…</h1>
              <p className="font-inter text-sm text-slate-500">Please wait a moment.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <div className="space-y-1.5">
              <h1 className="font-hanken font-bold text-xl text-slate-900">Email verified</h1>
              <p className="font-inter text-sm text-slate-500">
                Your email has been verified successfully. You can now sign in to your account.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full bg-deep-indigo hover:bg-primary text-white py-2.5 px-4 rounded-md font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow active:scale-[0.98]"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-error-red" />
            <div className="space-y-1.5">
              <h1 className="font-hanken font-bold text-xl text-slate-900">Verification failed</h1>
              <p className="font-inter text-sm text-slate-500">{message}</p>
            </div>
            <Link
              to="/login"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-md font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
