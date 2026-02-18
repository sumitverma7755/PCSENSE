# PCSensei Android Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PCSENSEI ANDROID APP                             │
│                     Native Android (Java + XML)                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         📱 PRESENTATION LAYER (UI)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │
│  │ HomeFragment  │  │ PCBuilder     │  │ Preferences   │              │
│  │               │→ │ Fragment      │→ │ Fragment      │              │
│  │ - Welcome     │  │ - Budget      │  │ - CPU pref    │              │
│  │ - Features    │  │ - Usage       │  │ - GPU pref    │              │
│  └───────────────┘  └───────────────┘  └───────────────┘              │
│                                                ↓                         │
│                                         ┌───────────────┐               │
│                                         │ Results       │               │
│                                         │ Fragment      │               │
│                                         │ - Components  │               │
│                                         │ - Total price │               │
│                                         │ - Shop links  │               │
│                                         └───────────────┘               │
│                                                                          │
│  Navigation: Bottom Nav + Drawer Nav (Android Navigation Component)     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↑ ↓
                      (Bundle arguments, ViewModels)
                                    ↑ ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      🧠 BUSINESS LOGIC LAYER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  RecommendationEngine.java                                       │   │
│  │  ───────────────────────────────────────────────────────────     │   │
│  │  • selectLaptops(db, budget, usage) → List<Laptop>              │   │
│  │  • calculateLaptopScore(laptop, budget, usage) → int            │   │
│  │                                                                  │   │
│  │  MATCHES: main.html lines 980-1040                              │   │
│  │                                                                  │   │
│  │  Scoring Logic:                                                  │   │
│  │    - Usage bonuses (gaming: GPU+30, refresh+15)                 │   │
│  │    - Budget efficiency (85-100% = +25 points)                   │   │
│  │    - Sorting: score DESC → price DESC                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  DesktopBuildEngine.java                                         │   │
│  │  ───────────────────────────────────────────────────────────     │   │
│  │  • buildPC(db, budget, usage, cpuPref, gpuPref) → DesktopBuild  │   │
│  │  • calculateAllocation(budget, usage) → BudgetAllocation        │   │
│  │  • calculatePSUWattage(cpu, gpu) → int                          │   │
│  │  • enforceBudget(build, budget) → DesktopBuild                  │   │
│  │                                                                  │   │
│  │  MATCHES: main.html lines 1050-1350                             │   │
│  │                                                                  │   │
│  │  Budget Tiers:                                                   │   │
│  │    ≤₹20k  → APU build (no discrete GPU)                         │   │
│  │    ≤₹45k  → Budget APU (Ryzen 5000 series)                      │   │
│  │    >₹45k  → Standard (CPU + discrete GPU)                       │   │
│  │                                                                  │   │
│  │  Allocation (Gaming):                                            │   │
│  │    CPU: 20%, GPU: 45%, RAM: 10%, Storage: 10%                   │   │
│  │    Mobo: 8%, PSU: 5%, Case: 2%                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↑ ↓
                          (ComponentDatabase objects)
                                    ↑ ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       🌐 DATA ACCESS LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ApiService.java                                                 │   │
│  │  ───────────────────────────────────────────────────────────     │   │
│  │  • fetchComponents(callback)                                     │   │
│  │    → ComponentDatabase                                           │   │
│  │                                                                  │   │
│  │  Implementation:                                                 │   │
│  │    1. HTTP GET: http://192.168.29.76:8000/data/components.json  │   │
│  │    2. Background thread (NetworkOnMainThread crash prevention)   │   │
│  │    3. Gson.fromJson() → ComponentDatabase                        │   │
│  │    4. Callback on main thread (UI updates)                       │   │
│  │                                                                  │   │
│  │  interface ComponentCallback {                                   │   │
│  │    void onSuccess(ComponentDatabase db);                         │   │
│  │    void onError(Exception e);                                    │   │
│  │  }                                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↑ ↓
                               (HTTP/JSON)
                                    ↑ ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       📦 DATA MODELS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Component.java                   Laptop.java extends Component         │
