import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, BookOpenCheck, BriefcaseBusiness, CalendarCheck2, ClipboardList, FileText, Flame, LogOut, NotebookPen, UserCircle2, Workflow } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/plans', label: 'Plans', icon: ClipboardList },
  { to: '/tasks', label: 'Tasks', icon: NotebookPen },
  { to: '/check-ins', label: 'Check-ins', icon: CalendarCheck2 },
  { to: '/roadmaps', label: 'Roadmaps', icon: BookOpenCheck },
  { to: '/placements', label: 'Placements', icon: Workflow },
  { to: '/companies', label: 'Companies', icon: BriefcaseBusiness },
  { to: '/resumes', label: 'Resumes', icon: FileText },
];

function navClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
    isActive
      ? 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30'
      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
  ].join(' ');
}

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full bg-career-grid text-slate-100">
      <div className="mx-auto grid min-h-full max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6 lg:py-6">
        <aside className="rounded-[2rem] border border-slate-800/80 bg-slate-950/75 p-4 shadow-glow backdrop-blur">
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-800 bg-slate-900/70 px-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">CareerOS</div>
              <div className="text-xs text-slate-400">Career operating system</div>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={navClass}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-100">
                <UserCircle2 size={20} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{user?.fullName ?? 'Workspace user'}</div>
                <div className="truncate text-xs text-slate-400">{user?.email ?? 'No account loaded'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
