# Passwortgenerator - Start Script
# Check dependencies, run tests, detect browser, start dev server

$ErrorActionPreference = "Stop"

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Success($text) { Write-Host "[OK] $text" -ForegroundColor $Green }
function Write-Warning($text) { Write-Host "[!] $text" -ForegroundColor $Yellow }
function Write-Error($text) { Write-Host "[ERROR] $text" -ForegroundColor $Red }
function Read-Choice($question) {
    Write-Host "$question [j/n]: " -NoNewline -ForegroundColor $Cyan
    return Read-Host
}

# Browser Config Functions
$appDataDir = "$env:LOCALAPPDATA\Passwortgenerator"
$browserConfigFile = "$appDataDir\browser-config.json"

function Load-BrowserConfig() {
    if (Test-Path $browserConfigFile) {
        try {
            $config = Get-Content $browserConfigFile | ConvertFrom-Json
            if ($config.browserPath -and (Test-Path $config.browserPath)) {
                return $config
            }
        } catch {
            # Config defekt, ignorieren
        }
    }
    return $null
}

function Save-BrowserConfig($path, $name) {
    if (-not (Test-Path $appDataDir)) {
        New-Item -ItemType Directory -Path $appDataDir | Out-Null
    }
    $config = @{
        browserPath = $path
        browserName = $name
        savedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    }
    $config | ConvertTo-Json | Set-Content $browserConfigFile
}

$useSavedBrowser = $false
$savedConfig = Load-BrowserConfig

# Header
Clear-Host
Write-Host "
========================================
  PASSWORTGENERATOR STARTER
========================================
" -ForegroundColor $Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Step 1: Check Node.js
Write-Host "Schritt 1: Pruefe Node.js..." -ForegroundColor $Cyan
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Success "Node.js gefunden: $nodeVersion"
    } else { throw "Nicht gefunden" }
} catch {
    Write-Error "Node.js ist nicht installiert!"
    $c = Read-Choice "Soll ich Node.js installieren"
    if ($c -eq "j") {
        Start-Process "https://nodejs.org/"
        Read-Host "Bitte installiere Node.js neu starten - ENTER zum Beenden"
        exit
    } else {
        Read-Host "Node.js wird benoetigt - ENTER zum Beenden"
        exit
    }
}

# Step 2: Check npm
Write-Host "`nSchritt 2: Pruefe npm..." -ForegroundColor $Cyan
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Success "npm gefunden: v$npmVersion"
    } else { throw "Nicht gefunden" }
} catch {
    Write-Error "npm nicht installiert!"
    $c = Read-Choice "Soll ich npm installieren"
    if ($c -eq "j") {
        npm install -g npm
        Write-Success "npm installiert!"
    } else {
        Read-Host "npm wird benoetigt - ENTER zum Beenden"
        exit
    }
}

# Step 3: Check node_modules
Write-Host "`nSchritt 3: Pruefe node_modules..." -ForegroundColor $Cyan
if (Test-Path "node_modules") {
    Write-Success "node_modules gefunden"
} else {
    Write-Warning "node_modules fehlt!"
    $c = Read-Choice "'npm install' ausfuehren"
    if ($c -eq "j") {
        npm install
        Write-Success "Abhaengigkeiten installiert!"
    } else {
        Read-Host "node_modules wird benoetigt - ENTER zum Beenden"
        exit
    }
}

# Step 4: Tests
Write-Host "`nSchritt 4: Fuehre Tests aus..." -ForegroundColor $Cyan
$testsPassed = $false

try {
    $testOutput = npm test 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Alle Tests bestanden!"
        $testsPassed = $true
    } else {
        Write-Error "Tests fehlgeschlagen!"
        Write-Host $testOutput -ForegroundColor $Red
    }
} catch {
    Write-Error "Tests konnten nicht ausgefuehrt werden!"
    Write-Host $_.Exception.Message -ForegroundColor $Red
}

# Wenn Tests fehlgeschlagen sind, nachfragen
if (-not $testsPassed) {
    $c = Read-Choice "Trotzdem Server starten"
    if ($c -ne "j" -and $c -ne "J") {
        Write-Host "Start abgebrochen." -ForegroundColor $Yellow
        Read-Host "ENTER zum Beenden"
        exit
    }
    Write-Warning "Starte trotz fehlgeschlagener Tests..."
}

# Step 5: Browser Detection / Config Loading
Write-Host "`nSchritt 5: Browser-Erkennung..." -ForegroundColor $Cyan
$browser = $null

# Pruefe gespeicherte Konfiguration
if ($savedConfig) {
    Write-Success "Gespeicherte Browser-Konfiguration gefunden: $($savedConfig.browserName)"
    $c = Read-Choice "Gespeicherten Browser verwenden"
    if ($c -eq "j" -or $c -eq "J") {
        $browser = @{Name=$savedConfig.browserName; Path=$savedConfig.browserPath}
        $useSavedBrowser = $true
    }
}