│  ──────────────                   ────────────────────────────          │
│  • id: String                     • type: String (gaming/office)        │
│  • name: String                   • screen: String (15.6" FHD)          │
│  • price: int                     • refresh: int (144Hz)                │
│  • brand: String                  • battery: String (56Wh)              │
│  • spec: String                   • weight: double (1.8kg)              │
│  • shopLinks: Map                 • aiScore: int (for sorting)          │
│                                                                          │
│  CPU.java extends Component       GPU.java extends Component            │
│  ────────────────────────          ────────────────────────             │
│  • cores: int                     • vram: int                           │
│  • threads: int                   • tdp: int                            │
│  • socket: String (AM4, LGA1700)  • tier: String (budget/mid/high)      │
│  • tdp: int                                                             │
│                                                                          │
│  Motherboard.java extends Component   DesktopBuild.java                 │
│  ───────────────────────────────      ───────────────────               │
│  • socket: String (MUST match CPU!)   • cpu: CPU                        │
│  • chipset: String (B550, Z690)       • gpu: GPU                        │
│  • formFactor: String (ATX, mATX)     • motherboard: Motherboard        │
│                                       • ram: Component                  │
│                                       • storage: Component              │
│  ComponentDatabase.java               • psu: Component                  │
│  ──────────────────────               • caseComponent: Component        │
│  • laptops: List<Laptop>              • getTotalPrice(): int            │
│  • cpus: List<Component>                                                │
│  • gpus: List<Component>                                                │
│  • mobos: List<Component>         BudgetAllocation.java                 │
│  • ram: List<Component>           ───────────────────────               │
│  • storage: List<Component>       • cpuBudget: int                      │
│  • psu: List<Component>           • gpuBudget: int                      │
│  • cases: List<Component>         • ramBudget: int                      │
│                                   • storageBudget: int                  │
│                                   • moboBudget: int                     │
│                                   • psuBudget: int                      │
│                                   • caseBudget: int                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↑ ↓
                           (Parsed from JSON)
                                    ↑ ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    🖥️ BACKEND DATA SOURCE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Local Web Server (Python)                                              │
│  ─────────────────────────                                              │
│  • URL: http://192.168.29.76:8000                                       │
│  • File: data/components.json (15,096 lines)                            │
│  • Size: ~800 components across 8 categories                            │
│                                                                          │
│  JSON Structure:                                                         │
│  {                                                                       │
│    "laptops": [ {...}, {...}, ... ],     // ~200 laptops                │
│    "cpus": [ {...}, {...}, ... ],        // ~100 CPUs                   │
│    "gpus": [ {...}, {...}, ... ],        // ~150 GPUs                   │
│    "mobos": [ {...}, {...}, ... ],       // ~100 motherboards           │
│    "ram": [ {...}, {...}, ... ],         // ~80 RAM kits                │
│    "storage": [ {...}, {...}, ... ],     // ~120 SSDs/HDDs              │
│    "psu": [ {...}, {...}, ... ],         // ~60 PSUs                    │
│    "case": [ {...}, {...}, ... ]         // ~40 cases                   │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                          📱 USER FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════

   User Opens App
         │
         ↓
   ┌─────────────┐
   │ HomeFragment│  "Build Your Dream PC"
   │             │  [Start PC Builder] [Browse Laptops]
   └─────────────┘
         │
         ├─────────────────┬─────────────────┐
         ↓                 ↓                 ↓
   ┌──────────────┐  ┌────────────┐  ┌──────────────┐
   │ PCBuilder    │  │ Laptop     │  │ Price        │
   │ Fragment     │  │ Finder     │  │ Monitor      │
   │              │  │ Fragment   │  │ Fragment     │
   │ Input:       │  │            │  │              │
   │ • Build Type │  │ Input:     │  │ View:        │
   │   (Desktop/  │  │ • Budget   │  │ • Updates    │
   │    Laptop)   │  │ • Usage    │  │ • History    │
   │ • Budget     │  │            │  │ • Trends     │
   │ • Usage      │  └────────────┘  └──────────────┘
   └──────────────┘         │
         │                  ↓
         ↓            [API Call]
   ┌──────────────┐         │
   │ Preferences  │         ↓
   │ Fragment     │   ┌──────────────┐
   │              │   │ Results      │
   │ Desktop:     │   │ Fragment     │
   │ • CPU pref   │   │              │
   │   (Intel/AMD)│   │ Display:     │
   │ • GPU pref   │←──│ • Top 3      │
   │   (NVIDIA/   │   │   laptops    │
   │    AMD)      │   │ • Scores     │
   │              │   │ • Shop links │
   │ Laptop:      │   └──────────────┘
   │ (skip this)  │
   └──────────────┘
         │
         ↓
   [Generate Recommendation]
         │
         ↓
   ┌──────────────┐
   │ API Call:    │
   │ fetchComp... │
   └──────────────┘
         │
         ↓
   ┌──────────────┐
   │ Recommendation│
   │ Engine       │
   │              │
   │ Desktop:     │
   │ 1. Budget    │
   │    allocation│
   │ 2. Select    │
   │    components│
   │ 3. Socket    │
   │    check     │
   │ 4. PSU calc  │
   │ 5. Enforce   │
   │    budget    │
   │              │
   │ Laptop:      │
   │ 1. Filter by │
   │    budget    │
   │ 2. Score all │
   │ 3. Sort DESC │
   │ 4. Top 3     │
   └──────────────┘
         │
         ↓
   ┌──────────────┐
   │ Results      │
   │ Fragment     │
   │              │
   │ Desktop:     │
   │ ┌──────────┐ │
   │ │ CPU      │ │
   │ │ ₹18,000  │ │
   │ └──────────┘ │
   │ ┌──────────┐ │
   │ │ GPU      │ │
   │ │ ₹42,000  │ │
   │ └──────────┘ │
   │ ...          │
   │ Total: ₹90k  │
   │              │
   │ Laptop:      │
   │ ┌──────────┐ │
   │ │ #1 Score │ │
   │ │ 85/100   │ │
   │ │ ₹85,000  │ │
   │ │ [Buy]    │ │
   │ └──────────┘ │
   └──────────────┘
         │
         ↓
   [Buy Now] → Opens Shop Link in Browser


═══════════════════════════════════════════════════════════════════════════
                     🔄 DATA FLOW: Desktop Build Example
═══════════════════════════════════════════════════════════════════════════

User Input:
├─ Build Type: Desktop
├─ Budget: ₹90,000
├─ Usage: Gaming
├─ CPU Pref: AMD
└─ GPU Pref: NVIDIA

         │
         ↓
┌────────────────────────────────────────────────────────────────┐
│ ApiService.fetchComponents()                                   │
│ → HTTP GET: components.json                                    │
│ → Returns: ComponentDatabase with 800+ items                   │
└────────────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────────────┐
│ DesktopBuildEngine.buildPC()                                   │
│                                                                 │
│ Step 1: calculateAllocation(90000, "gaming")                   │
│ ─────────────────────────────────────────────                  │
│ CPU:     ₹18,000 (20%)                                         │
│ GPU:     ₹40,500 (45%)  ← Priority for gaming                  │
│ RAM:     ₹9,000  (10%)                                         │
│ Storage: ₹9,000  (10%)                                         │
│ Mobo:    ₹7,200  (8%)                                          │
│ PSU:     ₹4,500  (5%)                                          │
│ Case:    ₹1,800  (2%)                                          │
│                                                                 │
│ Step 2: selectCPU(cpus, ₹18,000, "AMD")                        │
│ ───────────────────────────────────────                        │
│ Filter:  brand.contains("AMD")                                 │
│ Filter:  price <= ₹18,000                                      │
│ Select:  Best value → Ryzen 5 5600X (₹16,500)                  │
│          socket: AM4                                            │
│                                                                 │
│ Step 3: selectGPU(gpus, ₹40,500, "NVIDIA")                     │
│ ────────────────────────────────────────                       │
│ Filter:  brand.contains("NVIDIA")                              │
│ Filter:  price <= ₹40,500                                      │
│ Select:  Best value → RTX 3060 Ti (₹38,000)                    │
│                                                                 │
│ Step 4: selectMotherboard(mobos, "AM4", ₹7,200)                │
│ ─────────────────────────────────────────────                  │
│ Filter:  socket == "AM4"  ← MUST MATCH CPU!                    │
│ Filter:  price <= ₹7,200                                       │
│ Select:  B550 motherboard (₹7,000)                             │
│                                                                 │
│ Step 5: selectRAM, selectStorage, selectCase                   │
│ ───────────────────────────────────────────────                │
│ RAM:     16GB DDR4 3200MHz (₹4,500)                            │
│ Storage: 512GB NVMe SSD (₹3,800)                               │
│ Case:    Mid Tower ATX (₹2,500)                                │
│                                                                 │
│ Step 6: calculatePSUWattage(cpu, gpu)                          │
│ ───────────────────────────────────────                        │
│ CPU TDP:  65W (extracted from spec)                            │
│ GPU TDP:  200W (extracted from spec)                           │
│ System:   +100W (overhead)                                     │
│ Headroom: ×1.2 (20% safety)                                    │
│ Required: (65 + 200 + 100) × 1.2 = 438W                        │
│ Select:   550W Bronze PSU (₹4,000)                             │
│                                                                 │
│ Step 7: enforceBudget(build, 90000)                            │
│ ────────────────────────────────────                           │
│ Total: ₹76,300                                                 │
│ Check: ₹76,300 <= ₹90,000 ✅ Under budget!                     │
│ Action: Keep all components                                    │
│                                                                 │
│ Final Build:                                                    │
│ ──────────                                                     │
│ CPU:      Ryzen 5 5600X       ₹16,500                          │
│ GPU:      RTX 3060 Ti         ₹38,000                          │
│ Mobo:     B550                ₹7,000                           │
│ RAM:      16GB DDR4           ₹4,500                           │
│ Storage:  512GB NVMe          ₹3,800                           │
│ PSU:      550W Bronze         ₹4,000                           │
│ Case:     Mid Tower ATX       ₹2,500                           │
│ ──────────────────────────────────────                         │
│ TOTAL:                        ₹76,300                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────────────┐
│ ResultsFragment displays:                                      │
│                                                                 │
│ RecyclerView with ComponentAdapter:                            │
│ ┌──────────────────────────────────────┐                       │
│ │ CPU: Ryzen 5 5600X        ₹16,500   │                       │
│ │ 6 cores, 12 threads, AM4  [Buy]     │                       │
│ └──────────────────────────────────────┘                       │
│ ┌──────────────────────────────────────┐                       │
│ │ GPU: RTX 3060 Ti          ₹38,000   │                       │
│ │ 8GB GDDR6, 200W TDP       [Buy]     │                       │
│ └──────────────────────────────────────┘                       │
│ ...                                                             │
│                                                                 │
│ Total: ₹76,300 (Budget: ₹90,000 ✅)                            │
│ Savings: ₹13,700                                               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                         🚦 CRITICAL CHECKPOINTS
═══════════════════════════════════════════════════════════════════════════

✅ MUST HAVE:
├─ Internet permission in AndroidManifest.xml
├─ usesCleartextTraffic="true" for HTTP
├─ Gson dependency in build.gradle
├─ Background thread for network calls
├─ Main thread callback for UI updates
├─ Socket compatibility check (CPU ↔ Motherboard)
├─ PSU wattage calculation (TDP + overhead + headroom)
├─ Budget enforcement loop (max 3 attempts, no infinite loop)
└─ Price formatting with ₹ symbol

❌ COMMON PITFALLS:
├─ NetworkOnMainThreadException → Use background thread!
├─ NullPointerException → Check if JSON fields exist
├─ Infinite loop in budget enforcement → Add attempt counter
├─ Wrong socket → Always verify mobo.socket == cpu.socket
├─ Insufficient PSU → Calculate TDP + 100W + 20% headroom
└─ Memory leak → Don't hold Activity reference in callbacks


═══════════════════════════════════════════════════════════════════════════
                              📁 FILE TREE
═══════════════════════════════════════════════════════════════════════════

app/src/main/
├── AndroidManifest.xml
├── java/com/example/androidofpcsense/
│   ├── MainActivity.java
│   ├── models/
│   │   ├── Component.java
│   │   ├── Laptop.java
│   │   ├── CPU.java
│   │   ├── GPU.java
│   │   ├── Motherboard.java
│   │   ├── ComponentDatabase.java
│   │   ├── DesktopBuild.java
│   │   └── BudgetAllocation.java
│   ├── services/
│   │   ├── ApiService.java
│   │   ├── RecommendationEngine.java
│   │   └── DesktopBuildEngine.java
│   ├── adapters/
│   │   └── ComponentAdapter.java
│   └── ui/
│       ├── home/
│       │   ├── HomeFragment.java
│       │   └── HomeViewModel.java
│       ├── pcbuilder/
│       │   ├── PCBuilderFragment.java
│       │   └── PCBuilderViewModel.java
│       ├── preferences/
│       │   ├── PreferencesFragment.java
│       │   └── PreferencesViewModel.java
│       └── results/
│           ├── ResultsFragment.java
│           └── ResultsViewModel.java
└── res/
    ├── layout/
    │   ├── activity_main.xml
    │   ├── fragment_home.xml
    │   ├── fragment_pc_builder.xml
    │   ├── fragment_preferences.xml
    │   ├── fragment_results.xml
    │   └── item_component.xml
    ├── navigation/
    │   └── mobile_navigation.xml
    ├── menu/
    │   └── bottom_navigation.xml
    └── values/
        ├── strings.xml
        ├── colors.xml
        └── dimens.xml

Total Files to Create: ~25-30 files
Estimated Lines of Code: ~3,000-4,000 LOC
```

