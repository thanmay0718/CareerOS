export function SectionCard({ title, children, accent = 'linear-gradient(90deg, #4f46e5, #7c3aed, #10b981)' }) {
  return (
    <section className="stitch-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <h2 className="font-display text-lg font-bold text-white">{title}</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
