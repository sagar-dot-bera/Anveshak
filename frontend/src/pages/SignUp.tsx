import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, AtSign, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.svg';
import { register as registerUser, googleCodeExchange } from '@/api/authApi';
import { isAuthenticated, setTokens } from '@/lib/authStore';
import { useGoogleLogin } from '@react-oauth/google';

// Google sign-in is hidden for now; flip to true to bring it back.
const SHOW_GOOGLE_SIGN_IN = false;

const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const names = data.fullName.trim().split(/\s+/);
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';
      const username = data.email.split('@')[0] + Math.floor(Math.random() * 1000);

      await registerUser({
        firstName,
        lastName,
        username,
        email: data.email,
        password: data.password,
      });

      toast.success('Account created successfully!', {
        description: `Welcome to Anveshak, ${data.fullName}! Please log in.`,
      });
      navigate('/login');
    } catch (err: any) {
      const errMsg = err.response?.data?.msg || err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error('Registration failed', {
        description: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const googleOAuthSignUp = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        const res = await googleCodeExchange(codeResponse.code);
        setTokens(res.accessToken, res.refreshToken);
        toast.success('Successfully signed up with Google!', {
          description: 'Welcome to Anveshak',
        });
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Google signup failed.';
        toast.error('Google signup failed', { description: errMsg });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error('Google signup failed', { description: 'Could not connect to Google. Please try again.' });
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-aurora p-4 md:p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-24 w-[30rem] h-[30rem] rounded-full bg-violet-400/35 blur-[100px] animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-[30rem] h-[30rem] rounded-full bg-pink-400/35 blur-[100px] animate-float" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-orange-300/30 blur-[90px] animate-float-slow" />
      
      {/* Centered Logo & Brand Headers */}
      <div className="relative text-center space-y-2 max-w-sm">
        <img 
          src={logo} 
          alt="Anveshak Logo" 
          className="w-14 h-14 p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 object-contain mx-auto -rotate-6 shadow-[0_12px_28px_-8px_rgba(99,102,241,0.8)]" 
        />
        <h1 className="font-hanken font-extrabold text-3xl md:text-4xl text-slate-900 tracking-tight leading-none pt-3">
          Create your <span className="text-prism">account</span>
        </h1>
        <p className="font-inter text-sm text-slate-500">
          Your second brain for academic excellence.
        </p>
      </div>

      {/* Main SignUp Card */}
      <div className="w-full max-w-[460px] relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(124,58,237,0.55)] border border-white p-8 md:p-10 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <input
                type="text"
                placeholder="Dr. Sarah Chen"
                className={`w-full pl-10 pr-4 py-3 bg-violet-50/40 border-2 ${
                  errors.fullName ? 'border-error-red focus:ring-error-red/20' : 'border-violet-100 focus:border-pink-400 focus:ring-pink-500/15 focus:bg-white'
                } rounded-2xl text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-4`}
                {...register('fullName')}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-error-red mt-1 font-inter">{errors.fullName.message}</p>
            )}
          </div>

          {/* Academic/Work Email */}
          <div className="space-y-2">
            <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
              Academic/Work Email
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <input
                type="email"
                placeholder="s.chen@university.edu"
                className={`w-full pl-10 pr-4 py-3 bg-violet-50/40 border-2 ${
                  errors.email ? 'border-error-red focus:ring-error-red/20' : 'border-violet-100 focus:border-pink-400 focus:ring-pink-500/15 focus:bg-white'
                } rounded-2xl text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-4`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error-red mt-1 font-inter">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-violet-50/40 border-2 ${
                  errors.password ? 'border-error-red focus:ring-error-red/20' : 'border-violet-100 focus:border-pink-400 focus:ring-pink-500/15 focus:bg-white'
                } rounded-2xl text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-4`}
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
            {errors.password ? (
              <p className="text-xs text-error-red mt-1 font-inter">{errors.password.message}</p>
            ) : (
              <p className="font-mono text-[10px] md:text-[11px] text-slate-400 tracking-wide mt-1">
                Minimum 8 characters with at least one number.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-deep-indigo hover:bg-primary text-white py-3.5 px-4 rounded-full font-inter font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none mt-2"
          >
            <span>{isLoading ? 'Joining...' : 'Join Anveshak'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {SHOW_GOOGLE_SIGN_IN && (
          <>
          {/* Divider */}
          <div className="relative flex py-2 items-center mt-6">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 font-mono text-[10px] text-slate-400 tracking-wider font-semibold">
              OR SIGN UP WITH
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Social Buttons */}
          <div className="w-full mt-4">
            <button
              type="button"
              onClick={() => googleOAuthSignUp()}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border-2 border-violet-100 hover:border-pink-200 rounded-full bg-white hover:bg-pink-50/40 active:bg-slate-100 transition-colors shadow-sm cursor-pointer"
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
              <span className="font-inter text-sm font-medium text-slate-700">Continue with Google</span>
            </button>
          </div>
          </>
        )}

      </div>

      {/* Footer text below the card */}
      <div className="mt-6 text-center space-y-4 max-w-sm">
        <p className="font-inter text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-hanken font-bold text-vibrant-blue hover:text-primary transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>

    </div>
  );
}
