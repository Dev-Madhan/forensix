# 🔬 Forensix — Sketch Generator Workflow

<p align="center">
  <img src="https://img.shields.io/badge/System-Forensix%20AI%20Composite-7952b3?style=for-the-badge&logo=probot&logoColor=white" />
  <img src="https://img.shields.io/badge/Pipeline-Dual--Stage%20(LLM%20+%20Diffusion)-4c1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Hardware-RTX%204050%206GB%20(FP16)-007acc?style=for-the-badge&logo=nvidia&logoColor=white" />
  <img src="https://img.shields.io/badge/Datasets-CelebAMask--HQ%20+%20FS2K-ff69b4?style=for-the-badge" />
</p>

---

## 🧭 Visual System Blueprint

```mermaid
graph TB
    subgraph UI_LAYER["🖥️ INTERACTIVE UI LAYER (/sketch)"]
        direction TB
        UI1["1️⃣ Witness Statement Card<br/><b>Natural Language Transcript</b>"]
        UI2["2️⃣ Facial Taxonomy Sidebar<br/><b>CelebAMask-HQ Coordinate Anchors</b>"]
        UI3["3️⃣ Interactive Canvas<br/><b>High-Res Pencil Composite + Inspection</b>"]
        UI4["4️⃣ Investigation Dossier<br/><b>Confidence & Morphological Report</b>"]
    end

    subgraph ORCHESTRATION["⚡ BACKEND ORCHESTRATOR (:8000)"]
        direction TB
        ORCH["<b>sketch_service.py</b><br/>Multi-Stage Event Coordinator"]
        SCORER["<b>Prompt Quality Scorer</b><br/>Completeness Metric: 0 – 100%"]
        GEO["<b>Geometry Service</b><br/>Normalized 2D Cranial Anchors"]
        REASON["<b>Forensic LLM Engine</b><br/>13-Priority Attention-Weighted Compiler"]
    end

    subgraph AI_MODELS["🤖 DEEP LEARNING MODEL ZOO"]
        direction TB
        subgraph NLP_STAGE["STAGE 1: THE BRAIN"]
            M_QWEN["<b>Qwen 2.5 (7B / 1.5B)</b><br/>Taxonomy NLP Parser"]
        end
        subgraph DIFF_STAGE["STAGE 2: THE HAND"]
            M_SD["<b>Stable Diffusion 1.5</b><br/>Latent Diffusion Backbone (FP16)"]
            M_LORA["<b>Forensic LoRA (Rank-64)</b><br/>FS2K + CelebAMask-HQ Weights"]
        end
        subgraph BIO_STAGE["STAGE 3: RECOGNITION"]
            M_FACE["<b>InsightFace (buffalo_l)</b><br/>512D Biometric Embedder"]
        end
    end

    subgraph STORAGE_LAYER["🗄️ PERSISTENCE & MATCHING"]
        DB_PG[("<b>PostgreSQL + pgvector</b><br/>Suspect Mugshot Database")]
        IMG_FS[("<b>Local Output Cache</b><br/>ai-service/outputs/*.png")]
    end

    %% UI Connections
    UI1 -->|POST /api/v1/witness/process| M_QWEN
    M_QWEN -->|Extracted JSON Attributes| UI2
    UI2 -->|Parameters + Sliders| ORCH

    %% Processing Pipeline
    ORCH --> SCORER
    SCORER --> REASON
    ORCH --> GEO
    REASON -->|Calibrated CLIP Prompts| M_SD
    GEO -->|2D Spatial Anchors| M_SD

    %% Synthesis Connections
    M_SD -.->|Injects Fine-Tuned Layers| M_LORA
    M_LORA -->|Synthesized Sketch .PNG| IMG_FS
    IMG_FS --> UI3
    REASON --> UI4

    %% Biometrics
    UI3 --> M_FACE
    M_FACE -->|Cosine Vector Query| DB_PG
```

