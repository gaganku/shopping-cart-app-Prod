# ModernShop - Automated Setup Script for Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ModernShop - Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is installed
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB is installed" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host "⚠ MongoDB is not installed or not in PATH" -ForegroundColor Yellow
    Write-Host "You can install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "Or use MongoDB Atlas (cloud) instead" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found" -ForegroundColor Yellow
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host "⚠ Please update .env with your configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your configuration"
Write-Host "2. Start MongoDB: mongod (in a separate terminal)"
Write-Host "3. Run the application: npm start"
Write-Host ""
Write-Host "The application will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
