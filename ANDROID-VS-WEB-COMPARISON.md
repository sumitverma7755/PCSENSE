# PCSensei: Android vs Web Architecture Comparison

## 🔄 Code Translation Guide

This document shows how web code from `main.html` translates to Android Java code.

---

## 1. Laptop Recommendation Algorithm

### Web Version (main.html lines 980-1040)

```javascript
function selectLaptops(components, budget, usage) {
    let filtered = [];
    
    // Filter by budget with tolerance
    for (const laptop of components.laptops) {
        if (laptop.price <= budget) {
            filtered.push(laptop);
        } else if (laptop.price <= budget * 1.05) {
            filtered.push(laptop); // 5% overage
        } else if (budget > 100000 && laptop.price <= budget * 1.20) {
            filtered.push(laptop); // 20% overage for high-end
        }
    }
    
    // Score each laptop
    filtered.forEach(laptop => {
        laptop.aiScore = calculateLaptopScore(laptop, budget, usage);
    });
    
    // Sort by score DESC, then price DESC
    filtered.sort((a, b) => {
        const scoreDiff = b.aiScore - a.aiScore;
        if (Math.abs(scoreDiff) > 10) {
            return scoreDiff;
        }
        return b.price - a.price;
    });
    
    return filtered.slice(0, 3); // Top 3
}

function calculateLaptopScore(laptop, budget, usage) {
    let score = 0;
    
    // Usage-based scoring
    if (usage === 'gaming') {
        if (laptop.spec.includes('RTX 4060')) score += 30;
        if (laptop.refresh >= 144) score += 15;
    }
    
    // Budget efficiency bonus
    const utilization = laptop.price / budget;
    if (utilization >= 0.85 && utilization <= 1.0) {
        score += 25;
    } else if (utilization >= 0.70 && utilization < 0.85) {
        score += 15;
    }
    
    return score;
}
```

### Android Version (Java)

```java
public class RecommendationEngine {
    
    public List<Laptop> selectLaptops(ComponentDatabase db, int budget, String usage) {
        List<Laptop> filtered = new ArrayList<>();
        
        // Filter by budget with tolerance
        for (Laptop laptop : db.getLaptops()) {
            if (laptop.getPrice() <= budget) {
                filtered.add(laptop);
            } else if (laptop.getPrice() <= budget * 1.05) {
                filtered.add(laptop); // 5% overage
            } else if (budget > 100000 && laptop.getPrice() <= budget * 1.20) {
                filtered.add(laptop); // 20% overage for high-end
            }
        }
        
        // Score each laptop
        for (Laptop laptop : filtered) {
            int score = calculateLaptopScore(laptop, budget, usage);
            laptop.setAiScore(score);
        }
        
        // Sort by score DESC, then price DESC
        Collections.sort(filtered, (a, b) -> {
            int scoreDiff = b.getAiScore() - a.getAiScore();
            if (Math.abs(scoreDiff) > 10) {
                return scoreDiff;
            }
            return b.getPrice() - a.getPrice();
        });
        
        // Return top 3
        return filtered.subList(0, Math.min(3, filtered.size()));
    }
    
    private int calculateLaptopScore(Laptop laptop, int budget, String usage) {
        int score = 0;
        
        // Usage-based scoring
        if (usage.equals("gaming")) {
            if (laptop.getSpec().contains("RTX 4060")) score += 30;
            if (laptop.getRefresh() >= 144) score += 15;
        }
        
        // Budget efficiency bonus
        double utilization = (double) laptop.getPrice() / budget;
        if (utilization >= 0.85 && utilization <= 1.0) {
            score += 25;
        } else if (utilization >= 0.70 && utilization < 0.85) {
            score += 15;
        }
        
        return score;
    }
}
```

**Key Differences:**
- JavaScript `const` → Java `final` (or no modifier)
- `forEach()` → `for` loop
- `.includes()` → `.contains()`
- Type declarations required in Java
- Lambda expressions similar: `(a, b) -> { }`

---

## 2. Budget Allocation

### Web Version (main.html lines 1100-1150)

