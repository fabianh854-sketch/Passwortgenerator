@echo off
chcp 65001 >nul
title Passwortgenerator - Start
echo.
echo  Starting Passwortgenerator...
echo.
powershell -ExecutionPolicy Bypass -File "scripts\start-dev.ps1"