# Wenn kein gespeicherter Browser verwendet wird -> Erkennung
if (-not $useSavedBrowser) {
    $browsers = @()

    # Chrome
    $chromePaths = @(
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            $browsers += @{Name="Google Chrome"; Path=$path}
            break
        }
    }

    # Edge
    $edgePaths = @(
        "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    )
    foreach ($path in $edgePaths) {
        if (Test-Path $path) {
            $browsers += @{Name="Microsoft Edge"; Path=$path}
            break
        }
    }

    # Firefox
    $firefoxPaths = @(
        "C:\Program Files\Mozilla Firefox\firefox.exe",
        "C:\Program Files (x86)\Mozilla Firefox\firefox.exe"
    )
    foreach ($path in $firefoxPaths) {
        if (Test-Path $path) {
            $browsers += @{Name="Firefox"; Path=$path}
            break
        }
    }

    # Brave
    $bravePaths = @(
        "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
    )
    foreach ($path in $bravePaths) {
        if (Test-Path $path) {
            $browsers += @{Name="Brave Browser"; Path=$path}
            break
        }
    }

    # Opera
    $operaPaths = @(
        "C:\Program Files\Opera\launcher.exe",
        "$env:LOCALAPPDATA\Programs\Opera\launcher.exe"
    )
    foreach ($path in $operaPaths) {
        if (Test-Path $path) {
            $browsers += @{Name="Opera"; Path=$path}
            break
        }
    }

    if ($browsers.Count -eq 0) {
        Write-Warning "Kein Browser erkannt, verwende System-Standard"
        $browser = @{Name="System-Standard"; Path="default"}
    } elseif ($browsers.Count -eq 1) {
        $browser = $browsers[0]
        Write-Success "Browser gefunden: $($browser.Name)"
    } else {
        Write-Host "Mehrere Browser gefunden:" -ForegroundColor $Yellow
        for ($i=0; $i -lt $browsers.Count; $i++) {
            Write-Host "  [$($i+1)] $($browsers[$i].Name)" -ForegroundColor $Cyan
        }
        $choice = Read-Host "Waehle (1-$($browsers.Count))"
        try {
            $browser = $browsers[[int]$choice - 1]
        } catch {
            $browser = @{Name="System-Standard"; Path="default"}
        }
    }
    
    # Frage ob gespeichert werden soll
    if ($browser.Path -ne "default") {
        $c = Read-Choice "Diese Auswahl fuer zukuenftige Starts speichern"
        if ($c -eq "j" -or $c -eq "J") {
            Save-BrowserConfig $browser.Path $browser.Name
            Write-Success "Browser-Auswahl gespeichert!"
        }
    }
}

# Step 6: Start Server
Write-Host "`nSchritt 6: Starte Dev-Server..." -ForegroundColor $Cyan
$env:BROWSER = "none"
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "Set-Location '$projectRoot'; npm run dev"

# Wait for server
Write-Host "Warte auf Server-Start..." -ForegroundColor $Yellow
$maxRetries = 15
$retry = 0
$serverReady = $false

while ($retry -lt $maxRetries -and -not $serverReady) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method HEAD -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
        }
    } catch {
        $retry++
        Write-Host "." -NoNewline -ForegroundColor $Yellow
    }
}
Write-Host ""

if ($serverReady) {
    Write-Success "Server bereit auf http://localhost:3000"
} else {
    Write-Warning "Server-Status unklar, starte trotzdem..."
}

# Step 7: Open Browser
Write-Host "`nSchritt 7: Oeffne Browser..." -ForegroundColor $Cyan
$url = "http://localhost:3000"
if ($browser.Path -eq "default") {
    Start-Process $url
} else {
    Start-Process $browser.Path -ArgumentList $url
}
Write-Success "Browser geoeffnet: $($browser.Name)"

# Success Message
Write-Host "`n========================================" -ForegroundColor $Green
Write-Host "  PASSWORTGENERATOR LAUFT!" -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Green
Write-Host "  URL:    http://localhost:3000" -ForegroundColor $Cyan
Write-Host "  Browser: $($browser.Name)" -ForegroundColor $Cyan
if ($testsPassed) {
    Write-Host "  Tests:  OK" -ForegroundColor $Green
} else {
    Write-Host "  Tests:  FEHLGESCHLAGEN (trotzdem gestartet)" -ForegroundColor $Yellow
}
Write-Host "========================================" -ForegroundColor $Green
Write-Host "`nDruecke ENTER zum Beenden" -ForegroundColor $Yellow
Read-Host
