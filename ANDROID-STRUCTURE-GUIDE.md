# PCSensei Android Project Structure Guide

## 📋 Current State Analysis

### What You Have Now

Your project currently has **TWO Android implementations**:

#### 1. **Native Android App** (Standard Android Studio Project)
Location: `D:\Project Work\PCSensei\app\`

**Purpose**: Traditional Android Navigation Drawer app template
**Status**: ✅ Partially implemented (template structure)
**Technology**: 
- Java + Android SDK
- View Binding
- Navigation Components
- Bottom Navigation + Drawer Navigation
- Material Design Components

**Current Structure**:
```
app/
├── build.gradle.kts              ✅ Configured
├── src/main/
│   ├── AndroidManifest.xml       ✅ Basic setup
│   ├── java/com/example/androidofpcsense/
│   │   ├── MainActivity.java     ✅ Working (Navigation setup)
│   │   └── ui/
│   │       ├── transform/        ⚠️ Template fragment (needs replacement)
│   │       ├── reflow/           ⚠️ Template fragment (needs replacement)
│   │       ├── slideshow/        ⚠️ Template fragment (needs replacement)
│   │       └── settings/         ⚠️ Template fragment (needs replacement)
│   └── res/
│       ├── layout/
│       │   ├── activity_main.xml           ✅ Main container
│       │   ├── app_bar_main.xml            ✅ Toolbar + FAB
│       │   ├── content_main.xml            ✅ Nav host + bottom nav
│       │   ├── nav_header_main.xml         ✅ Drawer header
│       │   ├── fragment_transform.xml      ⚠️ Placeholder
│       │   ├── fragment_reflow.xml         ⚠️ Placeholder
│       │   ├── fragment_slideshow.xml      ⚠️ Placeholder
│       │   └── fragment_settings.xml       ⚠️ Placeholder
│       ├── navigation/
│       │   └── mobile_navigation.xml       ✅ Nav graph (needs updates)
│       └── menu/
│           ├── activity_main_drawer.xml    ✅ Drawer menu
│           └── bottom_navigation.xml       ✅ Bottom nav menu
```

**What's Missing**:
- ❌ PCSensei-specific functionality (currently generic template)
- ❌ API service layer to fetch from `components.json`
- ❌ Recommendation algorithms from main.html
- ❌ Network permissions in AndroidManifest
- ❌ RecyclerView adapters for component lists
- ❌ Data models (Component, Laptop, CPU, GPU, etc.)
- ❌ Budget calculation logic
- ❌ Socket compatibility checking
- ❌ Price formatting utilities

#### 2. **React Native Android** (Alternative Implementation)
Location: `D:\Project Work\PCSensei\android\android\`

**Purpose**: Cross-platform React Native implementation
**Status**: ⚠️ Exists but not integrated with main project
**Files**:
```
android/android/
├── app/src/main/java/com/pcsensei/
│   ├── MainActivity.java         ✅ React Native bridge
│   └── MainApplication.java      ✅ React Native setup
├── build.gradle                  ✅ React Native config
└── settings.gradle               ✅ React Native modules
```

---

## 🎯 Which Approach Should You Use?

### Option A: Pure Native Android (Recommended for You)
**Best if**: You want full Android performance, no JavaScript overhead

**Pros**:
- ✅ Faster performance
- ✅ Better IDE support (Android Studio)
- ✅ Existing template already set up
- ✅ No additional React Native complexity
- ✅ Direct integration with Android ecosystem

**Cons**:
- ❌ Need to rewrite all logic from main.html to Java
- ❌ Separate codebase from web version
- ❌ More code to maintain

**What to Build**: 
Continue developing in `app/` folder - convert web logic to Java

---

### Option B: React Native (Cross-Platform)
**Best if**: You want to share code with a future iOS app

**Pros**:
- ✅ Single JavaScript codebase
- ✅ Can reuse web logic (main.html algorithms)
- ✅ Easier to port web features
- ✅ Cross-platform (Android + iOS)

**Cons**:
- ❌ Larger app size (~20-30MB base)
- ❌ Performance overhead
- ❌ Need to learn React Native
- ❌ More complex build setup

**What to Build**: 
Create React Native screens + reuse backend logic

---

## 🏗️ Recommended Path: Pure Native Android

Since you already have the native Android structure set up and the web version working, here's what to build:

### Phase 1: Core Data Layer (Week 1)

#### 1.1 Create Data Models
**File**: `app/src/main/java/com/example/androidofpcsense/models/`

```java
// Component.java
public class Component {
    private String id;
    private String name;
    private int price;
    private String brand;
    private String spec;
    private Map<String, String> shopLinks;
    // Getters/Setters
}