```javascript
function calculateBudgetAllocation(budget, usage) {
    const allocation = {};
    
    if (usage === 'gaming') {
        allocation.cpu = budget * 0.20;
        allocation.gpu = budget * 0.45;  // GPU priority
        allocation.ram = budget * 0.10;
        allocation.storage = budget * 0.10;
        allocation.mobo = budget * 0.08;
        allocation.psu = budget * 0.05;
        allocation.case = budget * 0.02;
    } else if (usage === 'productivity' || usage === 'coding') {
        allocation.cpu = budget * 0.30;  // CPU priority
        allocation.gpu = budget * 0.25;
        allocation.ram = budget * 0.15;
        allocation.storage = budget * 0.12;
        allocation.mobo = budget * 0.10;
        allocation.psu = budget * 0.06;
        allocation.case = budget * 0.02;
    }
    
    // High-end adjustment
    if (budget > 200000) {
        allocation.gpu = budget * 0.50;
        allocation.cpu = budget * 0.20;
    }
    
    return allocation;
}
```

### Android Version (Java)

```java
public class BudgetAllocation {
    public int cpuBudget;
    public int gpuBudget;
    public int ramBudget;
    public int storageBudget;
    public int moboBudget;
    public int psuBudget;
    public int caseBudget;
}

public class DesktopBuildEngine {
    
    private BudgetAllocation calculateAllocation(int budget, String usage) {
        BudgetAllocation alloc = new BudgetAllocation();
        
        if (usage.equals("gaming")) {
            alloc.cpuBudget = (int)(budget * 0.20);
            alloc.gpuBudget = (int)(budget * 0.45);  // GPU priority
            alloc.ramBudget = (int)(budget * 0.10);
            alloc.storageBudget = (int)(budget * 0.10);
            alloc.moboBudget = (int)(budget * 0.08);
            alloc.psuBudget = (int)(budget * 0.05);
            alloc.caseBudget = (int)(budget * 0.02);
        } else if (usage.equals("productivity") || usage.equals("coding")) {
            alloc.cpuBudget = (int)(budget * 0.30);  // CPU priority
            alloc.gpuBudget = (int)(budget * 0.25);
            alloc.ramBudget = (int)(budget * 0.15);
            alloc.storageBudget = (int)(budget * 0.12);
            alloc.moboBudget = (int)(budget * 0.10);
            alloc.psuBudget = (int)(budget * 0.06);
            alloc.caseBudget = (int)(budget * 0.02);
        }
        
        // High-end adjustment
        if (budget > 200000) {
            alloc.gpuBudget = (int)(budget * 0.50);
            alloc.cpuBudget = (int)(budget * 0.20);
        }
        
        return alloc;
    }
}
```

**Key Differences:**
- JavaScript object `{}` → Java class with fields
- `===` → `.equals()` for strings
- Explicit type casting: `(int)(budget * 0.20)`
- `||` works the same in both

---

## 3. PSU Wattage Calculation

### Web Version (main.html lines 1305-1325)

```javascript
function calculatePSUWattage(cpu, gpu) {
    // Extract TDP from spec strings
    const cpuTDP = extractTDP(cpu.spec) || 65;
    const gpuTDP = extractTDP(gpu.spec) || 150;
    
    // System overhead + 20% headroom
    const totalTDP = cpuTDP + gpuTDP + 100;
    const requiredWattage = Math.ceil(totalTDP * 1.2);
    
    return requiredWattage;
}

function extractTDP(spec) {
    const match = spec.match(/(\d+)W/);
    return match ? parseInt(match[1]) : null;
}

function selectPSU(psus, requiredWattage, budget) {
    let tier;
    if (budget > 300000) {
        tier = 'platinum|titanium';
    } else if (budget > 150000) {
        tier = 'gold';
    } else {
        tier = 'bronze|standard';
    }
    
    return psus.find(psu => 
        psu.wattage >= requiredWattage && 
        new RegExp(tier, 'i').test(psu.spec)
    );
}
```

### Android Version (Java)

```java
public class DesktopBuildEngine {
    
    private int calculatePSUWattage(CPU cpu, GPU gpu) {
        // Extract TDP from spec strings
        int cpuTDP = extractTDP(cpu) != 0 ? extractTDP(cpu) : 65;
        int gpuTDP = extractTDP(gpu) != 0 ? extractTDP(gpu) : 150;
        
        // System overhead + 20% headroom
        int totalTDP = cpuTDP + gpuTDP + 100;
        int requiredWattage = (int) Math.ceil(totalTDP * 1.2);
        
        return requiredWattage;
    }
    
    private int extractTDP(Component component) {
        String spec = component.getSpec();
        Pattern pattern = Pattern.compile("(\\d+)W");
        Matcher matcher = pattern.matcher(spec);
        
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }
        return 0;
    }
    
    private Component selectPSU(List<Component> psus, int requiredWattage, int budget) {
        String tier;
        if (budget > 300000) {
            tier = "platinum|titanium";
        } else if (budget > 150000) {
            tier = "gold";
        } else {
            tier = "bronze|standard";
        }
        
        Pattern tierPattern = Pattern.compile(tier, Pattern.CASE_INSENSITIVE);
        
        for (Component psu : psus) {
            if (psu.getWattage() >= requiredWattage && 
                tierPattern.matcher(psu.getSpec()).find()) {
                return psu;
            }
        }
        return null;
    }
}
```

