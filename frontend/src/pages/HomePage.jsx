import { motion } from 'framer-motion';

const PRICE_ROWS = [
  { part: 'Ryzen 7 7700', amazon: 'Rs 27,990', flipkart: 'Rs 28,449', md: 'Rs 27,499', best: 'MD' },
  { part: 'RTX 4060 8GB', amazon: 'Rs 29,999', flipkart: 'Rs 30,799', md: 'Rs 29,399', best: 'MD' },
  { part: '16GB DDR5 6000', amazon: 'Rs 5,199', flipkart: 'Rs 5,049', md: 'Rs 5,499', best: 'Flipkart' },
  { part: '1TB NVMe Gen4 SSD', amazon: 'Rs 5,799', flipkart: 'Rs 5,999', md: 'Rs 5,549', best: 'MD' }
];

const FEATURE_CARDS = [
  {
    title: 'Real Performance Numbers',
    body: 'Benchmark-informed recommendations so you know what to expect before spending.'
  },
  {
    title: 'Indian Price Awareness',
    body: 'Track common Indian storefront prices and choose parts based on real availability.'
  },
  {
    title: 'Clear Trade-offs',
    body: 'Understand where budget goes: GPU-heavy gaming builds vs balanced creator builds.'
  }
];

export default function HomePage({ onStartWizard }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8 sm:py-10">
      <div className="wizard-grid-bg pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-6xl space-y-8">
        <nav className="glass-panel flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient font-black text-white">
              P
            </div>
            <div>
              <p className="text-lg font-bold text-white">PCSensei</p>
              <p className="text-xs text-slate-400">Intelligent PC Consultant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartWizard}
            className="rounded-xl border border-blue-300/40 bg-accent-gradient px-4 py-2 text-sm font-bold text-white btn-glow"
          >
            Open Builder
          </button>
        </nav>

        <section className="glass-panel p-6 sm:p-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300"
          >
            Home
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Build the right PC on the first try.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-3xl text-sm text-slate-300 sm:text-lg"
          >
            Practical recommendations, compatibility checks, and price context built for Indian buyers.
          </motion.p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onStartWizard}
              className="rounded-2xl border border-blue-300/40 bg-accent-gradient px-6 py-3 text-sm font-bold text-white btn-glow sm:text-base"
            >
              Start Building
            </motion.button>
            <button
              type="button"
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[0.08] sm:text-base"
            >
              Explore Features
            </button>
          </div>
        </section>

        <section className="glass-panel overflow-hidden p-6 sm:p-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Live Price Snapshot</h2>
              <p className="mt-1 text-sm text-slate-300">Quick baseline pricing before detailed configuration.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-3 py-3">Part</th>
                  <th className="px-3 py-3">Amazon</th>
                  <th className="px-3 py-3">Flipkart</th>
                  <th className="px-3 py-3">MD</th>
                  <th className="px-3 py-3">Best</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_ROWS.map((row) => (
                  <tr key={row.part} className="border-b border-white/5">
                    <td className="px-3 py-3 font-semibold text-white">{row.part}</td>
                    <td className="px-3 py-3">{row.amazon}</td>
                    <td className="px-3 py-3">{row.flipkart}</td>
                    <td className="px-3 py-3">{row.md}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full border border-blue-300/35 bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-100">
                        {row.best}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <motion.article
              key={card.title}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass-panel p-5"
            >
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{card.body}</p>
            </motion.article>
          ))}
        </section>

        <section className="glass-panel flex flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-xl font-bold text-white">Ready to configure your build?</h3>
            <p className="mt-1 text-sm text-slate-300">Use the guided wizard for fastest high-quality recommendations.</p>
          </div>
          <button
            type="button"
            onClick={onStartWizard}
            className="rounded-2xl border border-blue-300/40 bg-accent-gradient px-5 py-3 text-sm font-bold text-white btn-glow"
          >
            Launch Wizard
          </button>
        </section>
      </div>
    </div>
  );
}

