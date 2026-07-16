import { Bell, ShieldCheck, UserCircle2 } from 'lucide-react';
import { ApiAlert } from '../components/ApiAlert';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

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
    </div>
  );
}
