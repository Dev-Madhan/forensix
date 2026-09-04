# Start both local Qwen (llama-server port 8001) and FastAPI AI Service (port 8000)
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Launching llama-server on port 8001 in a background window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptDir\start-llama.ps1"

Start-Sleep -Seconds 2

Write-Host "Launching FastAPI AI backend on port 8000..." -ForegroundColor Green
& "$scriptDir\start-service.ps1"
