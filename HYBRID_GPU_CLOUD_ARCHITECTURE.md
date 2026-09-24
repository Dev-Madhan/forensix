# ⚡ Forensix — Hybrid GPU Cloud Architecture

> **Bridging Local NVIDIA RTX 4050 GPU Neural Synthesis with Vercel Production Deployments**  
> *Stack: Next.js 16 (Vercel) · Cloudflare Edge Tunnel (QUIC) · FastAPI · Stable Diffusion 1.5 + ControlNet · Qwen 2.5 LLM*

---

## 1. Executive Summary

Forensix operates on a **Hybrid Cloud-Edge Architecture**:
- **Cloud Layer (Vercel):** Hosts the production Next.js frontend, authentication, database connections (Neon PostgreSQL), and serverless API proxy routes with global low-latency CDN distribution.
- **Edge GPU Worker (Local PC):** Runs heavy PyTorch generative AI pipelines (SD 1.5, ControlNet Lineart, Qwen 2.5 LLM) locally on an **NVIDIA GeForce RTX 4050 6GB Laptop GPU**.
- **Secure Cloud Bridge (Cloudflare Tunnel):** Seamlessly bridges the two environments over an encrypted, outbound QUIC tunnel without port forwarding, dynamic DNS, or public IP exposure.

```
┌───────────────────────────────────────────────────────────┐
│                    GLOBAL CLOUD LAYER                     │
│                                                           │
│  [ Forensic Officer ]                                     │
│         │ (HTTPS)                                         │
│         ▼                                                 │
│  [ Vercel Production App ] ─── (Neon Cloud PostgreSQL)    │
│  https://forensix-sketch.vercel.app                       │
│         │                                                 │
│         ▼ (POST /api/ai/sketch | maxDuration = 60s)       │
│  [ Vercel Serverless Function ]                           │
└─────────┼─────────────────────────────────────────────────┘
          │ (Encrypted HTTPS via AI_SERVICE_URL)
          ▼
┌───────────────────────────────────────────────────────────┐
│                  CLOUDFLARE EDGE NETWORK                  │
│                                                           │
│  [ Cloudflare Edge Tunnel ]                               │
│  https://xxxx.trycloudflare.com                           │
└─────────┼─────────────────────────────────────────────────┘
          │ (Encrypted Outbound QUIC/TLS Tunnel)
          ▼
┌───────────────────────────────────────────────────────────┐
│                 LOCAL EDGE GPU WORKER (PC)                │
│                                                           │
│  [ cloudflared.exe Daemon ]                               │
│         │                                                 │
│         ▼ (Forward to http://localhost:8000)              │
│  [ FastAPI Microservice ] (Uvicorn :8000)                 │
│         │                                                 │
│         ▼                                                 │
│  [ NVIDIA GeForce RTX 4050 6GB GPU ]                      │
│   ├── Stable Diffusion 1.5 (FP16)                         │
│   ├── ControlNet v1.1 Lineart Guidance                    │
│   ├── DPM++ 2M Karras Latent Diffusion Scheduler         │
│   └── Qwen 2.5 7B LLM (GGUF Q4_K_M)                       │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Why Traditional Local AI Fails on Vercel

When developing locally (`http://localhost:3000`), the browser and Next.js backend both share the same machine as FastAPI (`http://localhost:8000`).

However, moving to cloud hosting triggers three major architectural hurdles:

### The Network Disconnect
Vercel executes Next.js server routes inside ephemeral cloud serverless containers (AWS Lambda / GCP microVMs). In that cloud container, `localhost:8000` refers to the container itself, **not your laptop**. Any attempt to call `http://localhost:8000` throws an immediate `ECONNREFUSED` error.

### The 15-Second Vercel Timeout Barrier
By default, Vercel Serverless Functions have an execution duration limit of **15 seconds** (formerly 10s on Hobby). A full generative diffusion pass on a 6GB GPU takes:
- **Cold start (loading weights into VRAM):** ~40–50 seconds
- **Standard pass (24 steps):** ~14–18 seconds
- **Master pass (36 steps):** ~22–30 seconds

