# Start local llama.cpp server for Forensix Qwen LLM
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$aiServiceDir = Split-Path -Parent $scriptDir
Set-Location $aiServiceDir

# Locate llama-server executable
$llamaServer = Get-Command "llama-server" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $llamaServer) {
    $wingetCandidate = Get-ChildItem -Path "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "llama-server.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if ($wingetCandidate) {
        $llamaServer = $wingetCandidate
    }
}

if (-not $llamaServer) {
    Write-Error "llama-server.exe could not be found. Please ensure ggml.llamacpp is installed via winget."
    exit 1
}

# Locate Qwen GGUF model
$modelFile = Get-ChildItem -Path "$aiServiceDir\models\qwen" -Filter "*.gguf" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
if (-not $modelFile) {
    Write-Error "No .gguf model found in $aiServiceDir\models\qwen\"
    exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Forensix AI - Starting Local Qwen LLM" -ForegroundColor Cyan
Write-Host "Server: $llamaServer" -ForegroundColor Gray
Write-Host "Model:  $modelFile" -ForegroundColor Gray
Write-Host "Port:   8001" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan

# Launch llama-server with 24 GPU offloaded layers and 4096 context window
& "$llamaServer" -m "$modelFile" --host 127.0.0.1 --port 8001 -c 4096 -ngl 24
