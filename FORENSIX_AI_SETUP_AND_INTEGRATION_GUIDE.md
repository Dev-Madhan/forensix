# Criminal Eye --- AI Model Setup, Wiring & Next.js Integration

> **Complete local AI setup guide**
>
> **Target machine:** Windows • AMD Ryzen 7 7435HS • 24 GB RAM • NVIDIA
> RTX 4050 Laptop GPU • 6 GB VRAM

------------------------------------------------------------------------

## 0. Executive Overview

This guide defines the local AI stack for **Criminal Eye** and explains
how to download, configure, wire, test, and run the AI components with
the existing Next.js application.

The recommended architecture is:

``` text
Next.js 16
    │
    ▼
Next.js Server Route / Server Action
    │
    ▼
FastAPI AI Service :8000
    │
    ├── Witness Processing
    │       │
    │       ▼
    │   Qwen3-8B Q4_K_M
    │   llama.cpp :8001
    │       │
    │       ▼
    │   Structured Facial Attributes
    │
    └── Sketch Generation
            │
            ▼
      Geometry / Components
            │
            ▼
        Line-art Guide
            │
            ▼
   ControlNet Lineart + SD 1.5
            │
            ▼
       PNG + Metadata
            │
            ▼
         Next.js UI
```

### Core principle

Do **not** use a single prompt-to-image call.

Criminal Eye needs controlled facial feature placement, so the system
separates:

1.  **Language understanding** --- Qwen extracts observable facial
    attributes.
2.  **Geometry/control** --- the application converts attributes into
    structured facial geometry.
3.  **Rendering** --- ControlNet + Stable Diffusion renders the
    structural guide as a sketch.
4.  **Human review** --- the investigator reviews and can edit the
    extracted attributes before generation.

> **Responsible-use boundary:** A generated sketch is a reconstruction
> aid, not proof of identity or guilt. Keep human review in the workflow
> and do not treat a similarity score or generated image as an
> autonomous determination.

------------------------------------------------------------------------

# 1. Hardware-Aware Model Strategy

Your development machine has:

-   **CPU:** AMD Ryzen 7 7435HS
-   **RAM:** 24 GB
-   **GPU:** NVIDIA GeForce RTX 4050 Laptop GPU
-   **VRAM:** 6 GB

The 6 GB VRAM limit is the most important constraint.

## Recommended local stack

  Component            Recommendation
  -------------------- -----------------------------------------
  LLM                  **Qwen3-8B Q4_K_M GGUF**
  LLM runtime          **llama.cpp**
  Diffusion base       **Stable Diffusion 1.5**
  Structural control   **ControlNet Lineart for SD1.5**
  Facial geometry      **MediaPipe Face Landmarker**
  API layer            **FastAPI**
  Frontend             **Existing Next.js 16 application**
  Dataset              **FS2K + your component dataset layer**

### Do not start with

-   Qwen3-8B BF16 on the GPU
-   Qwen3.6-27B locally on this GPU
-   FLUX-class large checkpoints
-   Multiple ControlNets
-   1024×1024 generation
-   Batch generation
-   Large-model training

For this machine, prioritize **stable inference and a clean
architecture** before optimization or training.

------------------------------------------------------------------------

# 2. Official Download Sources

Use first-party repositories and documentation.

## Qwen

-   **Qwen3-8B GGUF:**\
    https://huggingface.co/Qwen/Qwen3-8B-GGUF
-   **Exact Q4_K_M file:**\
    https://huggingface.co/Qwen/Qwen3-8B-GGUF/blob/main/Qwen3-8B-Q4_K_M.gguf

## llama.cpp

-   **Official releases:**\
    https://github.com/ggml-org/llama.cpp/releases
-   **Installation documentation:**\
    https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md

## Stable Diffusion

-   **Stable Diffusion 1.5:**\
    https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5

## ControlNet

-   **ControlNet Lineart:**\
    https://huggingface.co/lllyasviel/control_v11p_sd15_lineart
-   **Diffusers ControlNet documentation:**\
    https://huggingface.co/docs/diffusers/main/en/using-diffusers/controlnet

## MediaPipe

-   **Face Landmarker for Python:**\
    https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/python

## FS2K

-   **Official repository:**\
    https://github.com/DengPingFan/FS2K

## Hugging Face

-   **Hugging Face CLI:**\
    https://huggingface.co/docs/huggingface_hub/guides/cli

## PyTorch

-   **Official local installation selector:**\
    https://pytorch.org/get-started/locally/

## FastAPI

-   **First steps:**\
    https://fastapi.tiangolo.com/tutorial/first-steps/

------------------------------------------------------------------------

# 3. Project Structure

The AI service should be a separate application inside the Criminal Eye
repository.

