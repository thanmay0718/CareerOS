import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';

export function DashboardGradientCard({
  title,
  description,
  badge = 'AI career signal',
  metricLabel,
  metricValue,
  progress,
  actionLabel = 'Explore',
  onAction,
  stats = [],
}) {
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const safeProgress = Number.isFinite(Number(progress)) ? Math.min(Math.max(Number(progress), 0), 100) : 0;

  const handleMouseMove = (event) => {
    if (!cardRef.current || shouldReduceMotion) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    setRotation({
      x: -(y / rect.height) * 5,
      y: (x / rect.width) * 5,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.article
      ref={cardRef}
      className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e131f] p-6 shadow-2xl"
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: '0 -10px 100px 10px rgba(78, 99, 255, 0.25), 0 18px 50px rgba(0, 0, 0, 0.35)',
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered && !shouldReduceMotion ? -5 : 0,
        rotateX: shouldReduceMotion ? 0 : rotation.x,
        rotateY: shouldReduceMotion ? 0 : rotation.y,
        perspective: 1000,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-[35]"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(2px)',
        }}
        animate={{ opacity: isHovered ? 0.7 : 0.5 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <div
        className="absolute inset-0 z-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%275%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-10 h-2/3"
        style={{
          background:
            'radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.72) -10%, rgba(79, 70, 229, 0) 70%), radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.7) -10%, rgba(79, 70, 229, 0) 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: isHovered ? 0.92 : 0.78,
          y: isHovered && !shouldReduceMotion ? rotation.x * 0.5 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 h-px"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.05) 100%)',
        }}
        animate={{
          boxShadow: isHovered
            ? '0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 32px 6px rgba(56, 189, 248, 0.45)'
            : '0 0 15px 3px rgba(172, 92, 255, 0.75), 0 0 26px 5px rgba(56, 189, 248, 0.35)',
        }}
      />

      <motion.div
        className="relative z-40 flex min-h-[25rem] flex-col"
        animate={{
          z: isHovered ? 8 : 2,
          rotateX: isHovered && !shouldReduceMotion ? -rotation.x * 0.25 : 0,
          rotateY: isHovered && !shouldReduceMotion ? -rotation.y * 0.25 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex items-start justify-between gap-4">
          <motion.div
            className="grid h-12 w-12 place-items-center rounded-full"
            style={{
              background: 'linear-gradient(225deg, #171c2c 0%, #121624 100%)',
              boxShadow:
                '0 8px 16px -2px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.12), inset -2px -2px 5px rgba(0,0,0,0.7)',
            }}
            animate={{ y: isHovered && !shouldReduceMotion ? -2 : 0 }}
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            {badge}
          </span>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-2xl font-bold leading-tight text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        </div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-slate-400">{metricLabel}</div>
              <div className="mt-1 font-display text-3xl font-bold text-white">{metricValue}</div>
            </div>
            <div className="text-right text-xs font-semibold text-cyan-100">{safeProgress}%</div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300"
              initial={{ width: 0 }}
              animate={{ width: `${safeProgress}%` }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="truncate text-xs text-slate-400">{stat.label}</div>
              <div className="mt-1 truncate text-sm font-semibold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onAction}
          className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-semibold text-white transition hover:text-cyan-100"
        >
          {actionLabel}
          <motion.span animate={{ x: isHovered && !shouldReduceMotion ? 4 : 0 }}>
            <ArrowRight size={16} />
          </motion.span>
        </button>
      </motion.div>
    </motion.article>
  );
}
