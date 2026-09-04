# Start Forensix AI FastAPI Service
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$aiServiceDir = Split-Path -Parent $scriptDir
Set-Location $aiServiceDir

$pythonExe = "$aiServiceDir\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Error "Virtual environment python not found at $pythonExe."
    exit 1
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Forensix AI - Starting FastAPI Backend" -ForegroundColor Green
Write-Host "Venv:   $pythonExe" -ForegroundColor Gray
Write-Host "Port:   8000" -ForegroundColor Gray
Write-Host "Docs:   http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Green

& "$pythonExe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