**Key Differences:**
- JavaScript `match()` → Java `Pattern` + `Matcher`
- `parseInt()` → `Integer.parseInt()`
- `Math.ceil()` same in both
- `find()` → manual `for` loop with condition
- Regex flags: `/i` → `Pattern.CASE_INSENSITIVE`

---

## 4. Budget Enforcement Loop

### Web Version (main.html lines 1335-1370)

```javascript
function enforceBudget(build, budget, components) {
    let total = calculateTotal(build);
    let attempts = 0;
    
    while (total > budget && attempts < 3) {
        if (attempts === 0) {
            // Try cheaper GPU
            build.gpu = selectGPU(components.gpus, build.gpu.price * 0.8);
        } else if (attempts === 1) {
            // Try cheaper CPU (maintain socket!)
            build.cpu = selectCPU(components.cpus, build.cpu.price * 0.8);
            build.mobo = selectMotherboard(components.mobos, build.cpu.socket);
        } else {
            // Strip to basics
            build.ram = components.ram[0];
            build.storage = components.storage[0];
            build.case = components.cases[0];
        }
        
        total = calculateTotal(build);
        attempts++;
    }
    
    return build;
}

function calculateTotal(build) {
    return build.cpu.price + build.gpu.price + build.mobo.price +
           build.ram.price + build.storage.price + 
           build.psu.price + build.case.price;
}
```

### Android Version (Java)

```java
public class DesktopBuildEngine {
    
    private DesktopBuild enforceBudget(
        DesktopBuild build, 
        int budget, 
        ComponentDatabase db
    ) {
        int total = calculateTotal(build);
        int attempts = 0;
        
        while (total > budget && attempts < 3) {
            if (attempts == 0) {
                // Try cheaper GPU
                GPU gpu = selectGPU(
                    db.getGpus(), 
                    (int)(build.getGpu().getPrice() * 0.8), 
                    "any"
                );
                build.setGpu(gpu);
            } else if (attempts == 1) {
                // Try cheaper CPU (maintain socket!)
                CPU cpu = selectCPU(
                    db.getCpus(), 
                    (int)(build.getCpu().getPrice() * 0.8), 
                    "any"
                );
                build.setCpu(cpu);
                
                Motherboard mobo = selectMotherboard(
                    db.getMotherboards(), 
                    cpu.getSocket(), 
                    build.getMotherboard().getPrice()
                );
                build.setMotherboard(mobo);
            } else {
                // Strip to basics
                build.setRam(db.getRam().get(0));
                build.setStorage(db.getStorage().get(0));
                build.setCaseComponent(db.getCases().get(0));
            }
            
            total = calculateTotal(build);
            attempts++;
        }
        
        return build;
    }
    
    private int calculateTotal(DesktopBuild build) {
        return build.getCpu().getPrice() + 
               build.getGpu().getPrice() + 
               build.getMotherboard().getPrice() +
               build.getRam().getPrice() + 
               build.getStorage().getPrice() + 
               build.getPsu().getPrice() + 
               build.getCaseComponent().getPrice();
    }
}
```

**Key Differences:**
- `===` → `==` for integers
- Array access `[0]` → `.get(0)` for Lists
- Object property access: `.price` → `.getPrice()`
- Need explicit setters: `.setGpu(gpu)`

---

## 5. API Calls & Data Fetching

### Web Version (main.html)

```javascript
async function loadComponents() {
    try {
        const response = await fetch('/data/components.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading components:', error);
        return null;
    }
}

// Usage
const components = await loadComponents();
```

### Android Version (Java)

