import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiAlert } from '../components/ApiAlert';
import { Spinner } from '../components/Spinner';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitError('');

    try {
      await login(values);
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
      <div className="liquid-glass w-full max-w-md rounded-2xl p-6">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <Sparkles size={14} />
            Career OS
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Continue to your live placement workspace and today's priorities.</p>
        </div>

        {submitError ? (
          <div className="mb-5">
            <ApiAlert title="Login failed" description={submitError} />
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                {...register('password', { required: 'Password is required' })}
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
          </label>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input type="checkbox" className="h-4 w-4 rounded border-white/10" />
              Remember me
            </label>
            <Link to="/login" className="font-semibold text-indigo-200 transition hover:text-white">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="stitch-button inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Spinner label="Signing in" /> : 'Sign in'}
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
          Need an account?{' '}
          <Link to="/register" className="text-indigo-200 transition hover:text-white">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
