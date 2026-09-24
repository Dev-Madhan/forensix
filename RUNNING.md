# 🔬 Forensix — Project Setup & Run Guide

> **Stack:** Next.js 16 · Prisma · Python FastAPI · SD 1.5 + ControlNet · RTX 4050 6GB

---

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Version | Download |
|---|---|---|
| Node.js | v24+ | https://nodejs.org |
| pnpm | v10+ | `npm install -g pnpm` |
| Python | 3.11+ | https://python.org/downloads |
| Git | Latest | https://git-scm.com |
| CUDA Toolkit | 12.4 | https://developer.nvidia.com/cuda-downloads |

---

## 📁 Project Structure

```
forensix/
├── src/                    ← Next.js app (frontend + API routes)
├── ai-service/             ← Python FastAPI AI backend
│   ├── models/
│   │   ├── sd15/           ← Stable Diffusion 1.5 model weights
│   │   ├── controlnet/     ← ControlNet Lineart model
│   │   └── qwen/           ← Qwen 2.5 LLM (Q4_K_M GGUF)
│   └── .venv/              ← Python virtual environment
├── .env                    ← Next.js environment variables
└── ai-service/.env         ← FastAPI environment variables
```

---

## 🚀 FIRST-TIME SETUP (Run Once)

### Step 1 — Install Next.js Dependencies

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix"
pnpm install
```

### Step 2 — Generate Prisma Client

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix"
pnpm db:generate
```

### Step 3 — Create Python Virtual Environment

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
python -m venv .venv
```

### Step 4 — Install Python Dependencies (with CUDA support)

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\pip install --upgrade pip
.\.venv\Scripts\pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
.\.venv\Scripts\pip install -r requirements.txt
```

### Step 5 — Verify CUDA / GPU Works

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0))"
```

Expected output:
```
CUDA: True
GPU: NVIDIA GeForce RTX 4050 Laptop GPU
```

---

## 📦 MODEL DOWNLOAD (Run Once — Already Downloaded)

> ✅ Your models are already at `ai-service/models/`. Skip unless re-downloading.

### Download Stable Diffusion 1.5

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\python -c "
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id='runwayml/stable-diffusion-v1-5',
    local_dir='./models/sd15',
    ignore_patterns=['*.ckpt', '*.bin', 'safety_checker/*'],
    revision='main'
)
print('SD 1.5 downloaded!')
"
```

### Download ControlNet Lineart

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\python -c "
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id='lllyasviel/control_v11p_sd15_lineart',
    local_dir='./models/controlnet/lineart',
    revision='main'
)
print('ControlNet Lineart downloaded!')
"
```

### Download Qwen 2.5 7B LLM

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\python -c "
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id='Qwen/Qwen2.5-7B-Instruct-GGUF',
    filename='qwen2.5-7b-instruct-q4_k_m.gguf',
    local_dir='./models/qwen'
)
print('Qwen 2.5 downloaded!')
"
```

---

## ▶️ DAILY STARTUP — Run the Project

> Open **2 separate PowerShell terminals**.

### Terminal 1 — Start AI Service (GPU Model Server)

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Wait for:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 — Start Next.js Frontend

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix"
pnpm dev
```

Wait for:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

### ✅ Open in browser: http://localhost:3000

---

## 🔎 Verify Everything is Running

### Check AI Service is healthy

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -UseBasicParsing | Select-Object StatusCode, Content
```

Expected: `StatusCode: 200` · `{"status":"ok","service":"criminal-eye-ai"}`

### Check Next.js is healthy

```powershell
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Select-Object StatusCode
```

Expected: `StatusCode: 200`

### Test a Real Sketch Generation (full end-to-end)

```powershell
$body = '{"prompt":"young woman with long curly hair, sharp jawline, green eyes, freckles, mid 20s","sketch_style":"Forensic Graphite (Pencil)","camera_angle":"frontal","detail_level":"Standard"}'
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/sketch" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 200
$json = $r.Content | ConvertFrom-Json
Write-Host "Engine:" $json.metadata.engine
Write-Host "Image type:" $json.image.content_type
Write-Host "Status:" $json.status
```

Expected:
```
Engine: diffusion_local_sd15_controlnet
Image type: image/png
Status: completed
```

---

## 🗄️ Database Commands

```powershell
# Push schema changes to Neon (cloud Postgres)
cd "d:\Madhan Kumar\Web Development Projects\forensix"
pnpm db:push

# Open Prisma Studio (visual database browser)
pnpm db:studio

# Regenerate Prisma client after schema changes
pnpm db:generate
```