```java
public class ApiService {
    private static final String API_BASE = "http://192.168.29.76:8000";
    
    public void fetchComponents(ComponentCallback callback) {
        // Run on background thread
        new Thread(() -> {
            try {
                URL url = new URL(API_BASE + "/data/components.json");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                
                // Read response
                InputStream is = conn.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                StringBuilder json = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    json.append(line);
                }
                reader.close();
                
                // Parse JSON
                Gson gson = new Gson();
                ComponentDatabase db = gson.fromJson(json.toString(), ComponentDatabase.class);
                
                // Return on main thread
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
    
    public interface ComponentCallback {
        void onSuccess(ComponentDatabase db);
        void onError(Exception e);
    }
}

// Usage in Fragment
ApiService api = new ApiService();
api.fetchComponents(new ApiService.ComponentCallback() {
    @Override
    public void onSuccess(ComponentDatabase db) {
        // Use data here (on main thread)
        displayComponents(db);
    }
    
    @Override
    public void onError(Exception e) {
        Toast.makeText(context, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
    }
});
```

**Key Differences:**
- `async/await` → callback pattern
- Network on main thread crashes → must use background thread
- `fetch()` → `HttpURLConnection`
- `response.json()` → manual parsing with Gson
- Main thread updates: `Handler(Looper.getMainLooper()).post()`

---

## 6. UI Rendering

### Web Version (main.html)

```javascript
function displayResults(build) {
    const container = document.getElementById('results');
    container.innerHTML = `
        <div class="component-card">
            <h3>CPU</h3>
            <p>${build.cpu.name}</p>
            <p class="price">₹${build.cpu.price.toLocaleString('en-IN')}</p>
            <button onclick="showShopLinks('${build.cpu.id}')">Buy Now</button>
        </div>
        <div class="component-card">
            <h3>GPU</h3>
            <p>${build.gpu.name}</p>
            <p class="price">₹${build.gpu.price.toLocaleString('en-IN')}</p>
        </div>
        <div class="total">
            <h2>Total: ₹${calculateTotal(build).toLocaleString('en-IN')}</h2>
        </div>
    `;
}
```

### Android Version (Java)

**RecyclerView Adapter**:
```java
public class ComponentAdapter extends RecyclerView.Adapter<ComponentAdapter.ViewHolder> {
    
    private List<Component> components;
    private int totalPrice;
    
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_component, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        Component component = components.get(position);
        
        holder.categoryText.setText(component.getCategory());
        holder.nameText.setText(component.getName());
        holder.priceText.setText(formatINR(component.getPrice()));
        
        holder.buyButton.setOnClickListener(v -> 
            showShopLinks(component.getId())
        );
    }
    
    @Override
    public int getItemCount() {
        return components.size();
    }
    
    private String formatINR(int price) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        formatter.setCurrency(Currency.getInstance("INR"));
        return formatter.format(price);
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView categoryText, nameText, priceText;
        Button buyButton;
        
        ViewHolder(View view) {
            super(view);
            categoryText = view.findViewById(R.id.category_text);
            nameText = view.findViewById(R.id.name_text);
            priceText = view.findViewById(R.id.price_text);
            buyButton = view.findViewById(R.id.buy_button);
        }
    }
}
```

**Layout XML** (`res/layout/item_component.xml`):
```xml
<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp">
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">
        
        <TextView
            android:id="@+id/category_text"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textStyle="bold"
            android:textSize="14sp" />
        
        <TextView
            android:id="@+id/name_text"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:textSize="16sp" />
        
        <TextView
            android:id="@+id/price_text"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="18sp"
            android:textColor="@color/price_green" />
        
        <Button
            android:id="@+id/buy_button"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Buy Now" />
    </LinearLayout>
</com.google.android.material.card.MaterialCardView>
```

**Usage in Fragment**:
```java
public class ResultsFragment extends Fragment {
    
    private void displayResults(DesktopBuild build) {
        List<Component> components = new ArrayList<>();
        components.add(build.getCpu());
        components.add(build.getGpu());
        components.add(build.getMotherboard());
        // ... add all components
        
        ComponentAdapter adapter = new ComponentAdapter(
            components, 
            build.getTotalPrice()
        );
        
        RecyclerView recyclerView = view.findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
        
        // Show total
        TextView totalText = view.findViewById(R.id.total_text);
        totalText.setText("Total: " + formatINR(build.getTotalPrice()));
    }
}
```

**Key Differences:**
- `innerHTML` → RecyclerView + Adapter pattern
- Template literals → separate XML layouts
- Direct DOM manipulation → ViewHolder pattern
- `onclick` → `setOnClickListener()`
- `toLocaleString()` → `NumberFormat.getCurrencyInstance()`

---

## 7. Navigation Flow

