import { motion } from 'framer-motion'

function CheckBadge() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full accent-gradient shadow-[0_0_22px_rgba(79,140,255,0.55)]">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" aria-hidden="true">
        <path
          d="M20 6L9 17l-5-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.3"
        />
      </svg>
    </span>
  )
}

function SelectionCard({
  title,
  description,
  icon,
  tooltip,
  selected = false,
  onSelect,
  id,
}) {
  const MotionButton = motion.button

  return (
    <MotionButton
      type="button"
      role="radio"
      aria-checked={selected}
      aria-describedby={tooltip ? `${id}-tip` : undefined}
      onClick={onSelect}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={[
        'card-lift group relative min-h-48 rounded-2xl border p-5 text-left',
        'glass-panel focus-ring',
        selected
          ? 'selected-glow border-blue-300/60 bg-blue-500/12'
          : 'border-white/10 bg-white/[0.03] hover:border-blue-300/40',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-blue-100">
          {icon}
        </span>
        <div className="flex items-center gap-2">
          {tooltip ? (
            <span className="relative">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs text-slate-300">
                i
              </span>
              <span
                id={`${id}-tip`}
                role="tooltip"
                className="pointer-events-none absolute right-0 top-8 z-10 w-52 rounded-xl border border-white/15 bg-slate-900/95 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100"
              >
                {tooltip}
              </span>
            </span>
          ) : null}
          {selected ? <CheckBadge /> : null}
        </div>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
    </MotionButton>
  )
}

export default SelectionCard
