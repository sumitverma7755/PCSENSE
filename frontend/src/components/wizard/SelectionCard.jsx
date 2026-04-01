import { motion } from 'framer-motion';

export default function SelectionCard({
  title,
  description,
  icon,
  selected = false,
  focused = false,
  onSelect,
  onFocus
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onFocus={onFocus}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative min-h-40 w-full rounded-2xl border p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/80 ${
        selected
          ? 'border-blue-400/80 bg-blue-500/15 shadow-glow'
          : focused
            ? 'border-blue-300/70 bg-white/10'
            : 'border-white/10 bg-white/[0.04] hover:border-white/30'
      }`}
    >
      {selected && (
        <span className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-200/70 bg-accent-gradient text-xs font-bold text-white">
          ?
        </span>
      )}
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </motion.button>
  );
}
