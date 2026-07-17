import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  StickyNote,
  Sun,
  Target,
  UserCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learning', label: 'Learning', icon: BookOpenCheck },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/projects', label: 'Projects', icon: BriefcaseBusiness },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function navClass({ isActive }, collapsed) {
  return [
    'group relative flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition duration-200',
    collapsed ? 'justify-center' : '',
    isActive
      ? 'bg-indigo-500/15 text-white shadow-[0_0_28px_rgba(99,102,241,0.16)] ring-1 ring-indigo-300/30 before:absolute before:left-0 before:h-5 before:w-1 before:rounded-full before:bg-indigo-300'
      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_22px_rgba(99,102,241,0.08)]',
  ].join(' ');
}

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
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('ALL');
  const [commandQuery, setCommandQuery] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('careeros-theme') || 'dark');

  useEffect(() => {
    setDocumentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
        setNotificationsOpen(false);
        setMobileOpen(false);
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

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openRoute = (path) => {
    navigate(path);
    setCommandOpen(false);
    setMobileOpen(false);
  };

  const sidebar = (
    <motion.aside
      className={[
      'liquid-glass flex h-full flex-col rounded-[1.5rem] p-3 transition-all duration-200',
      collapsed ? 'lg:w-[84px]' : 'lg:w-[260px]',
    ].join(' ')}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-100">
            <Command size={20} />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">Careeros</div>
              <div className="truncate text-xs text-slate-400">AI career workspace</div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition hover:bg-white/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <motion.button
        type="button"
        onClick={() => setCommandOpen(true)}
        className={['mt-3 flex h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-left text-slate-400 transition hover:text-white', collapsed ? 'justify-center' : ''].join(' ')}
        aria-label="Search workspace"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        <Search size={16} />
        {!collapsed ? <span className="text-xs">Search workspace</span> : null}
      </motion.button>

      <nav className="mt-4 flex-1 overflow-y-auto pr-1" aria-label="Primary navigation">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={(state) => navClass(state, collapsed)}
                title={item.label}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-2">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden h-10 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed ? 'Collapse' : null}
        </button>
      </div>
    </motion.aside>
  );

  return (
    <div className="min-h-full bg-career-grid text-slate-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[14%] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-[6%] top-[8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-[4%] left-[38%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-full max-w-[1520px] gap-4 px-3 py-3 md:px-5 md:py-5">
        <div className="hidden shrink-0 lg:sticky lg:top-5 lg:block lg:h-[calc(100vh-2.5rem)]">
          {sidebar}
        </div>

        <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/70 p-3 backdrop-blur lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {sidebar}
          </motion.div>
        ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <motion.header
            className="liquid-glass sticky top-3 z-30 rounded-[1.5rem] px-3 py-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/10 lg:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu size={19} />
                </button>
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  className="hidden h-10 min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-left text-sm text-slate-400 transition hover:text-white md:flex"
                >
                  <Command size={16} />
                  <span className="w-44 truncate lg:w-64">Search Careeros</span>
                  <kbd className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-500">Ctrl K</kbd>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(true)}
                  className="relative grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" /> : null}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
                <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 xl:flex">
                  <UserCircle2 size={20} className="text-slate-300" />
                  <div className="max-w-40">
                    <div className="truncate text-sm font-semibold text-white">{user?.fullName || user?.email || 'Account'}</div>
                    {user?.email ? <div className="truncate text-xs text-slate-400">{user.email}</div> : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-slate-300 transition hover:bg-red-500/10 hover:text-red-100"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </motion.header>

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
          className="fixed inset-0 z-[65] bg-slate-950/55 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.aside
            className="liquid-glass ml-auto flex h-full w-full max-w-md flex-col rounded-none p-4 sm:rounded-l-2xl"
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
              <button type="button" onClick={() => setNotificationsOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close notifications">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['ALL', 'TASK', 'PLAN', 'CHECKIN', 'SYSTEM'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setNotificationFilter(item)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${notificationFilter === item ? 'border-indigo-300/40 bg-indigo-500/20 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
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
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-indigo-300/30 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">{notification.type}</div>
                        <h3 className="mt-1 text-sm font-bold text-white">{notification.title}</h3>
                      </div>
                      {notification.unread ? <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" /> : null}
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
