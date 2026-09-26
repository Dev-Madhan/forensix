<#
.SYNOPSIS
    Forensix Local GPU Worker & Cloud Bridge Launcher (All-In-One)
.DESCRIPTION
    Starts the full local AI stack on your RTX 4050 GPU:
    1. Local Qwen 2.5 7B LLM (llama-server on port 8001 for witness morphology extraction)
    2. FastAPI AI Backend (port 8000 for SD 1.5, ControlNet lineart, and face analysis)
    3. Secure HTTPS Cloudflare Tunnel bridging port 8000 to your Vercel production deployment
#>

param(
    [ValidateSet("cloudflare", "localtunnel", "ngrok")]
    [string]$TunnelProvider = "cloudflare",
    [int]$Port = 8000,
    [int]$LlmPort = 8001,
    [string]$TunnelToken = "",
    [string]$Subdomain = "",
    [string]$NgrokDomain = "",
    [switch]$SkipLLM
)

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot
if (-not (Test-Path "$rootDir\ai-service")) {
    $rootDir = Split-Path -Parent $PSScriptRoot
}
$aiDir = Join-Path $rootDir "ai-service"

# Auto-load variables from .env and ai-service\.env
foreach ($envFile in @("$rootDir\.env", "$aiDir\.env")) {
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
                $parts = $line.Split("=", 2)
                $k = $parts[0].Trim()
                $v = $parts[1].Trim().Trim('"').Trim("'")
                if (-not [System.Environment]::GetEnvironmentVariable($k)) {
                    [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
                }
            }
        }
    }
}

if (-not $NgrokDomain -and $env:NGROK_DOMAIN) {
    $NgrokDomain = $env:NGROK_DOMAIN
    $TunnelProvider = "ngrok"
}
if (-not $TunnelToken -and $env:CLOUDFLARE_TUNNEL_TOKEN) {
    $TunnelToken = $env:CLOUDFLARE_TUNNEL_TOKEN
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Magenta
Write-Host "  FORENSIX — LOCAL GPU WORKER & VERCEL CLOUD BRIDGE               " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Magenta
Write-Host ""

# -----------------------------------------------------------------------------
# 1. Check Python Venv
# -----------------------------------------------------------------------------
$pythonExe = Join-Path $aiDir ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "[-] Python virtual environment not found at $pythonExe" -ForegroundColor Red
    Write-Host "    Please run setup first: python -m venv ai-service\.venv" -ForegroundColor Yellow
    exit 1
}

# -----------------------------------------------------------------------------
# 2. Check CUDA / GPU
# -----------------------------------------------------------------------------
Write-Host "[1/4] Verifying GPU and PyTorch CUDA acceleration..." -ForegroundColor Yellow
try {
    $gpuCheck = & $pythonExe -c "import torch; print('CUDA: ' + str(torch.cuda.is_available()) + ' | Device: ' + (torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'))"
    Write-Host "      $gpuCheck" -ForegroundColor Green
} catch {
    Write-Host "[-] Warning: Failed to query CUDA status from PyTorch." -ForegroundColor DarkYellow
}