---

## 🖥️ Screen Layout & Interactive Wireframe

```
+---------------------------------------------------------------------------------------------------------+
|  🔬 FORENSIX — FORENSIC FACIAL COMPOSITE SUITE                               [RTX 4050 6GB] [Status: OK] |
+----------------------------------------------------+----------------------------------------------------+
|  PANEL 1: WITNESS INPUT & TAXONOMY                 |  PANEL 2: SYNTHESIS CANVAS & ANALYSIS             |
|                                                    |                                                    |
|  ┌──────────────────────────────────────────────┐  |  ┌──────────────────────────────────────────────┐  |
|  │ 1. Witness Statement (Natural Language)      │  |  │ 3. Interactive Forensic Canvas               │  |
|  │ "Adult male, late 20s, sharp jawline,        │  |  │                                              │  |
|  │  pointy nose, bushy brows, 5 o'clock stubble"│  |  │           ┌──────────────────────┐             │  |
|  │                                              │  |  │           │  [Composite Sketch]  │             │  |
|  │  [⚡ Extract Facial Attributes (Qwen)]       │  |  │           │   Authentic 2B       │             │  |
|  └──────────────────────────────────────────────┘  |  │           │   Graphite Lineart   │             │  |
|                                                    |  │           │   (512 x 512 FP16)   │             │  |
|  ┌──────────────────────────────────────────────┐  |  │           └──────────────────────┘             │  |
|  │ 2. Facial Taxonomy (CelebAMask-HQ Anchors)   │  |  │  [🔍 Zoom] [↔ Pan] [📐 Toggle Landmark Overlay]│  |
|  │  • Face Structure : [ Square Jawline     ▼ ] │  |  └──────────────────────────────────────────────┘  |
|  │  • Eye Contour    : [ Narrow Slender     ▼ ] │                                                    |
|  │  • Nose Bridge    : [ Pointed Sharp      ▼ ] │  ┌──────────────────────────────────────────────┐  |
|  │  • Lip Volume     : [ Full Lips          ▼ ] │  │ 4. Anatomical Reasoning & Confidence Dossier    │  |
|  │  • Facial Hair    : [ 5 o'Clock Shadow   ▼ ] │  │  • Quality Score   : [ 94.2% Completeness ]     │  |
|  │  • Gender / Age   : [ Male ▼ ] [ 20-30 ▼ ]   │  │  • Primary Medium  : Forensic Graphite (Pencil) │  |
|  │                                              │  │  • Geometry Drift  : 0.8% (Exact Alignment)     │  |
|  │  [🎨 Generate Forensic Composite Sketch]     │  │  • Suspect Matches : 3 Identities Found (>85%)   │  |
|  └──────────────────────────────────────────────┘  |  └──────────────────────────────────────────────┘  |
+----------------------------------------------------+----------------------------------------------------+
```

---

## ⚡ The 4-Phase Generation Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Witness as 👤 Witness / Investigator
    participant UI as 🖥️ Web UI (/sketch)
    participant Qwen as 🧠 Qwen 2.5 LLM
    participant Engine as ⚙️ Forensic Engine
    participant SD as 🎨 SD 1.5 + LoRA
    participant DB as 🗄️ pgvector DB

    Note over Witness,Qwen: PHASE 1: WITNESS STATEMENT NLP EXTRACTION
    Witness->>UI: Types raw statement ("Male, 20s, square jaw, pointed nose, stubble...")
    UI->>Qwen: Dispatches statement to /api/v1/witness/process
    Qwen-->>UI: Emits validated JSON (face_shape, nose_tip, facial_hair, etc.)

    Note over UI,Engine: PHASE 2: TAXONOMY CALIBRATION & REASONING
    Witness->>UI: Adjusts sidebar sliders (CelebAMask-HQ landmark anchors)
    Witness->>UI: Clicks "Generate Forensic Composite"
    UI->>Engine: Sends attributes to /api/v1/sketch/generate
    Engine->>Engine: Scores prompt quality & builds 13-Level Weighted CLIP Tokens

    Note over Engine,SD: PHASE 3: LATENT DIFFUSION SYNTHESIS
    Engine->>SD: Passes Positive Prompt, Hardened Negative, DDIM (28 steps, CFG 9.0)
    Note over SD: Denoises latent space with fine-tuned Rank-64 LoRA weights
    SD-->>UI: Transmits rendered high-precision pencil sketch (.png)

    Note over UI,DB: PHASE 4: BIOMETRIC MATCHING & DOSSIER
    UI->>DB: InsightFace extracts 512D vector & runs Cosine Similarity Query
    DB-->>UI: Returns top suspect mugshots & renders Case Dossier