// Laptop.java
public class Laptop extends Component {
    private String type; // gaming, office, creative
    private String screen;
    private int refresh;
    private String battery;
    private double weight;
}

// CPU.java
public class CPU extends Component {
    private int cores;
    private int threads;
    private String socket;
    private int tdp;
}

// GPU.java
public class GPU extends Component {
    private int vram;
    private int tdp;
    private String tier; // budget, mid, high, ultra
}

// Motherboard.java
public class Motherboard extends Component {
    private String socket;
    private String chipset;
    private String formFactor;
}

// ComponentDatabase.java
public class ComponentDatabase {
    private List<Laptop> laptops;
    private List<CPU> cpus;
    private List<GPU> gpus;
    private List<Motherboard> motherboards;
    private List<Component> ram;
    private List<Component> storage;
    private List<Component> psu;
    private List<Component> cases;
}
```

#### 1.2 Create API Service
**File**: `app/src/main/java/com/example/androidofpcsense/services/ApiService.java`

```java
public class ApiService {
    private static final String API_BASE = "http://192.168.29.76:8000";
    
    // Fetch components.json
    public void fetchComponents(ComponentCallback callback) {
        new Thread(() -> {
            try {
                URL url = new URL(API_BASE + "/data/components.json");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                
                InputStream is = conn.getInputStream();
                String json = readStream(is);
                
                Gson gson = new Gson();
                ComponentDatabase db = gson.fromJson(json, ComponentDatabase.class);
                
                new Handler(Looper.getMainLooper()).post(() -> 
                    callback.onSuccess(db)
                );
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> 
                    callback.onError(e)
                );
            }
        }).start();
    }
    
    interface ComponentCallback {
        void onSuccess(ComponentDatabase db);
        void onError(Exception e);
    }
}
```

**Add to AndroidManifest.xml**:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<application android:usesCleartextTraffic="true">
```

**Add Gson dependency to `app/build.gradle.kts`**:
```kotlin
dependencies {
    implementation("com.google.code.gson:gson:2.10.1")
}
```

---

### Phase 2: Recommendation Engine (Week 2)

#### 2.1 Laptop Recommendation Algorithm
**File**: `app/src/main/java/com/example/androidofpcsense/services/RecommendationEngine.java`

**Critical**: This must match `main.html` lines 980-1040 exactly!

