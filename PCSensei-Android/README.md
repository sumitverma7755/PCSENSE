# 🤖 PCSensei Android App

AI-Powered PC Building Assistant for Android

---

## 📱 About

This is the native Android version of PCSensei - an intelligent PC and laptop recommendation engine with real-time price monitoring.

**Features:**
- 🖥️ Desktop PC Builder with smart component selection
- 💻 Laptop Finder with AI-powered scoring
- 💰 Budget-based recommendations (₹15k to ₹5L+)
- 🎯 Usage-optimized builds (Gaming, Productivity, Coding, Content Creation)
- 🔗 Direct shop links to 6 Indian retailers
- ✨ Material Design UI with bottom navigation

---

## 🚀 Quick Start

### Prerequisites
- **Android Studio** (latest version recommended)
- **JDK 17** (included with Android Studio)
- **Python 3.x** (for backend server)

### Setup

1. **Open in Android Studio**
   ```
   File → Open → Select this folder (PCSensei-Android)
   ```

2. **Wait for Gradle Sync**
   - Takes 1-2 minutes on first open
   - Downloads dependencies automatically

3. **Start Backend Server** (in separate terminal)
   ```bash
   cd D:\Project Work\PCSensei
   python -m http.server 8000
   ```

4. **Run the App**
   - Click Run ▶️ button
   - Select device/emulator
   - App builds and launches!

---

## 📊 Architecture

### Technology Stack
- **Language**: Java
- **UI**: Material Design Components
- **Navigation**: Android Navigation Component
- **Data**: Gson for JSON parsing
- **Network**: HttpURLConnection
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36

### Project Structure
```
app/src/main/
├── java/com/example/androidofpcsense/
│   ├── models/          # Data models (Component, Laptop, CPU, GPU, etc.)
│   ├── services/        # Business logic (API, Recommendations, PC Builder)
│   ├── adapters/        # RecyclerView adapters
│   └── ui/              # Fragments and UI components
└── res/
    ├── layout/          # XML layouts
    ├── drawable/        # Icons and graphics
    ├── menu/            # Navigation menus
    └── values/          # Strings, colors, dimensions
```

---

## 🎯 Key Features

### 1. Desktop PC Builder
**Algorithm**: Matches `main.html` lines 1050-1350

- Budget tier detection (≤₹20k, ≤₹45k, >₹45k)
- Usage-based allocation:
  - **Gaming**: GPU 45%, CPU 20%
  - **Productivity**: CPU 30%, GPU 25%
  - **Content**: GPU 35%, CPU 25%
- Socket compatibility checking
- PSU wattage calculation: `(CPU_TDP + GPU_TDP + 100W) × 1.2`
- Budget enforcement with smart downgrading

### 2. Laptop Finder
**Algorithm**: Matches `main.html` lines 980-1040

- Multi-factor AI scoring:
  - **GPU tier**: +30 for RTX 4060
  - **Refresh rate**: +15 for 144Hz
  - **RAM**: +30 for 32GB
  - **Display**: +20 for OLED
- Budget efficiency bonus: +25 for 85-100% utilization
- Top 3 recommendations sorted by score

### 3. Component Display
- Material card design
- Category badges
- Price formatting (₹ with commas)
- Shop links integration
- Detailed specifications

---

## 🔧 Configuration

### API Endpoint
**File**: `app/src/main/java/.../services/ApiService.java`

```java
private static final String API_BASE = "http://192.168.29.76:8000";
```

**For Emulator**: Change to `http://10.0.2.2:8000`

### Usage Types
**File**: `app/src/main/res/values/strings.xml`

```xml
<string-array name="usage_types">
    <item>Gaming</item>
    <item>Productivity</item>
    <item>Coding</item>
    <item>Content Creation</item>
    <item>Office</item>
</string-array>
```

---

## 🧪 Testing

### Test Scenarios

**Budget Gaming Laptop (₹60,000)**
- Expected: GTX 1650/RTX 3050
- AI Score: ~50-70

**Mid-Range Desktop (₹80,000)**
- Expected: Ryzen 5 + RTX 3060
- GPU Budget: ~₹36,000 (45%)
- Total: ≤₹80,000

**High-End PC (₹200,000)**
- Expected: Ryzen 9 + RTX 4070/4080
- GPU Budget: ~₹90,000 (45-50%)
- Premium components

