export function StatCard({ label, value, highlight = false }) {
  const cardClasses = highlight
    ? 'rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 shadow-glow backdrop-blur'
    : 'rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-glow backdrop-blur';

  return (
    <div className={cardClasses}>
      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
