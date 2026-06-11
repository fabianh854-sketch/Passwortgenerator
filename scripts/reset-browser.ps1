# Passwortgenerator - Browser Config Reset
# Loescht die gespeicherte Browser-Konfiguration

$appDataDir = "$env:LOCALAPPDATA\Passwortgenerator"
$configFile = "$appDataDir\browser-config.json"

clear
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  BROWSER-KONFIGURATION ZURUECKSETZEN" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $configFile) {
    Remove-Item $configFile -Force
    Write-Host "[OK] Browser-Konfiguration geloescht!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Beim naechsten Start wird der Browser neu erkannt." -ForegroundColor Yellow
} else {
    Write-Host "[i] Keine gespeicherte Browser-Konfiguration vorhanden." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Druecke ENTER zum Beenden..." -ForegroundColor Yellow
Read-Host