```java
public class RecommendationEngine {
    
    // Main laptop selection - matches main.html lines 980-1040
    public List<Laptop> selectLaptops(
        ComponentDatabase db, 
        int budget, 
        String usage
    ) {
        List<Laptop> filtered = new ArrayList<>();
        
        // Step 1: Filter by budget with tolerance
        for (Laptop laptop : db.getLaptops()) {
            // Try exact budget first
            if (laptop.getPrice() <= budget) {
                filtered.add(laptop);
                continue;
            }
            // Allow 5% overage
            if (laptop.getPrice() <= budget * 1.05) {
                filtered.add(laptop);
                continue;
            }
            // Last resort: 20% overage for high-end
            if (budget > 100000 && laptop.getPrice() <= budget * 1.20) {
                filtered.add(laptop);
            }
        }
        
        // Step 2: Score each laptop
        for (Laptop laptop : filtered) {
            int score = calculateLaptopScore(laptop, budget, usage);
            laptop.setAiScore(score); // Add this field to Laptop model
        }
        
        // Step 3: Sort by score DESC, then price DESC
        Collections.sort(filtered, (a, b) -> {
            int scoreDiff = b.getAiScore() - a.getAiScore();
            if (Math.abs(scoreDiff) > 10) {
                return scoreDiff; // Significant score difference
            }
            return b.getPrice() - a.getPrice(); // Tiebreaker: higher price
        });
        
        // Return top 3
        return filtered.subList(0, Math.min(3, filtered.size()));
    }
    
    // Scoring logic - matches main.html exactly
    private int calculateLaptopScore(Laptop laptop, int budget, String usage) {
        int score = 0;
        
        // Usage-based scoring
        switch (usage.toLowerCase()) {
            case "gaming":
                // GPU tier bonus
                if (laptop.getSpec().contains("RTX 4060")) score += 30;
                else if (laptop.getSpec().contains("RTX 4050")) score += 25;
                else if (laptop.getSpec().contains("GTX 1650")) score += 15;
                
                // High refresh rate
                if (laptop.getRefresh() >= 144) score += 15;
                else if (laptop.getRefresh() >= 120) score += 10;
                break;
                
            case "productivity":
                // RAM bonus
                if (laptop.getSpec().contains("32GB")) score += 30;
                else if (laptop.getSpec().contains("16GB")) score += 20;
                
                // Battery life
                if (laptop.getBattery().contains("80Wh")) score += 25;
                break;
                
            case "coding":
                // RAM + Storage
                if (laptop.getSpec().contains("16GB")) score += 25;
                if (laptop.getSpec().contains("512GB SSD")) score += 15;
                break;
                
            case "content":
                // Display quality
                if (laptop.getScreen().contains("OLED")) score += 20;
                if (laptop.getScreen().contains("4K")) score += 15;
                break;
        }
        
        // Budget efficiency bonus (critical!)
        double utilization = (double) laptop.getPrice() / budget;
        if (utilization >= 0.85 && utilization <= 1.0) {
            score += 25; // Perfect budget use
        } else if (utilization >= 0.70 && utilization < 0.85) {
            score += 15; // Good budget use
        } else if (utilization >= 0.50 && utilization < 0.70) {
            score += 5; // Moderate budget use
        }
        
        return score;
    }
}
```

#### 2.2 Desktop PC Build Algorithm
**Critical**: Must match `main.html` lines 1050-1350!

