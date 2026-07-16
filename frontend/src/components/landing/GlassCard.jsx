import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={`stitch-panel overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
    >
      {children}
    </motion.div>
  );
}