```

---

## 🤖 Model Comparison Matrix

| Model | Architecture | Checkpoint / Weights | VRAM Profile | Forensic Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Qwen 2.5** | Autoregressive Decoder | `qwen2.5-7b-instruct-q4_k_m.gguf` (4.68 GB) | CPU / 4.5 GB RAM | **The Brain:** Parses ambiguous natural language witness statements into structured schema. |
| **Stable Diffusion 1.5** | Latent Diffusion Model (UNet + VAE + CLIP) | `runwayml/stable-diffusion-v1-5` (3.97 GB FP16) | ~3.8 GB VRAM | **The Hand:** Synthesizes the core visual composite image via 512×512 iterative denoising. |
| **Forensic LoRA** | PEFT Low-Rank Adapter (Rank-64, Alpha-64) | `forensic_sketch_lora_v2.safetensors` (51 MB) | +120 MB VRAM | **The Artist:** Restricts generation strictly to authentic 2B pencil strokes trained on FS2K & CelebAMask-HQ. |
| **ControlNet** *(Opt.)* | Zero-Convolution Lineart Guide | `control_v11p_sd15_lineart` (1.45 GB) | ~1.2 GB VRAM | **The Ruler:** Locks pixel boundaries to structural facial lineart edges. |
| **InsightFace** | ResNet-50 ArcFace Biometric Extractor | `buffalo_l / w600k_r50.onnx` (250 MB) | System CPU / RAM | **The Investigator:** Extracts 512-dim facial identity vector to match mugshot databases. |

---

## 🧬 Anatomical Attribute Binding: From Text to Canvas

```mermaid
classDiagram
    class RawWitnessText {
        +String statement
        "Male in late 20s, sharp jaw, pointy nose, thick bushy eyebrows, stubble"
    }

    class QwenTaxonomy {
        +gender: "male"
        +estimated_age: "20-30"
        +face_shape: "square"
        +eyebrows_thickness: "thick"
        +nose_tip: "pointed"
        +facial_hair: "5_o_clock_shadow"
    }

    class CelebAMaskGeometry {
        +left_eye: [0.38, 0.40]
        +right_eye: [0.62, 0.40]
        +nose_tip: [0.50, 0.58]
        +jaw_width: 0.78 (Expanded)
        +chin_apex: [0.50, 0.84]
    }

    class CLIPPromptWeighting {
        +Priority_0_Style: "(forensic graphite pencil sketch:1.4)"
        +Priority_2_Face: "(square strong jawline:1.3)"
        +Priority_3_Brows: "(thick bushy dense eyebrows:1.35)"
        +Priority_4_Nose: "(pointed sharp nose:1.35)"
        +Priority_7_Beard: "(heavy 5 o'clock shadow stubble:1.35)"
        +Negative_Suppression: "(color:1.5), (photograph:1.5), (robot:1.8)"
    }

    class OutputDrawing {
        +Medium: 2B Graphite on Paper
        +Resolution: 512 x 512 px
        +Symmetry: Forensic Calibrated
    }

    RawWitnessText --> QwenTaxonomy : NLP Extraction
    QwenTaxonomy --> CelebAMaskGeometry : Coordinate Mapping
    QwenTaxonomy --> CLIPPromptWeighting : Token Compilation
    CelebAMaskGeometry --> OutputDrawing : Spatial Constraint
    CLIPPromptWeighting --> OutputDrawing : Diffusion Conditioning
