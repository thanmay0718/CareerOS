import { motion } from 'framer-motion';

export function SectionCard({ title, children, accent = 'linear-gradient(90deg, #6366F1, #38BDF8)' }) {
  return (
    <motion.section
      className="stitch-panel rounded-2xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_22px_rgba(99,102,241,0.7)]" style={{ background: accent }} />
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-indigo-300/20 via-white/10 to-transparent" />
      </div>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}
