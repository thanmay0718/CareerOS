import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiAlert } from '../components/ApiAlert';
import { Spinner } from '../components/Spinner';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

const testimonials = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: 'Sarah Chen',
    handle: '@sarahdigital',
    text: 'The daily structure made placement prep feel less scattered and much easier to sustain.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Marcus Johnson',
    handle: '@marcustech',
    text: 'Roadmaps, tasks, and analytics finally sit in one calm workspace.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'David Martinez',
    handle: '@davidcreates',
    text: 'The progress signals are clear enough to decide what to study next.',
  },
];

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function GlassInputWrapper({ children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-sm transition focus-within:border-indigo-300/50 focus-within:bg-white/[0.07]">
      {children}
    </div>
  );
}

function TestimonialCard({ testimonial, delay }) {
  return (
    <div className={`animate-testimonial ${delay} flex w-64 items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-5 backdrop-blur-xl`}>
      <img src={testimonial.avatarSrc} className="h-10 w-10 rounded-2xl object-cover" alt={`${testimonial.name} avatar`} />
      <div className="text-sm leading-snug">
        <p className="font-medium text-white">{testimonial.name}</p>
        <p className="text-slate-400">{testimonial.handle}</p>
        <p className="mt-1 text-slate-300">{testimonial.text}</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAccount } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitError('');

    try {
      await registerAccount(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const validationErrors = getApiValidationErrors(error);
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field, { type: 'server', message });
        });
      } else {
        setSubmitError(getApiErrorMessage(error));
      }
    }
  };

  return (
    <main className="min-h-screen bg-career-grid px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:min-h-[min(720px,calc(100vh-5rem))] lg:grid-cols-[0.95fr_0.82fr]">
        <section className="relative hidden overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/70 p-8 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] lg:block xl:p-10">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/30 to-black/18" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold">
              <Sparkles size={20} />
              CareerOS
            </Link>
            <p className="animate-element animate-delay-700 mt-10 text-sm font-semibold text-indigo-100">Placement command center</p>
            <h2 className="animate-element animate-delay-800 mt-3 max-w-xl text-4xl font-bold leading-tight text-white xl:text-5xl">
              Build steady momentum before interview season starts.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/74">
              Create your account and bring roadmaps, tasks, applications, check-ins, and analytics into one calm workspace.
            </p>
          </div>
          <div className="absolute bottom-8 left-1/2 z-10 flex w-full -translate-x-1/2 justify-center gap-4 px-8">
            <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
            <div className="hidden xl:flex">
              <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
            </div>
          </div>
        </section>

        <section className="liquid-glass flex items-center justify-center rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <Link to="/" className="animate-element animate-delay-100 mb-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 transition hover:text-white">
              <span className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
                <Sparkles size={16} />
              </span>
              CareerOS
            </Link>

            <div className="flex flex-col gap-6">
              <div>
                <h1 className="animate-element animate-delay-200 text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                  Create your workspace
                </h1>
                <p className="animate-element animate-delay-300 mt-3 text-sm leading-6 text-slate-400">
                  Start planning, tracking, and improving your placement preparation from one focused account.
                </p>
              </div>

              {submitError ? (
                <div className="animate-element animate-delay-300">
                  <ApiAlert title="Registration failed" description={submitError} />
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <label className="animate-element animate-delay-400 block">
                  <span className="mb-2 block text-sm font-medium text-slate-400">Full name</span>
                  <GlassInputWrapper>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      {...register('fullName', { required: 'Full name is required' })}
                      className="w-full border-0 bg-transparent p-4 text-sm outline-none placeholder:text-slate-600"
                    />
                  </GlassInputWrapper>
                  {errors.fullName ? <p className="mt-2 text-sm text-red-300">{errors.fullName.message}</p> : null}
                </label>

                <label className="animate-element animate-delay-500 block">
                  <span className="mb-2 block text-sm font-medium text-slate-400">Email address</span>
                  <GlassInputWrapper>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full border-0 bg-transparent p-4 text-sm outline-none placeholder:text-slate-600"
                    />
                  </GlassInputWrapper>
                  {errors.email ? <p className="mt-2 text-sm text-red-300">{errors.email.message}</p> : null}
                </label>

                <label className="animate-element animate-delay-600 block">
                  <span className="mb-2 block text-sm font-medium text-slate-400">Password</span>
                  <GlassInputWrapper>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Create a password"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        })}
                        className="w-full border-0 bg-transparent p-4 pr-12 text-sm outline-none placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </GlassInputWrapper>
                  {errors.password ? <p className="mt-2 text-sm text-red-300">{errors.password.message}</p> : null}
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="animate-element animate-delay-700 stitch-button inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? <Spinner label="Creating account" /> : <>Create account <ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="animate-element animate-delay-800 relative flex items-center justify-center">
                <span className="w-full border-t border-white/10" />
                <span className="absolute bg-background px-4 text-sm text-slate-500">Or continue with</span>
              </div>

              <button type="button" className="animate-element animate-delay-900 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 py-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="animate-element animate-delay-1000 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-200 transition hover:text-white">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
