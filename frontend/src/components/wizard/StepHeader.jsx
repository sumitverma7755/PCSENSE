import ProgressBar from './ProgressBar';

export default function StepHeader({ title, subtitle, steps, currentStep, progress }) {
  return (
    <header className="space-y-6">
      <div>
        <p className="mb-2 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          Configuration Wizard
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-300 sm:text-lg">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map((step, idx) => {
          const active = idx === currentStep;
          const completed = idx < currentStep;
          return (
            <div
              key={step.key}
              className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                active
                  ? 'border-transparent bg-accent-gradient text-white shadow-glow'
                  : completed
                    ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/10 bg-white/[0.03] text-slate-300'
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Step {idx + 1}</p>
              <p className="mt-1 text-sm font-semibold">{step.label}</p>
            </div>
          );
        })}
      </div>

      <ProgressBar value={progress} />
    </header>
  );
}