# -----------------------------------------------------------------------------
# Pre-Flight Cleanup: Clear Stale Processes & Free Ports
# -----------------------------------------------------------------------------
foreach ($checkPort in @($Port, $LlmPort)) {
    $conns = Get-NetTCPConnection -LocalPort $checkPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pidToTest in $conns) {
        $endpoint = if ($checkPort -eq $Port) { "http://localhost:$checkPort/api/v1/health" } else { "http://127.0.0.1:$checkPort/health" }
        $isOk = $false
        try {
            $testRes = Invoke-RestMethod -Uri $endpoint -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($testRes.status -eq "ok" -or $testRes -match "ok") {
                $isOk = $true
            }
        } catch {}
        if (-not $isOk) {
            # Stale or frozen process holding the port — terminate it
            Stop-Process -Id $pidToTest -Force -ErrorAction SilentlyContinue
        }
    }
}
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# -----------------------------------------------------------------------------
# 3. Start Local Qwen LLM Server (llama-server on port 8001)
# -----------------------------------------------------------------------------
$llmProc = $null
if (-not $SkipLLM) {
    Write-Host "[2/4] Checking Local Qwen LLM server (port $LlmPort)..." -ForegroundColor Yellow
    
    $llmActive = $false
    try {
        $llmRes = Invoke-RestMethod -Uri "http://127.0.0.1:$LlmPort/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($llmRes.status -eq "ok" -or $llmRes -match "ok") {
            $llmActive = $true
            Write-Host "      Local Qwen LLM already active on port $LlmPort!" -ForegroundColor Green
        }
    } catch {
        $llmActive = $false
    }

    if (-not $llmActive) {
        # Locate llama-server executable
        $llamaServer = Get-Command "llama-server" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
        if (-not $llamaServer) {
            $wingetCandidate = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "llama-server.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
            if ($wingetCandidate) {
                $llamaServer = $wingetCandidate
            }
        }

        # Locate Qwen GGUF model
        $modelFile = Get-ChildItem -Path "$aiDir\models\qwen" -Filter "*.gguf" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

        if ($llamaServer -and $modelFile) {
            Write-Host "      Starting llama-server with Qwen 2.5 7B (-ngl 16 GPU offload)..." -ForegroundColor Cyan
            $llmArgs = "-m `"$modelFile`" --host 127.0.0.1 --port $LlmPort -c 2048 -ngl 16"
            $llmProc = Start-Process -FilePath $llamaServer -ArgumentList $llmArgs -PassThru -WindowStyle Hidden
            
            # Wait for LLM to load weights
            $loaded = $false
            for ($i = 0; $i -lt 30; $i++) {
                Start-Sleep -Seconds 1
                try {
                    $res = Invoke-RestMethod -Uri "http://127.0.0.1:$LlmPort/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
                    if ($res.status -eq "ok" -or $res -match "ok") {
                        $loaded = $true
                        break
                    }
                } catch {}
            }
            if ($loaded) {
                Write-Host "      Local Qwen LLM is HEALTHY and READY on port $LlmPort!" -ForegroundColor Green
            } else {
                Write-Host "      [!] Qwen LLM is taking longer to load. Proceeding in background." -ForegroundColor DarkYellow
            }
        } else {
            Write-Host "      [-] llama-server or Qwen GGUF not found. AI service will use rule-based NLP fallback." -ForegroundColor DarkYellow
        }
    }
} else {
    Write-Host "[2/4] Skipping Local LLM server (-SkipLLM specified)." -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 4. Start FastAPI Backend (Port 8000)
# -----------------------------------------------------------------------------
Write-Host "[3/4] Checking FastAPI AI microservice (port $Port)..." -ForegroundColor Yellow

$fastApiActive = $false
try {
    $res = Invoke-RestMethod -Uri "http://localhost:$Port/api/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($res.status -eq "ok") {
        $fastApiActive = $true
        Write-Host "      FastAPI AI microservice already active and HEALTHY on port $Port!" -ForegroundColor Green
    }
} catch {
    $fastApiActive = $false
}

$aiProc = $null
if (-not $fastApiActive) {
    Write-Host "      Starting FastAPI AI backend..." -ForegroundColor Cyan
    $uvicornArgs = "-m uvicorn app.main:app --host 0.0.0.0 --port $Port"
    
    $aiProc = Start-Process -FilePath $pythonExe -ArgumentList $uvicornArgs -WorkingDirectory $aiDir -PassThru -WindowStyle Hidden
    
    # Wait for local health check (PyTorch + Diffusers takes ~15-20s to load on Windows)
    $healthy = $false
    for ($i = 0; $i -lt 35; $i++) {
        Start-Sleep -Seconds 1
        try {
            $res = Invoke-RestMethod -Uri "http://localhost:$Port/api/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($res.status -eq "ok") {
                $healthy = $true
                break
            }
        } catch {}
    }

    if (-not $healthy) {
        Write-Host "[-] Warning: AI service is still warming up. Proceeding with tunnel..." -ForegroundColor Yellow
    } else {
        Write-Host "      FastAPI AI microservice is HEALTHY and READY on port $Port!" -ForegroundColor Green
    }
}

# -----------------------------------------------------------------------------
# 5. Prepare HTTPS Tunnel Provider ($TunnelProvider)
# -----------------------------------------------------------------------------
Write-Host "[4/4] Preparing secure HTTPS tunnel provider ($TunnelProvider)..." -ForegroundColor Yellow
$cloudflaredExe = Join-Path $aiDir "cloudflared.exe"

# Stop any old dangling tunnel processes
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$tunnelProc = $null
$tunnelUrl = $null
$tunnelLog = $null

if ($TunnelProvider -eq "cloudflare") {
    $systemCloudflared = Get-Command "cloudflared" -ErrorAction SilentlyContinue
    if ($systemCloudflared) {
        $tunnelBin = $systemCloudflared.Source
        Write-Host "      Using system cloudflared: $tunnelBin" -ForegroundColor Green
    } elseif (Test-Path $cloudflaredExe) {
        $tunnelBin = $cloudflaredExe
        Write-Host "      Using portable cloudflared: $tunnelBin" -ForegroundColor Green
    } else {
        Write-Host "      Downloading portable cloudflared (~35MB)..." -ForegroundColor Cyan
        $cfUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        try {
            Invoke-WebRequest -Uri $cfUrl -OutFile $cloudflaredExe -UseBasicParsing
            $tunnelBin = $cloudflaredExe
            Write-Host "      Cloudflared downloaded successfully!" -ForegroundColor Green
        } catch {
            Write-Host "[-] Could not download cloudflared. Falling back to localtunnel..." -ForegroundColor Yellow
            $TunnelProvider = "localtunnel"
        }
    }

    if ($TunnelProvider -eq "cloudflare") {
        # Check for permanent Cloudflare token
        $token = $TunnelToken
        if (-not $token -and $env:CLOUDFLARE_TUNNEL_TOKEN) { $token = $env:CLOUDFLARE_TUNNEL_TOKEN }

        if ($token) {
            Write-Host "      Starting Cloudflare Named Tunnel with permanent token..." -ForegroundColor Green
            $tunnelProc = Start-Process -FilePath $tunnelBin -ArgumentList @("tunnel", "run", "--token", "$token") -PassThru -WindowStyle Hidden
            $tunnelUrl = if ($env:AI_SERVICE_URL -and $env:AI_SERVICE_URL -notmatch "trycloudflare") { $env:AI_SERVICE_URL } else { "https://ai.yourdomain.com" }
        } else {
            # Quick Tunnel (trycloudflare.com)
            $tunnelLog = Join-Path $aiDir "tunnel_err.log"
            if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force -ErrorAction SilentlyContinue }

            Write-Host "      Connecting to Cloudflare edge..." -ForegroundColor Cyan
            $tunnelProc = Start-Process -FilePath $tunnelBin -ArgumentList "tunnel", "--url", "http://localhost:$Port" -RedirectStandardError $tunnelLog -PassThru -WindowStyle Hidden

            Write-Host "      Waiting for Cloudflare public HTTPS URL..." -ForegroundColor Cyan
            for ($i = 0; $i -lt 25; $i++) {
                Start-Sleep -Seconds 1
                if (Test-Path $tunnelLog) {
                    $logContent = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
                    if ($logContent -match '(https://[a-zA-Z0-9-]+\.trycloudflare\.com)') {
                        $tunnelUrl = $matches[1]
                        break
                    }
                }
            }
        }
    }
} elseif ($TunnelProvider -eq "ngrok") {
    $ngrokBin = Get-Command "ngrok" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
    if (-not $ngrokBin) {
        $ngrokCandidate = Get-ChildItem -Path "$env:LOCALAPPDATA" -Filter "ngrok.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
        if ($ngrokCandidate) { $ngrokBin = $ngrokCandidate }
    }

    if (-not $ngrokBin) {
        Write-Host "[-] ngrok executable not found in PATH." -ForegroundColor Red
        Write-Host "    Please install it via: winget install ngrok" -ForegroundColor Yellow
        Write-Host "    Then link your authtoken: ngrok config add-authtoken <TOKEN>" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "      Using ngrok: $ngrokBin" -ForegroundColor Green
    $ngrokArgs = @("http", "$Port")
    if ($NgrokDomain) {
        $ngrokArgs += @("--domain", "$NgrokDomain")
        $tunnelUrl = "https://$NgrokDomain"
        Write-Host "      Connecting to permanent ngrok static domain: $tunnelUrl" -ForegroundColor Cyan
    } else {
        Write-Host "      Starting ngrok tunnel on port $Port..." -ForegroundColor Cyan
    }

    $tunnelLog = Join-Path $aiDir "ngrok_err.log"
    $tunnelProc = Start-Process -FilePath $ngrokBin -ArgumentList $ngrokArgs -RedirectStandardError $tunnelLog -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 2

    if (-not $tunnelUrl) {
        # Query local ngrok API to find assigned domain if no static domain was passed
        try {
            $tunnelsApi = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 3 -ErrorAction SilentlyContinue
            $tunnelUrl = $tunnelsApi.tunnels[0].public_url
            if ($tunnelUrl -match '^http:') { $tunnelUrl = $tunnelUrl -replace '^http:', 'https:' }
        } catch {}
    }
} elseif ($TunnelProvider -eq "localtunnel") {
    $ltArgs = @("--port", "$Port")
    if ($Subdomain) { 
        $ltArgs += @("--subdomain", "$Subdomain")
        $tunnelUrl = "https://$Subdomain.loca.lt"
    }
    Write-Host "      Starting localtunnel on port $Port..." -ForegroundColor Cyan
    $tunnelProc = Start-Process -FilePath "npx" -ArgumentList (@("-y", "localtunnel") + $ltArgs) -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# -----------------------------------------------------------------------------
# 6. Verify Tunnel Connectivity, Update .env, and Monitor
# -----------------------------------------------------------------------------
if ($tunnelUrl) {
    Write-Host "      Testing public tunnel connectivity..." -ForegroundColor Cyan
    $verified = $false
    for ($v = 0; $v -lt 12; $v++) {
        Start-Sleep -Seconds 1
        try {
            $headers = @{ "ngrok-skip-browser-warning" = "true" }
            $res = Invoke-RestMethod -Uri "$tunnelUrl/api/v1/health" -Headers $headers -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($res.status -eq "ok") {
                $verified = $true
                break
            }
        } catch {}
    }

    # Auto-copy URL to Windows clipboard
    try {
        Set-Clipboard -Value $tunnelUrl
        $copied = $true
    } catch {
        $copied = $false
    }

    # Auto-update .env files
    try {
        foreach ($envTarget in @(Join-Path $aiDir ".env", Join-Path $rootDir ".env")) {
            if (Test-Path $envTarget) {
                $content = Get-Content $envTarget -Raw
                if ($content -match 'AI_SERVICE_URL=.*') {
                    $content = $content -replace 'AI_SERVICE_URL=.*', "AI_SERVICE_URL=$tunnelUrl"
                } else {
                    $content += "`nAI_SERVICE_URL=$tunnelUrl`n"
                }
                Set-Content -Path $envTarget -Value $content -NoNewline
            }
        }
    } catch {}

    $isPermanent = ($TunnelProvider -eq "ngrok" -and $NgrokDomain) -or ($TunnelProvider -eq "cloudflare" -and $token)

    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Green
    if ($isPermanent) {
        Write-Host "  🎉 PERMANENT STATIC URL CONNECTED & VERIFIED ONLINE!            " -ForegroundColor Green
    } else {
        Write-Host "  🎉 TUNNEL IS CONNECTED & VERIFIED ONLINE!                       " -ForegroundColor Green
    }
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Public HTTPS URL : " -NoNewline -ForegroundColor White
    Write-Host "$tunnelUrl" -ForegroundColor Cyan
    Write-Host "  Tunnel Provider  : " -NoNewline -ForegroundColor White
    Write-Host "$TunnelProvider" -ForegroundColor Magenta
    Write-Host "  Tunnel Status    : " -NoNewline -ForegroundColor White
    if ($verified) {
        Write-Host "200 OK — Fully Reachable from the Internet!" -ForegroundColor Green
    } else {
        Write-Host "Tunnel established (ready or propagating)" -ForegroundColor Yellow
    }
    Write-Host "  Local AI Backend : " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:$Port [READY]" -ForegroundColor Green
    Write-Host "  Local Qwen LLM   : " -NoNewline -ForegroundColor White
    if ($llmActive -or $llmProc) {
        Write-Host "http://127.0.0.1:$LlmPort [READY]" -ForegroundColor Green
    } else {
        Write-Host "Rule-based NLP Fallback [ACTIVE]" -ForegroundColor DarkYellow
    }
    Write-Host "  Clipboard        : " -NoNewline -ForegroundColor White
    if ($copied) {
        Write-Host "COPIED TO CLIPBOARD! Press Ctrl+V" -ForegroundColor Magenta
    } else {
        Write-Host "Copy the URL above manually" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Magenta
    if ($isPermanent) {
        Write-Host "  👉 ONE-TIME VERCEL CONFIGURATION (NEVER CHANGE IT AGAIN):      " -ForegroundColor Cyan
    } else {
        Write-Host "  👉 TO TURN ON IN YOUR HOSTED VERCEL PLATFORM:                  " -ForegroundColor Cyan
    }
    Write-Host "==================================================================" -ForegroundColor Magenta
    Write-Host "  1. Open your Vercel Dashboard -> forensix-sketch project" -ForegroundColor White
    Write-Host "  2. Go to: Settings -> Environment Variables" -ForegroundColor White
    Write-Host "  3. Set or update:" -ForegroundColor White
    Write-Host "     AI_SERVICE_URL = $tunnelUrl" -ForegroundColor Cyan
    Write-Host "     AI_SERVICE_SECRET = forensix_ai_secret_dev_2026" -ForegroundColor Cyan
    Write-Host "  4. Redeploy your latest deployment on Vercel" -ForegroundColor White
    Write-Host "  5. Refresh your live site -> Status badge turns GREEN (GPU ONLINE)!" -ForegroundColor Green
    if ($isPermanent) {
        Write-Host "  ⭐ Since this is a PERMANENT URL, you will NEVER have to edit Vercel again!" -ForegroundColor Green
    }
    Write-Host "==================================================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  Tunnel is ACTIVE. Press Ctrl+C in this window to stop." -ForegroundColor DarkGray
    Write-Host ""

    # Keep alive and monitor
    try {
        while ($true) {
            if ($tunnelProc.HasExited) {
                Write-Host "[-] Tunnel process exited unexpectedly." -ForegroundColor Red
                break
            }
            Start-Sleep -Seconds 2
        }
    } finally {
        Write-Host "`nStopping tunnel and worker processes..." -ForegroundColor Yellow
        if ($tunnelProc -and -not $tunnelProc.HasExited) { Stop-Process -Id $tunnelProc.Id -Force -ErrorAction SilentlyContinue }
        if ($aiProc -and -not $aiProc.HasExited) { Stop-Process -Id $aiProc.Id -Force -ErrorAction SilentlyContinue }
        if ($llmProc -and -not $llmProc.HasExited) { Stop-Process -Id $llmProc.Id -Force -ErrorAction SilentlyContinue }
        if ($tunnelLog -and (Test-Path $tunnelLog)) { Remove-Item $tunnelLog -Force -ErrorAction SilentlyContinue }
        Write-Host "Clean shutdown complete." -ForegroundColor Green
    }
} else {
    Write-Host "[-] Could not establish public tunnel URL." -ForegroundColor Red
    if ($tunnelLog -and (Test-Path $tunnelLog)) {
        Write-Host "    Check log: $tunnelLog" -ForegroundColor Yellow
    }
    if ($tunnelProc -and -not $tunnelProc.HasExited) { Stop-Process -Id $tunnelProc.Id -Force }
}