``` text
criminal-eye/
├── app/                         # Next.js application
├── components/
├── features/
├── hooks/
├── lib/
├── actions/
├── services/
├── schemas/
├── types/
├── utils/
├── config/
├── constants/
├── styles/
│
├── prisma/
│
└── ai-service/
    ├── app/
    │   ├── main.py
    │   │
    │   ├── api/
    │   │   └── v1/
    │   │       ├── health.py
    │   │       ├── witness.py
    │   │       └── sketch.py
    │   │
    │   ├── core/
    │   │   ├── config.py
    │   │   └── logging.py
    │   │
    │   ├── schemas/
    │   │   ├── witness.py
    │   │   └── sketch.py
    │   │
    │   ├── services/
    │   │   ├── witness_service.py
    │   │   ├── geometry_service.py
    │   │   └── sketch_service.py
    │   │
    │   └── providers/
    │       ├── qwen_provider.py
    │       ├── geometry_provider.py
    │       └── diffusion_provider.py
    │
    ├── models/
    │   ├── qwen/
    │   ├── sd15/
    │   ├── controlnet/
    │   └── mediapipe/
    │
    ├── datasets/
    │   ├── FS2K/
    │   └── components/
    │
    ├── outputs/
    ├── tests/
    ├── requirements.txt
    └── .env
```

------------------------------------------------------------------------

# 4. Windows Environment Setup

## 4.1 Verify the machine

Open PowerShell:

``` powershell
python --version
git --version
nvidia-smi
node --version
pnpm --version
```

You should be able to see the RTX 4050 in:

``` powershell
nvidia-smi
```

------------------------------------------------------------------------

## 4.2 Create the AI service

From the Criminal Eye repository root:

``` powershell
mkdir ai-service
cd ai-service
```

Create a Python 3.11 virtual environment:

``` powershell
py -3.11 -m venv .venv
```

Activate it:

``` powershell
.\.venv\Scripts\Activate.ps1
```

Upgrade the Python packaging tools:

``` powershell
python -m pip install --upgrade pip setuptools wheel
```

> Keep the Python environment completely separate from the Next.js/pnpm
> environment.

------------------------------------------------------------------------

# 5. Create AI Service Directories

From `ai-service`:

``` powershell
mkdir app
mkdir app\api
mkdir app\api\v1
mkdir app\core
mkdir app\schemas
mkdir app\services
mkdir app\providers

mkdir models
mkdir models\qwen
mkdir models\sd15
mkdir models\controlnet
mkdir models\mediapipe

mkdir datasets
mkdir datasets\FS2K
mkdir outputs
mkdir tests
```

------------------------------------------------------------------------

# 6. Python Dependencies

Create:

``` text
ai-service/requirements.txt
```

Use:

``` text
fastapi
uvicorn[standard]
pydantic
pydantic-settings
httpx
python-multipart
pillow
opencv-python
numpy
mediapipe
transformers
accelerate
diffusers[torch]
safetensors
huggingface_hub
```

Install:

``` powershell
python -m pip install -r requirements.txt
```

## PyTorch

Install the current CUDA-enabled Windows build from the official PyTorch
selector:

https://pytorch.org/get-started/locally/

Do not blindly copy an old CUDA command from an unrelated tutorial.

Verify the installation:

``` powershell
python -c "import torch; print('torch:', torch.__version__); print('cuda:', torch.cuda.is_available()); print('gpu:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

Expected:

``` text
cuda: True
gpu: NVIDIA GeForce RTX 4050 Laptop GPU
```

------------------------------------------------------------------------

# 7. Qwen3-8B Q4_K_M

## 7.1 Why Qwen3-8B Q4_K_M?

Qwen is responsible for converting witness language into structured
facial attributes.

The pipeline is:

``` text
Witness Description
        ↓
      Qwen
        ↓
FacialAttributes JSON
        ↓
Validation
        ↓
Geometry
```

For a 6 GB GPU, **Q4_K_M GGUF** is the practical starting point.

Do not load the BF16 model directly onto the GPU.

------------------------------------------------------------------------

# 8. Install llama.cpp

On Windows:

``` powershell
winget install llama.cpp
```

Verify:

``` powershell
llama --help
```

If the command is not immediately recognized, restart PowerShell so the
updated PATH is loaded.

Official installation documentation:

https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md

------------------------------------------------------------------------

# 9. Run Qwen Locally

Start the OpenAI-compatible llama.cpp server:

``` powershell
llama serve -hf Qwen/Qwen3-8B-GGUF:Q4_K_M --host 127.0.0.1 --port 8001
```

Keep this terminal running.

Qwen is now available at:

``` text
http://127.0.0.1:8001
```

The OpenAI-compatible chat endpoint is:

``` text
http://127.0.0.1:8001/v1/chat/completions
```

> **Security:** Keep the server bound to `127.0.0.1` during local
> development. The browser should never call port `8001` directly.

------------------------------------------------------------------------

# 10. Test Qwen

Open a second PowerShell terminal.

``` powershell
$body = @{
  model = "Qwen3-8B-GGUF"
  messages = @(
    @{
      role = "user"
      content = "Return only JSON: {`"face_shape`":`"oval`"}"
    }
  )
  temperature = 0.1
} | ConvertTo-Json -Depth 8

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8001/v1/chat/completions" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

If Qwen returns a response, the LLM layer is working.

------------------------------------------------------------------------

