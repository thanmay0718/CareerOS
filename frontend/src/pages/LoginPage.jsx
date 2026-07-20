import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiAlert } from '../components/ApiAlert';
import { Spinner } from '../components/Spinner';
import { getApiErrorMessage, getApiValidationErrors } from '../utils/apiErrors';

function Pupil({ size = 12, maxDistance = 5, pupilColor = '#1f2937', forceLookX, forceLookY }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => setMouse({ x: event.clientX, y: event.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getPosition = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    if (!pupilRef.current) {
      return { x: 0, y: 0 };
    }

    const rect = pupilRef.current.getBoundingClientRect();
    const deltaX = mouse.x - (rect.left + rect.width / 2);
    const deltaY = mouse.y - (rect.top + rect.height / 2);
    const distance = Math.min(Math.hypot(deltaX, deltaY), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const position = getPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 100ms ease-out',
      }}
    />
  );
}

function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = '#1f2937', isBlinking = false, forceLookX, forceLookY }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => setMouse({ x: event.clientX, y: event.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getPosition = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    if (!eyeRef.current) {
      return { x: 0, y: 0 };
    }

    const rect = eyeRef.current.getBoundingClientRect();
    const deltaX = mouse.x - (rect.left + rect.width / 2);
    const deltaY = mouse.y - (rect.top + rect.height / 2);
    const distance = Math.min(Math.hypot(deltaX, deltaY), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const position = getPosition();

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center rounded-full transition-all duration-150"
      style={{
        width: size,
        height: isBlinking ? 2 : size,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking ? (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: 'transform 100ms ease-out',
          }}
        />
      ) : null}
    </div>
  );
}

