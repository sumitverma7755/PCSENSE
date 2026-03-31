import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CTAButton from './components/wizard/CTAButton'
import SelectionCard from './components/wizard/SelectionCard'
import StepHeader from './components/wizard/StepHeader'
import WizardLayout from './components/wizard/WizardLayout'

const MotionSection = motion.section
const MotionDiv = motion.div
const MotionParagraph = motion.p

const STEPS = [
  { key: 'type', label: 'Type' },
  { key: 'usage', label: 'Usage' },
  { key: 'budget', label: 'Budget' },
  { key: 'summary', label: 'Summary' },
]

const TYPE_OPTIONS = [
  {
    value: 'desktop',
    title: 'Desktop',
    description: 'Best for performance & gaming',
    tooltip: 'Higher thermal headroom, easier upgrades, and long-term price-to-performance.',
  },
  {
    value: 'laptop',
    title: 'Laptop',
    description: 'Portable & convenient',
    tooltip: 'Compact setup with built-in display and battery for mobility-first workflows.',
  },
]

const USAGE_OPTIONS = [
  {
    value: 'gaming',
    title: 'Gaming',
    description: 'High FPS gameplay and stronger GPU-first balancing.',
  },
  {
    value: 'creator',
    title: 'Content Creation',
    description: 'Balanced CPU/GPU mix for editing, rendering, and production.',
  },
  {
    value: 'developer',
    title: 'Development',
    description: 'Fast compile times, containers, and heavy multitasking.',
  },
  {
    value: 'productivity',
    title: 'Productivity',
    description: 'Smooth everyday workflows with efficiency-focused components.',
  },
]

function DesktopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M9 19h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  )
}

function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="5" y="5" width="14" height="10" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M2.5 19h19" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  )
}

function UsageIcon({ type }) {
  if (type === 'gaming') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="8" width="18" height="8" rx="4" fill="none" stroke="currentColor" strokeWidth="1.9" />
        <path d="M8 12h4M10 10v4M16 11.5h.01M18 12.5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
      </svg>
    )
  }

  if (type === 'creator') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 3l2.7 5.48L21 9.3l-4.5 4.38L17.6 21 12 18.02 6.4 21l1.1-7.32L3 9.3l6.3-.82L12 3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    )
  }

  if (type === 'developer') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.9"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  )
}

