import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export function StatCard({ label, value, highlight = false }) {
  const cardClasses = highlight
    ? 'stitch-panel rounded-2xl border-sky-400/30 p-5'
    : 'stitch-panel rounded-2xl p-5';

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      viewport={{ once: true }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase text-slate-400">{label}</div>
        <div className={`grid h-9 w-9 place-items-center rounded-2xl border border-white/10 ${highlight ? 'bg-emerald-400/10 text-emerald-200' : 'bg-indigo-500/15 text-indigo-100'}`}>
          <TrendingUp size={16} />
        </div>
      </div>
      <div className="mt-4 truncate font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full w-2/3 rounded-full ${highlight ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
      </div>
    </motion.div>
  );
}
