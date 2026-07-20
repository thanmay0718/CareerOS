import { ArrowRight, Award, CheckCircle2, Coins, Flame, Gauge, Sparkles, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionCard } from '../components/SectionCard';

const scoreRules = [
  {
    icon: CheckCircle2,
    title: 'Complete tasks',
    points: '+5 coins, +25 XP',
    detail: 'Every completed task moves your plan forward. Each set of 5 completed tasks adds a +20 coin bonus.',
  },
  {
    icon: Sparkles,
    title: 'Submit daily check-ins',
    points: '+2 coins, +10 XP',
    detail: 'Check-ins power consistency, study-hour tracking, streaks, and your weekly improvement score.',
  },
  {
    icon: Award,
    title: 'Create revision notes',
    points: '+3 coins, +15 XP',
    detail: 'Notes are counted as learning proof and also unlock the Revision Note Builder achievement.',
  },
  {
    icon: Flame,
    title: 'Protect your streak',
    points: '+30 coins, +120 XP',
    detail: 'Reach a 7-day streak to unlock the streak bonus and the Seven Day Streak achievement.',
  },
];

const achievements = [
  ['First Task', 'Complete 1 task.'],
  ['Seven Day Streak', 'Check in for 7 days in a row.'],
  ['100 Problems Solved', 'Log 100 solved practice problems through check-ins.'],
  ['Revision Note Builder', 'Create 10 revision notes.'],
  ['Consistency Champion', 'Complete 25 tasks.'],
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <header className="premium-page-header overflow-hidden rounded-2xl p-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-200">
          <Trophy size={15} />
          Points guide
        </p>
        <div className="mt-4 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold text-white md:text-5xl">How CareerOS scores your progress</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Coins, XP, streaks, productivity, and achievements are generated from the work you record in the app.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200/25 bg-amber-400/10 p-5 shadow-[0_0_44px_rgba(251,191,36,0.16)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100">
              <Flame size={24} fill="currentColor" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">The fastest way to grow</h2>
            <p className="mt-2 text-sm leading-6 text-amber-50/80">
              Check in daily, finish tasks, write revision notes, and log practice problems. That combination boosts every major score.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scoreRules.map((rule) => {
          const Icon = rule.icon;
          return (
            <article key={rule.title} className="stitch-panel rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-amber-100">
                  <Icon size={20} />
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
                  {rule.points}
                </span>
              </div>
              <h2 className="mt-5 text-lg font-bold text-white">{rule.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{rule.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Score formulas" accent="linear-gradient(90deg, #F59E0B, #F43F5E)">
          <div className="space-y-3">
            {[
              ['Coins', '2 per check-in + 5 per completed task + 20 per 5-task bundle + 3 per note + 30 for a 7-day streak.'],
              ['XP', '10 per check-in + 25 per completed task + 15 per note + 120 for a 7-day streak.'],
              ['Productivity', '70% from today task completion and 30% from today study hours, capped at 5 hours for the check-in part.'],
              ['Consistency', 'Active check-in days from the last 7 days converted into a percentage.'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  {label === 'Coins' ? <Coins size={16} /> : <Gauge size={16} />}
                  {label}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Achievement checklist" accent="linear-gradient(90deg, #22C55E, #38BDF8)">
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map(([title, detail]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Trophy size={16} className="text-amber-200" />
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
              </article>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="stitch-button mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            View my achievements
            <ArrowRight size={16} />
          </button>
        </SectionCard>
      </section>
    </div>
  );
}
