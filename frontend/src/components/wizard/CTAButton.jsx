import { motion } from 'framer-motion';

export default function CTAButton({ disabled, onClick, label, isFinalStep = false }) {
  return (
    <div className="z-50 mt-4 px-1 sm:pointer-events-none sm:fixed sm:bottom-8 sm:right-8 sm:mt-0 sm:px-0">
      <motion.button
        type="button"
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        disabled={disabled}
        onClick={onClick}
        className={`w-full rounded-2xl border px-6 py-3 text-sm font-bold text-white transition-all sm:pointer-events-auto sm:min-w-[188px] sm:w-auto sm:px-7 sm:py-4 sm:text-base ${
          disabled
            ? 'cursor-not-allowed border-white/12 bg-slate-800/70 text-slate-400'
            : 'border-blue-200/40 btn-gradient btn-glow hover:shadow-glow'
        }`}
      >
        {label}
        {!isFinalStep && <span className="ml-2">-&gt;</span>}
      </motion.button>
    </div>
  );
}
