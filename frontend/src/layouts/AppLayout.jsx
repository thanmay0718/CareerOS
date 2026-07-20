import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  Command,
  Coins,
  LayoutDashboard,
  LogOut,
  Settings,
  StickyNote,
  Target,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnalyticsSummary } from '../hooks/useAnalytics';
import { useNotifications } from '../hooks/useNotifications';
import { ShadowOverlayBackground } from '../components/ShadowOverlayBackground';
import { Navbar1 } from '@/components/ui/navbar-1';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learning', label: 'Learning', icon: BookOpenCheck },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/check-ins', label: 'Check In', icon: CalendarCheck2 },
  { to: '/projects', label: 'Projects', icon: BriefcaseBusiness },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function setDocumentTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('careeros-theme', theme);
}

function formatNotificationDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const notificationsQuery = useNotifications();
  const analyticsSummaryQuery = useAnalyticsSummary();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('ALL');
  const [commandQuery, setCommandQuery] = useState('');
  const [loginReward, setLoginReward] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('careeros-theme') || 'dark');

  useEffect(() => {
    setDocumentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const rawReward = localStorage.getItem('careeros-login-reward');
    if (!rawReward) {
      return undefined;
    }

    try {
      const reward = JSON.parse(rawReward);
      const today = new Date().toISOString().slice(0, 10);
      const rewardDate = reward.awardedDate || (reward.awardedAt ? new Date(reward.awardedAt).toISOString().slice(0, 10) : today);
      const rewardUser = reward.userId || reward.email || 'anonymous';
      const viewedKey = `careeros-login-reward-viewed:${rewardUser}:${rewardDate}`;

      if (rewardDate !== today || localStorage.getItem(viewedKey)) {
        localStorage.removeItem('careeros-login-reward');
        return undefined;
      }

      localStorage.setItem(viewedKey, 'true');
      setLoginReward({ coins: reward.coins || 1 });
      localStorage.removeItem('careeros-login-reward');
      const timer = window.setTimeout(() => setLoginReward(null), 4200);
      return () => window.clearTimeout(timer);
    } catch {
      localStorage.removeItem('careeros-login-reward');
      return undefined;
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const notificationItems = notificationsQuery.data ?? [];
  const unreadCount = notificationItems.filter((item) => item.unread).length;
  const filteredNotifications = notificationItems.filter((item) => {
    if (notificationFilter === 'ALL') {
      return true;
    }

    return item.type?.includes(notificationFilter);
  });
  const filteredCommands = useMemo(
    () => navigationItems.filter((item) => item.label.toLowerCase().includes(commandQuery.toLowerCase())),
    [commandQuery],
  );
  const currentStreak = analyticsSummaryQuery.data?.currentStreak;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openRoute = (path) => {
    navigate(path);
    setCommandOpen(false);
  };

  return (
    <div className="min-h-full bg-career-grid text-slate-100">
      <ShadowOverlayBackground />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[8%] top-[14%] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-[6%] top-[8%] h-80 w-80 rounded-full bg-sky-400/5 blur-3xl" />
        <div className="absolute bottom-[4%] left-[38%] h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-full max-w-[1520px] flex-col px-3 py-3 md:px-5 md:py-5">
        <Navbar1
          items={navigationItems}
          activePath={location.pathname}
          onNavigate={openRoute}
          onSearch={() => setCommandOpen(true)}
          onNotifications={() => setNotificationsOpen(true)}
          onThemeToggle={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
          onLogout={handleLogout}
          unreadCount={unreadCount}
          streakDays={currentStreak}
          theme={theme}
          user={user}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <motion.section
            className="min-w-0 flex-1 py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.04 }}
          >
            <Outlet />
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
      {loginReward ? (
        <motion.div
          className="fixed right-4 top-24 z-[90] overflow-hidden rounded-2xl border border-amber-200/35 bg-slate-950/95 p-4 text-amber-50 shadow-[0_0_44px_rgba(251,191,36,0.25)] backdrop-blur-xl"
          initial={{ opacity: 0, y: -14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.22 }}
          role="status"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-300/15 text-amber-100">
              <Coins size={22} />
            </div>
            <div>
              <div className="text-sm font-black text-white">Daily login reward</div>
              <div className="text-xs font-semibold text-amber-100">+{loginReward.coins} coin added once today</div>
            </div>
            <button
              type="button"
              onClick={() => setLoginReward(null)}
              className="ml-2 grid h-8 w-8 place-items-center rounded-xl text-amber-100/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close daily login reward"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      ) : null}
      </AnimatePresence>

      <AnimatePresence>
      {commandOpen ? (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-start bg-slate-950/65 px-3 pt-20 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="liquid-glass mx-auto w-full max-w-2xl rounded-[1.5rem] p-3"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-3 pb-3">
              <Command size={18} className="text-indigo-200" />
              <input
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                autoFocus
                placeholder="Search visible modules"
                className="min-h-0 flex-1 border-0 bg-transparent px-0 py-2 text-sm outline-none"
              />
              <button type="button" onClick={() => setCommandOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close command palette">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto py-2">
              {filteredCommands.length ? filteredCommands.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.label}-${item.to}`}
                    type="button"
                    onClick={() => openRoute(item.to)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon size={17} className="text-indigo-200" />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                );
              }) : (
                <div className="px-3 py-6 text-center text-sm text-slate-400">No matching modules.</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
      </AnimatePresence>

      <AnimatePresence>
      {notificationsOpen ? (
        <motion.div
          className="fixed inset-0 z-[65] bg-[radial-gradient(circle_at_18%_14%,rgba(99,102,241,0.22),transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.72),rgba(15,23,42,0.58))] backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setNotificationsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.aside
            className="ml-auto flex h-full w-full max-w-md flex-col overflow-hidden border-l border-indigo-200/10 bg-slate-950/82 p-4 shadow-[0_0_80px_rgba(99,102,241,0.22),-24px_0_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:rounded-l-[2rem]"
            onClick={(event) => event.stopPropagation()}
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-semibold text-indigo-200">Notification center</div>
                <h2 className="mt-1 text-xl font-bold text-white">{unreadCount} unread</h2>
              </div>
              <button type="button" onClick={() => setNotificationsOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close notifications">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['ALL', 'TASK', 'PLAN', 'CHECKIN', 'SYSTEM'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setNotificationFilter(item)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${notificationFilter === item ? 'border-indigo-200/40 bg-indigo-500/[0.24] text-white shadow-[0_0_22px_rgba(99,102,241,0.18)]' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white'}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
              {notificationsQuery.isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/10" />)}
                </div>
              ) : filteredNotifications.length ? (
                filteredNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => notification.actionPath ? openRoute(notification.actionPath) : undefined}
                    className="group w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-4 text-left shadow-[0_16px_42px_rgba(0,0,0,0.22)] transition hover:border-indigo-200/28 hover:bg-indigo-500/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">{notification.type}</div>
                        <h3 className="mt-1 text-sm font-bold text-white">{notification.title}</h3>
                      </div>
                      {notification.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.95)]" /> : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{notification.message}</p>
                    <div className="mt-3 text-xs text-slate-500">{formatNotificationDate(notification.createdAt)}</div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
                  No notifications in this group.
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </div>
  );
}