```java
public class DesktopBuildEngine {
    
    public DesktopBuild buildPC(
        ComponentDatabase db,
        int budget,
        String usage,
        String cpuPref,  // "intel", "amd", "any"
        String gpuPref   // "nvidia", "amd", "any"
    ) {
        // Step 1: Budget tier detection
        if (budget <= 20000) {
            return buildAPUSystem(db, budget);
        } else if (budget <= 45000) {
            return buildBudgetSystem(db, budget, usage);
        } else {
            return buildStandardSystem(db, budget, usage, cpuPref, gpuPref);
        }
    }
    
    private DesktopBuild buildStandardSystem(
        ComponentDatabase db, int budget, String usage,
        String cpuPref, String gpuPref
    ) {
        // Budget allocation (matches main.html lines 1100-1150)
        BudgetAllocation allocation = calculateAllocation(budget, usage);
        
        // Component selection with preferences
        CPU cpu = selectCPU(
            db.getCpus(), 
            allocation.cpuBudget, 
            cpuPref
        );
        
        GPU gpu = selectGPU(
            db.getGpus(), 
            allocation.gpuBudget, 
            gpuPref
        );
        
        // Socket compatibility check (CRITICAL!)
        Motherboard mobo = selectMotherboard(
            db.getMotherboards(),
            cpu.getSocket(), // Must match!
            allocation.moboBudget
        );
        
        Component ram = selectRAM(db.getRam(), allocation.ramBudget);
        Component storage = selectStorage(db.getStorage(), allocation.storageBudget);
        
        // PSU wattage calculation (matches main.html lines 1305-1325)
        int totalTDP = extractTDP(cpu) + extractTDP(gpu) + 100; // system overhead
        int requiredWattage = (int)(totalTDP * 1.2); // 20% headroom
        Component psu = selectPSU(db.getPsu(), requiredWattage, budget);
        
        Component caseComponent = selectCase(db.getCases(), allocation.caseBudget);
        
        // Budget enforcement loop (matches main.html lines 1335-1370)
        DesktopBuild build = new DesktopBuild(cpu, gpu, mobo, ram, storage, psu, caseComponent);
        int total = build.getTotalPrice();
        
        int attempts = 0;
        while (total > budget && attempts < 3) {
            // Downgrade strategy: GPU → CPU → Basics
            if (attempts == 0) {
                // Try cheaper GPU
                gpu = selectGPU(db.getGpus(), gpu.getPrice() * 0.8, gpuPref);
            } else if (attempts == 1) {
                // Try cheaper CPU (maintain socket!)
                cpu = selectCPU(db.getCpus(), cpu.getPrice() * 0.8, cpuPref);
                mobo = selectMotherboard(db.getMotherboards(), cpu.getSocket(), allocation.moboBudget);
            } else {
                // Strip to basics
                ram = db.getRam().get(0); // Cheapest
                storage = db.getStorage().get(0);
                caseComponent = db.getCases().get(0);
            }
            
            build = new DesktopBuild(cpu, gpu, mobo, ram, storage, psu, caseComponent);
            total = build.getTotalPrice();
            attempts++;
        }
        
        return build;
    }
    
    // Budget allocation - matches main.html
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
                alloc.cpuBudget = (int)(budget * 0.30); // CPU priority
                alloc.gpuBudget = (int)(budget * 0.25);
                alloc.ramBudget = (int)(budget * 0.15);
                alloc.storageBudget = (int)(budget * 0.12);
                alloc.moboBudget = (int)(budget * 0.10);
                alloc.psuBudget = (int)(budget * 0.06);
                alloc.caseBudget = (int)(budget * 0.02);
                break;
                
            case "content":
                alloc.cpuBudget = (int)(budget * 0.25);
                alloc.gpuBudget = (int)(budget * 0.35);
                alloc.ramBudget = (int)(budget * 0.15);
                alloc.storageBudget = (int)(budget * 0.10);
                alloc.moboBudget = (int)(budget * 0.08);
                alloc.psuBudget = (int)(budget * 0.05);
                alloc.caseBudget = (int)(budget * 0.02);
                break;
        }
        
        // High-end adjustment
        if (budget > 200000) {
            alloc.gpuBudget = (int)(budget * 0.50); // GPU can be 50%
            alloc.cpuBudget = (int)(budget * 0.20);
        }
        
        return alloc;
    }
    
    private int extractTDP(Component component) {
        // Extract TDP from spec string
        String spec = component.getSpec();
        Pattern pattern = Pattern.compile("(\\d+)W");
        Matcher matcher = pattern.matcher(spec);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        
        // Defaults if not found
        if (component instanceof CPU) return 65;
        if (component instanceof GPU) return 150;
        return 0;
    }
}
```

---

### Phase 3: UI Screens (Week 3)

#### 3.1 Replace Template Fragments

