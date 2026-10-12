import { useEffect, useRef, useState } from 'react';
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
  // The token is single-use (the backend deletes it once verified), so
  // StrictMode's dev-mode double-invoke of this effect must not fire the
  // request twice - the second call would fail on an already-consumed token
  // and clobber the first call's success.
  const requestedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing a token. Please use the link from your email.');
      return;
    }

    if (requestedTokenRef.current === token) return;
    requestedTokenRef.current = token;

    verifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(
          err.response?.data?.msg ||
            err.response?.data?.error ||
            'This verification link is invalid or has expired.',
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-aurora p-4 md:p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-24 w-[30rem] h-[30rem] rounded-full bg-violet-400/35 blur-[100px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-pink-400/35 blur-[100px] animate-float" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-orange-300/30 blur-[90px] animate-float-slow" />
      <div className="w-full max-w-[440px] relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(124,58,237,0.55)] border border-white overflow-hidden p-8 md:p-10 flex flex-col items-center text-center space-y-6">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Anveshak Logo" className="w-9 h-9 p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 object-contain" />
          <span className="font-hanken font-bold text-lg tracking-wide text-slate-900">Anveshak</span>
        </div>

        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
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
              className="w-full bg-deep-indigo hover:bg-primary text-white py-3.5 px-4 rounded-full font-inter font-bold text-sm transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow active:scale-[0.98]"
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
              className="w-full bg-violet-50 hover:bg-violet-100 text-violet-700 py-3.5 px-4 rounded-full font-inter font-bold text-sm transition-all duration-200 flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
