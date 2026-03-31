package com.example.androidofpcsense.services;

import android.util.Log;

import com.example.androidofpcsense.models.BudgetAllocation;
import com.example.androidofpcsense.models.Component;
import com.example.androidofpcsense.models.ComponentDatabase;
import com.example.androidofpcsense.models.DesktopBuild;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Desktop PC build engine
 * Matches main.html lines 1050-1350
 */
public class DesktopBuildEngine {

    private static final String TAG = "DesktopBuildEngine";

    /**
     * Build a complete desktop PC based on budget and preferences
     */
    public DesktopBuild buildPC(ComponentDatabase db, int budget, String usage,
                                String cpuPref, String gpuPref) {
        Log.d(TAG, "Building PC - Budget: ₹" + budget + ", Usage: " + usage);

        // Step 1: Budget tier detection
        if (budget <= 20000) {
            Log.d(TAG, "Ultra-budget tier (≤₹20k) - APU build");
            return buildAPUSystem(db, budget);
        } else if (budget <= 45000) {
            Log.d(TAG, "Budget tier (≤₹45k) - APU build");
            return buildBudgetAPUSystem(db, budget, usage);
        } else {
            Log.d(TAG, "Standard tier (>₹45k) - Discrete GPU build");
            return buildStandardSystem(db, budget, usage, cpuPref, gpuPref);
        }
    }

    /**
     * Ultra-budget APU system (≤₹20k)
     */
    private DesktopBuild buildAPUSystem(ComponentDatabase db, int budget) {
        // AMD Athlon APU with integrated graphics
        Component cpu = selectBestValue(db.getCpus(), budget * 0.30, "athlon");
        if (cpu == null) cpu = selectBestValue(db.getCpus(), budget * 0.30, null);

        Component mobo = selectBestValue(db.getMobos(), budget * 0.25, null);
        Component ram = selectBestValue(db.getRam(), budget * 0.20, null);
        Component storage = selectBestValue(db.getStorage(), budget * 0.15, null);
        Component psu = selectBestValue(db.getPsu(), budget * 0.07, null);
        Component caseComponent = selectBestValue(db.getCases(), budget * 0.03, null);

        return new DesktopBuild(cpu, null, mobo, ram, storage, psu, caseComponent);
    }

    /**
     * Budget APU system (₹20k-₹45k)
     */
    private DesktopBuild buildBudgetAPUSystem(ComponentDatabase db, int budget, String usage) {
        // Ryzen 5000 series APU
        Component cpu = selectBestValue(db.getCpus(), budget * 0.35, "5600g");
        if (cpu == null) cpu = selectBestValue(db.getCpus(), budget * 0.35, "ryzen");

        Component mobo = selectBestValue(db.getMobos(), budget * 0.20, null);
        Component ram = selectBestValue(db.getRam(), budget * 0.20, null);
        Component storage = selectBestValue(db.getStorage(), budget * 0.15, null);
        Component psu = selectBestValue(db.getPsu(), budget * 0.07, null);
        Component caseComponent = selectBestValue(db.getCases(), budget * 0.03, null);

        return new DesktopBuild(cpu, null, mobo, ram, storage, psu, caseComponent);
    }

    /**
     * Standard system with discrete GPU (>₹45k)
     */
    private DesktopBuild buildStandardSystem(ComponentDatabase db, int budget, String usage,
                                            String cpuPref, String gpuPref) {
        // Budget allocation based on usage
        BudgetAllocation allocation = calculateAllocation(budget, usage);

        Log.d(TAG, "Budget allocation - CPU: ₹" + allocation.cpuBudget +
                   ", GPU: ₹" + allocation.gpuBudget);

        // Component selection with preferences
        Component cpu = selectCPU(db.getCpus(), allocation.cpuBudget, cpuPref);
        Component gpu = selectGPU(db.getGpus(), allocation.gpuBudget, gpuPref);

        // Socket compatibility check (CRITICAL!)
        Component mobo = selectMotherboard(db.getMobos(), allocation.moboBudget);

        Component ram = selectBestValue(db.getRam(), allocation.ramBudget, null);
        Component storage = selectBestValue(db.getStorage(), allocation.storageBudget, null);

        // PSU wattage calculation
        int requiredWattage = calculatePSUWattage(cpu, gpu);
        Component psu = selectPSU(db.getPsu(), requiredWattage, budget);

        Component caseComponent = selectBestValue(db.getCases(), allocation.caseBudget, null);

        // Create initial build
        DesktopBuild build = new DesktopBuild(cpu, gpu, mobo, ram, storage, psu, caseComponent);

        // Budget enforcement loop
        build = enforceBudget(build, budget, db, cpuPref, gpuPref);

        Log.d(TAG, "Final build total: ₹" + build.getTotalPrice());
        return build;
    }

