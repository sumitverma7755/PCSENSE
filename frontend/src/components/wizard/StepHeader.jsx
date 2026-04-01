import ProgressBar from './ProgressBar';

export default function StepHeader({ title, subtitle, steps, currentStep, progress }) {
  return (
    <header className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-tag mb-3">Configuration Wizard</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm subtle-copy sm:text-lg">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Progress</p>
          <p className="mt-1 text-lg font-bold text-white">
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {steps.map((step, idx) => {
            const active = idx === currentStep;
            const completed = idx < currentStep;

            return (
              <div
                key={step.key}
                className={`relative overflow-hidden rounded-2xl border px-3 py-3 transition-all sm:px-4 ${
                  active
                    ? 'border-transparent bg-gradient-to-br from-blue-500/90 to-indigo-500/90 text-white shadow-lg shadow-blue-500/30'
                    : completed
                      ? 'border-emerald-300/35 bg-emerald-500/10 text-emerald-100'
                      : 'border-white/12 bg-transparent text-slate-300'
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em]">Step {idx + 1}</p>
                <p className="mt-1 text-sm font-semibold">{step.label}</p>
                <p className="mt-1 text-[11px] font-medium opacity-80">
                  {completed ? 'Completed' : active ? 'In progress' : 'Upcoming'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <ProgressBar value={progress} />
    </header>
  );
}
