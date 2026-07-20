import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Github, Linkedin, Moon, Sparkles, Sun, Twitter } from 'lucide-react';
import { AiDataHills } from '../components/landing/AiDataHills';
import { MagneticLink } from '../components/landing/MagneticLink';
import { OrbitGallery } from '../components/ui/3d-orbit-gallery';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const navItems = [['Home', '#home']];

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

          <nav className="hidden items-center gap-3 text-sm text-slate-300 xl:flex" aria-label="Primary navigation">
            {navItems.map(([label, href]) => (
              <LiquidButton key={label} asChild size="sm" variant="ghost" className="text-slate-300 hover:text-white">
                <a href={href}>{label}</a>
              </LiquidButton>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LiquidButton
              type="button"
              size="icon"
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </LiquidButton>
            <LiquidButton asChild size="sm" variant="ghost" className="hidden text-slate-200 sm:inline-flex">
              <Link to="/login">Login</Link>
            </LiquidButton>
            <LiquidButton asChild size="default" variant="default" className="font-semibold">
              <Link to="/register" className="inline-flex items-center gap-2">
                Sign Up Free
                <ArrowRight size={16} />
              </Link>
            </LiquidButton>
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
              <MagneticLink to="/login" variant="secondary" className="hero-cta w-full sm:w-auto">
                Login
              </MagneticLink>
            </motion.div>
          </motion.div>

          <HeroOrbit />
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
              ['Product', ['Dashboard', 'Resume Builder', 'AI Interviews']],
              ['Resources', ['Blog', 'Documentation', 'Community']],
              ['Company', ['About', 'Contact', 'Careers']],
              ['Legal', ['Privacy', 'Terms', 'Copyright']],
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
