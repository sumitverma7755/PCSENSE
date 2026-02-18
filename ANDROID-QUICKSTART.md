# 🚀 PCSensei Android - Quick Start Guide

## ⚡ Get Started in 5 Steps

### Step 1: Understand Your Current Setup (5 minutes)

You have a **Native Android app template** at:
```
D:\Project Work\PCSensei\app\
```

**Status**: ✅ Template working, ❌ PCSensei logic not implemented

**What's There**:
- MainActivity.java (navigation setup)
- 4 placeholder fragments (Transform, Reflow, Slideshow, Settings)
- Bottom navigation + drawer navigation
- Material Design UI components

**What's Missing**:
- API service to fetch components.json
- Recommendation algorithms
- PCSensei-specific UI screens
- Data models for components

---

### Step 2: Add Required Dependencies (2 minutes)

**Edit**: `app/build.gradle.kts`

Add Gson for JSON parsing:

```kotlin
dependencies {
    // ...existing dependencies...
    
    // Add these:
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
}
```

**Sync Gradle**: Click "Sync Now" in Android Studio

---

### Step 3: Add Internet Permission (1 minute)

**Edit**: `app/src/main/AndroidManifest.xml`

Add before `<application>` tag:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

Inside `<application>` tag, add:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

This allows HTTP connections to your local server (192.168.29.76:8000).

---

### Step 4: Create Your First Data Model (15 minutes)

**Create folder**: `app/src/main/java/com/example/androidofpcsense/models/`

**Create file**: `Component.java`

```java
package com.example.androidofpcsense.models;

import java.util.Map;

public class Component {
    private String id;
    private String name;
    private int price;
    private String brand;
    private String spec;
    private Map<String, String> shopLinks;
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }
    
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    
    public String getSpec() { return spec; }
    public void setSpec(String spec) { this.spec = spec; }
    
    public Map<String, String> getShopLinks() { return shopLinks; }
    public void setShopLinks(Map<String, String> shopLinks) { this.shopLinks = shopLinks; }
}
```

**Create file**: `Laptop.java`

```java
package com.example.androidofpcsense.models;

public class Laptop extends Component {
    private String type; // gaming, office, creative, basic
    private String screen;
    private int refresh;
    private String battery;
    private double weight;
    private int aiScore; // For recommendation scoring
    
    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getScreen() { return screen; }
    public void setScreen(String screen) { this.screen = screen; }
    
    public int getRefresh() { return refresh; }
    public void setRefresh(int refresh) { this.refresh = refresh; }
    
    public String getBattery() { return battery; }
    public void setBattery(String battery) { this.battery = battery; }
    
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    
    public int getAiScore() { return aiScore; }
    public void setAiScore(int aiScore) { this.aiScore = aiScore; }
}
```

**Create file**: `ComponentDatabase.java`

```java
package com.example.androidofpcsense.models;

import java.util.List;

public class ComponentDatabase {
    private List<Laptop> laptops;
    private List<Component> cpus;
    private List<Component> gpus;
    private List<Component> mobos;
    private List<Component> ram;
    private List<Component> storage;
    private List<Component> psu;
    private List<Component> cases;
    
    // Getters and Setters
    public List<Laptop> getLaptops() { return laptops; }
    public void setLaptops(List<Laptop> laptops) { this.laptops = laptops; }
    
    public List<Component> getCpus() { return cpus; }
    public void setCpus(List<Component> cpus) { this.cpus = cpus; }
    
    public List<Component> getGpus() { return gpus; }
    public void setGpus(List<Component> gpus) { this.gpus = gpus; }
    
    public List<Component> getMobos() { return mobos; }
    public void setMobos(List<Component> mobos) { this.mobos = mobos; }
    
    public List<Component> getRam() { return ram; }
    public void setRam(List<Component> ram) { this.ram = ram; }
    
    public List<Component> getStorage() { return storage; }
    public void setStorage(List<Component> storage) { this.storage = storage; }
    
    public List<Component> getPsu() { return psu; }
    public void setPsu(List<Component> psu) { this.psu = psu; }
    
    public List<Component> getCases() { return cases; }
    public void setCases(List<Component> cases) { this.cases = cases; }
}
```

