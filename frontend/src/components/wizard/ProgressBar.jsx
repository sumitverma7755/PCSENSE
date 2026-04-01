import { motion } from 'framer-motion';

export default function ProgressBar({ value }) {
  return (
    <div className="space-y-2">
      <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-slate-900/75">
        <motion.div
          className="h-full rounded-full btn-gradient shadow-[0_0_18px_rgba(90,124,255,0.45)]"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Progress</span>
        <span>{Math.round(value)}% complete</span>
      </div>
    </div>
  );
}
