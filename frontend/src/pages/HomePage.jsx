import { motion } from 'framer-motion';

const PRICE_ROWS = [
  { part: 'Ryzen 7 7700', amazon: 27990, flipkart: 28449, md: 27499 },
  { part: 'RTX 4060 8GB', amazon: 29999, flipkart: 30799, md: 29399 },
  { part: '16GB DDR5 6000', amazon: 5199, flipkart: 5049, md: 5499 },
  { part: '1TB NVMe Gen4 SSD', amazon: 5799, flipkart: 5999, md: 5549 }
];

const STATS = [
  { label: 'Components Indexed', value: '980+' },
  { label: 'Retailers Tracked', value: '6' },
  { label: 'Daily Price Refresh', value: '24h' },
  { label: 'Budget Coverage', value: 'Rs 30K - Rs 3L+' }
];

const STEPS = [
  {
    title: 'Answer 4 Guided Questions',
    copy: 'Capture setup type, workload, and budget in under a minute with keyboard support.'
  },
  {
    title: 'Match Against Live Catalog Data',
    copy: 'Parts are selected for compatibility and budget fit using the current component catalog.'
  },
  {
    title: 'Review and Approve with Context',
    copy: 'See estimated totals, chosen parts, and rationale before finalizing your recommendation.'
  }
];

function formatINR(value) {
  return `Rs ${value.toLocaleString('en-IN')}`;
}

function bestStore(row) {
  const stores = [
    { name: 'Amazon', value: row.amazon },
    { name: 'Flipkart', value: row.flipkart },
    { name: 'MD', value: row.md }
  ];
  return stores.sort((a, b) => a.value - b.value)[0];
}

export default function HomePage({ onStartWizard, onOpenAdmin }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8 sm:py-10">
      <div className="wizard-grid-bg pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-violet-500/18 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-8">
        <nav className="panel-shell flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 btn-gradient text-lg font-black text-white">
              PS
            </div>
            <div>
              <p className="text-lg font-bold text-white">PCSensei</p>
              <p className="text-xs subtle-copy">Professional PC Planning Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              Catalog Synced
            </span>
            {onOpenAdmin ? (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
              >
                Admin
              </button>
            ) : null}
            <button
              type="button"
              onClick={onStartWizard}
              className="rounded-xl border border-blue-300/45 btn-gradient px-4 py-2 text-sm font-bold text-white btn-glow"
            >
              Start Wizard
            </button>
          </div>
        </nav>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel-shell p-7 sm:p-9">
            <motion.p className="section-tag mb-4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              Build Planning
            </motion.p>
            <motion.h1
              className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-5xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              Build your next PC with
              <span className="text-gradient"> confidence, speed, and clarity.</span>
            </motion.h1>
            <motion.p
              className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              PCSensei combines guided inputs, compatibility-aware selection, and transparent pricing so each recommendation is practical and easy to trust.
            </motion.p>

            <div className="mt-6 grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Compatibility-first recommendations</p>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Budget-aware component allocation</p>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Clear rationale for every suggestion</p>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Desktop and laptop decision flow</p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onStartWizard}
                className="rounded-2xl border border-blue-300/40 btn-gradient px-6 py-3 text-sm font-bold text-white btn-glow sm:text-base"
              >
                Start Build Wizard
              </motion.button>
              <button
                type="button"
                onClick={() => document.getElementById('price-board')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08] sm:text-base"
              >
                View Price Snapshot
              </button>
            </div>
          </div>

          <aside className="panel-shell p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Planning Snapshot</p>
            <h2 className="mt-2 text-xl font-bold text-white">Typical split for a Rs 1,00,000 gaming target</h2>
            <div className="mt-5 space-y-3">
              {[
                ['GPU budget', 'Rs 40,000', '40%'],
                ['CPU budget', 'Rs 24,000', '24%'],
                ['Platform + Memory', 'Rs 20,000', '20%'],
                ['Storage + Power + Case', 'Rs 16,000', '16%']
              ].map(([label, value, pct]) => (
                <div key={label} className="rounded-xl border border-white/12 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
                    <div className="h-full rounded-full btn-gradient" style={{ width: pct }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs subtle-copy">Final allocation adapts to selected usage, budget, and component fit.</p>
          </aside>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="panel-shell p-4">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </section>

        <section id="price-board" className="panel-shell overflow-hidden p-6 sm:p-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="section-tag mb-2">Price Board</p>
              <h2 className="text-2xl font-bold text-white">Live Price Snapshot</h2>
              <p className="mt-1 text-sm subtle-copy">Current benchmark prices across major stores before full configuration.</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">Updated Daily</span>
          </div>

          <div className="hidden space-y-3 sm:block">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-3 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              <p>Component</p>
              <p>Amazon</p>
              <p>Flipkart</p>
              <p>MD</p>
              <p>Best</p>
            </div>
            {PRICE_ROWS.map((row) => {
              const best = bestStore(row);
              return (
                <div key={row.part} className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/[0.05] sm:grid-cols-[1.6fr_1fr_1fr_1fr_auto] sm:items-center">
                  <p className="font-bold text-white">{row.part}</p>
                  <p className="text-sm text-slate-300">{formatINR(row.amazon)}</p>
                  <p className="text-sm text-slate-300">{formatINR(row.flipkart)}</p>
                  <p className="text-sm text-slate-300">{formatINR(row.md)}</p>
                  <span className="inline-flex w-fit rounded-full border border-blue-300/35 bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-100">
                    Best: {best.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 sm:hidden">
            {PRICE_ROWS.map((row) => {
              const best = bestStore(row);
              return (
                <div key={row.part} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-white">{row.part}</p>
                    <span className="rounded-full border border-blue-300/35 bg-blue-500/20 px-2 py-1 text-[10px] font-semibold text-blue-100">
                      Best: {best.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">Lowest: {formatINR(best.value)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.article
              key={step.title}
              whileHover={{ y: -4 }}
              className="panel-shell p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Step {index + 1}</p>
              <h3 className="mt-2 text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm subtle-copy">{step.copy}</p>
            </motion.article>
          ))}
        </section>

        <section className="panel-shell flex flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-2xl font-bold text-white">Ready to generate a tailored build?</h3>
            <p className="mt-1 text-sm subtle-copy">Launch the wizard to get a recommendation with budget alignment and clear part-level explanation.</p>
          </div>
          <button
            type="button"
            onClick={onStartWizard}
            className="rounded-2xl border border-blue-300/45 btn-gradient px-5 py-3 text-sm font-bold text-white btn-glow"
          >
            Launch Wizard
          </button>
        </section>
      </div>
    </div>
  );
}