---

### Step 5: Create API Service (30 minutes)

**Create folder**: `app/src/main/java/com/example/androidofpcsense/services/`

**Create file**: `ApiService.java`

```java
package com.example.androidofpcsense.services;

import android.os.Handler;
import android.os.Looper;

import com.example.androidofpcsense.models.ComponentDatabase;
import com.google.gson.Gson;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiService {
    
    private static final String API_BASE = "http://192.168.29.76:8000"; // Your local IP
    
    /**
     * Fetch components.json from local server
     * CRITICAL: Must run on background thread!
     */
    public void fetchComponents(ComponentCallback callback) {
        new Thread(() -> {
            try {
                // Make HTTP request
                URL url = new URL(API_BASE + "/data/components.json");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000); // 10 seconds
                conn.setReadTimeout(10000);
                
                // Check response code
                int responseCode = conn.getResponseCode();
                if (responseCode != 200) {
                    throw new Exception("Server returned: " + responseCode);
                }
                
                // Read response
                InputStream is = conn.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                StringBuilder json = new StringBuilder();
                String line;
                
                while ((line = reader.readLine()) != null) {
                    json.append(line);
                }
                
                reader.close();
                conn.disconnect();
                
                // Parse JSON using Gson
                Gson gson = new Gson();
                ComponentDatabase db = gson.fromJson(json.toString(), ComponentDatabase.class);
                
                // Return result on MAIN THREAD (required for UI updates)
                new Handler(Looper.getMainLooper()).post(() -> 
                    callback.onSuccess(db)
                );
                
            } catch (Exception e) {
                // Return error on main thread
                new Handler(Looper.getMainLooper()).post(() -> 
                    callback.onError(e)
                );
            }
        }).start();
    }
    
    /**
     * Callback interface for async API calls
     */
    public interface ComponentCallback {
        void onSuccess(ComponentDatabase db);
        void onError(Exception e);
    }
}
```

---

### Step 6: Test API Connection (10 minutes)

**Edit existing**: `app/src/main/java/com/example/androidofpcsense/ui/transform/TransformFragment.java`

Replace the `onCreateView` method:

```java
@Override
public View onCreateView(@NonNull LayoutInflater inflater,
                         ViewGroup container, Bundle savedInstanceState) {
    View root = inflater.inflate(R.layout.fragment_transform, container, false);
    
    TextView textView = root.findViewById(R.id.text_transform);
    textView.setText("Loading components...");
    
    // TEST: Fetch components
    ApiService apiService = new ApiService();
    apiService.fetchComponents(new ApiService.ComponentCallback() {
        @Override
        public void onSuccess(ComponentDatabase db) {
            // Success! Show count
            int totalComponents = db.getLaptops().size() + 
                                  db.getCpus().size() + 
                                  db.getGpus().size();
            
            textView.setText("✅ Loaded " + totalComponents + " components!\n" +
                           "Laptops: " + db.getLaptops().size() + "\n" +
                           "CPUs: " + db.getCpus().size() + "\n" +
                           "GPUs: " + db.getGpus().size());
        }
        
        @Override
        public void onError(Exception e) {
            // Error! Show message
            textView.setText("❌ Error: " + e.getMessage() + "\n\n" +
                           "Make sure:\n" +
                           "1. Python server is running (port 8000)\n" +
                           "2. Phone/emulator can reach " + API_BASE);
        }
    });
    
    return root;
}
```

**Run the app**:
1. Start your local web server: `python -m http.server 8000`
2. Make sure your phone/emulator can reach `http://192.168.29.76:8000`
3. Run the app in Android Studio
4. Click on the first bottom nav item

**Expected Result**: You should see component counts displayed!

---

## 🎯 What You've Achieved

✅ Android app template set up  
✅ Gradle dependencies configured  
✅ Internet permissions added  
✅ Data models created (Component, Laptop, ComponentDatabase)  
✅ API service implemented  
✅ Network connection tested  

