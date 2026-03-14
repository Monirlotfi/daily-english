# ================================================
#  AppV2 — Auto Setup + Build APK
#  Run: .\setup.ps1
# ================================================

Write-Host ""
Write-Host "======================================" -ForegroundColor Yellow
Write-Host "  Daily English V2 — Auto Setup" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# Step 1 — npm install
Write-Host "[1/5] Installing Capacitor..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install failed" -ForegroundColor Red; exit 1 }

# Step 2 — cap add android
Write-Host ""
Write-Host "[2/5] Adding Android platform..." -ForegroundColor Cyan
npx cap add android 2>$null
Write-Host "Android added." -ForegroundColor Green

# Step 3 — Copy icons to Android res
Write-Host ""
Write-Host "[3/5] Copying icons..." -ForegroundColor Cyan

$iconDirs = @(
    "android\app\src\main\res\mipmap-mdpi",
    "android\app\src\main\res\mipmap-hdpi",
    "android\app\src\main\res\mipmap-xhdpi",
    "android\app\src\main\res\mipmap-xxhdpi",
    "android\app\src\main\res\mipmap-xxxhdpi"
)
$iconSizes = @("48","72","96","144","192")

for ($i = 0; $i -lt $iconDirs.Length; $i++) {
    New-Item -ItemType Directory -Force -Path $iconDirs[$i] | Out-Null
    $src = "assets\icon-$($iconSizes[$i]).png"
    if (Test-Path $src) {
        Copy-Item -Force $src "$($iconDirs[$i])\ic_launcher.png"
        Copy-Item -Force $src "$($iconDirs[$i])\ic_launcher_round.png"
    }
}
Write-Host "Icons copied." -ForegroundColor Green

# Step 4 — cap sync
Write-Host ""
Write-Host "[4/5] Syncing web assets..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: cap sync failed" -ForegroundColor Red; exit 1 }

# Step 5 — Build APK
Write-Host ""
Write-Host "[5/5] Building APK..." -ForegroundColor Cyan
cd android
.\gradlew assembleDebug --no-daemon
cd ..

$apk = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    $size = [math]::Round((Get-Item $apk).Length / 1MB, 1)
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "  APK READY! ($size MB)" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK location:" -ForegroundColor Yellow
    Write-Host "  $((Get-Item $apk).FullName)" -ForegroundColor White
    Write-Host ""
    Write-Host "Install on phone:" -ForegroundColor Yellow
    Write-Host "  adb install $apk" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build failed. Check errors above." -ForegroundColor Red
    Write-Host "Try: GitHub Actions (free cloud build)" -ForegroundColor Yellow
}