### Web Version (main.html)

```javascript
// Show/hide screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Navigation
document.getElementById('start-btn').addEventListener('click', () => {
    showScreen('budget-screen');
});

document.getElementById('next-btn').addEventListener('click', () => {
    const budget = parseInt(document.getElementById('budget-input').value);
    const usage = document.getElementById('usage-select').value;
    
    // Store in global state
    window.buildConfig = { budget, usage };
    
    // Navigate to preferences
    showScreen('preferences-screen');
});
```

### Android Version (Java)

**Fragment 1: PCBuilderFragment**
```java
public class PCBuilderFragment extends Fragment {
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_pc_builder, container, false);
        
        EditText budgetInput = root.findViewById(R.id.budget_input);
        Spinner usageSpinner = root.findViewById(R.id.usage_spinner);
        Button nextButton = root.findViewById(R.id.next_button);
        
        nextButton.setOnClickListener(v -> {
            int budget = Integer.parseInt(budgetInput.getText().toString());
            String usage = usageSpinner.getSelectedItem().toString();
            
            // Create bundle for next screen
            Bundle bundle = new Bundle();
            bundle.putInt("budget", budget);
            bundle.putString("usage", usage);
            bundle.putString("buildType", "desktop");
            
            // Navigate using Navigation Component
            NavController navController = Navigation.findNavController(v);
            navController.navigate(
                R.id.action_pc_builder_to_preferences, 
                bundle
            );
        });
        
        return root;
    }
}
```

**Fragment 2: PreferencesFragment**
```java
public class PreferencesFragment extends Fragment {
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_preferences, container, false);
        
        // Retrieve arguments
        Bundle args = getArguments();
        int budget = args.getInt("budget");
        String usage = args.getString("usage");
        String buildType = args.getString("buildType");
        
        // Use data
        TextView summaryText = root.findViewById(R.id.summary_text);
        summaryText.setText("Budget: ₹" + budget + "\nUsage: " + usage);
        
        return root;
    }
}
```

**Navigation Graph** (`res/navigation/mobile_navigation.xml`):
```xml
<navigation>
    <fragment
        android:id="@+id/nav_pc_builder"
        android:name="...PCBuilderFragment">
        <action
            android:id="@+id/action_pc_builder_to_preferences"
            app:destination="@+id/nav_preferences" />
    </fragment>
    
    <fragment
        android:id="@+id/nav_preferences"
        android:name="...PreferencesFragment">
        <argument
            android:name="budget"
            app:argType="integer" />
        <argument
            android:name="usage"
            app:argType="string" />
    </fragment>
</navigation>
```

**Key Differences:**
- `showScreen()` → Navigation Component with `navController.navigate()`
- Global state → Bundle arguments
- Event listeners → `setOnClickListener()`
- `querySelector` → `findViewById()`
- Screen visibility → Fragment replacement

---

## 📊 Quick Reference Table

| Feature | Web (JavaScript) | Android (Java) |
|---------|-----------------|----------------|
| **Variables** | `const`, `let`, `var` | `final`, typed variables |
| **Functions** | `function name() {}` | `public void name() {}` |
| **Arrays** | `[]`, `.push()`, `.length` | `ArrayList`, `.add()`, `.size()` |
| **Objects** | `{}`, dot notation | Classes with getters/setters |
| **Strings** | `.includes()`, template literals | `.contains()`, `String.format()` |
| **Loops** | `for...of`, `.forEach()` | `for (Type item : list)` |
| **Conditionals** | `===`, `!==` | `.equals()` for strings, `==` for primitives |
| **Async** | `async/await`, Promises | Threads, callbacks, Handlers |
| **JSON** | `JSON.parse()`, `JSON.stringify()` | Gson library |
| **Sorting** | `.sort((a, b) => ...)` | `Collections.sort()`, Comparators |
| **Regex** | `/pattern/flags` | `Pattern.compile()`, `Matcher` |
| **UI Updates** | Direct DOM manipulation | RecyclerView, Adapters, XML layouts |
| **Navigation** | Show/hide divs | Navigation Component, Fragments |
| **Data Passing** | Global variables, sessionStorage | Bundles, Intent extras |

---

## 🎯 Critical Android-Specific Considerations

### 1. Thread Safety
**Web**: Single-threaded with event loop
**Android**: Must use background threads for network, update UI on main thread

