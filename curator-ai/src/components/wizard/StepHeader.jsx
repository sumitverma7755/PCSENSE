import ProgressBar from './ProgressBar'

function StepHeader({ title, subtitle, steps, currentStep, progress }) {
  return (
    <header className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-slate-200">
            Configuration Wizard
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300">{subtitle}</p>
        </div>
        <div className="glass-chip inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-medium text-slate-200">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isActive = index === currentStep

          return (
            <div
              key={step.key}
              className={[
                'relative rounded-2xl border px-4 py-3 transition-all',
                isActive
                  ? 'border-blue-300/60 bg-blue-400/10 text-blue-100'
                  : isComplete
                    ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-white/5 text-slate-400',
              ].join(' ')}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={[
                    'inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold',
                    isActive
                      ? 'border-blue-300/70 bg-blue-400/20 text-blue-100'
                      : isComplete
                        ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100'
                        : 'border-white/20 bg-white/5 text-slate-300',
                  ].join(' ')}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-wider">Step {index + 1}</p>
              </div>
              <p className="text-sm font-semibold">{step.label}</p>
            </div>
          )
        })}
      </div>

      <ProgressBar progress={progress} />
    </header>
  )
}

export default StepHeader
