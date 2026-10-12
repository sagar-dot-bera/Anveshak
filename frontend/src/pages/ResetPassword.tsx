import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Eye, EyeOff, ArrowRight, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { resetPassword } from '@/api/authApi';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await resetPassword(token, data.newPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.msg || err.response?.data?.error || 'This reset link is invalid or has expired.';
      toast.error('Reset failed', { description: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

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

        {!token && (
          <>
            <XCircle className="w-12 h-12 text-error-red" />
            <div className="space-y-1.5">
              <h1 className="font-hanken font-bold text-xl text-slate-900">Invalid link</h1>
              <p className="font-inter text-sm text-slate-500">
                This password reset link is missing a token. Please use the link from your email.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full bg-violet-50 hover:bg-violet-100 text-violet-700 py-3.5 px-4 rounded-full font-inter font-bold text-sm transition-all duration-200 flex items-center justify-center"
            >
              Back to Sign In
            </Link>
          </>
        )}

        {token && success && (
          <>
            <div className="space-y-1.5">
              <h1 className="font-hanken font-bold text-xl text-slate-900">Password reset</h1>
              <p className="font-inter text-sm text-slate-500">
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-deep-indigo hover:bg-primary text-white py-3.5 px-4 rounded-full font-inter font-bold text-sm transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow active:scale-[0.98]"
            >
              Go to Sign In
            </button>
          </>
        )}

        {token && !success && (
          <>
            <div className="space-y-1.5">
              <h1 className="font-hanken font-bold text-xl text-slate-900">Reset your password</h1>
              <p className="font-inter text-sm text-slate-500">Enter a new password for your account.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5 text-left">
              <div className="space-y-2">
                <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-violet-50/40 border-2 ${
                      errors.newPassword
                        ? 'border-error-red focus:ring-error-red/20'
                        : 'border-violet-100 focus:border-pink-400 focus:ring-pink-500/15 focus:bg-white'
                    } rounded-2xl text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-4`}
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-error-red mt-1 font-inter">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-violet-50/40 border-2 ${
                      errors.confirmPassword
                        ? 'border-error-red focus:ring-error-red/20'
                        : 'border-violet-100 focus:border-pink-400 focus:ring-pink-500/15 focus:bg-white'
                    } rounded-2xl text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-4`}
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-error-red mt-1 font-inter">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-deep-indigo hover:bg-primary text-white py-3.5 px-4 rounded-full font-inter font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
              >
                <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
