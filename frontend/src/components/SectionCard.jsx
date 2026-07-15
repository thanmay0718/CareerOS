export function SectionCard({ title, children, accent = 'linear-gradient(90deg, rgba(56, 189, 248, 0.35), rgba(34, 211, 238, 1))' }) {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-glow backdrop-blur">
      <div className="mb-4 h-1.5 w-20 rounded-full" style={{ background: accent }} />
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
