import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-career-grid px-4 text-slate-100">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/80 p-8 text-center shadow-glow">
        <p className="text-xs uppercase tracking-[0.28em] text-sky-300">CareerOS</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">The route you requested does not exist.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-sky-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-sky-400"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}

