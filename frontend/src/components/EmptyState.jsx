import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState({ title, description, actionLabel, onActionClick }) {
  return (
    <motion.div
      className="stitch-panel rounded-2xl border-dashed p-7 text-center"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22 }}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-300/25 bg-indigo-500/15 text-sky-300 shadow-glow">
        <Inbox size={26} />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onActionClick}
          disabled={!onActionClick}
          className="stitch-button mt-5 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </motion.div>
  );
}
