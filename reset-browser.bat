@echo off
title Passwortgenerator - Browser Reset
echo.
echo  Browser-Konfiguration zuruecksetzen...
echo.
powershell -ExecutionPolicy Bypass -File "scripts\reset-browser.ps1"
