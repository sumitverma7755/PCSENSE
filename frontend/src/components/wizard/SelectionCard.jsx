import { motion } from 'framer-motion';

export default function SelectionCard({
  title,
  description,
  icon,
  selected = false,
  focused = false,
  onSelect,
  onFocus,
  helper
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onFocus={onFocus}
      whileHover={{ scale: 1.025, y: -5 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative min-h-44 w-full rounded-2xl border p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/80 ${
        selected
          ? 'border-blue-300/55 bg-gradient-to-br from-blue-500/16 to-indigo-500/18 shadow-glow'
          : focused
            ? 'border-blue-300/35 bg-white/[0.08]'
            : 'border-white/18 bg-white/[0.05] hover:border-white/30'
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-200/70 bg-blue-500/30 text-[11px] font-bold text-blue-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}

      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-slate-100">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-200">{description}</p>

      {helper ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-blue-200/90">{helper}</p>
      ) : null}
    </motion.button>
  );
}
