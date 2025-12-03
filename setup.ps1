# File Integrity Monitoring System - Quick Start Script
# Run this script to set up and start the application

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  File Integrity Monitoring System Setup  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoStatus = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoStatus.Status -eq "Running") {
        Write-Host "✓ MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "! MongoDB service not running. Attempting to start..." -ForegroundColor Yellow
        Start-Service -Name MongoDB
        Write-Host "✓ MongoDB service started" -ForegroundColor Green
    }
} catch {
    Write-Host "! MongoDB service not found. Ensure MongoDB is installed." -ForegroundColor Yellow
    Write-Host "  You can continue, but the application will need a MongoDB connection." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location backend

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please configure it with your settings." -ForegroundColor Green
    Write-Host "  Opening .env file for editing..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    notepad .env
    Write-Host ""
    Write-Host "Press any key after you've configured the .env file..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Install backend dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Set-Location ../frontend

# Install frontend dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Green
Write-Host "  1. Open a terminal and run: cd backend; npm start" -ForegroundColor White
Write-Host "  2. Open another terminal and run: cd frontend; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or run the start script: .\start.ps1" -ForegroundColor Green
Write-Host ""
Write-Host "The application will be available at:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Default admin credentials:" -ForegroundColor Yellow
Write-Host "  You need to register first at the login page" -ForegroundColor White
Write-Host ""
Write-Host "For testing, files in backend/watched_files will be monitored" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to start now
$response = Read-Host "Would you like to start the application now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"
    
    Start-Sleep -Seconds 3
    
    Write-Host "Starting frontend server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    
    Write-Host ""
    Write-Host "✓ Application started!" -ForegroundColor Green
    Write-Host "  Check the new terminal windows for logs" -ForegroundColor Yellow
    Write-Host "  Frontend will open automatically at http://localhost:5173" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Thank you for using File Integrity Monitoring System!" -ForegroundColor Cyan
Write-Host ""