function App() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    type: '',
    usage: '',
    budget: 50000,
  })

  const progress = Math.round(((step + 1) / STEPS.length) * 100)
  const isFinalStep = step === STEPS.length - 1

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(form.type)
    if (step === 1) return Boolean(form.usage)
    if (step === 2) return Number(form.budget) >= 15000
    return true
  }, [form.budget, form.type, form.usage, step])

  const triggerFeedback = () => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(12)
    }
  }

  const handleRovingSelection = (event, options, selectedValue, onSelect) => {
    const key = event.key
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Enter', ' '].includes(key)) return
    event.preventDefault()

    const currentIndex = Math.max(options.findIndex((item) => item.value === selectedValue), 0)
    let nextIndex = currentIndex

    if (key === 'ArrowRight' || key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % options.length
    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + options.length) % options.length
    }

    const next = options[nextIndex]
    if (!next) return
    onSelect(next.value)
    triggerFeedback()
  }

  const setType = (value) => {
    setForm((prev) => ({ ...prev, type: value }))
    triggerFeedback()
  }

  const setUsage = (value) => {
    setForm((prev) => ({ ...prev, usage: value }))
    triggerFeedback()
  }

  const setBudget = (value) => {
    setForm((prev) => ({ ...prev, budget: Number(value) }))
  }

  const goBack = () => {
    setSubmitted(false)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const continueFlow = () => {
    if (step < STEPS.length - 1) {
      if (!canContinue) return
      triggerFeedback()
      setStep((prev) => prev + 1)
      return
    }
    setSubmitted(true)
    triggerFeedback()
  }

  const ctaLabel = isFinalStep ? (submitted ? 'Configuration Saved' : 'Generate Recommendation') : 'Continue ->'
  const typeTitle = TYPE_OPTIONS.find((option) => option.value === form.type)?.title || 'Not selected'
  const usageTitle = USAGE_OPTIONS.find((option) => option.value === form.usage)?.title || 'Not selected'

  return (
    <WizardLayout
      header={
        <StepHeader
          title="Build Your Perfect PC"
          subtitle="Answer a few quick questions to get started"
          steps={STEPS}
          currentStep={step}
          progress={progress}
        />
      }
      leftDock={
        step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="glass-chip rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-blue-300/50 hover:bg-blue-400/10 focus-ring"
          >
            Back
          </button>
        ) : null
      }
      floatingAction={
        <div className="flex flex-col items-end gap-2">
          <p className="glass-chip hidden rounded-full px-3 py-1 text-[11px] text-slate-300 sm:inline-flex">
            Tip: Use arrow keys and Enter
          </p>
          <CTAButton
            label={ctaLabel}
            disabled={!canContinue || submitted}
            onClick={continueFlow}
            className="w-full sm:w-auto"
          />
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <MotionSection
          key={step}
          initial={{ opacity: 0, y: 16, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.985 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {step === 0 ? (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Choose your preferred setup</h2>
              <div
                role="radiogroup"
                aria-label="Computer type"
                onKeyDown={(event) => handleRovingSelection(event, TYPE_OPTIONS, form.type, setType)}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {TYPE_OPTIONS.map((option) => (
                  <SelectionCard
                    key={option.value}
                    id={`type-${option.value}`}
                    title={option.title}
                    description={option.description}
                    tooltip={option.tooltip}
                    icon={option.value === 'desktop' ? <DesktopIcon /> : <LaptopIcon />}
                    selected={form.type === option.value}
                    onSelect={() => setType(option.value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-white md:text-3xl">How will you primarily use it?</h2>
              <div
                role="radiogroup"
                aria-label="Primary usage"
                onKeyDown={(event) => handleRovingSelection(event, USAGE_OPTIONS, form.usage, setUsage)}
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {USAGE_OPTIONS.map((option) => (
                  <SelectionCard
                    key={option.value}
                    id={`usage-${option.value}`}
                    title={option.title}
                    description={option.description}
                    icon={<UsageIcon type={option.value} />}
                    selected={form.usage === option.value}
                    onSelect={() => setUsage(option.value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-7">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white md:text-3xl">Set your budget range</h2>
                <p className="text-sm text-slate-300">
                  Drag to define your comfort zone. We will tune component recommendations to this value.
                </p>
              </div>

              <div className="soft-card rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
                <input
                  aria-label="Budget range"
                  type="range"
                  min={15000}
                  max={500000}
                  step={5000}
                  value={form.budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-white/15 accent-blue-400"
                />

                <MotionParagraph
                  key={form.budget}
                  initial={{ opacity: 0.35, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl"
                >
                  <span className="mr-2 text-2xl text-slate-300 md:text-3xl">Rs</span>
                  {form.budget.toLocaleString('en-IN')}
                </MotionParagraph>

                <div className="mt-7 flex flex-wrap gap-2">
                  {[50000, 80000, 120000, 180000, 250000].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBudget(value)}
                      className={[
                        'rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                        form.budget === value
                          ? 'border-blue-300/60 bg-blue-400/15 text-blue-100'
                          : 'border-white/15 bg-white/5 text-slate-300 hover:border-blue-300/45',
                      ].join(' ')}
                    >
                      Rs {value.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Summary</h2>
              <p className="text-sm text-slate-300">Review your preferences before generating your personalized build.</p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="soft-card rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Type</p>
                  <p className="mt-2 text-lg font-semibold text-white">{typeTitle}</p>
                </div>
                <div className="soft-card rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Usage</p>
                  <p className="mt-2 text-lg font-semibold text-white">{usageTitle}</p>
                </div>
                <div className="soft-card rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Budget</p>
                  <p className="mt-2 text-lg font-semibold text-white">Rs {form.budget.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-300/25 bg-blue-500/10 px-4 py-4 text-sm text-blue-100">
                We will now generate a balanced recommendation tuned to your workload and value target.
              </div>

              <AnimatePresence>
                {submitted ? (
                  <MotionDiv
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-emerald-300/35 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100"
                  >
                    Setup complete. Your onboarding preferences are now locked in.
                  </MotionDiv>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </MotionSection>
      </AnimatePresence>
    </WizardLayout>
  )
}

export default App
