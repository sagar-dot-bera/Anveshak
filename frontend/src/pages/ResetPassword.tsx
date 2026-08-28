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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4 md:p-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-[#f7f9fb] to-indigo-50/30">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_12px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden p-8 md:p-10 flex flex-col items-center text-center space-y-6">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Anveshak Logo" className="w-7 h-7 rounded-md object-cover shadow-sm" />
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
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-md font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center"
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
              className="w-full bg-deep-indigo hover:bg-primary text-white py-2.5 px-4 rounded-md font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow active:scale-[0.98]"
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
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border ${
                      errors.newPassword
                        ? 'border-error-red focus:ring-error-red/20'
                        : 'border-slate-200 focus:border-vibrant-blue focus:ring-vibrant-blue/20'
                    } rounded-md text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-2`}
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
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border ${
                      errors.confirmPassword
                        ? 'border-error-red focus:ring-error-red/20'
                        : 'border-slate-200 focus:border-vibrant-blue focus:ring-vibrant-blue/20'
                    } rounded-md text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-2`}
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
                className="w-full bg-deep-indigo hover:bg-primary text-white py-2.5 px-4 rounded-md font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
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
