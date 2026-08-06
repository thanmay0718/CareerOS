import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Code2,
  FileCheck2,
  Github,
  GraduationCap,
  LineChart,
  Linkedin,
  Mail,
  Map,
  MessageSquareText,
  Play,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Twitter,
  Users,
  Zap,
} from 'lucide-react';

const navItems = [
  ['Features', '#features'],
  ['Dashboard Preview', '#showcase'],
  ['Pricing', '#pricing'],
  ['About', '#about'],
  ['Contact', '#contact'],
  ['Blog', '#blog'],
];

const companies = ['TCS', 'Infosys', 'Accenture', 'Microsoft', 'Amazon', 'Google', 'Oracle', 'Capgemini', 'Cisco', 'Wipro'];

const featureCards = [
  ['AI Roadmap Generator', 'Turn your target role into a daily execution plan.', Map],
  ['Resume Analyzer', 'Score, improve, and tailor resumes for each opening.', FileCheck2],
  ['Mock Interview', 'Practice HR, DSA, system design, and project rounds.', MessageSquareText],
  ['Placement Dashboard', 'Your preparation, applications, and readiness in one view.', ClipboardList],
  ['Progress Analytics', 'Understand momentum, weak spots, and consistency.', BarChart3],
  ['Company Tracker', 'Track rounds, deadlines, status, notes, and follow-ups.', BriefcaseBusiness],
  ['Revision Planner', 'Spaced repetition for DSA, CS fundamentals, and notes.', CalendarDays],
  ['Daily Challenges', 'Focused tasks that keep preparation moving every day.', Zap],
  ['Study Notes', 'Capture concepts, mistakes, and interview learnings.', Bookmark],
  ['LeetCode Tracker', 'Monitor solved problems by topic, difficulty, and streak.', Code2],
  ['GitHub Activity', 'Connect projects and contribution consistency.', Github],
  ['Achievements', 'Milestones that make long prep feel visible.', Trophy],
  ['Coins', 'Reward focused execution and completed challenges.', Star],
  ['Streak System', 'Build durable preparation habits with streaks.', Activity],
  ['XP Level', 'Level up by completing roadmap milestones.', GraduationCap],
  ['Calendar', 'Keep study sessions and application deadlines aligned.', CalendarDays],
  ['Bookmarks', 'Save companies, notes, questions, and resources.', Bookmark],
  ['Dark Mode', 'A premium workspace built for long focus sessions.', Sparkles],
];

const steps = [
  ['Create Account', 'Start with your placement target and academic context.'],
  ['Select Interests', 'Choose roles, companies, tech stacks, and timelines.'],
  ['Generate AI Roadmap', 'CareerOS converts goals into a smart preparation plan.'],
  ['Complete Daily Tasks', 'Work through DSA, resume, projects, notes, and mocks.'],
  ['Track Progress', 'Watch consistency, readiness, and weak areas improve.'],
  ['Crack Placements', 'Apply with confidence and prepare for every round.'],
];

const showcaseTabs = [
  {
    key: 'Dashboard',
    title: 'Mission control for placement preparation',
    metric: '82%',
    caption: 'Readiness score',
    items: ['7 day streak', '24 tasks completed', '6 active applications'],
  },
  {
    key: 'Resume',
    title: 'Resume intelligence before every application',
    metric: '91',
    caption: 'ATS score',
    items: ['Impact rewrite', 'Keyword gaps', 'Project proof points'],
  },
  {
    key: 'Mock Interview',
    title: 'Practice rounds with immediate feedback',
    metric: '8.7',
    caption: 'Interview score',
    items: ['Communication', 'Problem solving', 'Confidence trend'],
  },
  {
    key: 'Analytics',
    title: 'Know exactly where effort is compounding',
    metric: '46h',
    caption: 'Monthly study time',
    items: ['DSA velocity', 'Weekly focus', 'Topic coverage'],
  },
  {
    key: 'Roadmap',
    title: 'A daily plan that adapts as you improve',
    metric: '34',
    caption: 'Roadmap days',
    items: ['DSA foundations', 'Projects', 'Interview revision'],
  },
  {
    key: 'Applications',
    title: 'Never lose track of an opportunity again',
    metric: '18',
    caption: 'Tracked companies',
    items: ['Round status', 'Follow-ups', 'Deadline alerts'],
  },
];