```

---

## 🚻 Male vs. Female Morphological Tuning

The fine-tuned pipeline applies distinct biological parameters based on the gender selector:

| Feature | 👨 Male Configuration | 👩 Female Configuration |
| :--- | :--- | :--- |
| **Mandibular Angle** | Broad horizontal base, acute gonial angle (`square_jawline:1.3`) | Tapering curved bone definition (`oval_face_shape:1.3`) |
| **Orbital & Brow Ridge** | Dense, straight brow texture (`thick_bushy_eyebrows:1.35`) | High-set, organic arch curve (`naturally_arched_eyebrows:1.3`) |
| **Facial Hair Handling** | Stubble, mustache, goatee, or sideburn tokens active | Forced negative token: `(clean-shaven face:1.5), (no facial hair:1.6)` |
| **Cranial Geometry** | Lower face height expanded by 4.2% | Mid-face cheeks elevated; softer chin apex |
| **Vermilion Borders** | Medium compression, neutral commissures | Voluminous vermilion borders (`cupid_bow_lips:1.4`) |

---

## ⚡ 6GB VRAM Allocation Map (RTX 4050)

```
0 GB               2 GB               4 GB               5 GB         6 GB [LIMIT]
┌──────────────────┬──────────────────┬──────────┬───────┬────────────┐
│ Stable Diffusion │ Forensic LoRA    │ Working  │ Py-   │ SAFETY     │
│ 1.5 UNet (FP16)  │ Rank-64 Weights  │ Latent   │ Torch │ HEADROOM   │
│ [ ~2.4 GB ]      │ [ ~120 MB ]      │ Space    │ Cache │ [ ~1.2 GB ]│
└──────────────────┴──────────────────┴──────────┴───────┴────────────┘
 * Offloaded to System RAM when idle: Text Encoder, VAE, Qwen LLM, InsightFace.
 * Active Peak GPU Usage during generation: 4.65 GB / 6.00 GB (100% stable, zero OOM).
```

---

## 📂 Code Reference Directory

* **Frontend Page:** [`src/app/sketch/page.tsx`](file:///d:/Madhan%20Kumar/Web%20Development%20Projects/forensix/src/app/sketch/page.tsx)
* **Interactive State:** [`src/components/sketch/sketch-context.tsx`](file:///d:/Madhan%20Kumar/Web%20Development%20Projects/forensix/src/components/sketch/sketch-context.tsx)
* **Sidebar Controls:** [`src/components/sketch/facial-attributes-editor.tsx`](file:///d:/Madhan%20Kumar/Web%20Development%20Projects/forensix/src/components/sketch/facial-attributes-editor.tsx)
* **Backend Coordinator:** [`ai-service/app/services/sketch_service.py`](file:///d:/Madhan%20Kumar/Web%20Development%20Projects/forensix/ai-service/app/services/sketch_service.py)
* **13-Level Prompt Engine:** [`ai-service/app/services/forensic_llm_engine.py`](file:///d:/Madhan%20Kumar/Web%20Development%20Projects/forensix/ai-service/app/services/forensic_llm_engine.py)
* **CelebA 2D Geometry:** [`ai-service/app/services/geometry_service.py`](file:///d:/Madhan%20Kumar/Web%20Development%20Projects/forensix/ai-service/app/services/geometry_service.py)
* **Diffusion Provider:** [`ai-service/app/providers/sketch/diffusion_local.py`](file:///d:/Madhan%20Kumar/Web%20Development%20Projects/forensix/ai-service/app/providers/sketch/diffusion_local.py)
