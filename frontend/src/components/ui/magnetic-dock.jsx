import * as React from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

function DockItem({
  item,
  mousePosition,
  iconSize,
  maxScale,
  magneticDistance,
  showLabels,
  isVertical,
  expanded,
}) {
  const ref = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });

  const distance = useTransform(mousePosition, (value) => {
    if (!ref.current) {
      return magneticDistance + 1;
    }

    const rect = ref.current.getBoundingClientRect();
    const center = isVertical
      ? rect.top + rect.height / 2
      : rect.left + rect.width / 2;

    return value - center;
  });

  const scale = useTransform(distance, [-magneticDistance, 0, magneticDistance], [1, maxScale, 1]);
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothScale = useSpring(scale, springConfig);
  const size = useTransform(smoothScale, (value) => value * iconSize);
  const lift = useTransform(smoothScale, (value) => (value - 1) * -10);
  const smoothLift = useSpring(lift, springConfig);

  React.useEffect(() => {
    if (!isHovered || !showLabels || !ref.current) {
      return undefined;
    }

    const updateTooltipPosition = () => {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPosition({
        top: isVertical ? rect.top + rect.height / 2 : rect.top - 12,
        left: isVertical ? rect.right + 14 : rect.left + rect.width / 2,
      });
    };

    updateTooltipPosition();
    window.addEventListener('scroll', updateTooltipPosition, true);
    window.addEventListener('resize', updateTooltipPosition);

    return () => {
      window.removeEventListener('scroll', updateTooltipPosition, true);
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, [isHovered, isVertical, showLabels]);

  if (expanded && isVertical) {
    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={item.onClick}
        className={cn(
          'group relative flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-left outline-none transition duration-150 focus-visible:ring-2 focus-visible:ring-indigo-200/70',
          item.isActive
            ? 'border border-indigo-200/25 bg-white/[0.10] text-white shadow-[0_14px_34px_rgba(99,102,241,0.16),inset_0_1px_0_rgba(255,255,255,0.16)]'
            : 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
        )}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        aria-label={item.label}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-indigo-100">
          {item.icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.label}</span>
        {item.badge > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        ) : null}
        {item.isActive ? (
          <span className="absolute right-2 h-6 w-1 rounded-full bg-indigo-100 shadow-[0_0_16px_rgba(199,210,254,0.86)]" />
        ) : null}
      </motion.button>
    );
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={item.onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-2xl outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-200/70',
        item.isActive && 'bg-white/[0.08]',
      )}
      style={{
        width: size,
        height: size,
        y: isVertical ? 0 : smoothLift,
        x: isVertical ? smoothLift : 0,
      }}
      whileTap={{ scale: 0.9 }}
      aria-label={item.label}
      title={showLabels ? undefined : item.label}
    >
      <motion.span
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-white/12',
          'bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.045)_48%,rgba(0,0,0,0.18))]',
          'text-slate-200 shadow-[0_14px_34px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl',
          item.isActive && 'border-indigo-200/35 text-white shadow-[0_16px_42px_rgba(99,102,241,0.22),inset_0_1px_0_rgba(255,255,255,0.24)]',
        )}
      >
        <span className="relative z-10 flex h-[58%] w-[58%] items-center justify-center">
          {item.icon}
        </span>
        <span
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: isHovered
              ? 'linear-gradient(135deg, rgba(255,255,255,0.34), transparent 48%, rgba(99,102,241,0.12))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.18), transparent 52%, transparent)',
          }}
        />
      </motion.span>

      <AnimatePresence>
        {item.badge > 0 ? (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg"
          >
            {item.badge > 99 ? '99+' : item.badge}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {item.isActive ? (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              'absolute rounded-full bg-indigo-100 shadow-[0_0_16px_rgba(199,210,254,0.86)]',
              isVertical ? '-right-2 h-6 w-1' : '-bottom-2 h-1.5 w-6',
            )}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showLabels && isHovered ? (
          <motion.span
            initial={{ opacity: 0, y: isVertical ? 0 : 8, x: isVertical ? -4 : 0, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: isVertical ? 0 : 8, x: isVertical ? -4 : 0, scale: 0.94 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'pointer-events-none fixed z-[120] whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/92 px-3 py-1.5 text-sm font-semibold text-white shadow-xl shadow-black/30 backdrop-blur-xl',
              isVertical ? '-translate-y-1/2' : '-translate-x-1/2 -translate-y-full',
            )}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {item.label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

export function MagneticDock({
  items,
  iconSize = 54,
  maxScale = 1.45,
  magneticDistance = 110,
  showLabels = true,
  position = 'bottom',
  variant = 'glass',
  expanded = false,
  className,
}) {
  const mousePosition = useMotionValue(Infinity);
  const isVertical = position === 'left' || position === 'right';

  const handleMouseMove = React.useCallback(
    (event) => {
      mousePosition.set(isVertical ? event.clientY : event.clientX);
    },
    [isVertical, mousePosition],
  );

  const variantStyles = {
    glass: 'border border-white/12 bg-slate-950/54 shadow-xl shadow-black/30 backdrop-blur-2xl',
    solid: 'border border-white/10 bg-slate-950 shadow-xl shadow-black/30',
    transparent: 'border-0 bg-transparent shadow-none',
  };

  return (
    <motion.nav
      onMouseMove={handleMouseMove}
      onMouseLeave={() => mousePosition.set(Infinity)}
      className={cn(
        'inline-flex items-center gap-2 rounded-[1.5rem] p-2',
        isVertical ? 'flex-col' : 'flex-row',
        variantStyles[variant],
        className,
      )}
      initial={{ opacity: 0, y: isVertical ? 0 : 18, x: isVertical ? -12 : 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      aria-label="Primary navigation"
    >
      {items.map((item) => (
        <DockItem
          key={item.id}
          item={item}
          mousePosition={mousePosition}
          iconSize={iconSize}
          maxScale={maxScale}
          magneticDistance={magneticDistance}
          showLabels={showLabels}
        isVertical={isVertical}
          expanded={expanded}
        />
      ))}
    </motion.nav>
  );
}

export default MagneticDock;
