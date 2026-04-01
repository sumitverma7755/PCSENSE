import { motion } from 'framer-motion';

export default function CTAButton({ disabled, onClick, label, isFinalStep = false }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 sm:bottom-8 sm:right-8">
      <motion.button
        type="button"
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        disabled={disabled}
        onClick={onClick}
        className={`pointer-events-auto rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all sm:px-7 sm:py-4 sm:text-base ${
          disabled
            ? 'cursor-not-allowed border border-white/10 bg-slate-700/60 text-slate-300'
            : 'border border-blue-300/40 bg-accent-gradient btn-glow hover:shadow-glow'
        }`}
      >
        {label} {!isFinalStep && <span className="ml-1">?</span>}
      </motion.button>
    </div>
  );
}
