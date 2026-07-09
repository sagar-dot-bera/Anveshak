import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { login } from '@/api/authApi';
import { setTokens } from '@/lib/authStore';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  keepMeLoggedIn: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      keepMeLoggedIn: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });
      setTokens(response.accessToken, response.refreshToken);
      toast.success('Successfully logged in!', {
        description: `Welcome to Anveshak`,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const errMsg = err.response?.data?.msg || err.response?.data?.error || 'Invalid email or password.';
      toast.error('Authentication failed', {
        description: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform: 'Google' | 'Facebook') => {
    toast.info(`Connecting to ${platform}...`, {
      description: `This redirects to ${platform} OAuth in production.`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4 md:p-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-[#f7f9fb] to-indigo-50/30">
      {/* Outer Card Container */}
      <div className="w-full max-w-[1000px] bg-white rounded-xl shadow-[0_12px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[580px]">

        {/* Left Side: Brand Panel */}
        <div className="w-full md:w-[42%] bg-deep-indigo relative p-8 md:p-10 flex flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-container via-deep-indigo to-deep-indigo text-white">
          {/* Subtle background overlay elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Logo & Title */}
          <div className="flex items-center space-x-3 z-10">
            <img
              src={logo}
              alt="Anveshak Logo"
              className="w-7 h-7 rounded-md object-cover shadow-sm "
            />
            <span className="font-hanken font-bold text-lg tracking-wide">Anveshak</span>
          </div>

          {/* Middle: Content */}
          <div className="my-10 md:my-auto z-10 flex flex-col justify-center space-y-4">
            <h2 className="font-hanken font-semibold text-2xl md:text-3xl leading-snug text-left text-white">
              Empowering researchers with AI precision.
            </h2>
            <p className="font-inter text-slate-300 text-sm leading-relaxed text-left max-w-sm">
              Access your second brain and navigate complex academic landscapes with ease.
            </p>

            <hr className="border-white/10 w-full my-6" />

            {/* Joined by researchers */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-deep-indigo bg-white flex items-center justify-center text-[10px] text-slate-500 font-semibold shadow-sm">
                  JD
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-deep-indigo bg-gradient-to-tr from-slate-500 to-slate-300 flex items-center justify-center text-[10px] text-white font-semibold shadow-sm">
                  AI
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-deep-indigo bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-[10px] text-white font-semibold shadow-sm">
                  RE
                </div>
              </div>
              <span className="font-mono text-xs text-slate-300 tracking-wide">
                Joined by 10k+ researchers
              </span>
            </div>
          </div>

          {/* Bottom spacer for layout balance */}
          <div className="hidden md:block h-4" />
        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full md:w-[58%] p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-[420px] w-full mx-auto space-y-6">

            {/* Header */}
            <div className="space-y-1.5 text-left">
              <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 tracking-tight leading-none m-0">
                Welcome back
              </h1>
              <p className="font-inter text-sm text-slate-500">
                Please enter your details to sign in to your account.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
              {/* Email Address */}
              <div className="space-y-2">
                <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border ${errors.email ? 'border-error-red focus:ring-error-red/20' : 'border-slate-200 focus:border-vibrant-blue focus:ring-vibrant-blue/20'
                      } rounded-md text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-2`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-error-red mt-1 font-inter">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Password recovery link sent if email matches.');
                    }}
                    className="font-mono text-xs text-vibrant-blue hover:text-primary transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border ${errors.password ? 'border-error-red focus:ring-error-red/20' : 'border-slate-200 focus:border-vibrant-blue focus:ring-vibrant-blue/20'
                      } rounded-md text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-2`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error-red mt-1 font-inter">{errors.password.message}</p>
                )}
              </div>

              {/* Keep me logged in */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="keepMeLoggedIn"
                  className="w-4 h-4 rounded border-slate-300 text-vibrant-blue focus:ring-vibrant-blue/20 bg-slate-50 transition-colors"
                  {...register('keepMeLoggedIn')}
                />
                <label
                  htmlFor="keepMeLoggedIn"
                  className="font-inter text-xs md:text-sm text-slate-500 cursor-pointer select-none"
                >
                  Keep me logged in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-deep-indigo hover:bg-primary text-white py-2.5 px-4 rounded-md font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 font-mono text-[10px] text-slate-400 tracking-wider font-semibold">
                OR CONTINUE WITH
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center space-x-2 py-2 px-4 border border-slate-200 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-inter text-sm font-medium text-slate-700">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="flex items-center justify-center space-x-2 py-2 px-4 border border-slate-200 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                {/* Facebook Icon SVG */}
                <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-inter text-sm font-medium text-slate-700">Facebook</span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-2 text-center">
              <p className="font-inter text-sm text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-hanken font-bold text-vibrant-blue hover:text-primary transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
