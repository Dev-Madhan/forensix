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

> 💡 Open a single PowerShell window at the **project root (`forensix`)**.

### ⚡ All-in-One Setup (Copy & Paste Everything):

```powershell
# 1. Install frontend dependencies & generate database client
pnpm install
pnpm db:generate

# 2. Setup Python environment and dependencies
cd ai-service
python -m venv .venv
.\.venv\Scripts\pip install --upgrade pip
.\.venv\Scripts\pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
.\.venv\Scripts\pip install -r requirements.txt

# 3. Verify CUDA / GPU status
.\.venv\Scripts\python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0))"

# 4. Return to project root
cd ..
```

<details>
<summary><b>Or view step-by-step instructions</b></summary>

#### Step 1 — Install Next.js Dependencies
*📍 Working Directory: `forensix` (Project Root)*
```powershell
pnpm install
```

#### Step 2 — Generate Prisma Client
*📍 Working Directory: `forensix` (Project Root)*
```powershell
pnpm db:generate
```

#### Step 3 — Create Python Virtual Environment
*📍 Working Directory: `forensix\ai-service`*
```powershell
cd ai-service
python -m venv .venv
```

#### Step 4 — Install Python Dependencies (with CUDA support)
*📍 Working Directory: `forensix\ai-service`*
```powershell
.\.venv\Scripts\pip install --upgrade pip
.\.venv\Scripts\pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
.\.venv\Scripts\pip install -r requirements.txt
```

#### Step 5 — Verify CUDA / GPU Works
*📍 Working Directory: `forensix\ai-service`*
```powershell
.\.venv\Scripts\python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0))"
```

Expected output:
```
CUDA: True
GPU: NVIDIA GeForce RTX 4050 Laptop GPU
```

#### Step 6 — Return to Root
```powershell
cd ..
```

</details>

---

## 📦 MODEL DOWNLOAD (Run Once — Already Downloaded)

> ✅ Your models are already downloaded at `ai-service/models/`. Skip unless re-downloading.
> If needed, run these inside the `ai-service` folder (`cd ai-service`):

### Download Stable Diffusion 1.5

```powershell
cd ai-service
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
cd ai-service
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
cd ai-service
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

> 💡 Open **3 separate PowerShell terminals**, all starting at the `forensix` project root.

### 📋 Quick Reference:
| Terminal | Window Name | Starting Location | Command |
|---|---|---|---|
| **Terminal 1** | AI Service (GPU) | `forensix` (Root) | `cd ai-service; .\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` |
| **Terminal 2** | Ngrok Tunnel | `forensix` (Root) | `ngrok http 8000 --url https://concerned-dominoes-debtor.ngrok-free.dev` |
| **Terminal 3** | Frontend (Next.js) | `forensix` (Root) | `pnpm dev` |

---

### 🖥️ Terminal 1 — Start AI Service (GPU Model Server)
*📍 Location: `forensix` (Project Root)*

Starts the FastAPI backend with SD 1.5 + ControlNet on your RTX 4050 GPU:

```powershell
cd ai-service; .\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Wait until you see:
```
INFO:     Application startup complete.
```

> ⚠️ First startup takes ~30–60s as PyTorch loads SD 1.5 + ControlNet weights into your GPU VRAM.

---

### 🌐 Terminal 2 — Start Ngrok Permanent Tunnel (Connects Your GPU to Vercel)
*📍 Location: `forensix` (Project Root)*

This creates a **permanent public HTTPS URL** that bridges your local AI service to the internet:

```powershell
ngrok http 8000 --url https://concerned-dominoes-debtor.ngrok-free.dev
```

> ⚠️ The port must be **8000** (matching the AI service). Using any other port (e.g. 80) will cause 502 errors.

When connected, you'll see a dashboard like:
```
Session Status    online
Account           your-account
Forwarding        https://concerned-dominoes-debtor.ngrok-free.dev -> http://localhost:8000
```

> ✅ **This URL never changes!** Your Vercel `AI_SERVICE_URL` is already set to `https://concerned-dominoes-debtor.ngrok-free.dev`. No need to update Vercel ever again — just start the tunnel.

---

### 🖥️ Terminal 3 — Start Next.js Frontend
*📍 Location: `forensix` (Project Root)*

```powershell
pnpm dev
```

Wait until you see:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

### ✅ Open in browser: [http://localhost:3000](http://localhost:3000)

---

### 🤖 Alternative: All-in-One Script (Optional)

If you prefer one command instead of 3 terminals, the script auto-detects your `NGROK_DOMAIN` from `.env`:

```powershell
.\start-gpu-worker.ps1
```

This starts the Qwen LLM (port 8001), FastAPI (port 8000), and the ngrok tunnel automatically.

---

## 🔎 Verify Everything is Running

### Check AI Service is healthy (local)

```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -UseBasicParsing | Select-Object StatusCode, Content
```

Expected: `StatusCode: 200` · `{"status":"ok","service":"criminal-eye-ai"}`

### Check Ngrok Tunnel is healthy (public)

