import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileSearch,
  FileText,
  Github,
  GraduationCap,
  Layers3,
  LineChart,
  Linkedin,
  MessageSquareText,
  Moon,
  NotebookTabs,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  TimerReset,
  Twitter,
  WandSparkles,
} from 'lucide-react';
import { GlassCard } from '../components/landing/GlassCard';
import { AiDataHills } from '../components/landing/AiDataHills';
import { MagneticLink } from '../components/landing/MagneticLink';
import { SectionHeader } from '../components/landing/SectionHeader';
import { OrbitGallery } from '../components/ui/3d-orbit-gallery';

const navItems = [
  ['Home', '#home'],
  ['Features', '#features'],
  ['Dashboard', '#dashboard'],
  ['AI Assistant', '#ai'],
  ['Roadmap', '#roadmap'],
  ['Pricing', '#pricing'],
  ['Testimonials', '#testimonials'],
  ['FAQ', '#faq'],
];

const trustedBy = ['Engineering Students', 'Universities', 'Placement Clubs', 'Career Mentors'];

const metricLabels = [
  ['Active Students', GraduationCap],
  ['Placement Goals Completed', Target],
  ['Tasks Finished', CheckCircle2],
  ['Mock Interviews', MessageSquareText],
  ['Companies Tracked', BriefcaseBusiness],
  ['AI Suggestions Generated', WandSparkles],
];

const features = [
  ['AI Career Assistant', 'Personalized recommendations, daily guidance, learning suggestions, and next-best-action planning.', Bot],
  ['Placement Dashboard', 'Real-time progress, readiness timelines, completion surfaces, and application momentum.', Layers3],
  ['Resume Analyzer', 'Resume scoring, ATS compatibility checks, version history, and improvement suggestions.', FileSearch],
  ['Company Preparation', 'Track target companies, rounds, deadlines, statuses, and role-specific preparation plans.', BriefcaseBusiness],
  ['DSA Tracker', 'Topic completion, difficulty progress, daily streaks, revision tracking, and coding consistency.', Code2],
  ['Mock Interview', 'Behavioral, technical, HR, and coding practice with structured performance reports.', MessageSquareText],
  ['Learning Roadmap', 'Frontend, backend, Java, Spring Boot, React, SQL, aptitude, AI, and cloud plans.', Route],
  ['Analytics', 'Weekly reports, monthly trends, productivity heatmaps, consistency graphs, and AI insights.', BarChart3],
  ['Daily Planner', 'Goals, check-ins, pomodoro sessions, habits, deadlines, and repeatable study rhythms.', CalendarCheck2],
];

const dashboardTabs = [
  ['Dashboard', Activity],
  ['Analytics', LineChart],
  ['Resume', FileText],
  ['Career Timeline', Route],
  ['Company Tracker', BriefcaseBusiness],
  ['Task Manager', NotebookTabs],
];

const journey = [
  'Sign Up',
  'Select Career Goal',
  'Set Daily Targets',
  'Track Learning',
  'AI Reviews Progress',
  'Resume Ready',
  'Interview Ready',
  'Placement Achieved',
];

const aiFeatures = [
  'AI Recommendation Engine',
  'Daily Planner',
  'Resume Review',
  'Career Prediction',
  'Placement Probability',
  'Weak Area Detection',
  'Interview Feedback',
  'Coding Suggestions',
  'Roadmap Generator',
  'Smart Notifications',
];

const modules = [
  ['Placement Preparation', ['Daily Tasks', 'Coding', 'Resume', 'Interview', 'Notes', 'Progress'], Target],
  ['Career Management', ['Applications', 'Offers', 'Company Status', 'Deadlines'], BriefcaseBusiness],
  ['Productivity', ['Calendar', 'Goals', 'Habits', 'Pomodoro', 'Streak'], TimerReset],
  ['AI', ['AI Mentor', 'Resume AI', 'Learning AI', 'Career AI', 'Analytics AI'], Bot],
];

const pricingPlans = [
  ['Starter', 'For students building their first placement rhythm.', ['Career dashboard', 'Daily task tracking', 'Resume workspace']],
  ['Professional', 'For serious preparation across companies and interviews.', ['AI recommendations', 'Company tracker', 'Analytics reports']],
  ['Ultimate', 'For complete career growth and guided placement readiness.', ['Roadmap generator', 'Mock interview reports', 'Advanced AI insights']],
];