# 11. Qwen Prompt Contract

Qwen should **not** generate the sketch.

It should only extract observable characteristics.

Recommended system instruction:

``` text
SYSTEM:

Extract only observable facial characteristics from the witness description.

Return JSON matching the supplied schema.

Do not identify a person.
Do not determine guilt.
Do not invent missing attributes.
Use "unknown" when the description is insufficient.

The output must contain only the requested structured facial attributes.
```

Example:

``` text
USER:

The person had a long oval face, narrow almond-shaped eyes,
thick arched eyebrows, a long straight narrow nose with a
rounded tip, thin upper lips, medium lower lips, a medium
rounded jaw and a rounded chin.
```

Expected structured result:

``` json
{
  "face_shape": "oval",
  "eyes": {
    "shape": "almond",
    "size": "unknown",
    "spacing": "unknown",
    "tilt": "unknown"
  },
  "eyebrows": {
    "thickness": "thick",
    "shape": "arched"
  },
  "nose": {
    "bridge": "straight",
    "length": "long",
    "width": "narrow",
    "tip": "rounded"
  },
  "mouth": {
    "width": "unknown",
    "upper_lip": "thin",
    "lower_lip": "medium"
  },
  "jaw": {
    "width": "medium",
    "shape": "rounded"
  },
  "chin": {
    "size": "unknown",
    "shape": "rounded"
  }
}
```

------------------------------------------------------------------------

# 12. Facial Attribute Schema

Create a strict schema rather than accepting arbitrary LLM output.

## Suggested structure

``` json
{
  "face_shape": "oval",
  "eyes": {
    "shape": "almond",
    "size": "medium",
    "spacing": "normal",
    "tilt": "neutral"
  },
  "eyebrows": {
    "thickness": "medium",
    "shape": "arched"
  },
  "nose": {
    "bridge": "straight",
    "length": "long",
    "width": "narrow",
    "tip": "rounded"
  },
  "mouth": {
    "width": "medium",
    "upper_lip": "thin",
    "lower_lip": "medium"
  },
  "jaw": {
    "width": "medium",
    "shape": "rounded"
  },
  "chin": {
    "size": "medium",
    "shape": "rounded"
  }
}
```

## Controlled vocabulary

  Region        Example values
  ------------- ------------------------------------
  Face          oval, round, square, oblong, heart
  Eyes          almond, round, narrow
  Eye size      small, medium, large
  Eye spacing   close, normal, wide
  Eye tilt      up, neutral, down
  Eyebrows      thin, medium, thick
  Brow shape    straight, arched
  Nose bridge   straight, convex, concave
  Nose width    narrow, medium, wide
  Nose length   short, medium, long
  Nose tip      pointed, rounded, broad
  Mouth width   narrow, medium, wide
  Lips          thin, medium, full
  Jaw           narrow, medium, wide
  Jaw shape     angular, rounded
  Chin          small, medium, large
  Chin shape    pointed, rounded, square

------------------------------------------------------------------------

# 13. Geometry Layer

This is the most important architectural layer for controlled
generation.

The geometry service converts:

``` text
FacialAttributes
        ↓
Normalized Coordinates
        ↓
Feature Placement
        ↓
Line-art Guide
```

Example:

``` json
{
  "canvas": {
    "width": 512,
    "height": 512
  },
  "anchors": {
    "left_eye": [0.36, 0.40],
    "right_eye": [0.64, 0.40],
    "nose_tip": [0.50, 0.58],
    "mouth": [0.50, 0.70],
    "chin": [0.50, 0.86]
  }
}
```

## Why this matters

If an investigator changes:

``` text
nose.width = wide
```

the system should not randomly move:

-   eye spacing
-   mouth position
-   jaw width
-   chin position

The geometry layer creates this separation.

------------------------------------------------------------------------

# 14. Component Dataset Structure

Create:

``` text
datasets/
├── components/
│   ├── eyes/
│   │   ├── narrow/
│   │   ├── almond/
│   │   └── round/
│   │
│   ├── eyebrows/
│   ├── noses/
│   │   ├── straight/
│   │   ├── broad/
│   │   └── narrow/
│   │
│   ├── mouths/
│   ├── jaws/
│   └── face_shapes/
│
└── metadata/
    ├── dataset_manifest.json
    └── splits.json
```

This becomes the foundation for future component-aware training.

------------------------------------------------------------------------

# 15. Stable Diffusion 1.5

Download:

``` text
stable-diffusion-v1-5/stable-diffusion-v1-5
```

Official repository:

https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5

Using the Hugging Face CLI:

``` powershell
hf --help
```

If authentication is required:

``` powershell
hf auth login
```

Download:

``` powershell
hf download stable-diffusion-v1-5/stable-diffusion-v1-5 `
  --local-dir .\models\sd15
