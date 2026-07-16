import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const variants = {
  primary: 'stitch-button text-white',
  secondary: 'stitch-button-secondary text-slate-100',
  outline: 'border border-white/15 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]',
};

export function MagneticLink({ to, children, variant = 'primary', className = '' }) {
  return (
    <motion.div whileHover={{ scale: 1.035 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}
