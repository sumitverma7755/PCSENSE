# 🚀 PCSensei Android - Setup Guide

Quick setup guide for the Android app.

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Prerequisites Check

**Required:**
- ✅ Android Studio (latest version)
- ✅ Internet connection (for first build)

**Optional:**
- Python 3.x (for local backend server)

---

### Step 2: Open Project

1. **Launch Android Studio**
2. Click **"Open"** or **File → Open**
3. Navigate to and select this folder: `PCSensei-Android`
4. Click **OK**

---

### Step 3: Wait for Gradle Sync

**First time opening:**
- Gradle sync starts automatically
- Downloads dependencies (~100MB)
- Takes 1-3 minutes depending on internet speed
- Progress shown in bottom status bar

**You'll see:**
```
Gradle sync in progress...
↓
BUILD SUCCESSFUL
```

---

### Step 4: Connect Device

**Option A: Physical Android Device**
1. Enable Developer Options:
   - Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options
   - Turn on "USB Debugging"
3. Connect via USB
4. Allow debugging when prompted

**Option B: Android Emulator**
1. Click **Device Manager** (phone icon on right)
2. Click **Create Device**
3. Select device (e.g., Pixel 5)
4. Select system image (API 30+)
5. Click **Finish**
6. Click **Play ▶️** to start emulator

---

### Step 5: Run the App

1. Make sure device is selected in dropdown (top toolbar)
2. Click **Run ▶️** button (or press Shift+F10)
3. Wait for build (30-60 seconds first time)
4. App installs and launches automatically!

---

## 🖥️ Backend Server Setup

The app needs the PCSensei backend to fetch component data.

### Start Server

**Option 1: From Parent Directory**
```bash
cd D:\Project Work\PCSensei
python -m http.server 8000
```

**Option 2: Using Batch File**
```bash
cd D:\Project Work\PCSensei
start-frontend.bat
```

**Verify Server:**
Open in browser: http://localhost:8000/data/components.json

You should see JSON data with laptops, CPUs, GPUs, etc.

---

## 📱 First Run

When app launches for the first time:

1. **Home Screen Appears**
   - Shows "PCSensei" logo
   - Status: "Loading components..."

2. **Server Connection**
   - Fetches from http://192.168.29.76:8000
   - Takes 2-5 seconds

3. **Ready State**
   - Status: "✅ Ready! 800+ components loaded"
   - Buttons become enabled

4. **Try Building a PC**
   - Click "Build Desktop PC"
   - Enter budget: `50000`
   - Select usage: `Gaming`
   - Click "Generate Recommendation"
   - See 7 component cards!

---

## 🔧 Configuration

### If Using Emulator

The emulator can't access `localhost` or `192.168.x.x` directly.

**Fix**: Update API endpoint in code

**File**: `app/src/main/java/com/example/androidofpcsense/services/ApiService.java`

**Change:**
```java
private static final String API_BASE = "http://192.168.29.76:8000";
```

**To:**
```java
private static final String API_BASE = "http://10.0.2.2:8000";
```

(`10.0.2.2` is the emulator's alias for the host machine's localhost)

---

### If Using Physical Device

Make sure:
1. Phone and PC are on **same WiFi network**
2. Windows Firewall allows Python on port 8000
3. Server is accessible from phone browser

**Test**: Open on phone browser:
```
http://192.168.29.76:8000/data/components.json
```

If it doesn't work, temporarily disable Windows Firewall for testing.

---

## 🐛 Common Issues

### Issue: Gradle Sync Failed

**Error**: "Could not download..."

**Solution**:
1. Check internet connection
2. File → Invalidate Caches → Restart
3. Try again

---

### Issue: "Unable to resolve host"

**Error in Logcat**: NetworkException

**Solutions**:
1. ✅ Verify Python server is running
2. ✅ Check firewall settings
3. ✅ For emulator: Use `10.0.2.2:8000`
4. ✅ For device: Test URL in browser first

---

### Issue: App crashes on launch

**Solution**:
1. Check Logcat for error stack trace
2. Look for red error lines
3. Common causes:
   - Network permission missing (already added)
   - Invalid JSON from server
   - Server not running

---

### Issue: Empty component list

**Symptoms**: No results after clicking "Generate"

**Solutions**:
1. Check Logcat filter by "PCSensei" or "ApiService"
2. Verify `components.json` exists and has data
3. Test API endpoint in browser
4. Check if server returned valid JSON

---

## 📊 Verify Everything Works

### Checklist

After setup, verify:

- [ ] Project opens in Android Studio
- [ ] Gradle sync completes successfully
- [ ] Device/emulator connected
- [ ] App runs without crash
- [ ] Home screen loads
- [ ] Python server running
- [ ] Status shows "Ready! X components loaded"
- [ ] Can click "Build Desktop PC" button
- [ ] Can enter budget and select usage
- [ ] Generate shows component cards
- [ ] Prices show ₹ symbol
- [ ] "Buy Now" button works

**If all ✅ → Setup complete!** 🎉

---

## 🎯 Next Steps

### Learn More
- Read: **ANDROID-QUICKSTART.md** - Detailed tutorial
- Read: **ANDROID-STRUCTURE-GUIDE.md** - Architecture
- Read: **README.md** - Features overview

### Customize
- Change usage types: `app/src/main/res/values/strings.xml`
- Modify budget allocation: `services/DesktopBuildEngine.java`
- Update API endpoint: `services/ApiService.java`

### Test Different Scenarios
- Budget ₹20k → APU build
- Budget ₹50k → Ryzen 5 + RTX 3050
- Budget ₹80k → Gaming PC
- Budget ₹200k → High-end build

---

## 📱 Building APK

### Debug APK (for testing)
```bash
.\gradlew.bat assembleDebug
```
Output: `app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)
1. Generate keystore (one-time):
   ```bash
   keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias pcsensei
   ```

2. Build release:
   ```bash
   .\gradlew.bat assembleRelease
   ```

3. Sign APK (or configure in `app/build.gradle.kts`)

---

## 🆘 Getting Help

### Documentation
- **ANDROID-SETUP-RUN.md** - Complete setup guide
- **ANDROID-BUILD-FIXES.md** - Common build errors
- **FINAL-STATUS.md** - Current status

### Logs
View in Android Studio:
- **View → Tool Windows → Logcat**
- Filter by: "PCSensei", "ApiService", "RecommendationEngine"

### Rebuild
If something goes wrong:
1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **File → Invalidate Caches → Restart**

---

## ✅ You're Ready!

Everything is set up. Just:
1. Open in Android Studio
2. Start Python server
3. Click Run ▶️

**Enjoy building PCs with AI!** 🚀

---

**Last Updated**: December 22, 2025