```

Verify:

``` powershell
Get-ChildItem .\models\sd15 -Recurse | Select-Object FullName
```

------------------------------------------------------------------------

# 16. ControlNet Lineart

Use the SD1.5-compatible Lineart ControlNet:

``` text
lllyasviel/control_v11p_sd15_lineart
```

Official repository:

https://huggingface.co/lllyasviel/control_v11p_sd15_lineart

Download:

``` powershell
hf download lllyasviel/control_v11p_sd15_lineart `
  --local-dir .\models\controlnet\lineart
```

Verify:

``` powershell
Get-ChildItem .\models\controlnet\lineart -Recurse | Select-Object FullName
```

> **Compatibility rule:** Use an SD1.5 ControlNet with an SD1.5 base
> model. Do not mix SDXL ControlNet checkpoints into this pipeline.

------------------------------------------------------------------------

# 17. Diffusers Pipeline

Start with:

-   FP16
-   512×512
-   Batch size 1
-   20--30 steps
-   One ControlNet
-   CPU offload
-   Attention slicing

Example:

``` python
import torch

from diffusers import (
    ControlNetModel,
    StableDiffusionControlNetPipeline,
)

controlnet = ControlNetModel.from_pretrained(
    "./models/controlnet/lineart",
    torch_dtype=torch.float16,
)

pipe = StableDiffusionControlNetPipeline.from_pretrained(
    "./models/sd15",
    controlnet=controlnet,
    torch_dtype=torch.float16,
    safety_checker=None,
)

pipe.enable_model_cpu_offload()
pipe.enable_attention_slicing()
```

Start generation at:

``` text
width = 512
height = 512
batch = 1
steps = 20–30
```

------------------------------------------------------------------------

# 18. Correct Diffusion Test Order

Do not debug everything simultaneously.

Use this sequence:

### Test 1 --- Stable Diffusion only

``` text
SD1.5
  ↓
Prompt
  ↓
Image
```

### Test 2 --- Add ControlNet

``` text
Lineart Guide
      ↓
ControlNet + SD1.5
      ↓
Image
```

### Test 3 --- Add your geometry layer

``` text
Facial Attributes
      ↓
Geometry
      ↓
Lineart Guide
      ↓
ControlNet
      ↓
SD1.5
      ↓
Sketch
```

This makes debugging dramatically easier.

------------------------------------------------------------------------

# 19. MediaPipe Face Landmarker

Install:

``` powershell
python -m pip install mediapipe
```

Official documentation:

https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/python

Store the compatible task model at:

``` text
ai-service/
└── models/
    └── mediapipe/
        └── face_landmarker.task
```

Example initialization:

``` python
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

base_options = python.BaseOptions(
    model_asset_path="./models/mediapipe/face_landmarker.task"
)

options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    num_faces=1,
)

landmarker = vision.FaceLandmarker.create_from_options(options)
```

Use landmarks for:

-   geometry
-   feature positioning
-   structural conditioning

Do not treat landmark output as an identity verdict.

------------------------------------------------------------------------

# 20. FS2K Dataset

The official FS2K repository describes **2,104 face/sketch pairs** and
provides current download instructions.

Official repository:

https://github.com/DengPingFan/FS2K

Recommended raw structure:

``` text
datasets/
└── FS2K/
    ├── photo/
    │   ├── photo1/
    │   ├── photo2/
    │   └── photo3/
    │
    ├── sketch/
    │   ├── sketch1/
    │   ├── sketch2/
    │   └── sketch3/
    │
    ├── anno_train.json
    ├── anno_test.json
    └── README.pdf
```

Recommended derived structure:

``` text
datasets/
├── raw/
│   └── FS2K/
│
├── processed/
│   ├── train/
│   ├── val/
│   └── test/
│
└── metadata/
    ├── dataset_manifest.json
    └── splits.json
```

## Dataset rules

-   Validate photo/sketch pairing.
-   Keep train/validation/test splits deterministic.
-   Never train on the test set.
-   Record source and version information.
-   Review the current dataset terms before redistribution.
-   Do not assume FS2K provides every eyes/nose/mouth label needed by
    your custom taxonomy.

------------------------------------------------------------------------

# 21. FastAPI AI Service

FastAPI is the orchestration boundary.

It should connect:

``` text
Next.js
   ↓
FastAPI
   ├── Qwen Provider
   ├── Geometry Provider
   └── Diffusion Provider
```

------------------------------------------------------------------------

# 22. FastAPI Environment Variables

Create:

``` text
ai-service/.env
```

Use:

``` env
AI_HOST=127.0.0.1
AI_PORT=8000

QWEN_BASE_URL=http://127.0.0.1:8001/v1
QWEN_MODEL=Qwen3-8B-GGUF

SD_MODEL_PATH=./models/sd15
CONTROLNET_MODEL_PATH=./models/controlnet/lineart

MEDIAPIPE_MODEL_PATH=./models/mediapipe/face_landmarker.task

OUTPUT_DIR=./outputs

NEXTJS_ORIGIN=http://localhost:3000
```

------------------------------------------------------------------------

# 23. FastAPI Entry Point

Create:

``` text
ai-service/app/main.py
```

Example:

``` python
from fastapi import FastAPI

app = FastAPI(
    title="Criminal Eye AI Service",
    version="0.1.0",
)


@app.get("/api/v1/health")
def health():
    return {
        "status": "ok",
        "service": "criminal-eye-ai",
    }
```