```powershell
Invoke-WebRequest -Uri "https://concerned-dominoes-debtor.ngrok-free.dev/api/v1/health" -Headers @{"ngrok-skip-browser-warning"="true"} -UseBasicParsing | Select-Object StatusCode, Content
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
# From project root:
# Push schema changes to Neon (cloud Postgres)
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
Terminal 2 (Ngrok Tunnel): Ctrl + C
Terminal 3 (Next.js):     Ctrl + C
```

---

## ❗ Troubleshooting

### AI Service won't start — module not found
```powershell
cd ai-service
.\.venv\Scripts\pip install -r requirements.txt
```

### CUDA not available (running on CPU — very slow)
```powershell
cd ai-service
.\.venv\Scripts\pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 --force-reinstall
```

### Sketch shows basic SVG instead of real image
The AI service is not running. Start Terminal 1 first, then Terminal 2.

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

### Next.js health check returns 502
This means `AI_SERVICE_URL` points to the ngrok tunnel but ngrok is not running or is on the wrong port.
1. Make sure Terminal 2 is running `ngrok http 8000` (not port 80 or any other port).
2. Make sure Terminal 1 (AI Service) is running and healthy on port 8000.

### Ngrok shows "ERR_NGROK_3200" or auth error
```powershell
ngrok config add-authtoken <YOUR_AUTHTOKEN>
```

### Next.js install errors
```powershell
# From project root:
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

AI_SERVICE_URL=https://concerned-dominoes-debtor.ngrok-free.dev
AI_SERVICE_SECRET=forensix_ai_secret_dev_2026

# Permanent Ngrok Static Domain (auto-detected by start-gpu-worker.ps1)
NGROK_DOMAIN=concerned-dominoes-debtor.ngrok-free.dev

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

# Permanent Ngrok Static Domain
AI_SERVICE_URL=https://concerned-dominoes-debtor.ngrok-free.dev
NGROK_DOMAIN=concerned-dominoes-debtor.ngrok-free.dev
```

---

## 🌐 CONNECT LOCAL GPU & LLM TO VERCEL PRODUCTION

> ✅ **Already configured!** Your Vercel project uses the permanent ngrok domain `https://concerned-dominoes-debtor.ngrok-free.dev`. You only need to start the AI Service (Terminal 1) and Ngrok Tunnel (Terminal 2) to go online.

### How it works:
1. **Your RTX 4050 GPU** runs the AI models locally (SD 1.5, ControlNet, Qwen 2.5 7B LLM) on port 8000.
2. **Ngrok** creates a permanent HTTPS tunnel from `https://concerned-dominoes-debtor.ngrok-free.dev` → `localhost:8000`.
3. **Vercel** has `AI_SERVICE_URL=https://concerned-dominoes-debtor.ngrok-free.dev` saved permanently. Every API call from Vercel goes through ngrok straight to your GPU.

### ❓ Why isn't it connected by default on Vercel?
1. **Local vs Cloud**: Vercel runs on cloud servers in AWS data centers. When Vercel tries to call `http://localhost:8000`, `localhost` points to Vercel's empty cloud container, NOT your laptop!
2. **Ngrok bridges this gap**: Your permanent ngrok domain routes Vercel's requests through the internet to your PC.
3. **When your PC is off**, the tunnel is down and Vercel's status badge shows **Amber (Offline)**. Start Terminal 1 + Terminal 2 to go back online.

---

### 📋 Vercel Environment Variables (Already Set — No Changes Needed):

| Variable | Value |
|---|---|
| `AI_SERVICE_URL` | `https://concerned-dominoes-debtor.ngrok-free.dev` |
| `AI_SERVICE_SECRET` | `forensix_ai_secret_dev_2026` |

---

### 💡 Alternative Tunnel Providers (Optional)

If you ever want to use a different provider instead of ngrok:

#### Cloudflare Named Tunnel (Permanent Free Domain with Custom Domain)
1. Sign up for free at [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) -> **Networks** -> **Tunnels** -> **Create a tunnel**.
2. Name it `forensix-ai` and copy the tunnel token.
3. Save the token in `ai-service\.env`:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi...
   ```
4. Point the public hostname in Cloudflare to `http://localhost:8000` (e.g. `ai.yourdomain.com`).
5. Set `AI_SERVICE_URL=https://ai.yourdomain.com` in Vercel **ONCE**.

#### Localtunnel with Fixed Subdomain
```powershell
.\start-gpu-worker.ps1 -TunnelProvider localtunnel -Subdomain forensix-gpu-madhan
```
Sets your URL permanently to `https://forensix-gpu-madhan.loca.lt`!

---

> 📖 **Deep Dive Architecture & Flowcharts:** See [HYBRID_GPU_CLOUD_ARCHITECTURE.md](./HYBRID_GPU_CLOUD_ARCHITECTURE.md) for full architectural sequence diagrams, security specs, and troubleshooting.

---

*Forensix — RTX 4050 6GB · Node v24 · Python 3.11 · Windows 11*

