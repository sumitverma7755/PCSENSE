import { motion } from 'framer-motion'

function ProgressBar({ progress = 0 }) {
  const safeProgress = Math.max(0, Math.min(100, progress))
  const MotionDiv = motion.div

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>Progress</span>
        <span className="font-semibold text-slate-200">{safeProgress}% complete</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <MotionDiv
          className="accent-gradient h-full rounded-full shadow-[0_0_16px_rgba(79,140,255,0.65)]"
          initial={false}
          animate={{ width: `${safeProgress}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.45 }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
