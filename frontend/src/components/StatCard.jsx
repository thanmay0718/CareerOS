export function StatCard({ label, value, highlight = false }) {
  const cardClasses = highlight
    ? 'stitch-panel rounded-2xl border-sky-400/30 p-5 transition duration-200 hover:-translate-y-1'
    : 'stitch-panel rounded-2xl p-5 transition duration-200 hover:-translate-y-1';

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-400">{label}</div>
        <div className={`h-2 w-2 rounded-full ${highlight ? 'bg-emerald-400' : 'bg-indigo-300/70'}`} />
      </div>
      <div className="mt-4 truncate font-display text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
