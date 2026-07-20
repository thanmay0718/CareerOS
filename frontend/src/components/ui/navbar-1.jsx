import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Command, Flame, LogOut, Menu, Moon, Search, Sun, UserCircle2, X } from 'lucide-react';

export function Navbar1({
  items = [],
  activePath,
  onNavigate,
  onSearch,
  onNotifications,
  onThemeToggle,
  onLogout,
  unreadCount = 0,
  streakDays,
  theme = 'dark',
  user,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const safeStreakDays = Number.isFinite(Number(streakDays)) ? Math.max(0, Number(streakDays)) : undefined;

  const handleNavigate = (path) => {
    onNavigate?.(path);
    setIsOpen(false);
  };

  return (
    <div className="sticky top-3 z-50 flex w-full justify-center px-0 py-0">
      <div className="relative z-10 flex w-full items-center justify-between overflow-hidden rounded-full border border-white/[0.08] bg-slate-950/[0.64] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.50),0_0_34px_rgba(99,102,241,0.10),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl md:px-5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(129,140,248,0.16),rgba(255,255,255,0.035)_42%,rgba(56,189,248,0.10)),radial-gradient(circle_at_5%_0%,rgba(167,139,250,0.22),transparent_22%),radial-gradient(circle_at_94%_0%,rgba(56,189,248,0.14),transparent_24%)]" />
        <div className="flex min-w-0 items-center gap-3">
          <motion.button
            type="button"
            onClick={() => handleNavigate('/dashboard')}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-500/20 text-indigo-50 shadow-[0_0_26px_rgba(129,140,248,0.24),inset_0_1px_0_rgba(255,255,255,0.14)]"
            initial={{ scale: 0.88 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.22 }}
            aria-label="Careeros dashboard"
          >
            <Command size={19} />
          </motion.button>

          <button
            type="button"
            onClick={onSearch}
            className="relative hidden h-10 min-w-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.055] px-3 text-left text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.095] hover:text-white lg:flex"
          >
            <Search size={15} />
            <span className="w-36 truncate xl:w-48">Search Careeros</span>
            <kbd className="rounded-full border border-white/10 bg-slate-950/30 px-2 py-0.5 text-[11px] text-slate-400">Ctrl K</kbd>
          </button>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {items.map((item, index) => {
            const isActive = activePath === item.to;

            return (
              <motion.button
                key={item.to}
                type="button"
                onClick={() => handleNavigate(item.to)}
                className={[
                  'relative rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-white/[0.13] text-white shadow-[0_12px_30px_rgba(129,140,248,0.18),inset_0_0_0_1px_rgba(199,210,254,0.16),inset_0_1px_0_rgba(255,255,255,0.16)]'
                    : 'text-slate-300 hover:bg-white/[0.075] hover:text-white',
                ].join(' ')}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.025 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {safeStreakDays !== undefined ? (
            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full border border-amber-100/[0.42] bg-[linear-gradient(135deg,rgba(253,224,71,0.36),rgba(245,158,11,0.16)_48%,rgba(99,102,241,0.18))] px-3 text-sm font-black text-amber-50 shadow-[0_0_38px_rgba(251,191,36,0.42),inset_0_1px_0_rgba(255,255,255,0.24)] transition hover:border-amber-50/80 hover:shadow-[0_0_52px_rgba(251,191,36,0.58),inset_0_1px_0_rgba(255,255,255,0.30)]"
              aria-label={`${safeStreakDays} day streak. Open settings points guide.`}
              title={`${safeStreakDays} day streak`}
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.26),transparent_38%)] opacity-90" />
              <Flame size={17} fill="currentColor" className="relative text-amber-100 drop-shadow-[0_0_10px_rgba(251,191,36,1)]" />
              <span className="relative">{safeStreakDays}d</span>
              <span className="pointer-events-none absolute -bottom-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-200 shadow-xl group-hover:block">
                Streak badge
              </span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={onNotifications}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.055] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.10] hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount ? (
              <span className="absolute right-1 top-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-[0_0_14px_rgba(239,68,68,0.9)]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onThemeToggle}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.055] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/[0.10] hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <div className="relative hidden max-w-56 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.055] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] xl:flex">
            <UserCircle2 size={18} className="shrink-0 text-slate-300" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{user?.fullName || user?.email || 'Account'}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.055] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-red-500/[0.18] hover:text-red-100"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>

        <motion.button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.075] text-white md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          whileTap={{ scale: 0.9 }}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] bg-slate-950/96 px-5 pt-5 backdrop-blur md:hidden"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-950">
                  <Command size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Careeros</div>
                  <div className="text-xs text-slate-400">Career workspace</div>
                </div>
              </div>
              <motion.button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white"
                onClick={() => setIsOpen(false)}
                whileTap={{ scale: 0.9 }}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {safeStreakDays !== undefined ? (
                <button
                  type="button"
                  onClick={() => handleNavigate('/settings')}
                  className="flex items-center justify-between rounded-2xl border border-amber-200/40 bg-amber-400/20 px-4 py-4 text-left text-base font-bold text-amber-50 shadow-[0_0_28px_rgba(251,191,36,0.2)]"
                >
                  <span className="inline-flex items-center gap-3">
                    <Flame size={19} fill="currentColor" />
                    Streak badge
                  </span>
                  <span>{safeStreakDays}d</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onSearch?.();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-left text-base font-semibold text-white"
              >
                <Search size={18} />
                Search
              </button>
              {items.map((item, index) => (
                <motion.button
                  key={item.to}
                  type="button"
                  onClick={() => handleNavigate(item.to)}
                  className={[
                    'rounded-2xl px-4 py-4 text-left text-base font-semibold',
                    activePath === item.to ? 'bg-white text-slate-950' : 'bg-white/[0.06] text-white',
                  ].join(' ')}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.06 }}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button type="button" onClick={onNotifications} className="rounded-2xl bg-white/[0.08] px-3 py-4 text-sm font-semibold text-white">
                  Alerts
                </button>
                <button type="button" onClick={onThemeToggle} className="rounded-2xl bg-white/[0.08] px-3 py-4 text-sm font-semibold text-white">
                  Theme
                </button>
                <button type="button" onClick={onLogout} className="rounded-2xl bg-red-500/15 px-3 py-4 text-sm font-semibold text-red-100">
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