Run:

``` powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open:

``` text
http://127.0.0.1:8000/api/v1/health
```

Expected:

``` json
{
  "status": "ok",
  "service": "criminal-eye-ai"
}
```

------------------------------------------------------------------------

# 24. FastAPI API Contract

## Health

``` http
GET /api/v1/health
```

Purpose:

``` text
Check whether the service is alive.
```

------------------------------------------------------------------------

## Readiness

``` http
GET /api/v1/health/ready
```

Purpose:

``` text
Check whether required dependencies/models are ready.
```

------------------------------------------------------------------------

## Witness processing

``` http
POST /api/v1/witness/process
```

Request:

``` json
{
  "text": "Long oval face, narrow almond eyes, long straight nose..."
}
```

Response:

``` json
{
  "attributes": {
    "face_shape": "oval",
    "eyes": {},
    "eyebrows": {},
    "nose": {},
    "mouth": {},
    "jaw": {},
    "chin": {}
  },
  "warnings": []
}
```

------------------------------------------------------------------------

## Sketch generation

``` http
POST /api/v1/sketch/generate
```

Request:

``` json
{
  "attributes": {},
  "seed": 184729,
  "resolution": 512,
  "steps": 24,
  "control_strength": 0.85
}
```

Response:

``` json
{
  "job_id": "uuid",
  "status": "completed",
  "image_url": "/api/v1/sketches/uuid/image",
  "metadata": {
    "llm_model": "Qwen3-8B-Q4_K_M",
    "diffusion_model": "stable-diffusion-v1-5",
    "controlnet_model": "control_v11p_sd15_lineart"
  }
}
```

------------------------------------------------------------------------

# 25. Qwen Provider

Create:

``` text
ai-service/app/providers/qwen_provider.py
```

Example:

``` python
import httpx


class QwenProvider:
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def complete(
        self,
        system_prompt: str,
        user_text: str,
    ) -> str:

        payload = {
            "model": self.model,
            "temperature": 0.1,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_text,
                },
            ],
        }

        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                json=payload,
            )

            response.raise_for_status()

            return response.json()["choices"][0]["message"]["content"]
```

------------------------------------------------------------------------

# 26. Provider Architecture

Use replaceable providers:

``` text
providers/
├── qwen_provider.py
├── geometry_provider.py
└── diffusion_provider.py
```

## Qwen Provider

``` text
Witness text
    ↓
Qwen
    ↓
Raw JSON
```

## Validation

``` text
Raw JSON
    ↓
Pydantic
    ↓
FacialAttributes
```

## Geometry Provider

``` text
FacialAttributes
    ↓
Normalized geometry
    ↓
Line-art guide
```

## Diffusion Provider

``` text
Line-art guide
    +
Controlled prompt
    ↓
ControlNet
    ↓
SD1.5
    ↓
PNG
```

## Sketch Service

``` text
Qwen
  ↓
Validation
  ↓
Geometry
  ↓
ControlNet
  ↓
Diffusion
  ↓
Metadata
  ↓
Result
```

------------------------------------------------------------------------

# 27. Next.js Integration

The browser should **not** call FastAPI or llama.cpp directly.

Recommended:

``` text
Browser
   ↓
Next.js Server Route
   ↓
FastAPI
   ↓
AI Models
```

This provides:

-   cleaner security boundaries
-   no browser CORS dependency
-   hidden internal service URLs
-   easier authentication
-   centralized error handling

------------------------------------------------------------------------

# 28. Next.js Environment Variable

Inside the existing Next.js project:

``` text
.env.local
```

Add:

``` env
AI_SERVICE_URL=http://127.0.0.1:8000
```

Do **not** use:

``` env
NEXT_PUBLIC_AI_SERVICE_URL=...
```

The AI service URL should remain server-side.

------------------------------------------------------------------------

# 29. Next.js Witness Route

Create:

``` text
app/api/ai/witness/route.ts
```

Example:

``` typescript
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const upstream = await fetch(
    `${process.env.AI_SERVICE_URL}/api/v1/witness/process`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  const data = await upstream.json();

  return NextResponse.json(data, {
    status: upstream.status,
  });
}
```

------------------------------------------------------------------------

# 30. Next.js Client Call

Your UI can now call:

``` typescript
const response = await fetch("/api/ai/witness", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: witnessDescription,
  }),
});

if (!response.ok) {
  throw new Error("AI processing failed");
}

const result = await response.json();
```

The browser only sees:

``` text
/api/ai/witness
```

It never sees:

``` text
:8001
```

------------------------------------------------------------------------

# 31. Recommended Investigation UI Flow

The best UX is:

``` text
1. Witness Description
        ↓
2. Process with AI
        ↓
3. Extracted Facial Attributes
        ↓
4. Investigator Review / Edit
        ↓
5. Generate Sketch
        ↓
6. Generation Progress
        ↓
7. Sketch Preview
        ↓
8. Regenerate / Refine
        ↓
