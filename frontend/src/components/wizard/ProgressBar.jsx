import { motion } from 'framer-motion';

export default function ProgressBar({ value }) {
  return (
    <div className="space-y-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
        <motion.div
          className="h-full rounded-full bg-accent-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
      <div className="text-right text-xs font-semibold text-slate-400">{Math.round(value)}% complete</div>
    </div>
  );
}
