import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Sparkles, WandSparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiAlert } from '../components/ApiAlert';
import { Spinner } from '../components/Spinner';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

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
  const [passwordValue, setPasswordValue] = useState('');
  const passwordStrength = [
    passwordValue.length >= 8,
    /[A-Z]/.test(passwordValue),
    /[0-9]/.test(passwordValue),
    /[^A-Za-z0-9]/.test(passwordValue),
  ].filter(Boolean).length;

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
    <main className="grid min-h-screen place-items-center bg-career-grid px-4 py-10 text-slate-100">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[0.82fr_1fr]">
      <motion.div
        className="liquid-glass w-full rounded-[2rem] p-6 sm:p-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <Sparkles size={14} />
            Career OS
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Start tracking your placement plan with live backend data.</p>
        </div>

        {submitError ? (
          <div className="mb-5">
            <ApiAlert title="Registration failed" description={submitError} />
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Full name</span>
            <input
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            />
            {errors.fullName ? <p className="mt-2 text-sm text-red-300">{errors.fullName.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            />
            {errors.email ? <p className="mt-2 text-sm text-red-300">{errors.email.message}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-900/80 pr-2 transition focus-within:border-sky-400">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  onChange: (event) => setPasswordValue(event.target.value),
                })}
                className="w-full border-0 bg-transparent px-4 py-3 text-slate-100 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password ? <p className="mt-2 text-sm text-red-300">{errors.password.message}</p> : null}
            <div className="mt-3">
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className={`h-1.5 rounded-full ${passwordStrength >= item ? 'bg-emerald-400' : 'bg-white/10'}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Password strength: {passwordStrength <= 1 ? 'Basic' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Strong' : 'Excellent'}
              </p>
            </div>
          </label>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">
            Email verification and OTP steps are ready to fit here when the backend flow is enabled.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="stitch-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Spinner label="Creating account" /> : <>Create account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
            Google
          </button>
          <button type="button" className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
            GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-200 transition hover:text-white">
            Sign in
          </Link>
        </p>
      </motion.div>

      <motion.section
        className="stitch-panel stitch-hero hidden rounded-[2rem] p-8 lg:flex lg:flex-col lg:justify-between"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32 }}
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-100">
            <WandSparkles size={14} />
            AI-first preparation
          </div>
          <h2 className="mt-7 max-w-xl text-5xl font-bold leading-tight text-white">Build a placement workspace that compounds every day.</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Create your command center for roadmaps, resumes, company tracking, habits, and analytics with a premium dark interface from the first session.</p>
        </div>
        <div className="mt-10 space-y-3">
          {['Generate guided roadmaps', 'Track applications and practice', 'Turn activity into analytics'].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm font-semibold text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.8)]" />
              {item}
            </div>
          ))}
        </div>
      </motion.section>
      </div>
    </main>
  );
}
