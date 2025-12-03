# File Integrity Monitoring System - Start Script
# This script starts both backend and frontend servers

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Starting File Integrity Monitoring System" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if setup was run
if (!(Test-Path "backend/node_modules") -or !(Test-Path "frontend/node_modules")) {
    Write-Host "✗ Dependencies not installed. Please run setup.ps1 first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Run: .\setup.ps1" -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (!(Test-Path "backend/.env")) {
    Write-Host "✗ Configuration file not found. Please run setup.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; npm start"

Start-Sleep -Seconds 3

Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✓ Application started!" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Check the new terminal windows for server logs." -ForegroundColor Cyan
Write-Host "Press Ctrl+C in those windows to stop the servers." -ForegroundColor Cyan
Write-Host ""
