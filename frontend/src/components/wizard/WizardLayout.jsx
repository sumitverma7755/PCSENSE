import { AnimatePresence, motion } from 'framer-motion';

export default function WizardLayout({ header, children, stepKey }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8 sm:py-10">
      <div className="wizard-grid-bg pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        {header}

        <div className="panel-shell p-5 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              initial={{ opacity: 0, x: 22, y: 4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -22, y: -4 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
