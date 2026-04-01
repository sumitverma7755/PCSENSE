import { useEffect, useMemo, useState } from 'react';
import CTAButton from '../components/wizard/CTAButton';
import SelectionCard from '../components/wizard/SelectionCard';
import StepHeader from '../components/wizard/StepHeader';
import WizardLayout from '../components/wizard/WizardLayout';

const STEP_CONFIG = [
  {
    key: 'type',
    label: 'Type',
    prompt: 'Choose your preferred form factor.',
    options: [
      {
        value: 'desktop',
        title: 'Desktop',
        description: 'Best for performance & gaming',
        icon: '???'
      },
      {
        value: 'laptop',
        title: 'Laptop',
        description: 'Portable & convenient',
        icon: '??'
      }
    ]
  },
  {
    key: 'usage',
    label: 'Usage',
    prompt: 'How will you mainly use this machine?',
    options: [
      {
        value: 'gaming',
        title: 'Gaming',
        description: 'High FPS, AAA-ready configurations',
        icon: '??'
      },
      {
        value: 'work',
        title: 'Work',
        description: 'Reliable daily productivity and coding',
        icon: '??'
      },
      {
        value: 'editing',
        title: 'Editing',
        description: 'Balanced CPU/GPU for creator workflows',
        icon: '??'
      }
    ]
  },
  {
    key: 'budget',
    label: 'Budget',
    prompt: 'Set your budget range (INR).'
  },
  {
    key: 'summary',
    label: 'Summary',
    prompt: 'Review your onboarding preferences.'
  }
];

const BUDGET_MIN = 30000;
const BUDGET_MAX = 300000;
const BUDGET_STEP = 5000;

function formatINR(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function ConfigurationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [focusedOption, setFocusedOption] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selections, setSelections] = useState({
    type: '',
    usage: '',
    budget: 100000
  });

  const totalSteps = STEP_CONFIG.length;
  const activeStep = STEP_CONFIG[currentStep];
  const progress = useMemo(() => ((currentStep + 1) / totalSteps) * 100, [currentStep, totalSteps]);

  const isStepValid = (step = activeStep) => {
    if (step.key === 'type') return Boolean(selections.type);
    if (step.key === 'usage') return Boolean(selections.usage);
    if (step.key === 'budget') return Number(selections.budget) >= BUDGET_MIN;
    return Boolean(selections.type && selections.usage && selections.budget);
  };

  useEffect(() => {
    setFocusedOption(0);
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isCompleted) return;
      const options = activeStep.options || [];

      if (activeStep.key === 'budget') {
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault();
          setSelections((prev) => ({ ...prev, budget: Math.min(BUDGET_MAX, prev.budget + BUDGET_STEP) }));
          return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault();
          setSelections((prev) => ({ ...prev, budget: Math.max(BUDGET_MIN, prev.budget - BUDGET_STEP) }));
          return;
        }
      }

      if (options.length > 0) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          setFocusedOption((prev) => (prev + 1) % options.length);
          return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          setFocusedOption((prev) => (prev - 1 + options.length) % options.length);
          return;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          const option = options[focusedOption];
          if (option) {
            setSelections((prev) => ({ ...prev, [activeStep.key]: option.value }));
          }
          return;
        }
      }

      if (event.key === 'Enter' && isStepValid()) {
        event.preventDefault();
        if (currentStep === totalSteps - 1) {
          setIsCompleted(true);
        } else {
          setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
        }
      }

      if (event.key === 'Escape' && currentStep > 0) {
        setCurrentStep((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, currentStep, focusedOption, isCompleted, selections, totalSteps]);

  const handleContinue = () => {
    if (!isStepValid()) return;
    if (currentStep === totalSteps - 1) {
      setIsCompleted(true);
      return;
    }
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const renderStepBody = () => {
    if (activeStep.options) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeStep.options.map((option, idx) => (
            <SelectionCard
              key={option.value}
              title={option.title}
              description={option.description}
              icon={option.icon}
              selected={selections[activeStep.key] === option.value}
              focused={focusedOption === idx}
              onFocus={() => setFocusedOption(idx)}
              onSelect={() => setSelections((prev) => ({ ...prev, [activeStep.key]: option.value }))}
            />
          ))}
        </div>
      );
    }

    if (activeStep.key === 'budget') {
      return (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={selections.budget}
              onChange={(event) => setSelections((prev) => ({ ...prev, budget: Number(event.target.value) }))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-blue-500"
            />
            <div className="mt-5 text-center">
              <div className="text-3xl font-extrabold text-white sm:text-5xl">{formatINR(selections.budget)}</div>
              <p className="mt-2 text-sm text-slate-300">Use arrow keys for fine tuning.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[50000, 80000, 120000, 180000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSelections((prev) => ({ ...prev, budget: preset }))}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  selections.budget === preset
                    ? 'border-blue-300/60 bg-accent-gradient text-white shadow-glow'
                    : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/30'
                }`}
              >
                {formatINR(preset)}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Type</p>
            <p className="mt-2 text-lg font-bold text-white capitalize">{selections.type || 'Not selected'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Usage</p>
            <p className="mt-2 text-lg font-bold text-white capitalize">{selections.usage || 'Not selected'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Budget</p>
            <p className="mt-2 text-lg font-bold text-white">{formatINR(selections.budget)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          This setup is ready for recommendation generation and backend integration.
        </div>
      </div>
    );
  };

  const ctaLabel = isCompleted ? 'Configuration Saved' : currentStep === totalSteps - 1 ? 'Finish Setup' : 'Continue';

  return (
    <>
      <WizardLayout
        stepKey={activeStep.key}
        header={
          <StepHeader
            title="Build Your Perfect PC"
            subtitle="Answer a few quick questions to get started"
            steps={STEP_CONFIG}
            currentStep={currentStep}
            progress={progress}
          />
        }
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">{activeStep.prompt}</h2>
              <p className="mt-1 text-sm text-slate-300">Use keyboard: arrows to navigate, Enter to select/continue.</p>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>

          {renderStepBody()}

          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                currentStep === 0
                  ? 'cursor-not-allowed border-white/10 bg-white/5 text-slate-500'
                  : 'border-white/20 bg-white/[0.04] text-slate-200 hover:border-white/40 hover:bg-white/10'
              }`}
            >
              Back
            </button>
          </div>
        </div>
      </WizardLayout>

      <CTAButton
        label={ctaLabel}
        disabled={isCompleted || !isStepValid()}
        onClick={handleContinue}
        isFinalStep={currentStep === totalSteps - 1}
      />
    </>
  );
}