**Navigation structure** (update `mobile_navigation.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/mobile_navigation"
    app:startDestination="@+id/nav_home">

    <fragment
        android:id="@+id/nav_home"
        android:name="com.example.androidofpcsense.ui.home.HomeFragment"
        android:label="Home"
        tools:layout="@layout/fragment_home">
        <action
            android:id="@+id/action_home_to_pc_builder"
            app:destination="@+id/nav_pc_builder" />
    </fragment>

    <fragment
        android:id="@+id/nav_pc_builder"
        android:name="com.example.androidofpcsense.ui.pcbuilder.PCBuilderFragment"
        android:label="PC Builder"
        tools:layout="@layout/fragment_pc_builder">
        <action
            android:id="@+id/action_pc_builder_to_preferences"
            app:destination="@+id/nav_preferences" />
    </fragment>

    <fragment
        android:id="@+id/nav_preferences"
        android:name="com.example.androidofpcsense.ui.preferences.PreferencesFragment"
        android:label="Preferences"
        tools:layout="@layout/fragment_preferences">
        <argument
            android:name="buildType"
            app:argType="string" />
        <argument
            android:name="usage"
            app:argType="string" />
        <argument
            android:name="budget"
            app:argType="integer" />
        <action
            android:id="@+id/action_preferences_to_results"
            app:destination="@+id/nav_results" />
    </fragment>

    <fragment
        android:id="@+id/nav_results"
        android:name="com.example.androidofpcsense.ui.results.ResultsFragment"
        android:label="Build Results"
        tools:layout="@layout/fragment_results" />

    <fragment
        android:id="@+id/nav_laptop_finder"
        android:name="com.example.androidofpcsense.ui.laptop.LaptopFinderFragment"
        android:label="Laptop Finder"
        tools:layout="@layout/fragment_laptop_finder" />

    <fragment
        android:id="@+id/nav_price_monitor"
        android:name="com.example.androidofpcsense.ui.price.PriceMonitorFragment"
        android:label="Price Monitor"
        tools:layout="@layout/fragment_price_monitor" />
</navigation>
```

#### 3.2 Update Bottom Navigation Menu
**File**: `res/menu/bottom_navigation.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/nav_home"
        android:icon="@drawable/ic_home"
        android:title="Home" />
    <item
        android:id="@+id/nav_pc_builder"
        android:icon="@drawable/ic_build"
        android:title="PC Builder" />
    <item
        android:id="@+id/nav_laptop_finder"
        android:icon="@drawable/ic_laptop"
        android:title="Laptops" />
    <item
        android:id="@+id/nav_price_monitor"
        android:icon="@drawable/ic_price"
        android:title="Prices" />
</menu>
```

#### 3.3 Create PreferencesFragment (Your Focus)
**File**: `app/src/main/java/com/example/androidofpcsense/ui/preferences/PreferencesFragment.java`

```java
public class PreferencesFragment extends Fragment {
    
    private PreferencesViewModel viewModel;
    private String buildType;
    private String usage;
    private int budget;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_preferences, container, false);
        
        // Get arguments from PCBuilderFragment
        if (getArguments() != null) {
            buildType = getArguments().getString("buildType");
            usage = getArguments().getString("usage");
            budget = getArguments().getInt("budget");
        }
        
        // Show/hide GPU/CPU preference based on build type
        View gpuPreferenceLayout = root.findViewById(R.id.gpu_preference_layout);
        View cpuPreferenceLayout = root.findViewById(R.id.cpu_preference_layout);
        
        if (buildType.equals("laptop")) {
            // Laptops: hide CPU/GPU brand selection
            gpuPreferenceLayout.setVisibility(View.GONE);
            cpuPreferenceLayout.setVisibility(View.GONE);
        } else {
            // Desktop: show brand preferences
            gpuPreferenceLayout.setVisibility(View.VISIBLE);
            cpuPreferenceLayout.setVisibility(View.VISIBLE);
        }
        
        // Summary display
        TextView summaryText = root.findViewById(R.id.summary_text);
        summaryText.setText(String.format(
            "Build Type: %s\nUsage: %s\nBudget: ₹%,d",
            buildType, usage, budget
        ));
        
        // CPU preference radio buttons
        RadioGroup cpuRadioGroup = root.findViewById(R.id.cpu_radio_group);
        RadioGroup gpuRadioGroup = root.findViewById(R.id.gpu_radio_group);
        
        // Generate button
        Button generateButton = root.findViewById(R.id.generate_button);
        generateButton.setOnClickListener(v -> {
            String cpuPref = getCPUPreference(cpuRadioGroup);
            String gpuPref = getGPUPreference(gpuRadioGroup);
            
            // Navigate to ResultsFragment
            Bundle bundle = new Bundle();
            bundle.putString("buildType", buildType);
            bundle.putString("usage", usage);
            bundle.putInt("budget", budget);
            bundle.putString("cpuPref", cpuPref);
            bundle.putString("gpuPref", gpuPref);
            
            NavController navController = Navigation.findNavController(v);
            navController.navigate(R.id.action_preferences_to_results, bundle);
        });
        
        return root;
    }
    
    private String getCPUPreference(RadioGroup group) {
        int selectedId = group.getCheckedRadioButtonId();
        if (selectedId == R.id.cpu_intel) return "intel";
        if (selectedId == R.id.cpu_amd) return "amd";
        return "any";
    }
    
    private String getGPUPreference(RadioGroup group) {
        int selectedId = group.getCheckedRadioButtonId();
        if (selectedId == R.id.gpu_nvidia) return "nvidia";
        if (selectedId == R.id.gpu_amd) return "amd";
        return "any";
    }
}
```

**Layout**: `res/layout/fragment_preferences.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <!-- Summary Card -->
        <com.google.android.material.card.MaterialCardView
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginBottom="16dp">
            
            <TextView
                android:id="@+id/summary_text"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:padding="16dp"
                android:textSize="16sp" />
        </com.google.android.material.card.MaterialCardView>

        <!-- CPU Preference (Desktop Only) -->
        <LinearLayout
            android:id="@+id/cpu_preference_layout"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:layout_marginBottom="16dp">
            
            <TextView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="CPU Brand Preference"
                android:textSize="18sp"
                android:textStyle="bold"
                android:layout_marginBottom="8dp" />
            
            <RadioGroup
                android:id="@+id/cpu_radio_group"
                android:layout_width="match_parent"
                android:layout_height="wrap_content">
                
                <RadioButton
                    android:id="@+id/cpu_any"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="Any (Best Value)"
                    android:checked="true" />
                
                <RadioButton
                    android:id="@+id/cpu_intel"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="Intel Only" />
                
                <RadioButton
                    android:id="@+id/cpu_amd"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="AMD Only" />
            </RadioGroup>
        </LinearLayout>

        <!-- GPU Preference (Desktop Only) -->
        <LinearLayout
            android:id="@+id/gpu_preference_layout"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:layout_marginBottom="24dp">
            
            <TextView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="GPU Brand Preference"
                android:textSize="18sp"
                android:textStyle="bold"
                android:layout_marginBottom="8dp" />
            
            <RadioGroup
                android:id="@+id/gpu_radio_group"
                android:layout_width="match_parent"
                android:layout_height="wrap_content">
                
                <RadioButton
                    android:id="@+id/gpu_any"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="Any (Best Value)"
                    android:checked="true" />
                
                <RadioButton
                    android:id="@+id/gpu_nvidia"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="NVIDIA Only" />
                
                <RadioButton
                    android:id="@+id/gpu_amd"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:text="AMD Only" />
            </RadioGroup>
        </LinearLayout>

        <!-- Generate Button -->
        <Button
            android:id="@+id/generate_button"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Generate Recommendation"
            android:textSize="16sp" />
    </LinearLayout>
</ScrollView>
```

---

### Phase 4: Results Screen (Week 4)

**File**: `app/src/main/java/com/example/androidofpcsense/ui/results/ResultsFragment.java`

```java
public class ResultsFragment extends Fragment {
    
    private RecyclerView componentRecyclerView;
    private ComponentAdapter adapter;
    private ResultsViewModel viewModel;
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_results, container, false);
        
        viewModel = new ViewModelProvider(this).get(ResultsViewModel.class);
        
        // Get build parameters
        Bundle args = getArguments();
        String buildType = args.getString("buildType");
        String usage = args.getString("usage");
        int budget = args.getInt("budget");
        String cpuPref = args.getString("cpuPref", "any");
        String gpuPref = args.getString("gpuPref", "any");
        
        // Setup RecyclerView
        componentRecyclerView = root.findViewById(R.id.component_recycler_view);
        componentRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        
        // Loading indicator
        ProgressBar loadingBar = root.findViewById(R.id.loading_bar);
        loadingBar.setVisibility(View.VISIBLE);
        
        // Fetch and generate build
        ApiService apiService = new ApiService();
        apiService.fetchComponents(new ApiService.ComponentCallback() {
            @Override
            public void onSuccess(ComponentDatabase db) {
                loadingBar.setVisibility(View.GONE);
                
                if (buildType.equals("laptop")) {
                    // Laptop recommendation
                    RecommendationEngine engine = new RecommendationEngine();
                    List<Laptop> laptops = engine.selectLaptops(db, budget, usage);
                    displayLaptops(laptops);
                } else {
                    // Desktop build
                    DesktopBuildEngine engine = new DesktopBuildEngine();
                    DesktopBuild build = engine.buildPC(db, budget, usage, cpuPref, gpuPref);
                    displayBuild(build);
                }
            }
            
            @Override
            public void onError(Exception e) {
                loadingBar.setVisibility(View.GONE);
                Toast.makeText(getContext(), "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
        
        return root;
    }
    
    private void displayBuild(DesktopBuild build) {
        List<Component> components = new ArrayList<>();
        components.add(build.getCpu());
        components.add(build.getGpu());
        components.add(build.getMotherboard());
        components.add(build.getRam());
        components.add(build.getStorage());
        components.add(build.getPsu());
        components.add(build.getCaseComponent());
        
        adapter = new ComponentAdapter(components, build.getTotalPrice());
        componentRecyclerView.setAdapter(adapter);
    }
    
    private void displayLaptops(List<Laptop> laptops) {
        adapter = new ComponentAdapter(new ArrayList<>(laptops), 0);
        componentRecyclerView.setAdapter(adapter);
    }
}
```

**RecyclerView Adapter**:
```java
public class ComponentAdapter extends RecyclerView.Adapter<ComponentAdapter.ViewHolder> {
    
    private List<Component> components;
    private int totalPrice;
    
    public ComponentAdapter(List<Component> components, int totalPrice) {
        this.components = components;
        this.totalPrice = totalPrice;
    }
    
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_component, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        Component component = components.get(position);
        holder.nameText.setText(component.getName());
        holder.priceText.setText(formatINR(component.getPrice()));
        holder.specText.setText(component.getSpec());
        
        // Shop links button
        holder.shopButton.setOnClickListener(v -> {
            showShopLinksDialog(component);
        });
    }
    
    private String formatINR(int price) {
        return String.format("₹%,d", price);
    }
    
    private void showShopLinksDialog(Component component) {
        // Show dialog with Amazon, Flipkart, etc. links
        Map<String, String> links = component.getShopLinks();
        // Implementation here
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView nameText, priceText, specText;
        Button shopButton;
        
        ViewHolder(View view) {
            super(view);
            nameText = view.findViewById(R.id.component_name);
            priceText = view.findViewById(R.id.component_price);
            specText = view.findViewById(R.id.component_spec);
            shopButton = view.findViewById(R.id.shop_button);
        }
    }
}
```

---

## 📊 Complete File Structure (After Implementation)

```
app/
├── build.gradle.kts
├── src/main/
│   ├── AndroidManifest.xml
│   ├── java/com/example/androidofpcsense/
│   │   ├── MainActivity.java
│   │   ├── models/
│   │   │   ├── Component.java
│   │   │   ├── Laptop.java
│   │   │   ├── CPU.java
│   │   │   ├── GPU.java
│   │   │   ├── Motherboard.java
│   │   │   ├── ComponentDatabase.java
│   │   │   ├── DesktopBuild.java
│   │   │   └── BudgetAllocation.java
│   │   ├── services/
│   │   │   ├── ApiService.java
│   │   │   ├── RecommendationEngine.java
│   │   │   └── DesktopBuildEngine.java
│   │   ├── adapters/
│   │   │   └── ComponentAdapter.java
│   │   └── ui/
│   │       ├── home/
│   │       │   ├── HomeFragment.java
│   │       │   └── HomeViewModel.java
│   │       ├── pcbuilder/
│   │       │   ├── PCBuilderFragment.java
│   │       │   └── PCBuilderViewModel.java
│   │       ├── preferences/
│   │       │   ├── PreferencesFragment.java
│   │       │   └── PreferencesViewModel.java
│   │       ├── results/
│   │       │   ├── ResultsFragment.java
│   │       │   └── ResultsViewModel.java
│   │       ├── laptop/
│   │       │   ├── LaptopFinderFragment.java
│   │       │   └── LaptopFinderViewModel.java
│   │       └── price/
│   │           ├── PriceMonitorFragment.java
│   │           └── PriceMonitorViewModel.java
│   └── res/
│       ├── layout/
│       │   ├── activity_main.xml
│       │   ├── fragment_home.xml
│       │   ├── fragment_pc_builder.xml
│       │   ├── fragment_preferences.xml
│       │   ├── fragment_results.xml
│       │   ├── fragment_laptop_finder.xml
│       │   ├── fragment_price_monitor.xml
│       │   └── item_component.xml
│       ├── navigation/
│       │   └── mobile_navigation.xml
│       └── menu/
│           ├── activity_main_drawer.xml
│           └── bottom_navigation.xml
```

---

## 🔧 Key Configuration Changes

### 1. Add Internet Permission
**File**: `AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application
    android:usesCleartextTraffic="true"
    ...>
```

### 2. Add Dependencies
**File**: `app/build.gradle.kts`

```kotlin
dependencies {
    // Existing dependencies
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.navigation.fragment)
    implementation(libs.navigation.ui)
    
    // New dependencies
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.cardview:cardview:1.0.0")
}
```

### 3. Update Package Name (Optional)
Change from `com.example.androidofpcsense` to `com.pcsensei.android` throughout

---

## 🚀 Testing Strategy

### 1. Unit Tests
```java
// Test recommendation scoring
@Test
public void testLaptopScoring_Gaming() {
    RecommendationEngine engine = new RecommendationEngine();
    Laptop laptop = createTestLaptop("RTX 4060", 144);
    
    int score = engine.calculateLaptopScore(laptop, 100000, "gaming");
    assertTrue(score >= 40); // Should get GPU + refresh bonuses
}
```

### 2. Integration Tests
- Test API connection to local server
- Test JSON parsing of components.json
- Test navigation between fragments

### 3. Manual Testing Checklist
- [ ] Can fetch components.json from local server
- [ ] Budget allocation matches web version
- [ ] Socket compatibility checks work
- [ ] PSU wattage calculation is correct
- [ ] Budget enforcement loop doesn't hang
- [ ] Shop links open correctly
- [ ] Price formatting shows ₹ symbol

---

## 📝 Next Steps

1. **Week 1**: Implement data models + API service
2. **Week 2**: Port recommendation algorithms
3. **Week 3**: Create all UI screens
4. **Week 4**: Testing + polish

**Start with**: Create `models/Component.java` and `services/ApiService.java` first!

---

## 🎯 Critical Reminders

1. **Match web logic exactly**: Lines 980-1040 (laptops) and 1050-1350 (desktops) from main.html
2. **Socket compatibility**: Always check CPU socket matches motherboard
3. **Budget enforcement**: Never exceed budget, use downgrade loop
4. **PSU wattage**: TDP + 100W system + 20% headroom
5. **Price format**: Always show ₹ symbol with comma separators
6. **API endpoint**: Use `http://192.168.29.76:8000` for local testing

Good luck! 🚀

