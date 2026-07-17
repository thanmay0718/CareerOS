export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      <div className="relative h-4 w-4 rounded-full bg-indigo-300/20">
        <span className="absolute inset-0 animate-ping rounded-full bg-indigo-300/40" />
        <span className="absolute inset-1 rounded-full bg-indigo-200" />
      </div>
      <span>{label}</span>
    </div>
  );
}