const faqs = [
  ['Can this consume real backend data?', 'Yes. Landing surfaces are structured as data-ready shells and avoid hardcoded user statistics or fake testimonials.'],
  ['Where do CTAs go before login?', 'Primary actions route to sign up or login. Authenticated users are redirected to their dashboard by the existing route guards.'],
  ['Is this responsive?', 'Yes. The page is designed for mobile, tablet, desktop, and wider screens with stable dimensions.'],
  ['Does it support light mode?', 'The global theme variables still support light mode, while the landing page defaults to the premium dark product look.'],
];

const heroWidgets = [
  {
    title: 'Resume Score',
    value: '92%',
    caption: 'ATS Optimized',
    icon: FileSearch,
    className: 'lg:left-6 lg:top-28 xl:left-12',
    delay: 0.1,
    rotate: -2,
  },
  {
    title: 'Interview AI',
    value: 'Next Mock Interview',
    caption: 'Tomorrow - 6 PM',
    icon: MessageSquareText,
    className: 'lg:right-8 lg:top-24 xl:right-16',
    delay: 0.22,
    rotate: 2,
  },
  {
    title: 'Placement Tracker',
    value: 'Applications',
    caption: '18',
    icon: BriefcaseBusiness,
    className: 'lg:left-10 lg:bottom-24 xl:left-20',
    delay: 0.34,
    rotate: 1.5,
  },
  {
    title: 'Progress',
    value: '78%',
    caption: 'Placement Ready',
    icon: Target,
    className: 'lg:right-12 lg:bottom-28 xl:right-24',
    delay: 0.46,
    rotate: -1.5,
  },
];

const skillTags = ['Java', 'React', 'Spring Boot', 'DSA'];
const heatmapCells = [2, 3, 1, 4, 2, 5, 3, 1, 2, 4, 5, 3, 2, 4, 1, 5, 3, 4, 2, 5, 4, 3, 1, 2, 4, 5, 3, 4];

const orbitCards = [
  { title: 'Resume Builder', description: 'ATS score, versions, AI fixes' },
  { title: 'AI Interviews', description: 'Mock rounds and feedback' },
  { title: 'Placement Tracker', description: 'Applications and deadlines' },
  { title: 'Study Notes', description: 'Organized learning memory' },
  { title: 'Skill Roadmaps', description: 'Java, React, Spring Boot, DSA' },
  { title: 'Progress Analytics', description: 'Readiness and consistency' },
  { title: 'Daily Planner', description: 'Tasks, habits, reminders' },
  { title: 'AI Dashboard', description: 'One intelligent command center' },
];

