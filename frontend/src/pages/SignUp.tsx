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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fb] p-4 md:p-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-[#f7f9fb] to-indigo-50/30">
      
      {/* Centered Logo & Brand Headers */}
      <div className="text-center space-y-2 max-w-sm">
        <img 
          src={logo} 
          alt="Anveshak Logo" 
          className="w-10 h-10 object-contain mx-auto" 
        />
        <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 tracking-tight leading-none pt-2">
          Create your account
        </h1>
        <p className="font-inter text-sm text-slate-500">
          Your second brain for academic excellence.
        </p>
      </div>

      {/* Main SignUp Card */}
      <div className="w-full max-w-[460px] bg-white rounded-xl shadow-[0_12px_45px_-15px_rgba(0,0,0,0.06)] border border-slate-100 p-8 md:p-10 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Dr. Sarah Chen"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border ${
                  errors.fullName ? 'border-error-red focus:ring-error-red/20' : 'border-slate-200 focus:border-vibrant-blue focus:ring-vibrant-blue/20'
                } rounded-md text-slate-900 placeholder:text-slate-400 font-inter text-sm transition-all focus:outline-none focus:ring-2`}
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
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="s.chen@university.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border ${
                  errors.email ? 'border-error-red focus:ring-error-red/20' : 'border-slate-200 focus:border-vibrant-blue focus:ring-vibrant-blue/20'
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
            <label className="block font-inter text-xs md:text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border ${
                  errors.password ? 'border-error-red focus:ring-error-red/20' : 'border-slate-200 focus:border-vibrant-blue focus:ring-vibrant-blue/20'
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
            className="w-full bg-deep-indigo hover:bg-primary text-white py-2.5 px-4 rounded-md font-inter font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none mt-2"
          >
            <span>{isLoading ? 'Joining...' : 'Join Anveshak'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

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
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-slate-200 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm cursor-pointer"
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
        
        <p className="font-mono text-[10px] md:text-[11px] text-slate-400 leading-normal">
          By creating an account, you agree to Anveshak's{' '}
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              toast.info('Terms of Service dialog not implemented.');
            }}
            className="underline hover:text-slate-600 transition-colors"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              toast.info('Privacy Policy dialog not implemented.');
            }}
            className="underline hover:text-slate-600 transition-colors"
          >
            Privacy Policy
          </a>
          . We prioritize data privacy for all researchers.
        </p>
      </div>

    </div>
  );
}
