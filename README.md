# Daily English V2 — Capacitor APK (~5MB)

## Option A — GitHub Actions (FREE cloud build) ⭐⭐⭐

### 1. Create GitHub repo
- github.com → New repository → "daily-english"
- Public

### 2. Push project
```powershell
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/daily-english.git
git push -u origin main
```

### 3. GitHub builds APK automatically!
- Go to: github.com/YOUR_USERNAME/daily-english/actions
- Click the running workflow
- Wait ~5 minutes
- Download APK from "Artifacts" section ✅

---

## Option B — Local build (Android Studio required)

```powershell
.\setup.ps1
```

APK at: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## Install on phone

```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

Or share APK via WhatsApp/Drive.