const aiFeatures = [
  ['AI Mentor', 'Ask what to study next, why you are stuck, and how to recover momentum.', Brain],
  ['Resume Review', 'Get targeted rewrites, missing keywords, and role-specific feedback.', FileCheck2],
  ['Roadmap Generator', 'Generate a plan from target companies, current skills, and time left.', Map],
  ['Interview Feedback', 'Receive structured feedback on clarity, depth, and confidence.', MessageSquareText],
  ['Personalized Suggestions', 'CareerOS recommends tasks from your progress and weak areas.', Sparkles],
  ['Career Insights', 'Understand role fit, preparation gaps, and application strategy.', SearchCheck],
];

const metrics = [
  ['10K+', 'Problems Solved'],
  ['500+', 'Mock Interviews'],
  ['95%', 'User Satisfaction'],
  ['1M+', 'Study Hours'],
  ['100K+', 'Roadmaps Generated'],
];

const testimonials = [
  ['Aarav Mehta', 'SDE Intern at Microsoft', 'CareerOS made my preparation finally feel organized. The roadmap and daily tasks kept me honest every week.', 'AM'],
  ['Nisha Rao', 'Analyst at Accenture', 'The application tracker and mock feedback helped me prepare for each company with much less stress.', 'NR'],
  ['Kabir Sen', 'Backend Developer at Amazon', 'I used the analytics view to identify weak topics and rebuilt my DSA schedule around them.', 'KS'],
  ['Mira Shah', 'Graduate Engineer at Infosys', 'The resume review gave me clear fixes instead of generic advice. My shortlist rate improved quickly.', 'MS'],
];

const faqs = [
  ['What is CareerOS?', 'CareerOS is an AI powered placement preparation operating system for roadmaps, DSA, resumes, interviews, analytics, and applications.'],
  ['Is it Free?', 'CareerOS can support a free starter plan, with pricing-ready sections prepared for future premium workflows.'],
  ['Can I Track LeetCode?', 'Yes. The product experience includes solved problems, topic coverage, heatmaps, streaks, and readiness analytics.'],
  ['Can AI Review Resume?', 'Yes. CareerOS is designed around resume scoring, targeted rewrites, keyword gaps, and role-specific improvements.'],
  ['Can I Track Applications?', 'Yes. You can track companies, status, rounds, notes, deadlines, and follow-ups from one dashboard.'],
  ['Can I Generate Roadmaps?', 'Yes. The AI roadmap generator turns goals, interests, and timelines into daily preparation plans.'],
  ['Can I Prepare for Interviews?', 'Yes. CareerOS supports mock interviews, feedback, scores, revision plans, and improvement trends.'],
];

const heatmap = Array.from({ length: 56 }, (_, index) => {
  const levels = ['bg-slate-700/50', 'bg-indigo-500/40', 'bg-violet-500/55', 'bg-emerald-400/65'];
  return levels[(index * 7 + index) % levels.length];
});

const sectionMotion = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

function LogoMark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-indigo-100 shadow-[0_0_32px_rgba(99,102,241,0.28)]">
      <Sparkles size={18} />
    </span>
  );
}

function ButtonLink({ to, href, children, variant = 'primary', className = '' }) {
  const classes =
    variant === 'primary'
      ? 'career-button career-button-primary'
      : 'career-button career-button-secondary';
  const content = <span className={`${classes} ${className}`}>{children}</span>;

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <a href={href}>{content}</a>;
}

function SectionHeader({ eyebrow, title, description, center = false }) {
  return (
    <motion.div
      className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
      variants={sectionMotion}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <p className="text-sm font-semibold uppercase text-indigo-200">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{description}</p> : null}
    </motion.div>
  );
}

function CareerCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={`career-glass career-card ${className}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.01 }}
    >
      {children}
    </motion.div>
  );
}

function DashboardMockup({ pointerX, pointerY }) {
  const shouldReduceMotion = useReducedMotion();
  const rotateX = useTransform(pointerY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(pointerX, [-0.5, 0.5], [-7, 7]);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 24 });

  return (
    <motion.div
      className="relative mx-auto w-full max-w-2xl"
      style={shouldReduceMotion ? undefined : { rotateX: springX, rotateY: springY, transformPerspective: 1100 }}
    >
      <div className="career-dashboard-shell">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">CareerOS Live Dashboard</span>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Readiness</p>
                  <p className="mt-1 text-3xl font-semibold text-white">82%</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-indigo-500/15 text-indigo-100">
                  <Target size={24} />
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400"
                  initial={{ width: '24%' }}
                  whileInView={{ width: '82%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 rounded-xl border border-white/10 bg-slate-950/45 p-4">
              {heatmap.map((level, index) => (
                <motion.span
                  key={index}
                  className={`h-5 rounded ${level}`}
                  initial={{ opacity: 0.25, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: index * 0.008 }}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['DSA', '142', Code2],
                ['Mocks', '18', MessageSquareText],
                ['Apps', '24', BriefcaseBusiness],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <Icon className="text-indigo-200" size={18} />
                  <p className="mt-3 text-xl font-semibold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">AI Mentor</p>
                <Sparkles size={18} className="text-emerald-300" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Focus on graphs today. Your interview score drops when explaining tradeoffs.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-semibold text-white">Roadmap</p>
              <div className="mt-4 space-y-3">
                {['Arrays revision', 'Resume impact rewrite', 'Mock interview round'].map((task, index) => (
                  <div key={task} className="flex items-center gap-3">
                    <span className={index === 0 ? 'task-dot task-dot-active' : 'task-dot'} />
                    <span className="text-sm text-slate-300">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-xs text-emerald-100">Coins</p>
                <p className="mt-1 text-2xl font-semibold text-white">2,480</p>
              </div>
              <div className="rounded-xl border border-indigo-300/20 bg-indigo-400/10 p-4">
                <p className="text-xs text-indigo-100">Streak</p>
                <p className="mt-1 text-2xl font-semibold text-white">17 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="floating-card floating-card-left"
        animate={shouldReduceMotion ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Trophy size={17} className="text-amber-200" />
        <span>Interview score 8.7</span>
      </motion.div>
      <motion.div
        className="floating-card floating-card-right"
        animate={shouldReduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Bell size={17} className="text-emerald-200" />
        <span>3 tasks due today</span>
      </motion.div>
    </motion.div>
  );
}

function ProductShowcase() {
  const [active, setActive] = useState(showcaseTabs[0]);

  return (
    <section id="showcase" className="career-section">
      <SectionHeader
        center
        eyebrow="Product Showcase"
        title="A complete placement workspace across every screen"
        description="Switch between the core workflows students use every day: dashboard, resume, mock interviews, analytics, roadmaps, and applications."
      />

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {showcaseTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active.key === tab.key
                ? 'border-indigo-300/40 bg-indigo-400/20 text-white'
                : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white'
            }`}
          >
            {tab.key}
          </button>
        ))}
      </div>

      <motion.div
        key={active.key}
        className="career-laptop mx-auto mt-8 max-w-6xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div>
            <p className="text-sm font-semibold text-indigo-200">{active.key}</p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight text-white">{active.title}</h3>
            <div className="mt-8 flex items-end gap-3">
              <span className="text-6xl font-semibold text-white">{active.metric}</span>
              <span className="pb-2 text-slate-300">{active.caption}</span>
            </div>
            <div className="mt-8 space-y-3">
              {active.items.map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-300">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-200">
                    <Check size={14} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 rounded-lg bg-white/[0.05] p-4 md:col-span-7">
                <p className="text-xs text-slate-400">Weekly Progress</p>
                <div className="mt-5 flex h-48 items-end gap-2">
                  {[32, 58, 44, 72, 66, 86, 78, 94].map((height, index) => (
                    <motion.span
                      key={index}
                      className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-emerald-300"
                      initial={{ height: 12 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.7, delay: index * 0.04 }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-12 space-y-3 md:col-span-5">
                {['Resume', 'DSA', 'Interview', 'Applications'].map((item, index) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item}</span>
                      <span className="text-white">{72 + index * 6}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-indigo-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${72 + index * 6}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="career-phone mx-auto mt-6 max-w-xs p-4">
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-white/20" />
        <div className="rounded-xl bg-white/[0.05] p-4">
          <p className="text-xs text-slate-400">Today</p>
          <p className="mt-2 text-lg font-semibold text-white">3 focused tasks</p>
          <div className="mt-4 space-y-2">
            {['Solve 2 graph problems', 'Review resume bullets', 'Mock HR answer'].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="career-section">
      <SectionHeader center eyebrow="FAQ" title="Everything students ask before starting" description="Clear answers for the workflows CareerOS is built to support." />
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {faqs.map(([question, answer], index) => (
          <div key={question} className="rounded-xl border border-white/10 bg-white/[0.04]">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-white"
              onClick={() => setOpen(open === index ? -1 : index)}
            >
              {question}
              <ChevronDown className={`shrink-0 transition ${open === index ? 'rotate-180' : ''}`} size={18} />
            </button>
            <motion.div
              initial={false}
              animate={{ height: open === index ? 'auto' : 0, opacity: open === index ? 1 : 0 }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-5 text-sm leading-6 text-slate-300">{answer}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const navBlur = useTransform(scrollY, [0, 80], ['blur(10px)', 'blur(22px)']);
  const navBackground = useTransform(scrollY, [0, 80], ['rgba(11,15,25,0.58)', 'rgba(11,15,25,0.86)']);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const particles = useMemo(
    () => Array.from({ length: 16 }, (_, index) => ({ id: index, left: `${(index * 29) % 96}%`, top: `${8 + ((index * 17) % 82)}%` })),
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    document.title = 'CareerOS - AI Powered Placement Preparation Operating System';
  }, []);

  function handlePointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <main className="career-landing min-h-screen overflow-hidden bg-[#0B0F19] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="career-aurora absolute inset-0" />
        <div className="career-grid absolute inset-0" />
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute h-1 w-1 rounded-full bg-indigo-200/60"
            style={{ left: particle.left, top: particle.top }}
            animate={shouldReduceMotion ? undefined : { opacity: [0.18, 0.8, 0.18], y: [0, -18, 0] }}
            transition={{ duration: 5 + (particle.id % 4), repeat: Infinity, delay: particle.id * 0.18 }}
          />
        ))}
      </div>

      <motion.header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ backdropFilter: navBlur, WebkitBackdropFilter: navBlur, backgroundColor: navBackground }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="CareerOS home">
            <LogoMark />
            <span>
              <span className="block text-base font-semibold text-white">CareerOS</span>
              <span className="hidden text-xs text-slate-400 sm:block">Placement Preparation OS</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm text-slate-300 lg:flex" aria-label="Primary navigation">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} className="rounded-full px-3 py-2 transition hover:bg-white/[0.06] hover:text-white">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] sm:inline-flex">
              Login
            </Link>
            <Link to="/register" className="career-nav-cta">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.header>

      <section id="home" className="relative z-10 px-4 pb-16 pt-10 sm:px-6 lg:px-8" onPointerMove={handlePointerMove}>
        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            <div className="career-badge">
              <Sparkles size={15} />
              Your AI Powered Placement Preparation Operating System
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              Master Placements with AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Track DSA, resumes, mock interviews, roadmaps, analytics, applications, and AI mentoring in one premium platform built for serious placement preparation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/register">
                Get Started
                <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="#showcase" variant="secondary">
                <Play size={17} />
                Watch Demo
              </ButtonLink>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['95%', 'Satisfaction'],
                ['10K+', 'Problems'],
                ['100K+', 'Roadmaps'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <DashboardMockup pointerX={pointerX} pointerY={pointerY} />
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.025] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-semibold uppercase text-slate-400">Trusted by Students Preparing For</p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-10">
            {companies.map((company) => (
              <div key={company} className="company-mark" aria-label={company}>
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="career-section">
        <SectionHeader
          eyebrow="Why CareerOS"
          title="Everything You Need For Placements"
          description="CareerOS brings the scattered pieces of placement prep into one focused operating system, so students can prepare, measure, and apply with clarity."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map(([title, description, Icon], index) => (
            <CareerCard key={title} delay={(index % 6) * 0.035}>
              <div className="career-icon">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </CareerCard>
          ))}
        </div>
      </section>

      <section id="about" className="career-section">
        <SectionHeader
          center
          eyebrow="How It Works"
          title="From scattered effort to a daily placement system"
          description="A simple workflow turns goals into tasks, tasks into progress, and progress into interview confidence."
        />
        <div className="relative mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-6">
          <div aria-hidden="true" className="timeline-line hidden md:block" />
          {steps.map(([title, description], index) => (
            <motion.div
              key={title}
              className="relative rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ProductShowcase />

      <section className="career-section">
        <SectionHeader
          eyebrow="AI Features"
          title="Intelligent guidance at every stage"
          description="AI is not a gimmick layer here. It helps decide what to study, what to improve, how to present yourself, and where to focus next."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map(([title, description, Icon], index) => (
            <CareerCard key={title} delay={index * 0.05}>
              <div className="flex items-start gap-4">
                <div className="career-icon shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
              </div>
            </CareerCard>
          ))}
        </div>
      </section>

      <section className="career-section">
        <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <SectionHeader
            eyebrow="Analytics"
            title="See consistency, growth, and readiness clearly"
            description="CareerOS turns preparation into measurable signals: heatmaps, weekly progress, monthly growth, study hours, solved problems, applications, and interview scores."
          />
          <CareerCard className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Monthly Growth</p>
                <div className="mt-5 flex h-44 items-end gap-2">
                  {[28, 36, 48, 44, 62, 76, 88].map((height, index) => (
                    <motion.span
                      key={index}
                      className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-violet-300"
                      initial={{ height: 8 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.75, delay: index * 0.05 }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ['Study Hours', '46h', LineChart],
                  ['Solved Problems', '142', Code2],
                  ['Applications', '24', BriefcaseBusiness],
                  ['Interview Scores', '8.7', Trophy],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-3">
                      <Icon className="text-indigo-200" size={18} />
                      <span className="text-sm text-slate-300">{label}</span>
                    </div>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CareerCard>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.025] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map(([value, label], index) => (
            <motion.div
              key={label}
              className="text-center"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <p className="text-4xl font-semibold text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="career-section">
        <SectionHeader center eyebrow="Testimonials" title="Built for students who want a real system" description="CareerOS helps students prepare with structure, not panic." />
        <div className="testimonial-track mt-10">
          {[...testimonials, ...testimonials].map(([name, role, quote, initials], index) => (
            <div key={`${name}-${index}`} className="testimonial-card">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-300">{quote}</p>
            </div>
          ))}
        </div>
      </section>

      <FAQ />

      <section className="career-section pb-10">
        <div className="final-cta relative overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-10">
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase text-indigo-100">Start Free</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">Ready to Crack Your Dream Job?</h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Build your roadmap, track your progress, and prepare with AI from one focused workspace.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/register">
                Start Free
                <Rocket size={18} />
              </ButtonLink>
              <ButtonLink to="/login" variant="secondary">
                Login
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="relative z-10 border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_1.4fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark />
              <span className="text-lg font-semibold text-white">CareerOS</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Your AI Powered Placement Preparation Operating System for roadmaps, resumes, interviews, analytics, and applications.
            </p>
            <div className="mt-5 flex gap-3">
              {[Github, Linkedin, Twitter, Mail].map((Icon, index) => (
                <a key={index} href={index === 3 ? 'mailto:hello@careeros.ai' : '#'} className="social-link" aria-label={`CareerOS social link ${index + 1}`}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ['Quick Links', ['Features', 'Dashboard Preview', 'Pricing', 'Blog']],
              ['Product', ['AI Mentor', 'Resume Analyzer', 'Mock Interview', 'Roadmaps']],
              ['Company', ['About', 'Privacy Policy', 'Terms', 'Contact']],
            ].map(([title, links]) => (
              <div key={title}>
                <h3 className="font-semibold text-white">{title}</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                  {links.map((item) => (
                    <a key={item} href={item === 'Features' ? '#features' : '#'} className="block transition hover:text-white">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div id="blog">
            <h3 className="font-semibold text-white">Newsletter</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">Get placement prep systems, roadmap ideas, and product updates.</p>
            <form className="mt-4 flex gap-2" onSubmit={(event) => event.preventDefault()}>
              <input className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm" placeholder="Email" aria-label="Email address" type="email" />
              <button className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white" type="submit" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
          <span>Copyright 2026 CareerOS. All rights reserved.</span>
          <span id="pricing">Pricing coming soon.</span>
        </div>
      </footer>
    </main>
  );
}
