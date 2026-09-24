<#
.SYNOPSIS
    Forensix Local GPU Worker & Cloud Bridge Launcher
.DESCRIPTION
    Starts the local FastAPI AI backend (RTX 4050 GPU: SD 1.5, ControlNet, Qwen 2.5)
    and exposes it over a secure HTTPS Cloudflare tunnel so your Vercel production
    deployment can dispatch sketch generation tasks to your local PC.
#>

param(
    [ValidateSet("cloudflare", "localtunnel", "ngrok")]
    [string]$TunnelProvider = "cloudflare",
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot
if (-not (Test-Path "$rootDir\ai-service")) {
    $rootDir = Split-Path -Parent $PSScriptRoot
}
$aiDir = Join-Path $rootDir "ai-service"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Magenta
Write-Host "  FORENSIX — LOCAL GPU WORKER & VERCEL CLOUD BRIDGE               " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Magenta
Write-Host ""

# 1. Check Python Venv
$pythonExe = Join-Path $aiDir ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "[-] Python virtual environment not found at $pythonExe" -ForegroundColor Red
    Write-Host "    Please run setup first: python -m venv ai-service\.venv" -ForegroundColor Yellow
    exit 1
}

# 2. Check CUDA / GPU
Write-Host "[1/3] Verifying GPU and PyTorch CUDA acceleration..." -ForegroundColor Yellow
try {
    $gpuCheck = & $pythonExe -c "import torch; print('CUDA:' + str(torch.cuda.is_available()) + ' | ' + (torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'))"
    Write-Host "      $gpuCheck" -ForegroundColor Green
} catch {
    Write-Host "[-] Warning: Failed to query CUDA status from PyTorch." -ForegroundColor DarkYellow
}

# 3. Ensure Tunnel Tool
Write-Host "[2/3] Preparing secure HTTPS tunnel provider ($TunnelProvider)..." -ForegroundColor Yellow
$cloudflaredExe = Join-Path $aiDir "cloudflared.exe"

if ($TunnelProvider -eq "cloudflare") {
    $systemCloudflared = Get-Command "cloudflared" -ErrorAction SilentlyContinue
    if ($systemCloudflared) {
        $tunnelBin = $systemCloudflared.Source
        Write-Host "      Using system cloudflared: $tunnelBin" -ForegroundColor Green
    } elseif (Test-Path $cloudflaredExe) {
        $tunnelBin = $cloudflaredExe
        Write-Host "      Using portable cloudflared: $tunnelBin" -ForegroundColor Green
    } else {
        Write-Host "      Downloading official portable cloudflared binary (once, ~35MB)..." -ForegroundColor Cyan
        $cfUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        try {
            Invoke-WebRequest -Uri $cfUrl -OutFile $cloudflaredExe -UseBasicParsing
            $tunnelBin = $cloudflaredExe
            Write-Host "      Cloudflared downloaded successfully to ai-service\cloudflared.exe!" -ForegroundColor Green
        } catch {
            Write-Host "[-] Could not auto-download cloudflared. Falling back to localtunnel..." -ForegroundColor Yellow
            $TunnelProvider = "localtunnel"
        }
    }
}

# 4. Start Uvicorn AI Microservice in separate background window
Write-Host "[3/3] Starting FastAPI AI microservice on http://localhost:$Port..." -ForegroundColor Yellow

$uvicornCmd = "cd `"$aiDir`"; .\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port $Port"
$aiProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", $uvicornCmd -PassThru

Write-Host "      FastAPI process started (PID: $($aiProc.Id)). Testing readiness..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Wait for local health check
$healthy = $false
for ($i = 0; $i -lt 15; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:$Port/api/v1/health" -TimeoutSec 2
        if ($res.status -eq "ok") {
            $healthy = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $healthy) {
    Write-Host "[-] Note: AI service is still warming up or starting." -ForegroundColor Yellow
} else {
    Write-Host "      FastAPI AI microservice is HEALTHY and READY!" -ForegroundColor Green
}

# 5. Start Tunnel and Output Instructions
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Magenta
Write-Host "  STARTING SECURE CLOUD TUNNEL FOR VERCEL PRODUCTION             " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "IMPORTANT: Once the tunnel outputs the public HTTPS URL below:" -ForegroundColor Yellow
Write-Host "  1. Copy your public tunnel URL (e.g. https://xxxx.trycloudflare.com)" -ForegroundColor White
Write-Host "  2. Go to: Vercel Dashboard -> Your Project -> Settings -> Environment Variables" -ForegroundColor White
Write-Host "  3. Set / Update:" -ForegroundColor White
Write-Host "     AI_SERVICE_URL = https://xxxx.trycloudflare.com" -ForegroundColor Cyan
Write-Host "     AI_SERVICE_SECRET = forensix_ai_secret_dev_2026" -ForegroundColor Cyan
Write-Host "  4. Redeploy on Vercel (or trigger new build)" -ForegroundColor White
Write-Host ""
Write-Host "Starting tunnel now... (Press Ctrl+C to stop)" -ForegroundColor Green
Write-Host ""

if ($TunnelProvider -eq "cloudflare") {
    & $tunnelBin tunnel --url "http://localhost:$Port"
} elseif ($TunnelProvider -eq "localtunnel") {
    npx -y localtunnel --port $Port
} elseif ($TunnelProvider -eq "ngrok") {
    ngrok http $Port
}