Without specific duration unlocks, Vercel terminates the function midway with `504 FUNCTION_INVOCATION_TIMEOUT`.

### Home Router & ISP NAT Firewalls
Home internet connections sit behind carrier-grade NAT (CGNAT) and dynamic IP pools. Traditional port forwarding exposes home networks to external port scans, DDoS attacks, and requires manual router configuration.

---

## 3. End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Forensic Officer / User
    participant Browser as Browser (forensix-sketch.vercel.app)
    participant Vercel as Vercel Serverless (/api/ai/sketch)
    participant CF as Cloudflare Edge Tunnel
    participant LocalFastAPI as Local FastAPI AI Service (:8000)
    participant GPU as RTX 4050 GPU (SD 1.5 + ControlNet)

    Note over LocalFastAPI,GPU: 1. SYSTEM INITIALIZATION
    LocalFastAPI->>GPU: Pre-warm pipeline (load FP16 weights into VRAM)
    LocalFastAPI->>CF: Establish outbound QUIC tunnel
    CF-->>LocalFastAPI: Public URL assigned (*.trycloudflare.com)

    Note over Officer,Browser: 2. LIVE HEALTH CHECK
    Browser->>Vercel: GET /api/ai/health
    Vercel->>CF: Query /api/v1/health
    CF->>LocalFastAPI: Forward health probe
    LocalFastAPI-->>Browser: Status: OK -> UI renders "GPU Online" badge

    Note over Officer,Browser: 3. SKETCH SYNTHESIS TRIGGER
    Officer->>Browser: Selects facial features and clicks "Generate Sketch"
    Browser->>Vercel: POST /api/ai/sketch (JSON Payload)

    Note over Vercel,CF: 4. CLUSTER PROXY (maxDuration = 60s)
    Vercel->>Vercel: Synthesize forensic prompt + negative prompt tokens
    Vercel->>CF: POST to AI_SERVICE_URL with X-AI-Secret & bypass headers
    CF->>LocalFastAPI: Forward to http://localhost:8000/api/v1/sketch/generate

    Note over LocalFastAPI,GPU: 5. LOCAL HARDWARE INFERENCE
    LocalFastAPI->>LocalFastAPI: Validate X-AI-Secret (constant-time check)
    LocalFastAPI->>GPU: Run DPM++ 2M Karras diffusion (12-18 seconds)
    GPU-->>LocalFastAPI: Generated 512x512 PNG saved to disk
    LocalFastAPI-->>CF: JSON response { image: { url: "/outputs/CASE/WIT.png" } }

    Note over CF,Browser: 6. RESPONSE PACKAGING & DELIVERY
    CF-->>Vercel: Stream response payload
    Vercel->>CF: Fetch raw PNG image bytes from local output path
    CF->>LocalFastAPI: Stream PNG file bytes
    LocalFastAPI-->>Vercel: Return raw binary PNG
    Vercel->>Vercel: Encode PNG bytes to base64 Data URI
    Vercel-->>Browser: JSON { image: { url: "data:image/png;base64,..." } }
    Browser-->>Officer: Render authentic pencil sketch + toast confirmation
```

---

## 4. Key Architectural Implementations

### A. Vercel Execution Duration Unlock
All AI proxy routes in Next.js configure `maxDuration = 60` and `dynamic = "force-dynamic"`. This gives Vercel serverless functions up to 60 seconds to wait for your RTX 4050 GPU to finish inference.

- `src/app/api/ai/sketch/route.ts`
- `src/app/api/ai/health/route.ts`
- `src/app/api/ai/witness/route.ts`
- `src/app/api/ai/recognition/route.ts`

### B. Tunnel Interstitial Bypass Headers
Many tunnel services (like ngrok or localtunnel) intercept automated requests with HTML warning pages ("Click to continue"). We inject custom headers into all requests in `src/services/ai/client.ts` and `src/app/api/ai/sketch/route.ts`:
```typescript
headers: {
  "bypass-tunnel-reminder": "true",
  "ngrok-skip-browser-warning": "true",
  "X-AI-Secret": aiSecret,
  "X-Request-ID": requestId,
}
```

### C. Background VRAM Pre-Warming
Loading 4GB of SD 1.5 and ControlNet weights from disk to GPU VRAM takes ~40 seconds on cold start. In `ai-service/app/main.py`, FastAPI starts a background warmup thread inside its `lifespan`:
```python
if settings.SKETCH_PROVIDER == "diffusion_local":
    def _warm_up():
        from app.services.sketch_service import sketch_service
        sketch_service.provider._ensure_pipeline()
    threading.Thread(target=_warm_up, daemon=True).start()
