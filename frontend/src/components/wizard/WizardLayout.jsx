import { AnimatePresence, motion } from 'framer-motion';

export default function WizardLayout({ header, children, stepKey }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8 sm:py-10">
      <div className="wizard-grid-bg pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
        {header}

        <div className="glass-panel p-5 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
