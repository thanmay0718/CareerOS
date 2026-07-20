import { Award, Bell, CheckCircle2, Coins, Flame, Gauge, ShieldCheck, Sparkles, Trophy, UserCircle2 } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

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
    detail: 'Notes count as learning proof and unlock the Revision Note Builder achievement.',
  },
  {
    icon: Flame,
    title: 'Daily login',
    points: '+1 coin once per day',
    detail: 'The popup and login coin are only granted on the first successful login of each calendar day.',
  },
];

const scoreFormulas = [
  ['Coins', '1 daily login coin once per day + 2 per check-in + 5 per completed task + 20 per 5-task bundle + 3 per note + 30 for a 7-day streak.'],
  ['XP', '10 per check-in + 25 per completed task + 15 per note + 120 for a 7-day streak.'],
  ['Productivity', '70% from today task completion and 30% from today study hours, capped at 5 hours for the check-in part.'],
  ['Consistency', 'Active check-in days from the last 7 days converted into a percentage.'],
];

export default function SettingsPage() {
  const { user } = useAuth();
  const notificationsQuery = useNotifications();
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <div className="space-y-5">
      <header className="stitch-panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-100">
              <ShieldCheck size={14} />
              Settings
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold text-white md:text-4xl">Workspace preferences</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Account and notification details are rendered from the active session and backend notification API.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Account">
          <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-100">
              <UserCircle2 size={24} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-400">Signed in as</div>
              <h2 className="mt-1 truncate text-lg font-bold text-white">{user?.fullName || user?.email || 'Account'}</h2>
              {user?.email ? <p className="mt-1 truncate text-sm text-slate-400">{user.email}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notifications">
          {notificationsQuery.isError ? (
            <ApiAlert
              title="Notifications unavailable"
              description={notificationsQuery.error?.response?.data?.message || notificationsQuery.error.message || 'Unable to load notification preferences.'}
              onRetry={notificationsQuery.refetch}
            />
          ) : notificationsQuery.isLoading ? (
            <Spinner label="Loading notification state" />
          ) : notifications.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Bell size={16} />
                  Backend reminders
                </div>
                <div className="mt-3 text-3xl font-bold text-white">{notifications.length}</div>
                <p className="mt-2 text-sm text-slate-400">Total notifications returned by the API.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-semibold text-slate-200">Unread</div>
                <div className="mt-3 text-3xl font-bold text-white">{unreadCount}</div>
                <p className="mt-2 text-sm text-slate-400">Items requiring attention.</p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No notification state yet"
              description="Task reminders, plan deadlines, and check-in prompts will appear here after the backend creates them."
            />
          )}
        </SectionCard>
      </section>

      <SectionCard title="About scoring">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-amber-200/25 bg-amber-400/10 p-5 shadow-[0_0_44px_rgba(251,191,36,0.12)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100">
              <Trophy size={24} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">How CareerOS scores progress</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Coins, XP, streaks, productivity, and achievements are generated from the work you record in the app.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {scoreRules.map((rule) => {
              const Icon = rule.icon;
              return (
                <article key={rule.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-amber-100">
                      <Icon size={18} />
                    </div>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
                      {rule.points}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{rule.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{rule.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {scoreFormulas.map(([label, value]) => (
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
    </div>
  );
}