```java
// WRONG - Crashes with NetworkOnMainThreadException
ComponentDatabase db = fetchComponentsSync();

// CORRECT - Background thread + callback
new Thread(() -> {
    ComponentDatabase db = fetchComponentsSync();
    runOnUiThread(() -> updateUI(db));
}).start();
```

### 2. Memory Management
**Web**: Garbage collection handled automatically
**Android**: Need to prevent memory leaks

```java
// Avoid leaking Activity context in callbacks
// Use WeakReference for long-lived objects
private WeakReference<Activity> activityRef;
```

### 3. Lifecycle Awareness
**Web**: Page load → unload
**Android**: Multiple lifecycle states (onCreate, onStart, onResume, onPause, onStop, onDestroy)

```java
@Override
public void onPause() {
    super.onPause();
    // Save state
}

@Override
public void onResume() {
    super.onResume();
    // Restore state
}
```

### 4. Configuration Changes
**Web**: Page refresh reloads everything
**Android**: Screen rotation destroys/recreates Activity

```java
// Use ViewModel to retain data across config changes
public class ResultsViewModel extends ViewModel {
    private MutableLiveData<DesktopBuild> build;
    
    public LiveData<DesktopBuild> getBuild() {
        if (build == null) {
            build = new MutableLiveData<>();
            loadBuild();
        }
        return build;
    }
}
```

---

## 🚀 Migration Checklist

When porting web code to Android:

- [ ] Replace `const`/`let` with typed variables
- [ ] Change `.includes()` to `.contains()`
- [ ] Convert template literals to `String.format()` or concatenation
- [ ] Replace `===` with `.equals()` for strings
- [ ] Move network calls to background threads
- [ ] Use Gson for JSON parsing
- [ ] Replace array methods with ArrayList/List methods
- [ ] Convert inline event handlers to click listeners
- [ ] Change DOM manipulation to RecyclerView updates
- [ ] Update navigation to use Navigation Component
- [ ] Add proper error handling (try/catch)
- [ ] Handle Android lifecycle events
- [ ] Use proper resources (strings.xml, colors.xml, dimens.xml)

---

## 📝 Example: Complete Feature Port

### Web: Laptop Card Click Handler

```javascript
function showLaptopDetails(laptop) {
    const modal = document.getElementById('details-modal');
    modal.innerHTML = `
        <h2>${laptop.name}</h2>
        <p>Price: ₹${laptop.price.toLocaleString('en-IN')}</p>
        <p>Screen: ${laptop.screen}</p>
        <p>Refresh: ${laptop.refresh}Hz</p>
        <div class="shop-links">
            ${Object.entries(laptop.shopLinks).map(([store, url]) => `
                <a href="${url}" target="_blank">${store}</a>
            `).join('')}
        </div>
    `;
    modal.classList.remove('hidden');
}
```

### Android: Dialog with Shop Links

```java
public class LaptopDetailsDialog extends DialogFragment {
    
    private Laptop laptop;
    
    public static LaptopDetailsDialog newInstance(Laptop laptop) {
        LaptopDetailsDialog dialog = new LaptopDetailsDialog();
        Bundle args = new Bundle();
        args.putSerializable("laptop", laptop); // Make Laptop Serializable
        dialog.setArguments(args);
        return dialog;
    }
    
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.dialog_laptop_details, container, false);
        
        laptop = (Laptop) getArguments().getSerializable("laptop");
        
        TextView nameText = view.findViewById(R.id.laptop_name);
        TextView priceText = view.findViewById(R.id.laptop_price);
        TextView screenText = view.findViewById(R.id.laptop_screen);
        TextView refreshText = view.findViewById(R.id.laptop_refresh);
        LinearLayout linksContainer = view.findViewById(R.id.shop_links_container);
        
        nameText.setText(laptop.getName());
        priceText.setText(formatINR(laptop.getPrice()));
        screenText.setText("Screen: " + laptop.getScreen());
        refreshText.setText("Refresh: " + laptop.getRefresh() + "Hz");
        
        // Add shop link buttons
        for (Map.Entry<String, String> entry : laptop.getShopLinks().entrySet()) {
            Button button = new Button(getContext());
            button.setText(entry.getKey());
            button.setOnClickListener(v -> {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(entry.getValue()));
                startActivity(browserIntent);
            });
            linksContainer.addView(button);
        }
        
        return view;
    }
}

// Usage
LaptopDetailsDialog.newInstance(laptop).show(getSupportFragmentManager(), "details");
```

---

This comparison should help you translate the web logic into Android code effectively! 🎉