9. Save Selected Sketch
        ↓
10. Attach to Case
```

This review step is important because an LLM can misunderstand natural
language.

------------------------------------------------------------------------

# 32. Complete Local Runtime

Run the system using **three PowerShell terminals**.

## Terminal 1 --- Qwen

``` powershell
cd <CRIMINAL_EYE>\ai-service

llama serve -hf Qwen/Qwen3-8B-GGUF:Q4_K_M `
  --host 127.0.0.1 `
  --port 8001
```

Keep running.

------------------------------------------------------------------------

## Terminal 2 --- FastAPI

``` powershell
cd <CRIMINAL_EYE>\ai-service

.\.venv\Scripts\Activate.ps1

uvicorn app.main:app `
  --host 127.0.0.1 `
  --port 8000 `
  --reload
```

Keep running.

------------------------------------------------------------------------

## Terminal 3 --- Next.js

``` powershell
cd <CRIMINAL_EYE>

pnpm dev
```

Open the Next.js application:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# 33. Complete Runtime Flow

## Witness processing

``` text
Browser
  │
  ▼
Next.js :3000
  │
  ▼
/api/ai/witness
  │
  ▼
FastAPI :8000
  │
  ▼
Qwen :8001
  │
  ▼
FacialAttributes JSON
  │
  ▼
FastAPI
  │
  ▼
Next.js
  │
  ▼
Attribute Editor
```

## Sketch generation

``` text
Browser
  │
  ▼
Next.js
  │
  ▼
FastAPI
  │
  ▼
Geometry
  │
  ▼
Line-art Guide
  │
  ▼
ControlNet
  │
  ▼
Stable Diffusion 1.5
  │
  ▼
PNG
  │
  ▼
FastAPI
  │
  ▼
Next.js
  │
  ▼
Sketch Preview
```

------------------------------------------------------------------------

# 34. First End-to-End Test

Use a neutral test description:

``` text
The person had a long oval face, narrow almond-shaped eyes
with normal spacing, thick arched eyebrows, a long straight
narrow nose with a rounded tip, thin upper lips, medium lower
lips, a medium rounded jaw and a rounded chin.
```

Expected sequence:

``` text
1. Next.js sends witness text.
2. FastAPI receives the request.
3. FastAPI calls Qwen.
4. Qwen returns structured attributes.
5. Pydantic validates the result.
6. Next.js displays the attributes.
7. User reviews/edits the attributes.
8. FastAPI creates geometry.
9. Geometry produces a line-art guide.
10. ControlNet receives the guide.
11. SD1.5 renders the sketch.
12. PNG is saved.
13. Seed/model metadata is recorded.
```

------------------------------------------------------------------------

# 35. Save Intermediate Artifacts

During development, keep:

``` text
outputs/
├── attributes/
├── geometry/
├── lineart/
├── sketches/
└── metadata/
```

This allows you to identify exactly where a failure occurred.

For example:

``` text
Bad final image
      ↓
Was JSON correct?
      ↓
Was geometry correct?
      ↓
Was line-art correct?
      ↓
Did ControlNet follow it?
      ↓
Did SD1.5 render it correctly?
```

Never debug the entire pipeline blindly.

------------------------------------------------------------------------

# 36. RTX 4050 6 GB Performance Plan

  Component     Start with       Avoid initially
  ------------- ---------------- -------------------------------------
  Qwen          Q4_K_M GGUF      BF16/FP16 GPU load
  SD            FP16             Full precision
  Resolution    512×512          1024×1024
  Batch         1                \>1
  Steps         20--30           60--100
  ControlNet    One Lineart      Multiple ControlNets
  Concurrency   One generation   Parallel generations
  Scheduling    Sequential       Both models heavily resident on GPU

------------------------------------------------------------------------

# 37. Sequential GPU Policy

The safest local runtime is:

``` text
Qwen request
    ↓
Return attributes
    ↓
Release/minimize Qwen GPU usage
    ↓
Geometry on CPU
    ↓
Load/use SD1.5 + ControlNet
    ↓
Generate one image
    ↓
Save PNG + metadata
    ↓
Release temporary tensors
```

Do not attempt to keep every model permanently loaded on the 6 GB GPU.

------------------------------------------------------------------------

# 38. CUDA Out-of-Memory Troubleshooting

If you receive:

``` text
CUDA out of memory
```

check these first:

1.  Resolution is `512×512`.
2.  Batch size is `1`.
3.  Only one generation runs at a time.
4.  Qwen is not consuming GPU memory simultaneously.
5.  CPU offload is enabled.
6.  Attention slicing is enabled.
7.  You are not loading multiple ControlNets.
8.  Restart the FastAPI process if repeated experiments cause memory
    fragmentation.

Do not immediately increase complexity.

------------------------------------------------------------------------

# 39. Storage Management

Model files, Hugging Face caches, datasets and generated outputs can
consume significant disk space.

Recommended:

``` text
models/
datasets/
outputs/
```

Keep one canonical copy of each model.

Monitor the Hugging Face cache regularly.

------------------------------------------------------------------------