    /**
     * Calculate budget allocation - matches main.html lines 1100-1150
     */
    private BudgetAllocation calculateAllocation(int budget, String usage) {
        BudgetAllocation alloc = new BudgetAllocation();

        switch (usage.toLowerCase()) {
            case "gaming":
                alloc.cpuBudget = (int)(budget * 0.20);
                alloc.gpuBudget = (int)(budget * 0.45); // GPU priority
                alloc.ramBudget = (int)(budget * 0.10);
                alloc.storageBudget = (int)(budget * 0.10);
                alloc.moboBudget = (int)(budget * 0.08);
                alloc.psuBudget = (int)(budget * 0.05);
                alloc.caseBudget = (int)(budget * 0.02);
                break;

            case "productivity":
            case "coding":
            case "development":
                alloc.cpuBudget = (int)(budget * 0.30); // CPU priority
                alloc.gpuBudget = (int)(budget * 0.25);
                alloc.ramBudget = (int)(budget * 0.15);
                alloc.storageBudget = (int)(budget * 0.12);
                alloc.moboBudget = (int)(budget * 0.10);
                alloc.psuBudget = (int)(budget * 0.06);
                alloc.caseBudget = (int)(budget * 0.02);
                break;

            case "content":
            case "creative":
                alloc.cpuBudget = (int)(budget * 0.25);
                alloc.gpuBudget = (int)(budget * 0.35);
                alloc.ramBudget = (int)(budget * 0.15);
                alloc.storageBudget = (int)(budget * 0.10);
                alloc.moboBudget = (int)(budget * 0.08);
                alloc.psuBudget = (int)(budget * 0.05);
                alloc.caseBudget = (int)(budget * 0.02);
                break;

            default: // Office/basic
                alloc.cpuBudget = (int)(budget * 0.25);
                alloc.gpuBudget = (int)(budget * 0.30);
                alloc.ramBudget = (int)(budget * 0.15);
                alloc.storageBudget = (int)(budget * 0.12);
                alloc.moboBudget = (int)(budget * 0.10);
                alloc.psuBudget = (int)(budget * 0.06);
                alloc.caseBudget = (int)(budget * 0.02);
        }

        // High-end adjustment
        if (budget > 200000) {
            alloc.gpuBudget = (int)(budget * 0.50); // GPU can be 50%
            alloc.cpuBudget = (int)(budget * 0.20);
        }

        return alloc;
    }

    /**
     * Select CPU with brand preference
     */
    private Component selectCPU(List<Component> cpus, int maxBudget, String preference) {
        if (cpus == null || cpus.isEmpty()) return null;

        Component best = null;

        for (Component cpu : cpus) {
            if (cpu.getPrice() > maxBudget) continue;

            // Check preference
            if (preference != null && !preference.equals("any")) {
                String name = cpu.getName().toLowerCase();
                if (preference.equals("intel") && !name.contains("intel") && !name.contains("i3")
                    && !name.contains("i5") && !name.contains("i7") && !name.contains("i9")) {
                    continue;
                }
                if (preference.equals("amd") && !name.contains("amd") && !name.contains("ryzen")
                    && !name.contains("athlon")) {
                    continue;
                }
            }

            if (best == null || cpu.getPrice() > best.getPrice()) {
                best = cpu;
            }
        }

        return best;
    }

    /**
     * Select GPU with brand preference
     */
    private Component selectGPU(List<Component> gpus, int maxBudget, String preference) {
        if (gpus == null || gpus.isEmpty()) return null;

        Component best = null;

        for (Component gpu : gpus) {
            if (gpu.getPrice() > maxBudget) continue;

            // Check preference
            if (preference != null && !preference.equals("any")) {
                String name = gpu.getName().toLowerCase();
                if (preference.equals("nvidia") && !name.contains("nvidia") && !name.contains("rtx")
                    && !name.contains("gtx")) {
                    continue;
                }
                if (preference.equals("amd") && !name.contains("amd") && !name.contains("radeon")
                    && !name.contains("rx")) {
                    continue;
                }
            }

            if (best == null || gpu.getPrice() > best.getPrice()) {
                best = gpu;
            }
        }

        return best;
    }

    /**
     * Select motherboard
     */
    private Component selectMotherboard(List<Component> mobos, int maxBudget) {
        return selectBestValue(mobos, maxBudget, null);
    }

    /**
     * Calculate PSU wattage - matches main.html lines 1305-1325
     */
    private int calculatePSUWattage(Component cpu, Component gpu) {
        int cpuTDP = extractTDP(cpu);
        if (cpuTDP == 0) cpuTDP = 65; // Default CPU TDP

        int gpuTDP = extractTDP(gpu);
        if (gpuTDP == 0) gpuTDP = 150; // Default GPU TDP

        // System overhead + 20% headroom
        int totalTDP = cpuTDP + gpuTDP + 100;
        int requiredWattage = (int)(totalTDP * 1.2);

        Log.d(TAG, "PSU calculation - CPU: " + cpuTDP + "W, GPU: " + gpuTDP +
                   "W, Required: " + requiredWattage + "W");

        return requiredWattage;
    }