---

## ⚙️ Generation Speed Reference (RTX 4050 6GB)

| Detail Level | Steps | Approx. Time |
|---|---|---|
| Draft | 14 | ~8 seconds |
| Standard | 24 | ~15 seconds |
| Master | 36 | ~22 seconds |

> ⚠️ First generation after startup takes ~40–60s (model loads into VRAM).
> All subsequent generations are fast.

---

## 🛑 Stop Everything

```
Terminal 1 (AI Service):  Ctrl + C
Terminal 2 (Next.js):     Ctrl + C
```

---

## ❗ Troubleshooting

### AI Service won't start — module not found
```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\pip install -r requirements.txt
```

### CUDA not available (running on CPU — very slow)
```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix\ai-service"
.\.venv\Scripts\pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 --force-reinstall
```

### Sketch shows basic SVG instead of real image
The AI service is not running. Start Terminal 1 first.

### Port 8000 already in use
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID_FROM_ABOVE> /F
```

### Port 3000 already in use
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_FROM_ABOVE> /F
```

### Next.js install errors
```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix"
pnpm install
pnpm dev
```

---

## 📂 Key File Locations

| What | Path |
|---|---|
| Next.js env | `.env` |
| AI Service env | `ai-service\.env` |
| SD 1.5 model | `ai-service\models\sd15\` |
| ControlNet model | `ai-service\models\controlnet\lineart\` |
| Qwen LLM | `ai-service\models\qwen\Qwen2.5-7B-Instruct-Q4_K_M.gguf` |
| Generated sketches | `ai-service\outputs\` |
| Sketch API route | `src\app\api\ai\sketch\route.ts` |
| Sketch page | `src\app\sketch\page.tsx` |
| AI Service docs | `http://localhost:8000/docs` |

---

## 🔑 Environment Variables Reference

### `.env` (Next.js root)

```env
DATABASE_URL="postgresql://..."

BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_SECRET=forensix_ai_secret_dev_2026

# Optional — enables Gemini Imagen 3 cloud generation
# GEMINI_API_KEY=your_key_here
```

### `ai-service\.env`

```env
APP_ENV=development
PORT=8000
HOST=0.0.0.0
NEXT_APP_URL=http://localhost:3000
AI_SERVICE_SECRET=forensix_ai_secret_dev_2026

SD_MODEL_PATH=./models/sd15
CONTROLNET_MODEL_PATH=./models/controlnet/lineart
OUTPUT_DIR=./outputs

SKETCH_PROVIDER=diffusion_local
LLM_PROVIDER=qwen_local
```

---

## 🌐 CONNECT LOCAL GPU MODEL TO VERCEL PRODUCTION

You can run your models locally on your RTX 4050 GPU and have your **Vercel production deployment** send its sketch generation and LLM jobs directly to your computer!

### Why isn't it working by default on Vercel?
- Vercel runs on cloud servers (AWS/GCP).
- When Vercel calls `http://localhost:8000`, it refers to Vercel's cloud container, NOT your laptop!
- To bridge them, your local FastAPI service must be exposed over a secure public HTTPS tunnel.

### Quick Start (One Command):

```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix"
.\start-gpu-worker.ps1
```

This automated script will:
1. Verify your RTX 4050 GPU & CUDA status.
2. Start the FastAPI microservice and pre-warm the SD 1.5 pipeline in VRAM.
3. Automatically download and launch a secure **Cloudflare HTTPS tunnel**.
4. Output your public URL: e.g. `https://xxxx.trycloudflare.com`.

### Connect to Vercel:

1. Copy the public tunnel URL printed in your terminal (e.g. `https://your-tunnel.trycloudflare.com`).
2. Go to your **Vercel Dashboard** -> Open the **forensix** project -> **Settings** -> **Environment Variables**.
3. Set:
   - `AI_SERVICE_URL` = `https://your-tunnel.trycloudflare.com`
   - `AI_SERVICE_SECRET` = `forensix_ai_secret_dev_2026`
4. Redeploy your latest deployment (or wait a few seconds for runtime environment variables to apply).
5. Open your live Vercel URL -> The status badge will show **GPU Online** -> Click **Generate Sketch**!
   Your local RTX 4050 GPU will now generate the forensic sketch and send it straight to your Vercel production app.

---

*Forensix — RTX 4050 6GB · Node v24 · Python 3.11 · Windows 11*