function LoginCharacters({ isTyping, password, showPassword }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [purpleBlinking, setPurpleBlinking] = useState(false);
  const [blackBlinking, setBlackBlinking] = useState(false);
  const [lookingAtEachOther, setLookingAtEachOther] = useState(false);
  const [purplePeeking, setPurplePeeking] = useState(false);
  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);
  const passwordVisible = password.length > 0 && showPassword;
  const passwordHidden = password.length > 0 && !showPassword;

  useEffect(() => {
    const handleMouseMove = (event) => setMouse({ x: event.clientX, y: event.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const scheduleBlink = (setter) => {
      const timeout = window.setTimeout(() => {
        setter(true);
        window.setTimeout(() => {
          setter(false);
          scheduleBlink(setter);
        }, 150);
      }, Math.random() * 4000 + 3000);

      return timeout;
    };

    const purpleTimeout = scheduleBlink(setPurpleBlinking);
    const blackTimeout = scheduleBlink(setBlackBlinking);
    return () => {
      window.clearTimeout(purpleTimeout);
      window.clearTimeout(blackTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isTyping) {
      setLookingAtEachOther(false);
      return undefined;
    }

    setLookingAtEachOther(true);
    const timer = window.setTimeout(() => setLookingAtEachOther(false), 800);
    return () => window.clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    if (!passwordVisible) {
      setPurplePeeking(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPurplePeeking(true);
      window.setTimeout(() => setPurplePeeking(false), 800);
    }, Math.random() * 3000 + 2000);

    return () => window.clearTimeout(timer);
  }, [passwordVisible, purplePeeking]);

  const calculatePosition = (ref) => {
    if (!ref.current) {
      return { faceX: 0, faceY: 0, bodySkew: 0 };
    }

    const rect = ref.current.getBoundingClientRect();
    const deltaX = mouse.x - (rect.left + rect.width / 2);
    const deltaY = mouse.y - (rect.top + rect.height / 3);

    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    };
  };

  const purple = calculatePosition(purpleRef);
  const black = calculatePosition(blackRef);
  const yellow = calculatePosition(yellowRef);
  const orange = calculatePosition(orangeRef);

  return (
    <div className="relative h-[360px] w-[500px] max-w-full overflow-visible">
      <div
        ref={purpleRef}
        className="absolute bottom-0 left-[64px] w-[166px] rounded-t-[18px] bg-[#6c3ff5] shadow-[0_22px_60px_rgba(31,18,74,0.28)] transition-all duration-700 ease-in-out"
        style={{
          height: isTyping || passwordHidden ? 390 : 350,
          zIndex: 1,
          transform: passwordVisible ? 'skewX(0deg)' : isTyping || passwordHidden ? `skewX(${purple.bodySkew - 12}deg) translateX(38px)` : `skewX(${purple.bodySkew}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{
            left: passwordVisible ? 20 : lookingAtEachOther ? 54 : 43 + purple.faceX,
            top: passwordVisible ? 34 : lookingAtEachOther ? 64 : 39 + purple.faceY,
          }}
        >
          {[0, 1].map((item) => (
            <EyeBall
              key={item}
              size={18}
              pupilSize={7}
              maxDistance={5}
              isBlinking={purpleBlinking}
              forceLookX={passwordVisible ? (purplePeeking ? 4 : -4) : lookingAtEachOther ? 3 : undefined}
              forceLookY={passwordVisible ? (purplePeeking ? 5 : -4) : lookingAtEachOther ? 4 : undefined}
            />
          ))}
        </div>
      </div>

      <div
        ref={blackRef}
        className="absolute bottom-0 left-[220px] w-[112px] rounded-t-[16px] bg-[#2d2d2d] shadow-[0_20px_50px_rgba(0,0,0,0.26)] transition-all duration-700 ease-in-out"
        style={{
          height: 275,
          zIndex: 2,
          transform: passwordVisible ? 'skewX(0deg)' : lookingAtEachOther ? `skewX(${black.bodySkew * 1.5 + 10}deg) translateX(18px)` : `skewX(${black.bodySkew * 1.5}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{
            left: passwordVisible ? 10 : lookingAtEachOther ? 30 : 24 + black.faceX,
            top: passwordVisible ? 28 : lookingAtEachOther ? 14 : 31 + black.faceY,
          }}
        >
          {[0, 1].map((item) => (
            <EyeBall
              key={item}
              size={16}
              pupilSize={6}
              maxDistance={4}
              isBlinking={blackBlinking}
              forceLookX={passwordVisible ? -4 : lookingAtEachOther ? 0 : undefined}
              forceLookY={passwordVisible ? -4 : lookingAtEachOther ? -4 : undefined}
            />
          ))}
        </div>
      </div>

      <div
        ref={orangeRef}
        className="absolute bottom-0 left-0 h-[178px] w-[220px] rounded-t-full bg-[#ff9b6b] shadow-[0_18px_50px_rgba(255,155,107,0.18)] transition-all duration-700 ease-in-out"
        style={{
          zIndex: 3,
          transform: passwordVisible ? 'skewX(0deg)' : `skewX(${orange.bodySkew}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{
            left: passwordVisible ? 48 : 76 + orange.faceX,
            top: passwordVisible ? 78 : 82 + orange.faceY,
          }}
        >
          {[0, 1].map((item) => (
            <Pupil key={item} forceLookX={passwordVisible ? -5 : undefined} forceLookY={passwordVisible ? -4 : undefined} />
          ))}
        </div>
      </div>

      <div
        ref={yellowRef}
        className="absolute bottom-0 left-[286px] h-[210px] w-[132px] rounded-t-full bg-[#e8d754] shadow-[0_18px_50px_rgba(232,215,84,0.16)] transition-all duration-700 ease-in-out"
        style={{
          zIndex: 4,
          transform: passwordVisible ? 'skewX(0deg)' : `skewX(${yellow.bodySkew}deg)`,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{
            left: passwordVisible ? 20 : 48 + yellow.faceX,
            top: passwordVisible ? 35 : 39 + yellow.faceY,
          }}
        >
          {[0, 1].map((item) => (
            <Pupil key={item} forceLookX={passwordVisible ? -5 : undefined} forceLookY={passwordVisible ? -4 : undefined} />
          ))}
        </div>
        <div
          className="absolute h-1 w-20 rounded-full bg-[#2d2d2d] transition-all duration-200 ease-out"
          style={{
            left: passwordVisible ? 10 : 36 + yellow.faceX,
            top: passwordVisible ? 88 : 84 + yellow.faceY,
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const password = watch('password') || '';

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
    <main className="min-h-screen bg-career-grid px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:min-h-[min(720px,calc(100vh-5rem))] lg:grid-cols-[0.95fr_0.82fr]">
        <motion.section
          className="relative hidden overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,#6c3ff5_0%,#5b36dd_48%,#3f2a98_100%)] p-8 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] lg:flex lg:flex-col lg:justify-between xl:p-10"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32 }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute right-[10%] top-[8%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[8%] left-[6%] h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold">
                <Sparkles size={20} />
                CareerOS
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur">
                <ShieldCheck size={14} />
                Secure placement workspace
              </div>
            </div>
            <h2 className="mt-9 max-w-xl text-4xl font-bold leading-tight text-white xl:text-5xl">Your dashboard is already watching the right signals.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/74">Sign in to continue planning, tracking, and improving your placement readiness with a calmer AI workspace.</p>
          </div>

          <div className="relative z-10 flex flex-1 items-end justify-center overflow-hidden pt-6">
            <div className="origin-bottom scale-[0.86] xl:scale-95">
              <LoginCharacters isTyping={isTyping} password={password} showPassword={showPassword} />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-7 text-sm text-white/62">
            <Link to="/" className="transition hover:text-white">Privacy Policy</Link>
            <Link to="/" className="transition hover:text-white">Terms of Service</Link>
            <Link to="/" className="transition hover:text-white">Contact</Link>
          </div>
        </motion.section>

        <motion.section
          className="liquid-glass flex items-center justify-center rounded-[2rem] p-6 sm:p-8 lg:p-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="w-full max-w-[430px]">
            <div className="mb-8 text-center lg:hidden">
              <Link to="/" className="inline-flex items-center justify-center gap-2 text-lg font-bold text-white">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/15 text-indigo-100">
                  <Sparkles size={17} />
                </span>
                CareerOS
              </Link>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-400">Please enter your details to continue</p>
            </div>

            {submitError ? (
              <div className="mb-5">
                <ApiAlert title="Login failed" description={submitError} />
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="anna@gmail.com"
                  {...register('email', { required: 'Email is required' })}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-300/50 focus:bg-white/[0.07]"
                />
                {errors.email ? <p className="mt-2 text-sm text-red-300">{errors.email.message}</p> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
                <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-white/[0.045] pr-2 transition focus-within:border-indigo-300/50 focus-within:bg-white/[0.07]">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Password"
                    {...register('password', { required: 'Password is required' })}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    className="h-full w-full border-0 bg-transparent px-4 text-slate-100 outline-none placeholder:text-slate-600"
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
                  <input type="checkbox" className="h-4 w-4 rounded border-white/10 accent-indigo-500" />
                  Remember for 30 days
                </label>
                <Link to="/login" className="font-semibold text-indigo-200 transition hover:text-white">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="stitch-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Spinner label="Signing in" /> : <>Log in <ArrowRight size={16} /></>}
              </button>
            </form>

            <button type="button" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
              <Mail className="mr-2 size-5" />
              Log in with Google
            </button>

            <p className="mt-8 text-center text-sm text-slate-400">
              Need an account?{' '}
              <Link to="/register" className="font-semibold text-white transition hover:text-indigo-200">
                Sign up
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
