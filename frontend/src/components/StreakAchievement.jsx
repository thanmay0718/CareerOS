import { Flame, Sparkles, Trophy } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

function streakMessage(days, milestone) {
  if (days <= 0) {
    return 'Start today and light the first day.';
  }

  if (days >= milestone) {
    return `${milestone}-day milestone unlocked. Keep the chain alive.`;
  }

  return `${milestone - days} days away from the ${milestone}-day badge.`;
}

export function StreakAchievement({
  days = 0,
  longest,
  label = 'Current streak',
  milestone = 7,
  compact = false,
  className = '',
}) {
  const shouldReduceMotion = useReducedMotion();
  const safeDays = Number.isFinite(Number(days)) ? Math.max(0, Number(days)) : 0;
  const safeLongest = Number.isFinite(Number(longest)) ? Math.max(0, Number(longest)) : undefined;
  const progress = Math.min(100, (safeDays / Math.max(1, milestone)) * 100);
  const unlocked = safeDays >= milestone;

  return (
    <motion.article
      className={`relative isolate overflow-hidden rounded-2xl border p-5 ${
        unlocked
          ? 'border-amber-200/50 bg-amber-400/10 shadow-[0_0_44px_rgba(251,191,36,0.2)]'
          : 'border-orange-300/30 bg-orange-500/10 shadow-[0_0_36px_rgba(249,115,22,0.16)]'
      } ${className}`}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion ? undefined : { y: -5, rotate: -0.4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      aria-label={`${label}: ${safeDays} days`}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_0%,rgba(251,191,36,0.28),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(244,63,94,0.24),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(2,6,23,0.72))]" />
      <motion.div
        className="absolute -right-10 -top-12 -z-10 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl"
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-black/20 px-3 py-1 text-xs font-bold uppercase text-amber-100">
            <Trophy size={14} />
            Achievement
          </div>
          <h3 className={`${compact ? 'mt-3 text-base' : 'mt-4 text-xl'} font-display font-bold text-white`}>{label}</h3>
        </div>
        <motion.div
          className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-100/30 bg-amber-300/15 text-amber-100 shadow-[0_0_26px_rgba(251,191,36,0.3)]"
          animate={shouldReduceMotion ? undefined : { rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame size={24} fill="currentColor" />
        </motion.div>
      </div>

      <div className="mt-5 flex items-end gap-3">
        <div className={`${compact ? 'text-4xl' : 'text-6xl'} font-black leading-none text-white drop-shadow-[0_0_18px_rgba(251,191,36,0.45)]`}>
          {safeDays}
        </div>
        <div className="pb-1">
          <div className="text-sm font-bold text-amber-100">{safeDays === 1 ? 'day' : 'days'}</div>
          <div className="text-xs text-orange-100/80">active chain</div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-amber-50/85">{streakMessage(safeDays, milestone)}</p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-amber-100/80">
          <span className="inline-flex items-center gap-1"><Sparkles size={13} /> Badge charge</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-400 to-rose-400 shadow-[0_0_18px_rgba(251,146,60,0.7)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {safeLongest !== undefined ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-amber-50/80">
          Best streak: <span className="font-bold text-white">{safeLongest} days</span>
        </div>
      ) : null}
    </motion.article>
  );
}