```
When user requests arrive, weights are **already warm in VRAM**, dropping generation latency to 12–18 seconds.

### D. CORS Wildcard for Vercel
In `ai-service/app/main.py`, the CORS middleware includes an origin regex matching preview and production Vercel domains:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "Content-Type"],
)
```

### E. Live UI Connection Indicator
`src/components/sketch/composite-sketch-header.tsx` actively polls `/api/ai/health` every 30 seconds.
- 🟢 **`GPU Online`** (with green pulse): Local RTX 4050 GPU worker is reachable and warm.
- 🟡 **`GPU Offline`**: Local worker is sleeping or tunnel is disconnected; the app will use Strategy 3 procedural fallback.

---

## 5. Daily Operation Guide

### Step 1 — Start the Local GPU Worker
In PowerShell, run the unified launcher script:
```powershell
cd "d:\Madhan Kumar\Web Development Projects\forensix"
.\start-gpu-worker.ps1
```

The script will:
1. Validate PyTorch CUDA GPU access (`NVIDIA GeForce RTX 4050 Laptop GPU`).
2. Start the Uvicorn FastAPI server on `http://localhost:8000`.
3. Pre-warm the neural pipeline in VRAM.
4. Launch the Cloudflare tunnel and print your public HTTPS URL:
   ```
   https://longitude-four-contest-cork.trycloudflare.com
   ```

### Step 2 — Configure Vercel
1. Open your **[Vercel Dashboard](https://vercel.com/dashboard)** ➔ select **forensix**.
2. Go to **Settings** ➔ **Environment Variables**.
3. Set:
   - `AI_SERVICE_URL` = `https://your-tunnel-url.trycloudflare.com`
   - `AI_SERVICE_SECRET` = `forensix_ai_secret_dev_2026`
4. Save and trigger a **Redeploy**.

---

## 6. Security & Isolation Model

1. **Zero Open Ports:** Cloudflare Tunnel operates strictly via **outbound connections** over QUIC (port 7844 / UDP) or HTTPS (port 443 / TCP). Your home router requires zero open inbound ports.
2. **Constant-Time Secret Authentication:** Every request from Vercel to your local machine must present the `X-AI-Secret` header, verified via Python's `secrets.compare_digest()` to eliminate timing attacks.
3. **Data URI Encoding:** Output images are fetched by Vercel server-to-server and packaged as Base64 Data URIs (`data:image/png;base64,...`). Your local machine's IP address and internal network topology are never exposed to the client's browser.

---

## 7. Troubleshooting Matrix

| Symptom | Cause | Solution |
|---|---|---|
| **Header shows "GPU Offline"** | FastAPI or Cloudflare Tunnel is not running on your PC. | Run `.\start-gpu-worker.ps1` in PowerShell. |
| **Generation produces SVG diagram instead of PNG sketch** | AI microservice was unreachable, so Strategy 3 procedural fallback activated. | Verify that `AI_SERVICE_URL` in Vercel matches your active tunnel URL. |
| **504 Gateway Timeout on Vercel** | Model is still loading from disk or detail level took > 60s. | Ensure `export const maxDuration = 60` is in `route.ts` and models are pre-warmed. |
| **Port 8000 already in use** | A previous Uvicorn process is still running. | Run `Get-Process python \| Stop-Process -Force` then restart `start-gpu-worker.ps1`. |
| **CUDA Out of Memory (OOM)** | VRAM fragmentation from multiple concurrent tasks. | `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` is enabled in `ai-service\.env`. Close external games or 3D apps. |
