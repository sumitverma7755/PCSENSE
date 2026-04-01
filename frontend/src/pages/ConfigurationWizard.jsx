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
        description: 'Best for performance and upgradability',
        icon: 'desktop',
        helper: 'Tower setup'
      },
      {
        value: 'laptop',
        title: 'Laptop',
        description: 'Portable and convenient',
        icon: 'laptop',
        helper: 'Carry anywhere'
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
        description: 'High FPS and AAA-ready performance',
        icon: 'gaming',
        helper: 'GPU-first'
      },
      {
        value: 'work',
        title: 'Work',
        description: 'Reliable daily productivity and coding',
        icon: 'work',
        helper: 'Balanced'
      },
      {
        value: 'editing',
        title: 'Editing',
        description: 'Balanced CPU/GPU for creator workflows',
        icon: 'editing',
        helper: 'Creator tuned'
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
    prompt: 'Review preferences and generate your recommendation.'
  }
];

const BUDGET_MIN = 30000;
const BUDGET_MAX = 300000;
const BUDGET_STEP = 5000;

function StepIcon({ type }) {
  const commonClass = 'h-5 w-5';

  if (type === 'desktop') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={commonClass}>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8" />
        <path d="M12 16v4" />
      </svg>
    );
  }

  if (type === 'laptop') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={commonClass}>
        <rect x="4" y="5" width="16" height="10" rx="2" />
        <path d="M2 18h20" />
      </svg>
    );
  }

  if (type === 'gaming') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={commonClass}>
        <path d="M6.5 9h11a3 3 0 0 1 2.8 4.1l-1.1 2.8a2.5 2.5 0 0 1-4.5.4L13.7 15h-3.4l-1 1.3a2.5 2.5 0 0 1-4.5-.4l-1.1-2.8A3 3 0 0 1 6.5 9Z" />
        <path d="M8 12h2" />
        <path d="M9 11v2" />
        <circle cx="15.5" cy="12.5" r="0.6" />
        <circle cx="17.5" cy="13.5" r="0.6" />
      </svg>
    );
  }

  if (type === 'work') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={commonClass}>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M9 6V4h6v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={commonClass}>
      <path d="M4 5h16v14H4z" />
      <path d="M9 9h6M8 13h8M10 17h4" />
    </svg>
  );
}