---

## 📋 Next Steps (Choose Your Path)

### Path A: Build the UI Screens First (Easier)
1. Create HomeFragment with welcome screen
2. Create PCBuilderFragment with budget input
3. Create PreferencesFragment (CPU/GPU selection)
4. Create ResultsFragment (display recommendations)
5. Wire up navigation between screens

**Time**: 2-3 days  
**Benefit**: See visual progress quickly

### Path B: Implement Recommendation Engine First (Harder but Critical)
1. Create RecommendationEngine.java (laptop selection)
2. Create DesktopBuildEngine.java (PC build logic)
3. Port all algorithms from main.html lines 980-1350
4. Write unit tests for scoring logic
5. Then build UI to display results

**Time**: 3-4 days  
**Benefit**: Core logic complete, UI becomes simple display

---

## 🔍 Troubleshooting

### "NetworkOnMainThreadException"
**Problem**: Trying to make HTTP request on main thread  
**Solution**: Make sure API calls are inside `new Thread(() -> { ... }).start()`

### "Unable to resolve host"
**Problem**: Phone can't reach your PC's IP address  
**Solution**: 
- Check firewall on PC (allow port 8000)
- Make sure phone and PC on same WiFi
- Test in browser: `http://192.168.29.76:8000/data/components.json`

### "JsonSyntaxException"
**Problem**: Gson can't parse components.json  
**Solution**: 
- Verify JSON is valid (use jsonlint.com)
- Check if field names in Java match JSON keys
- Make sure data types match (int vs String)

### "NullPointerException in getLaptops()"
**Problem**: ComponentDatabase fields are null  
**Solution**: 
- Check if JSON has `laptops` array
- Verify Gson mapping is correct
- Add null checks: `if (db.getLaptops() != null)`

---

## 📚 Resources

### Essential Files to Reference
- **ANDROID-STRUCTURE-GUIDE.md** - Complete implementation guide
- **ANDROID-VS-WEB-COMPARISON.md** - Code translation examples
- **main.html (lines 980-1350)** - Recommendation algorithms to port
- **AI-IMPROVEMENTS.md** - Design philosophy for recommendations

### Android Documentation
- [Navigation Component](https://developer.android.com/guide/navigation)
- [RecyclerView](https://developer.android.com/guide/topics/ui/layout/recyclerview)
- [ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [Gson User Guide](https://github.com/google/gson/blob/master/UserGuide.md)

### Testing Your Local Server
```bash
# Start server
python -m http.server 8000

# Test from browser
http://192.168.29.76:8000/data/components.json

# Test from command line (Windows)
curl http://192.168.29.76:8000/data/components.json
```

---

## 🎮 Your Next Action

**Right now, do this**:

1. Open Android Studio
2. Create the `models` folder and add `Component.java`, `Laptop.java`, `ComponentDatabase.java`
3. Create the `services` folder and add `ApiService.java`
4. Modify `TransformFragment.java` to test API connection
5. Run the app and verify you see component counts

**Once that works**, you're ready to start building either:
- UI screens (Path A)
- Recommendation engine (Path B)

---

## 💡 Pro Tips

### Keep Web and Android Logic Identical
When porting algorithms, **don't change the logic**. Just translate the syntax:
- `const` → `final`
- `.includes()` → `.contains()`
- `===` → `.equals()`

### Use Logging for Debugging
```java
import android.util.Log;

// In your code
Log.d("PCSensei", "Budget: " + budget);
Log.d("PCSensei", "Selected CPU: " + cpu.getName());
```

View logs in Android Studio → Logcat tab

### Test on Real Device
Emulator can be slow. Use a physical Android phone connected via USB for faster testing.

### Start Simple, Add Complexity Later
Don't try to implement everything at once:
1. First: Just display list of laptops
2. Then: Add filtering by budget
3. Then: Add scoring algorithm
4. Then: Add sorting
5. Finally: Add all usage-based bonuses

---

Good luck! 🚀 You've got all the information you need. Now go build! 💪