---

## 📝 Build Instructions

### Using Android Studio (Recommended)
1. Open project
2. Wait for sync
3. Click Run ▶️

### Using Command Line (Requires JDK 17)
```bash
# Build Debug APK
.\gradlew.bat assembleDebug

# Install on device
.\gradlew.bat installDebug

# Build and run
.\gradlew.bat installDebug
adb shell am start -n com.example.androidofpcsense/.MainActivity
```

**Output**: `app/build/outputs/apk/debug/app-debug.apk`

---

## 🐛 Troubleshooting

### "Unable to resolve host"
**Solution**:
1. Check Python server is running: `python -m http.server 8000`
2. Verify URL in browser: http://192.168.29.76:8000/data/components.json
3. Check Windows Firewall
4. For emulator, use `10.0.2.2:8000`

### "Java 17 required"
**Solution**: Open in Android Studio (includes JDK 17)

### Empty results
**Solution**:
1. Check Logcat for errors (filter by "PCSensei")
2. Verify server is accessible
3. Check JSON is valid

---

## 📚 Documentation

### Created Documentation
- **ANDROID-STRUCTURE-GUIDE.md** - Complete architecture
- **ANDROID-VS-WEB-COMPARISON.md** - Code translation
- **ANDROID-QUICKSTART.md** - Step-by-step tutorial
- **ANDROID-ARCHITECTURE-DIAGRAM.md** - Visual overview
- **ANDROID-BUILD-COMPLETE.md** - Implementation details
- **FINAL-STATUS.md** - Current status

---

## 🎯 What Works

✅ Component fetching from local server  
✅ Laptop AI recommendations  
✅ Desktop PC builds  
✅ Budget allocation by usage  
✅ Socket compatibility checking  
✅ PSU wattage calculation  
✅ Budget enforcement loop  
✅ Price formatting (₹)  
✅ Shop link integration  
✅ Material Design UI  
✅ Navigation system  

---

## 📊 Code Statistics

- **Total Files**: ~20 Java files + XML layouts
- **Lines of Code**: ~2,500 LOC
- **Models**: 8 classes
- **Services**: 3 classes
- **UI Components**: 2 fragments + 1 adapter
- **Layouts**: 4 XML files
- **Resources**: Strings, menus, drawables

---

## 🔗 Integration

### Backend Server
The app requires the PCSensei web backend:

```bash
# Start from parent directory
cd D:\Project Work\PCSensei
python -m http.server 8000
```

**Provides**: `data/components.json` with 800+ components

### Data Format
Fetches JSON with:
- Laptops (~200 items)
- CPUs (~100 items)
- GPUs (~150 items)
- Motherboards (~100 items)
- RAM, Storage, PSU, Cases

---

## 🎨 UI Screenshots

### Home Screen
- PCSensei branding
- Component loading status
- "Build Desktop PC" button
- "Find Laptop" button

### PC Builder
- Budget input field
- Usage dropdown
- Generate button
- 7-component result cards

### Laptop Finder
- Budget input
- Usage selection
- Top 3 laptops with AI scores
- Shop links

---

## 🚀 Future Enhancements

### Planned Features
- [ ] CPU/GPU brand preference UI
- [ ] Shop links dialog (all retailers)
- [ ] Offline caching
- [ ] Price history visualization
- [ ] Build comparison
- [ ] Save favorite builds
- [ ] Share functionality
- [ ] Dark mode

---

## 📄 License

MIT License - See parent project for details

---

## 👥 Contributing

This is part of the PCSensei project. See main repository for contribution guidelines.

---

## 🆘 Support

Check documentation files in this folder:
- Start with: **ANDROID-QUICKSTART.md**
- Troubleshooting: **ANDROID-SETUP-RUN.md**
- Architecture: **ANDROID-STRUCTURE-GUIDE.md**

---

## 🎉 Getting Started Now

**Ready to run?**

1. Open this folder in Android Studio
2. Wait for Gradle sync
3. Start Python server: `python -m http.server 8000`
4. Click Run ▶️

**That's it!** Your AI PC building assistant is ready! 🚀

---

**Built with ❤️ for PCSensei**  
*AI-Powered PC Building Made Easy*