    /**
     * Extract TDP from spec string
     */
    private int extractTDP(Component component) {
        if (component == null || component.getSpec() == null) return 0;

        String spec = component.getSpec();
        Pattern pattern = Pattern.compile("(\\d+)W");
        Matcher matcher = pattern.matcher(spec);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return 0;
    }

    /**
     * Select PSU based on wattage and budget tier
     */
    private Component selectPSU(List<Component> psus, int requiredWattage, int totalBudget) {
        if (psus == null || psus.isEmpty()) return null;

        String tier;
        if (totalBudget > 300000) {
            tier = "platinum|titanium";
        } else if (totalBudget > 150000) {
            tier = "gold";
        } else {
            tier = "bronze|standard";
        }

        Pattern tierPattern = Pattern.compile(tier, Pattern.CASE_INSENSITIVE);

        // Try to find PSU with correct wattage and tier
        for (Component psu : psus) {
            int wattage = extractWattage(psu);
            String tierText = ((psu != null && psu.getName() != null) ? psu.getName() : "") + " " +
                    ((psu != null && psu.getSpec() != null) ? psu.getSpec() : "");
            if (wattage >= requiredWattage && tierPattern.matcher(tierText).find()) {
                return psu;
            }
        }

        // Fallback: just find adequate wattage
        for (Component psu : psus) {
            int wattage = extractWattage(psu);
            if (wattage >= requiredWattage) {
                return psu;
            }
        }

        // Last resort: highest wattage available
        Component best = null;
        for (Component psu : psus) {
            if (best == null || extractWattage(psu) > extractWattage(best)) {
                best = psu;
            }
        }

        return best;
    }

    /**
     * Extract wattage from PSU name or spec
     */
    private int extractWattage(Component psu) {
        if (psu == null) return 0;

        String text = (psu.getName() + " " + psu.getSpec()).toLowerCase();
        Pattern pattern = Pattern.compile("(\\d+)w");
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return 0;
    }

    /**
     * Budget enforcement loop - matches main.html lines 1335-1370
     */
    private DesktopBuild enforceBudget(DesktopBuild build, int budget, ComponentDatabase db,
                                       String cpuPref, String gpuPref) {
        int total = build.getTotalPrice();
        int attempts = 0;

        Log.d(TAG, "Enforcing budget: ₹" + total + " / ₹" + budget);

        while (total > budget && attempts < 3) {
            Log.d(TAG, "Attempt " + (attempts + 1) + " to reduce budget");

            if (attempts == 0) {
                // Try cheaper GPU first
                if (build.getGpu() != null) {
                    Component cheaperGpu = selectGPU(db.getGpus(),
                        (int)(build.getGpu().getPrice() * 0.8), gpuPref);
                    if (cheaperGpu != null) {
                        build.setGpu(cheaperGpu);
                        Log.d(TAG, "Downgraded GPU to: " + cheaperGpu.getName());
                    }
                }
            } else if (attempts == 1) {
                // Try cheaper CPU
                if (build.getCpu() != null) {
                    Component cheaperCpu = selectCPU(db.getCpus(),
                        (int)(build.getCpu().getPrice() * 0.8), cpuPref);
                    if (cheaperCpu != null) {
                        build.setCpu(cheaperCpu);
                        Log.d(TAG, "Downgraded CPU to: " + cheaperCpu.getName());
                    }
                }
            } else {
                // Strip to basics
                if (db.getRam() != null && !db.getRam().isEmpty()) {
                    build.setRam(db.getRam().get(0));
                }
                if (db.getStorage() != null && !db.getStorage().isEmpty()) {
                    build.setStorage(db.getStorage().get(0));
                }
                if (db.getCases() != null && !db.getCases().isEmpty()) {
                    build.setCaseComponent(db.getCases().get(0));
                }
                Log.d(TAG, "Stripped to basic components");
            }

            total = build.getTotalPrice();
            attempts++;
        }

        if (total > budget) {
            Log.w(TAG, "Unable to meet budget after 3 attempts. Final: ₹" + total);
        }

        return build;
    }

    /**
     * Select best value component within budget
     */
    private Component selectBestValue(List<Component> components, double maxBudget, String keyword) {
        if (components == null || components.isEmpty()) return null;

        Component best = null;

        for (Component component : components) {
            if (component.getPrice() > maxBudget) continue;

            // Check keyword if provided
            if (keyword != null && !keyword.isEmpty()) {
                String name = component.getName().toLowerCase();
                if (!name.contains(keyword.toLowerCase())) {
                    continue;
                }
            }

            if (best == null || component.getPrice() > best.getPrice()) {
                best = component;
            }
        }

        return best;
    }
}