# 40. Testing Matrix

  Test         Pass condition
  ------------ ---------------------------------------
  NVIDIA       `nvidia-smi` sees RTX 4050
  PyTorch      `torch.cuda.is_available()` is `True`
  Qwen         localhost:8001 responds
  Schema       Invalid values are rejected
  MediaPipe    Landmarks are returned
  SD1.5        512×512 image generates
  ControlNet   Structural guide affects output
  FastAPI      `/health` works
  Readiness    `/health/ready` works
  Next.js      Server route reaches FastAPI
  End-to-end   Witness → attributes → sketch works

------------------------------------------------------------------------

# 41. Common Problems

## Problem: CUDA OOM

**Likely cause:** Too much GPU memory usage.

**Action:**

``` text
512×512
batch=1
CPU offload
attention slicing
sequential execution
```

------------------------------------------------------------------------

## Problem: Qwen returns invalid JSON

**Likely cause:** The model added explanatory prose.

**Action:**

-   Lower temperature.
-   Strengthen the system prompt.
-   Validate with Pydantic.
-   Reject invalid responses.
-   Use a bounded repair/retry path.

------------------------------------------------------------------------

## Problem: ControlNet appears ignored

**Likely cause:** The structural guide is weak or incorrect.

**Action:**

1.  Inspect the line-art guide.
2.  Test ControlNet independently.
3.  Tune conditioning strength only after the guide is correct.

------------------------------------------------------------------------

## Problem: Browser CORS error

**Likely cause:** The browser is calling FastAPI directly.

**Action:**

Use:

``` text
Browser
   ↓
Next.js Server Route
   ↓
FastAPI
```

not:

``` text
Browser
   ↓
FastAPI
```

------------------------------------------------------------------------

# 42. Metadata & Reproducibility

Every generated sketch should record enough information to reproduce or
audit the generation.

Recommended metadata:

``` json
{
  "sketch_id": "uuid",
  "schema_version": "1.0",
  "llm_model": "Qwen3-8B-Q4_K_M",
  "diffusion_model": "stable-diffusion-v1-5",
  "controlnet_model": "control_v11p_sd15_lineart",
  "seed": 184729,
  "steps": 24,
  "resolution": 512,
  "control_strength": 0.85,
  "created_at": "ISO-8601"
}
```

This becomes especially important for:

-   debugging
-   reports
-   regeneration
-   academic evaluation
-   audit trails

------------------------------------------------------------------------

# 43. Phase 7 Upgrade Path

Do not start training before the baseline pipeline works.

Recommended order:

``` text
A. Stable Qwen attribute extraction
        ↓
B. Stable deterministic geometry
        ↓
C. Stable SD1.5 + ControlNet baseline
        ↓
D. LoRA adaptation
        ↓
E. Component-aware conditioning
        ↓
F. Quantitative + human evaluation
```

------------------------------------------------------------------------

# 44. LoRA Direction

Once the baseline works, use a legally usable and consistently styled
sketch dataset to adapt the rendering style.

Recommended concept:

``` text
Stable Diffusion 1.5
        +
Criminal Eye LoRA
        +
ControlNet
        ↓
Target sketch style
```

Keep the base model unchanged.

Record:

-   LoRA version
-   training configuration
-   dataset version
-   model version
-   generation seed

------------------------------------------------------------------------

# 45. Component-Aware Generation

The long-term architecture should be:

``` text
Witness Description
        ↓
Qwen
        ↓
Facial Attributes
        ↓
Component Selection
        ↓
Component Placement
        ↓
Face Geometry
        ↓
Line-art Guide
        ↓
ControlNet
        ↓
SD1.5 + Criminal Eye LoRA
        ↓
Forensic-style Sketch
```

This is stronger than generic text-to-image generation because it
explicitly models feature-level control.

------------------------------------------------------------------------

# 46. Evaluation Targets

Measure more than visual quality.

## Attribute fidelity

Do the requested features appear correctly?

``` text
Requested:
narrow nose

Generated:
narrow nose
```

## Geometric stability

Change one feature:

``` text
nose.width
```

and verify that unrelated features remain as stable as possible.

## Style fidelity

Does the output match the intended sketch style?

## Reproducibility

Can the same model versions and seed reproduce a comparable result?

## Human review

Can evaluators understand whether the intended facial attributes are
represented?

------------------------------------------------------------------------

# 47. Security

Criminal Eye may process witness descriptions, images and potentially
biometric information.

Treat this data as sensitive.

## Local development

-   Bind Qwen to `127.0.0.1`.
-   Do not expose port `8001`.
-   Do not expose model endpoints to the browser.

## Production

-   Authenticate FastAPI.
-   Validate uploaded files.
-   Validate MIME types.
-   Validate file sizes.
-   Validate image dimensions.
-   Use generated storage names.
-   Avoid logging raw witness descriptions by default.
-   Store model/version metadata.
-   Use authenticated or signed access to generated files.

------------------------------------------------------------------------

# 48. Licensing

Before redistribution or deployment, review the current license/terms
for:

-   Qwen
-   Stable Diffusion 1.5
-   ControlNet
-   FS2K
-   MediaPipe
-   Any future LoRA/dataset

Keep a model/dataset manifest:

``` text
metadata/
└── dataset_manifest.json
```

Record:

``` text
name
version
source
license/terms
download date
checksum
usage notes
```

------------------------------------------------------------------------

# 49. Final Definition of Done

-   [ ] RTX 4050 is visible to the NVIDIA driver.
-   [ ] Python 3.11 virtual environment works.
-   [ ] CUDA-enabled PyTorch is verified.
-   [ ] Qwen3-8B Q4_K_M runs through llama.cpp.
-   [ ] Qwen endpoint responds on port 8001.
-   [ ] FastAPI starts on port 8000.
-   [ ] FastAPI health endpoint works.
-   [ ] FastAPI readiness endpoint works.
-   [ ] Facial attributes pass strict schema validation.
-   [ ] MediaPipe Face Landmarker works.
-   [ ] Geometry layer produces normalized feature placement.
-   [ ] SD1.5 generates a 512×512 image.
-   [ ] ControlNet Lineart follows the structural guide.
-   [ ] Next.js proxies requests to FastAPI server-side.
-   [ ] Browser never calls port 8001 directly.
-   [ ] Investigator can review/edit attributes before generation.
-   [ ] Generated sketch stores seed and model metadata.
-   [ ] FS2K is acquired using the official repository instructions.
-   [ ] Component dataset structure is documented.
-   [ ] Baseline pipeline is stable before LoRA training.
-   [ ] Recognition remains a separate, human-reviewed downstream
    function.

------------------------------------------------------------------------

# 50. Quick Start --- Every Command in One Place

## Terminal 1 --- Qwen

``` powershell
cd <CRIMINAL_EYE>\ai-service

llama serve -hf Qwen/Qwen3-8B-GGUF:Q4_K_M `
  --host 127.0.0.1 `
  --port 8001
```

## Terminal 2 --- FastAPI

``` powershell
cd <CRIMINAL_EYE>\ai-service

.\.venv\Scripts\Activate.ps1

uvicorn app.main:app `
  --host 127.0.0.1 `
  --port 8000 `
  --reload
```

## Terminal 3 --- Next.js

``` powershell
cd <CRIMINAL_EYE>

pnpm dev
```

## Final runtime

``` text
http://localhost:3000
        │
        ▼
Next.js
        │
        ▼
FastAPI :8000
        │
        ├───────────────┐
        ▼               ▼
 Qwen :8001        Geometry
                        │
                        ▼
                  ControlNet
                        │
                        ▼
                    SD1.5
                        │
                        ▼
                     Sketch
```

------------------------------------------------------------------------

# 51. Official References

-   Qwen3-8B GGUF: https://huggingface.co/Qwen/Qwen3-8B-GGUF
-   Qwen3-8B Q4_K_M:
    https://huggingface.co/Qwen/Qwen3-8B-GGUF/blob/main/Qwen3-8B-Q4_K_M.gguf
-   llama.cpp: https://github.com/ggml-org/llama.cpp
-   Stable Diffusion 1.5:
    https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
-   ControlNet Lineart:
    https://huggingface.co/lllyasviel/control_v11p_sd15_lineart
-   FS2K: https://github.com/DengPingFan/FS2K
-   MediaPipe Face Landmarker:
    https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/python
-   Hugging Face CLI:
    https://huggingface.co/docs/huggingface_hub/guides/cli
-   Diffusers: https://huggingface.co/docs/diffusers/installation
-   PyTorch: https://pytorch.org/get-started/locally/
-   FastAPI: https://fastapi.tiangolo.com/tutorial/first-steps/

------------------------------------------------------------------------

## Final Architecture

``` text
                    CRIMINAL EYE
                         │
                         ▼
                ┌─────────────────┐
                │    Next.js UI   │
                │  Review / Edit  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   Next.js API   │
                │ Server Boundary │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  FastAPI :8000  │
                │  AI Orchestrator│
                └───────┬─────────┘
                        / \
                       /   \
                      ▼     ▼
             ┌──────────┐  ┌──────────────┐
             │ Qwen     │  │ Geometry     │
             │ Q4_K_M   │  │ Components   │
             │ :8001    │  └──────┬───────┘
             └────┬─────┘         │
                  │               ▼
                  │        ┌──────────────┐
                  └───────►│  Line-art    │
                           │    Guide     │
                           └──────┬───────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │   ControlNet   │
                         │    Lineart     │
                         └───────┬────────┘
                                 │
                                 ▼
                         ┌────────────────┐
                         │ Stable Diffusion│
                         │      1.5       │
                         └───────┬────────┘
                                 │
                                 ▼
                         ┌────────────────┐
                         │ Sketch + Meta   │
                         └────────────────┘
```

> **Build order:** Get the baseline inference pipeline working first.
> Then add component-level control, LoRA/style adaptation, and
> eventually the downstream face-recognition/embedding pipeline
> described in the Criminal Eye roadmap.