function formatINR(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseNumeric(text) {
  const match = String(text || '').match(/(\d{2,4})/);
  return match ? Number(match[1]) : 0;
}

function parseRamGb(name) {
  const match = String(name || '').match(/(\d+)\s*GB/i);
  return match ? Number(match[1]) : 8;
}

function parseWattage(text) {
  const match = String(text || '').match(/(\d{2,4})\s*W/i);
  return match ? Number(match[1]) : parseNumeric(text);
}

function budgetFitScore(price, target) {
  const safeTarget = Math.max(target, 1);
  const delta = Math.abs(Number(price || 0) - safeTarget) / (safeTarget * 0.85);
  return clamp(100 - delta * 100, 0, 100);
}

function tierScore(tier) {
  const normalized = String(tier || '').toLowerCase();
  if (normalized === 'ultra') return 100;
  if (normalized === 'high') return 85;
  if (normalized === 'mid') return 68;
  if (normalized === 'entry') return 44;
  return 18;
}

function isMobileGpu(gpu) {
  const name = String(gpu?.name || '').toLowerCase();
  if (!name) return false;
  if (gpu?.mobile === true) return true;
  if (name.includes('mobile') || name.includes('laptop') || name.includes('notebook') || name.includes('max-q') || name.includes('max q')) {
    return true;
  }
  return /\b(?:rtx|gtx|rx|arc|radeon)\s+[a-z0-9-]*m(?:\b|\s)/i.test(name);
}

function pickBest(list, scoreFn) {
  if (!list.length) return null;
  return [...list]
    .map((item) => ({ item, score: scoreFn(item) }))
    .sort((a, b) => b.score - a.score || Number(a.item.price || 0) - Number(b.item.price || 0))[0].item;
}

function createLaptopRecommendation(db, selections) {
  const laptops = safeArray(db.laptops);
  if (!laptops.length) {
    throw new Error('Laptop catalog is empty.');
  }

  const budget = Number(selections.budget || 0);
  const usage = selections.usage;
  const usageKeyword = usage === 'editing' ? 'creator' : usage;

  const inRange = laptops.filter((item) => Number(item.price || 0) <= budget * 1.2);
  const source = inRange.length ? inRange : laptops;

  const scored = source
    .map((laptop) => {
      const specText = `${laptop.name || ''} ${laptop.spec || ''} ${laptop.type || ''}`.toLowerCase();
      const keywordBoost = specText.includes(usageKeyword) ? 10 : 0;
      const gamingBoost = usage === 'gaming' && /rtx|rx|gaming|144hz|165hz/i.test(specText) ? 12 : 0;
      const editingBoost = usage === 'editing' && /16gb|32gb|rtx|creator|render/i.test(specText) ? 10 : 0;
      const workBoost = usage === 'work' && /office|business|battery|lightweight|ultrabook/i.test(specText) ? 8 : 0;

      const score =
        budgetFitScore(laptop.price, budget) * 0.52 +
        tierScore(laptop.gpuTier) * 0.36 +
        keywordBoost +
        gamingBoost +
        editingBoost +
        workBoost;

      return { ...laptop, score };
    })
    .sort((a, b) => b.score - a.score || Math.abs(Number(a.price || 0) - budget) - Math.abs(Number(b.price || 0) - budget));

  const options = scored.slice(0, 3);
  const best = options[0];

  return {
    kind: 'laptop',
    title: `${usage.charAt(0).toUpperCase() + usage.slice(1)} Laptop Recommendation`,
    targetBudget: budget,
    totalPrice: Number(best.price || 0),
    options,
    reasoning: `Top laptop picks were scored for budget fit, GPU tier, and ${usage} suitability.`
  };
}

function createDesktopRecommendation(db, selections) {
  const cpus = safeArray(db.cpus);
  const gpus = safeArray(db.gpus);
  const mobos = safeArray(db.mobos);
  const ramList = safeArray(db.ram);
  const storageList = safeArray(db.storage);
  const psuList = safeArray(db.psu);
  const caseList = safeArray(db.case);

  if (!cpus.length || !gpus.length || !mobos.length || !ramList.length || !storageList.length || !psuList.length || !caseList.length) {
    throw new Error('Desktop component catalog is incomplete.');
  }

  const budget = Number(selections.budget || 0);
  const usage = selections.usage;

  const profileByUsage = {
    gaming: { cpu: 0.24, gpu: 0.42 },
    work: { cpu: 0.30, gpu: 0.20 },
    editing: { cpu: 0.28, gpu: 0.32 }
  };
  const profile = profileByUsage[usage] || profileByUsage.work;

  const desktopGpus = gpus.filter((gpu) => !isMobileGpu(gpu));
  const integratedGpu = gpus.find((gpu) => Number(gpu.price || 0) === 0) || desktopGpus[0] || gpus[0];

  const cpuPool = cpus.filter((cpu) => Number(cpu.price || 0) <= budget * 0.5);
  const cpuTarget = budget * profile.cpu;

  let cpu =
    pickBest(cpuPool, (item) => {
      const score = Number(item.score || 0);
      const coreCount = parseNumeric(item.cores);
      const editingBoost = usage === 'editing' && coreCount >= 8 ? 8 : 0;
      return budgetFitScore(item.price, cpuTarget) * 0.68 + score * 0.32 + editingBoost;
    }) || cpus[0];

  const useIntegrated = usage === 'work' && budget < 50000;
  const gpuTarget = budget * profile.gpu;
  const paidGpuPool = desktopGpus.filter((gpu) => Number(gpu.price || 0) > 0 && Number(gpu.price || 0) <= budget * 0.64);

  let gpu =
    (useIntegrated ? integratedGpu : null) ||
    pickBest(paidGpuPool, (item) => {
      const tier = tierScore(item.tier);
      const usageBoost = usage === 'gaming' ? tier * 0.55 : usage === 'editing' ? tier * 0.45 : tier * 0.30;
      return budgetFitScore(item.price, gpuTarget) * 0.6 + usageBoost;
    }) ||
    pickBest(desktopGpus.filter((item) => Number(item.price || 0) > 0), (item) => budgetFitScore(item.price, gpuTarget) + tierScore(item.tier)) ||
    integratedGpu;

  const moboPool = mobos.filter((item) => String(item.socket || '').toLowerCase() === String(cpu.socket || '').toLowerCase());
  const fallbackMobos = moboPool.length ? moboPool : mobos;
  const preferredMemoryType = budget >= 90000 ? 'DDR5' : 'DDR4';

  const mobo =
    pickBest(fallbackMobos, (item) => {
      const typeMatch = String(item.type || '').toUpperCase().includes(preferredMemoryType) ? 16 : 0;
      return budgetFitScore(item.price, budget * 0.12) + typeMatch;
    }) || fallbackMobos[0];

  const selectedMemoryType = /DDR5/i.test(String(mobo.type || '')) ? 'DDR5' : /DDR4/i.test(String(mobo.type || '')) ? 'DDR4' : '';
  const typedRam = selectedMemoryType ? ramList.filter((item) => String(item.type || '').toUpperCase().includes(selectedMemoryType)) : ramList;
  const fallbackRam = typedRam.length ? typedRam : ramList;
  const targetRam = usage === 'editing' ? (budget > 100000 ? 32 : 16) : usage === 'gaming' && budget > 140000 ? 32 : 16;

  const ram =
    pickBest(fallbackRam, (item) => {
      const gb = parseRamGb(item.name);
      const capacityFit = clamp(28 - Math.abs(gb - targetRam) * 8, 0, 28);
      const overTargetBonus = gb >= targetRam ? 8 : 0;
      return budgetFitScore(item.price, budget * 0.09) + capacityFit + overTargetBonus;
    }) || fallbackRam[0];

  const storage =
    pickBest(storageList, (item) => {
      const spec = String(item.name || '').toLowerCase();
      const nvmeBoost = budget >= 55000 && /nvme|gen4|gen5/.test(spec) ? 14 : 0;
      return budgetFitScore(item.price, budget * 0.07) + nvmeBoost;
    }) || storageList[0];

  const cpuTdp = parseWattage(cpu.tdp);
  const gpuTdp = parseWattage(gpu.tdp);
  const requiredWatt = Math.max(450, Math.ceil((cpuTdp + gpuTdp + 140) / 50) * 50);

  const psuScored = psuList.map((item) => ({ ...item, wattage: parseWattage(item.name) }));
  const psuEligible = psuScored.filter((item) => item.wattage >= requiredWatt);
  const psuSource = psuEligible.length ? psuEligible : psuScored;

  const psu =
    pickBest(psuSource, (item) => {
      const wattHeadroom = clamp(20 - Math.floor(Math.max(item.wattage - requiredWatt, 0) / 100), 0, 20);
      return budgetFitScore(item.price, budget * 0.07) + wattHeadroom;
    }) || psuSource[0];

  const userCase = pickBest(caseList, (item) => budgetFitScore(item.price, budget * 0.05)) || caseList[0];

  let parts = {
    cpu,
    gpu,
    motherboard: mobo,
    memory: ram,
    storage,
    psu,
    case: userCase
  };

  let totalPrice = Object.values(parts).reduce((sum, item) => sum + Number(item?.price || 0), 0);

  if (totalPrice > budget * 1.1 && Number(parts.gpu.price || 0) > 0) {
    const alternatives = desktopGpus
      .filter((item) => Number(item.price || 0) > 0 && Number(item.price || 0) < Number(parts.gpu.price || 0))
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

    const replacement = alternatives.find((item) => {
      const candidateTotal = totalPrice - Number(parts.gpu.price || 0) + Number(item.price || 0);
      return candidateTotal <= budget * 1.08;
    });

    if (replacement) {
      parts = { ...parts, gpu: replacement };
      totalPrice = Object.values(parts).reduce((sum, item) => sum + Number(item?.price || 0), 0);
    }
  }

  return {
    kind: 'desktop',
    title: `${usage.charAt(0).toUpperCase() + usage.slice(1)} Desktop Recommendation`,
    targetBudget: budget,
    totalPrice,
    parts,
    reasoning: `Component allocation was balanced for ${usage} performance and budget fit.`
  };
}

async function loadComponentDatabase() {
  const sources = ['/data/components.json', './data/components.json'];
  let lastError = null;

  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Unable to load ${source}`);
      }
      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid components payload');
      }
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to load component database');
}

function buildRecommendation(db, selections) {
  if (selections.type === 'laptop') {
    return createLaptopRecommendation(db, selections);
  }
  return createDesktopRecommendation(db, selections);
}

export default function ConfigurationWizard({ onGoHome }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [focusedOption, setFocusedOption] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [recommendation, setRecommendation] = useState(null);
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
    setRecommendation(null);
    setGenerationError('');
  }, [selections.type, selections.usage, selections.budget]);

  const generateRecommendation = async () => {
    if (isGenerating || !isStepValid(STEP_CONFIG[totalSteps - 1])) return;

    setIsGenerating(true);
    setGenerationError('');

    try {
      const data = await loadComponentDatabase();
      await new Promise((resolve) => setTimeout(resolve, 650));
      const result = buildRecommendation(data, selections);
      setRecommendation(result);
    } catch (error) {
      setGenerationError(error?.message || 'Failed to generate recommendation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = async () => {
    if (isGenerating || !isStepValid()) return;

    if (currentStep === totalSteps - 1) {
      await generateRecommendation();
      return;
    }

    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleBack = () => {
    if (isGenerating) return;
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isGenerating) return;

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
          void generateRecommendation();
        } else {
          setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
        }
        return;
      }

      if (event.key === 'Escape' && currentStep > 0) {
        event.preventDefault();
        setCurrentStep((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, currentStep, focusedOption, isGenerating, selections, totalSteps]);

  const renderRecommendationPanel = () => {
    if (isGenerating) {
      return (
        <div className="rounded-2xl border border-blue-300/30 bg-blue-500/10 p-5">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-transparent" />
            <p className="text-sm font-semibold text-blue-100">Scoring parts and validating compatibility from live catalog...</p>
          </div>
        </div>
      );
    }

    if (generationError) {
      return (
        <div className="rounded-2xl border border-red-300/35 bg-red-500/10 p-4 text-sm text-red-200">
          {generationError}
        </div>
      );
    }

    if (!recommendation) {
      return (
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Ready to generate. Click \"Suggest My PC\" for a complete recommendation card set.
        </div>
      );
    }

    if (recommendation.kind === 'laptop') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-300/30 bg-gradient-to-br from-blue-500/12 to-violet-500/12 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Top Pick</p>
            <p className="mt-1 text-xl font-bold text-white">{recommendation.options[0]?.name}</p>
            <p className="mt-2 text-sm text-slate-200">{recommendation.options[0]?.spec}</p>
            <p className="mt-3 text-lg font-bold text-blue-100">{formatINR(recommendation.options[0]?.price)}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recommendation.options.map((option, idx) => (
              <div key={option.id || option.name || idx} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Option {idx + 1}</p>
                <p className="mt-1 font-bold text-white">{option.name}</p>
                <p className="mt-2 text-xs text-slate-300">{option.spec}</p>
                <p className="mt-3 text-sm font-bold text-blue-200">{formatINR(option.price)}</p>
              </div>
            ))}
          </div>

          <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">{recommendation.reasoning}</p>
        </div>
      );
    }

    const partEntries = Object.entries(recommendation.parts || {});

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-blue-300/25 bg-gradient-to-br from-blue-500/12 to-indigo-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Estimated Total</p>
          <p className="mt-1 text-2xl font-extrabold text-white">{formatINR(recommendation.totalPrice)}</p>
          <p className="mt-2 text-sm text-slate-300">
            Target budget: {formatINR(recommendation.targetBudget)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {partEntries.map(([key, part]) => (
            <div key={key} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{key}</p>
              <p className="mt-1 font-bold text-white">{part?.name}</p>
              <p className="mt-2 text-sm font-semibold text-blue-200">{formatINR(part?.price)}</p>
            </div>
          ))}
        </div>

        <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">{recommendation.reasoning}</p>
      </div>
    );
  };

  const renderStepBody = () => {
    if (activeStep.options) {
      return (
        <div
          className={`grid grid-cols-1 gap-4 ${
            activeStep.key === 'usage' ? 'sm:grid-cols-3' : 'sm:grid-cols-2 sm:max-w-4xl sm:mx-auto'
          }`}
        >
          {activeStep.options.map((option, idx) => (
            <SelectionCard
              key={option.value}
              title={option.title}
              description={option.description}
              icon={<StepIcon type={option.icon} />}
              helper={option.helper}
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
            <div className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              <span>{formatINR(BUDGET_MIN)}</span>
              <span>{formatINR(BUDGET_MAX)}</span>
            </div>
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
                    ? 'border-blue-300/60 btn-gradient text-white shadow-glow'
                    : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/30'
                }`}
              >
                {formatINR(preset)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">GPU Budget</p>
              <p className="mt-1 font-bold text-white">{formatINR(Math.round(selections.budget * 0.4))}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">CPU Budget</p>
              <p className="mt-1 font-bold text-white">{formatINR(Math.round(selections.budget * 0.24))}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Platform + Other</p>
              <p className="mt-1 font-bold text-white">{formatINR(Math.round(selections.budget * 0.36))}</p>
            </div>
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

        {renderRecommendationPanel()}
      </div>
    );
  };

  const ctaLabel =
    isGenerating
      ? 'Generating...'
      : currentStep === totalSteps - 1
        ? recommendation
          ? 'Regenerate Build'
          : 'Suggest My PC'
        : 'Continue';

  return (
    <>
      <WizardLayout
        stepKey={activeStep.key}
        header={
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onGoHome}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]"
              >
                Home
              </button>
            </div>
            <StepHeader
              title="Build Your Perfect PC"
              subtitle="Answer a few quick questions to get started"
              steps={STEP_CONFIG}
              currentStep={currentStep}
              progress={progress}
            />
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">{activeStep.prompt}</h2>
              <p className="mt-1 text-sm text-slate-300">Keyboard support: arrows move focus, Enter selects and continues.</p>
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
              disabled={currentStep === 0 || isGenerating}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                currentStep === 0 || isGenerating
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
        disabled={isGenerating || !isStepValid()}
        onClick={handleContinue}
        isFinalStep={currentStep === totalSteps - 1}
      />
    </>
  );
}