function HeroWidget({ widget, index }) {
  const Icon = widget.icon;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className={`hero-floating-card group relative w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:w-64 lg:absolute ${widget.className}`}
      initial={{ opacity: 0, y: 26, scale: 0.94, rotate: widget.rotate }}
      animate={
        shouldReduceMotion
          ? { opacity: 1, y: 0, scale: 1, rotate: widget.rotate }
          : {
              opacity: 1,
              y: [0, -10 - index * 2, 0],
              scale: 1,
              rotate: [widget.rotate, widget.rotate * -0.55, widget.rotate],
            }
      }
      whileHover={{ y: -12, scale: 1.035, rotate: 0 }}
      transition={{
        opacity: { duration: 0.65, delay: widget.delay },
        scale: { duration: 0.65, delay: widget.delay },
        y: { duration: 6.5 + index, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: widget.delay },
        rotate: { duration: 7.5 + index, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: widget.delay },
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">{widget.title}</p>
          <p className="mt-2 text-lg font-bold leading-tight text-white">{widget.value}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-indigo-300/20 bg-indigo-500/15 text-indigo-100 shadow-lg shadow-indigo-500/15">
          <Icon size={18} />
        </span>
      </div>
      <p className={`mt-3 text-sm ${widget.title === 'Placement Tracker' ? 'text-3xl font-extrabold text-white' : 'text-slate-300'}`}>{widget.caption}</p>
    </motion.article>
  );
}

function SkillsWidget() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className="hero-floating-card relative w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:w-72 lg:absolute lg:left-1/2 lg:top-16 lg:-translate-x-1/2"
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : { opacity: 1, y: [0, -12, 0], scale: 1, rotate: [0, 1.2, 0] }}
      whileHover={{ y: -12, scale: 1.035 }}
      transition={{
        opacity: { duration: 0.65, delay: 0.28 },
        scale: { duration: 0.65, delay: 0.28 },
        y: { duration: 7.8, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: 0.28 },
        rotate: { duration: 8.6, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: 0.28 },
      }}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-indigo-300/20 bg-indigo-500/15 text-indigo-100">
          <Code2 size={18} />
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-400">Skills</p>
          <p className="text-sm font-bold text-white">Focus stack</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {skillTags.map((skill) => (
          <span key={skill} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">
            {skill}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

function HeatmapWidget() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className="hero-floating-card relative w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl sm:w-72 lg:absolute lg:bottom-14 lg:left-1/2 lg:-translate-x-1/2"
      initial={{ opacity: 0, y: 26, scale: 0.94 }}
      animate={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : { opacity: 1, y: [0, 10, 0], scale: 1, rotate: [0, -1, 0] }}
      whileHover={{ y: -10, scale: 1.035 }}
      transition={{
        opacity: { duration: 0.65, delay: 0.52 },
        scale: { duration: 0.65, delay: 0.52 },
        y: { duration: 8.2, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: 0.52 },
        rotate: { duration: 8.8, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut', delay: 0.52 },
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400">Heatmap Preview</p>
          <p className="mt-1 text-sm font-bold text-white">Study consistency</p>
        </div>
        <Activity size={18} className="text-indigo-100" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden="true">
        {heatmapCells.map((level, index) => (
          <span
            key={`${level}-${index}`}
            className="h-4 rounded-[5px] border border-white/5"
            style={{ backgroundColor: `rgba(99, 102, 241, ${0.12 + level * 0.13})` }}
          />
        ))}
      </div>
    </motion.article>
  );
}

function HeroOrbit() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="hero-orbit-canvas mx-auto mt-8 w-full max-w-5xl" aria-label="Careeros platform modules">
      <div className="hero-orbit-label">
        <Sparkles size={18} />
        <span>Careeros AI Hub</span>
      </div>
      <OrbitGallery items={orbitCards} reducedMotion={shouldReduceMotion} />
    </div>
  );
}

function DashboardMockup() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-3xl"
      initial={{ opacity: 0, y: 34, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="absolute -inset-5 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
      <div className="liquid-glass relative overflow-hidden rounded-2xl p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="h-3 w-3 rounded-full bg-cyan-400" />
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">placement.ai/workspace</div>
        </div>

        <div className="grid gap-4 pt-4 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            {dashboardTabs.map(([label, Icon], index) => (
              <motion.div
                key={label}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm ${index === 0 ? 'bg-cyan-400/12 text-white' : 'text-slate-400'}`}
                animate={{ x: [0, index % 2 ? 3 : -3, 0] }}
                transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon size={16} />
                {label}
              </motion.div>
            ))}
          </aside>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Resume Score', 'Daily Tasks', 'Coding Progress'].map((label, index) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                      initial={{ width: '18%' }}
                      animate={{ width: `${58 + index * 12}%` }}
                      transition={{ duration: 1.4, delay: index * 0.18 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">Placement Timeline</p>
                <Radar size={18} className="text-cyan-200" />
              </div>
              <div className="mt-4 grid grid-cols-6 items-end gap-2">
                {[44, 66, 52, 78, 62, 88].map((height, index) => (
                  <motion.div
                    key={height}
                    className="rounded-t bg-gradient-to-t from-blue-500/45 to-cyan-200"
                    initial={{ height: 18 }}
                    animate={{ height }}
                    transition={{ duration: 0.9, delay: index * 0.08 }}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {['AI Suggestions', 'Interview Tracker'].map((label) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-2 rounded-full bg-white/20" />
                    <div className="h-2 w-3/4 rounded-full bg-cyan-300/35" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PricingCard({ plan, index }) {
  const [name, description, items] = plan;
  const recommended = index === 1;

  return (
    <GlassCard className={`p-6 ${recommended ? 'border-orange-300/50 bg-orange-400/[0.045]' : ''}`} delay={index * 0.08}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        {recommended ? <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-slate-950">Recommended</span> : null}
      </div>
      <p className="mt-3 min-h-14 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-300">Pricing connects when billing data is available.</div>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
            <CheckCircle2 size={16} className="text-emerald-300" />
            {item}
          </li>
        ))}
      </ul>
      <MagneticLink to="/register" variant={recommended ? 'primary' : 'outline'} className="mt-7 w-full">
        Sign Up Free
      </MagneticLink>
    </GlassCard>
  );
}

export default function LandingPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('careeros-theme') || 'dark');
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const navPadding = useTransform(scrollY, [0, 120], [18, 10]);

  const particles = useMemo(
    () => Array.from({ length: 18 }, (_, index) => ({ id: index, left: `${(index * 37) % 100}%`, top: `${(index * 23) % 80}%` })),
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('careeros-theme', theme);
  }, [theme]);

  return (
    <main id="home" className="landing-canvas min-h-screen overflow-hidden text-slate-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="landing-grid absolute inset-0" />
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute h-1 w-1 rounded-full bg-cyan-200/60"
            style={{ left: particle.left, top: particle.top }}
            animate={{ opacity: [0.15, 0.75, 0.15], y: [0, -18, 0] }}
            transition={{ duration: 4 + (particle.id % 5), repeat: Infinity, delay: particle.id * 0.12 }}
          />
        ))}
      </div>

      <motion.header
        className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-2xl"
        style={{ paddingTop: navPadding, paddingBottom: navPadding }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Careeros home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
              <Sparkles size={19} />
            </span>
            <span>
              <span className="block font-bold text-white">Careeros</span>
              <span className="block text-xs text-slate-400">Career growth workspace</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-slate-300 xl:flex" aria-label="Primary navigation">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} className="transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/login" className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:inline-flex">
              Login
            </Link>
            <Link to="/register" className="stitch-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold">
              Sign Up Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.header>

      <section className="careeros-hero relative z-10 min-h-[calc(100vh-78px)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <AiDataHills className="absolute inset-0 z-0 opacity-35" />
        <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.10),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0.70)_42%,rgba(0,0,0,0.96)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 z-[1] h-56 bg-gradient-to-b from-black via-black/90 to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[1] h-44 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-142px)] max-w-7xl grid-rows-[auto_minmax(280px,1fr)] items-center">
          <motion.div
            className="mx-auto max-w-5xl pt-4 text-center"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1, delayChildren: 0.08 },
              },
            }}
          >
            <motion.p
              className="stitch-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-2xl shadow-indigo-500/10 sm:text-sm"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
              }}
            >
              <Sparkles size={15} />
              AI Powered Career Growth Platform
            </motion.p>
            <motion.h1
              className="mx-auto mt-7 max-w-5xl text-4xl font-semibold leading-[1.03] text-white sm:text-6xl lg:text-7xl xl:text-[5.4rem]"
              variants={{
                hidden: { opacity: 0, y: 26 },
                show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
              }}
            >
              Build Your Career with AI.
              <span className="block text-white">Land Your Dream Job Faster.</span>
            </motion.h1>
            <motion.p
              className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg"
              variants={{
                hidden: { opacity: 0, y: 26 },
                show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
              }}
            >
              Create ATS-friendly resumes, practice AI interviews, manage notes, track placements, analyze progress, and prepare smarter - all from one intelligent dashboard.
            </motion.p>
            <motion.div
              className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
              variants={{
                hidden: { opacity: 0, y: 26 },
                show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
              }}
            >
              <MagneticLink to="/register" className="hero-cta w-full sm:w-auto">
                Get Started
                <ArrowRight size={17} />
              </MagneticLink>
              <MagneticLink to="#features" variant="secondary" className="hero-cta w-full sm:w-auto">
                Explore Features
              </MagneticLink>
            </motion.div>
          </motion.div>

          <HeroOrbit />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metricLabels.map(([label, Icon], index) => (
            <GlassCard key={label} className="p-4" delay={index * 0.04}>
              <Icon size={19} className="text-cyan-200" />
              <p className="mt-4 text-sm font-bold text-white">{label}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Connects to live platform analytics</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why this platform"
          title="Everything You Need To Crack Placements"
          description="A unified workspace for preparation, execution, applications, interviews, analytics, and AI guidance."
          align="center"
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, description, Icon], index) => (
            <GlassCard key={title} className="p-6" delay={index * 0.04}>
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-100">
                  <Icon size={20} />
                </span>
                <ArrowRight size={17} className="text-slate-600" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="dashboard" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Interactive dashboard showcase"
          title="Floating browser mockups for every career workflow"
          description="Dashboard, analytics, resume, career timeline, company tracker, and task manager surfaces are presented as synchronized, data-ready product views."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {dashboardTabs.map(([label, Icon], index) => (
            <GlassCard key={label} className={`p-5 ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`} delay={index * 0.06}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={19} className="text-emerald-200" />
                  <h3 className="font-bold text-white">{label}</h3>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-3 rounded-full bg-white/15" />
                <div className="h-3 w-4/5 rounded-full bg-cyan-300/25" />
                <div className="h-3 w-2/3 rounded-full bg-emerald-300/25" />
              </div>
              {index === 0 ? <DashboardMockup /> : null}
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="roadmap" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Placement journey timeline" title="From first target to final offer" align="center" />
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {journey.map((step, index) => (
            <GlassCard key={step} className="p-5" delay={index * 0.05}>
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/15 text-sm font-bold text-emerald-100">{index + 1}</span>
                {index < journey.length - 1 ? <ArrowRight size={17} className="hidden text-slate-600 md:block" /> : <CheckCircle2 size={17} className="text-emerald-200" />}
              </div>
              <p className="mt-5 font-semibold text-white">{step}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="ai" className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <SectionHeader
          eyebrow="Smart AI features"
          title="A calm assistant that turns progress into action"
          description="AI surfaces are designed around recommendations, planning, resume review, career prediction, weak area detection, and feedback loops."
        />
        <GlassCard className="p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {aiFeatures.map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300"
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
              >
                <Sparkles size={15} className="text-purple-200" />
                {item}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section id="testimonials" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why students love it"
          title="Success stories without fake numbers"
          description="The testimonial and outcomes area is ready to render student profiles, placement statistics, resume improvement, learning consistency, and interview success from backend data."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {['Student Success Stories', 'Placement Statistics', 'Interview Success'].map((title, index) => (
            <GlassCard key={title} className="p-6" delay={index * 0.08}>
              <div className="flex items-center gap-1 text-orange-300" aria-label="Rating placeholder">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={15} fill="currentColor" />
                ))}
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">Dynamic profile, role, package, review, and outcome data can populate this card after API integration.</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Core modules" title="Every part of preparation, organized" align="center" />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(([title, items, Icon], index) => (
            <GlassCard key={title} className="p-6" delay={index * 0.06}>
              <Icon size={21} className="text-cyan-200" />
              <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Application preview" title="MacBook, tablet, and mobile previews stay synchronized" />
        <div className="mt-12 grid items-end gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <GlassCard className="p-4">
            <div className="aspect-[16/10] rounded-2xl border border-white/10 bg-black/30 p-5">
              <DashboardMockup />
            </div>
          </GlassCard>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <GlassCard className="p-4">
              <div className="aspect-[4/5] rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="h-3 w-1/3 rounded-full bg-cyan-200/40" />
                <div className="mt-6 space-y-3">
                  <div className="h-20 rounded-2xl bg-white/[0.05]" />
                  <div className="h-20 rounded-2xl bg-white/[0.05]" />
                  <div className="h-20 rounded-2xl bg-white/[0.05]" />
                </div>
              </div>
            </GlassCard>
            <GlassCard className="mx-auto w-full max-w-xs p-4">
              <div className="aspect-[9/16] rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="mx-auto h-1 w-12 rounded-full bg-white/25" />
                <div className="mt-6 space-y-3">
                  <div className="h-24 rounded-2xl bg-cyan-300/10" />
                  <div className="h-12 rounded-2xl bg-white/[0.05]" />
                  <div className="h-12 rounded-2xl bg-white/[0.05]" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Pricing" title="Modern SaaS plans, ready for dynamic billing" align="center" />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={plan[0]} plan={plan} index={index} />
          ))}
        </div>
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Clear answers for a serious product" align="center" />
        <div className="mt-10 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="stitch-panel group rounded-2xl p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white">
                {question}
                <ChevronDown size={18} className="transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-sm leading-6 text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="stitch-panel stitch-hero rounded-2xl p-8 text-center sm:p-12">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">Ready To Transform Your Placement Journey?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">Join thousands of students preparing smarter with AI.</p>
          <div className="mt-8 flex justify-center gap-3">
            <MagneticLink to="/register">Get Started Free</MagneticLink>
            <MagneticLink to="/login" variant="secondary">Schedule Demo</MagneticLink>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-12 text-sm text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="font-bold text-white">Careeros</div>
            <p className="mt-3 max-w-sm leading-6">AI-powered career growth, placement preparation, and productivity in one unified ecosystem.</p>
            <div className="mt-5 flex gap-3">
              {[Github, Linkedin, Twitter].map((Icon, index) => (
                <span key={index} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-300">
                  <Icon size={17} />
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-4">
            {[
              ['Product', ['Features', 'Pricing', 'AI Assistant']],
              ['Resources', ['Blog', 'Documentation', 'Community']],
              ['Company', ['About', 'Contact', 'Careers']],
              ['Newsletter', ['Privacy', 'Terms', 'Copyright']],
            ].map(([title, links]) => (
              <div key={title}>
                <h3 className="font-bold text-white">{title}</h3>
                <div className="mt-4 space-y-3">
                  {links.map((link) => (
                    <div key={link}>{link}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
