# Criminal Eye / Forensix --- Dataset Installation & Integration Guide

> **Datasets:** CelebAMask-HQ + FS2K\
> **Purpose:** Establish the research-data foundation for the Criminal
> Eye forensic sketch pipeline.\
> **Target:** `ai-service/datasets/`\
> **Platform:** Windows + Python/FastAPI + local AI workflow

------------------------------------------------------------------------

## 1. Dataset Strategy

Criminal Eye uses two complementary datasets:

  -----------------------------------------------------------------------
  Dataset                             Role
  ----------------------------------- -----------------------------------
  **CelebAMask-HQ**                   Facial component segmentation,
                                      parsing, structure, geometry and
                                      component-reference development

  **FS2K**                            Paired photo--sketch research,
                                      sketch-domain learning and
                                      evaluation
  -----------------------------------------------------------------------

They should **not** be treated as interchangeable.

``` text
CelebAMask-HQ
      ↓
Facial Parsing / Component Masks
      ↓
Normalized Components + Geometry
      ↓
                         ┌────────────────┐
                         │  Criminal Eye  │
                         │   Data Layer   │
                         └───────┬────────┘
                                 ↓
FS2K ─────────→ Photo ↔ Sketch Learning / Evaluation
                                 ↓
                       Control Representation
                                 ↓
                  ControlNet + Stable Diffusion
                                 ↓
                       Forensic Sketch
```

------------------------------------------------------------------------

# 2. Official Download Links

## 2.1 CelebAMask-HQ

**Official project page**

https://mmlab.ie.cuhk.edu.hk/projects/CelebA/CelebAMask_HQ.html

**Official GitHub repository**

https://github.com/switchablenorms/CelebAMask-HQ

CelebAMask-HQ contains **30,000 high-resolution face images** with
manually annotated **512×512 masks covering 19 facial/component
classes**.

### License warning

CelebAMask-HQ is provided for **non-commercial research purposes only**.
Do not redistribute the dataset or commercially exploit its images or
derived data. Review the official agreement before using it outside the
academic/research context.

------------------------------------------------------------------------

## 2.2 FS2K

**Official GitHub repository**

https://github.com/DengPingFan/FS2K

The official repository provides the dataset download information for
**photo + sketch + annotation**.

FS2K contains **2,104 photo--sketch pairs**:

-   Training: **1,058**
-   Testing: **1,046**

It also provides attributes such as hair condition, hair color, gender,
earring, smile, frontal-face status and sketch style.

**Research paper**

https://arxiv.org/abs/2112.15439

**Optional implementation reference**

https://github.com/DengPingFan/FSGAN

> **Important:** Use the official FS2K repository as the authoritative
> download source. Avoid random third-party re-uploads.

------------------------------------------------------------------------

# 3. Current Project & Dataset Architecture

### 3.1 High-Level Project Architecture

The Forensix (Criminal Eye) platform operates as a decoupled dual-stack system combining the Next.js full-stack web application with the localized FastAPI AI microservice:

``` text
forensix/
├── src/                                     # Next.js 16 Full-Stack Application Layer
│   ├── app/                                 # App Router (pages, layouts, route handlers)
│   │   ├── dashboard/                       # Cases, Criminal Registry & Audit Hub
│   │   ├── sketch/                          # Forensic Sketch Studio & Canvas
│   │   └── api/                             # Server-side route handlers & AI proxy
│   ├── components/                          # UI primitives (@base-ui/react) & case components
│   ├── features/                            # Domain slices (cases, criminals, evidence, audit)
│   ├── lib/                                 # Singletons, auth client, db client
│   └── services/                            # AI microservice client and HTTP contracts
│
├── prisma/                                  # Database Layer (PostgreSQL)
│   └── schema.prisma                        # Schemas for Cases, Witnesses, Sketches, Criminals
│
├── public/                                  # Static media & demonstration assets
│   └── images/                              # Brand marks, suspect mugshots, test sketches
│
├── ai-service/                              # Hardware-Optimized FastAPI AI Microservice
│   ├── app/                                 # FastAPI microservice core (/api/v1)
│   │   ├── api/v1/                          # Witness, Sketch & Recognition endpoints
│   │   ├── core/                            # Configuration, logging, auth security
│   │   ├── providers/                       # Local model provider adapters
│   │   └── schemas/                         # Pydantic V2 validation schemas
│   ├── models/                              # Local model weights (Qwen, SD1.5, ControlNet, MediaPipe)
│   ├── outputs/                             # Generation artifacts (sketches, attributes, landmarks)
│   ├── scripts/                             # Startup scripts (start-all.ps1, start-llama.ps1, etc.)
│   ├── tests/                               # Pytest automated test suite
│   ├── .cache_downloads/                    # Cached archives & binary packages
│   └── datasets/                            # Forensic Research & Training Datasets (detailed below)
│
└── PROJECT_STRUCTURE.md                     # Deep technical repository documentation
```

---

### 3.2 Current Dataset Architecture (`ai-service/datasets/`)

The research dataset layer under `ai-service/datasets/` has been established and aligned with verified data:

``` text
ai-service/
└── datasets/
    │
    ├── raw/                                 # [INSTALLED & VERIFIED] Original research datasets
    │   ├── CelebAMask-HQ/                   # High-resolution face parsing dataset
    │   │   ├── images/                      # 30,000 JPEG images (0.jpg - 29999.jpg, 1024×1024 RGB)
    │   │   ├── masks/                       # 15 subdirectories (0 - 14) containing 372,776 component masks (512×512)
    │   │   │   ├── 0/                       # Masks for images 00000 - 01999 (skin, nose, eyes, hair, etc.)
    │   │   │   ├── 1/                       # Masks for images 02000 - 03999
    │   │   │   └── ... (up to 14/)
    │   │   ├── CelebA-HQ-to-CelebA-mapping.txt # CelebA-HQ to original CelebA identifier mapping
    │   │   ├── CelebAMask-HQ-attribute-anno.txt # 40 binary facial attribute annotations
    │   │   ├── CelebAMask-HQ-pose-anno.txt  # Head pose orientation annotations (yaw, pitch, roll)
    │   │   ├── README.txt                   # Original distribution documentation & citation
    │   │   └── README.md                    # Forensix dataset documentation
    │   │
    │   └── FS2K/                            # Paired photo-sketch evaluation benchmark
    │       ├── photo/                       # 2,104 high-resolution face photographs
    │       │   ├── photo1/                  # Style 1 photographic source images
    │       │   ├── photo2/                  # Style 2 photographic source images
    │       │   └── photo3/                  # Style 3 photographic source images
    │       ├── sketch/                      # 2,104 paired forensic sketches
    │       │   ├── sketch1/                 # Style 1 artist sketches
    │       │   ├── sketch2/                 # Style 2 artist sketches
    │       │   └── sketch3/                 # Style 3 artist sketches
    │       ├── anno_train.json              # Official training split (1,058 paired items + attributes)
    │       ├── anno_test.json               # Official testing split (1,046 paired items + attributes)
    │       ├── README.pdf                   # Official FS2K publication & release documentation
    │       └── README.md                    # Forensix dataset documentation
    │
    ├── processed/                           # [SCAFFOLDED] Phase 7 preprocessing targets
    │   ├── CelebAMask-HQ/
    │   │   ├── components/                  # Isolated facial feature crops (eyes, nose, mouth, jaw)
    │   │   ├── geometry/                    # Extracted 2D landmark coordinates & anchor vectors
    │   │   └── normalized/                  # Resolution and illumination-normalized images
    │   │
    │   └── FS2K/
    │       ├── aligned/                     # Aligned photo-sketch pairs
    │       ├── normalized/                  # Lineart-normalized sketches
    │       └── metadata/                    # Standardized attribute mappings
    │
    ├── components/                          # [ESTABLISHED TAXONOMY] Curated forensic feature references
    │   ├── eyebrows/                        # Eyebrow shape references (.gitkeep)
    │   ├── eyes/                            # Eye geometry (almond, narrow, round)
    │   ├── face_shapes/                     # Facial contour references (.gitkeep)
    │   ├── jaws/                            # Chin and jawline templates (.gitkeep)
    │   ├── mouths/                          # Lip and mouth templates (.gitkeep)
    │   └── noses/                           # Nose structures (broad, narrow, straight)
    │
    └── metadata/                            # [INITIALIZED] Dataset manifests & splits
        ├── dataset_manifest.json            # Component taxonomy, model definitions, and licensing
        └── splits.json                      # Partition declarations

```

### Architecture Rules & Status

-   **`raw/`** = Original downloaded research datasets (**CelebAMask-HQ** & **FS2K** installed, verified, and active).
-   **`processed/`** = Criminal Eye preprocessing pipelines target output (directories scaffolded).
-   **`components/`** = Curated/derived facial feature taxonomy for composite assembly.
-   **`metadata/`** = Dataset definitions, splits, and schema manifests.
-   **Git Exclusion:** `ai-service/datasets/raw/` and `ai-service/datasets/processed/` are explicitly excluded from Git to prevent large binary tracking.
-   **Do not put these datasets under `models/` or `public/`.**

------------------------------------------------------------------------

# 4. Prerequisites

From the project root:

``` powershell
cd ai-service
```

Create the Python environment if it does not already exist:

``` powershell
python -m venv .venv
```

Activate:

``` powershell
.\.venv\Scripts\Activate.ps1
```

Upgrade tooling:

``` powershell
python -m pip install --upgrade pip setuptools wheel
```

Verify:

``` powershell
python --version
pip --version
```

------------------------------------------------------------------------

# 5. Create Dataset Directories

From `ai-service/`:

``` powershell
New-Item -ItemType Directory -Force -Path `
  datasets\raw\CelebAMask-HQ, `
  datasets\raw\FS2K, `
  datasets\processed\CelebAMask-HQ, `
  datasets\processed\FS2K, `
  datasets\components, `
  datasets\metadata
```

Verify:

``` powershell
Get-ChildItem datasets
```

Expected:

``` text
datasets/
├── raw/
├── processed/
├── components/
└── metadata/
```

------------------------------------------------------------------------

# 6. Install CelebAMask-HQ

### Step 1 --- Open the official source

https://mmlab.ie.cuhk.edu.hk/projects/CelebA/CelebAMask_HQ.html

or:

https://github.com/switchablenorms/CelebAMask-HQ

Use the download provided by the official project.

### Step 2 --- Download

Download the archive to a temporary location such as:

``` text
ai-service/.cache_downloads/CelebAMask-HQ/
```

Do not extract directly into `processed/`.

### Step 3 --- Extract

Place the original dataset under:

``` text
ai-service/datasets/raw/CelebAMask-HQ/
```

Preserve the source layout as much as possible.

### Step 4 --- Verify

Confirm:

-   image files exist
-   segmentation annotations exist
-   files can be opened
-   no archive extraction errors occurred
-   the raw data has not been modified

------------------------------------------------------------------------

# 7. Install FS2K

### Step 1 --- Open the official repository

https://github.com/DengPingFan/FS2K

### Step 2 --- Download

Use the official dataset download information in the repository.

### Step 3 --- Extract

Place the dataset under:

``` text
ai-service/datasets/raw/FS2K/
```

The official repository documents the expected structure:

``` text
FS2K/
├── photo/
│   ├── photo1/
│   ├── photo2/
│   └── photo3/
├── sketch/
│   ├── sketch1/
│   ├── sketch2/
│   └── sketch3/
├── anno_test.json
├── anno_train.json
└── README.pdf
```

### Step 4 --- Verify

Run:

``` powershell
Test-Path datasets\raw\FS2K\photo
Test-Path datasets\raw\FS2K\sketch
Test-Path datasets\raw\FS2K\anno_train.json
Test-Path datasets\raw\FS2K\anno_test.json
```

Every required path should return:

``` text
True
```

------------------------------------------------------------------------

# 8. FS2K Official Split

Use the official split as the primary benchmark:

``` text
Total:  2,104
Train:  1,058
Test:   1,046
```

The repository also provides:

``` text
anno_train.json
anno_test.json
```

and a tool for splitting the dataset:

``` text
tools/split_train_test.py
```

Do not replace the official benchmark split with a random split unless
an experiment explicitly requires it.

------------------------------------------------------------------------

# 9. FS2K Attributes

FS2K includes attributes useful for Criminal Eye research:

``` text
hair
hair_color
gender
earring
smile
frontal_face
style
```

Example internal representation:

``` json
{
  "source": "FS2K",
  "attributes": {
    "hair_visible": true,
    "hair_color": "black",
    "gender": "male",
    "earring": false,
    "smile": false,
    "frontal_face": true,
    "sketch_style": 1
  }
}
```

**Never overwrite the original annotation files.**

------------------------------------------------------------------------

# 10. CelebAMask-HQ Processing Pipeline

CelebAMask-HQ should primarily support **facial structure and component
understanding**.

``` text
CelebAMask-HQ
       ↓
Original Face Image + Segmentation Mask
       ↓
Face Component Extraction
       ↓
Normalization
       ↓
Geometry / Region Analysis
       ↓
Criminal Eye Component Catalog
```

Derived outputs belong in:

``` text
datasets/processed/CelebAMask-HQ/
```

Curated reusable components may eventually be placed in:

``` text
datasets/components/
```

Potential categories:

``` text
eyes
eyebrows
nose
mouth
face_shape
jaw
```

------------------------------------------------------------------------

# 11. FS2K Processing Pipeline

FS2K should primarily support the **photo-to-sketch domain**.

``` text
FS2K Photo
    +
FS2K Sketch
    +
Annotations
    ↓
Pair Validation
    ↓
Alignment / Normalization
    ↓
Training / Evaluation
```

FS2K should remain the primary paired benchmark for evaluating whether
Criminal Eye's generated sketches preserve facial structure and fit the
intended sketch domain.

------------------------------------------------------------------------

# 12. Do Not Train From Scratch Immediately

Installing the datasets does **not** mean immediately training Stable
Diffusion from scratch.

The planned architecture is:

``` text
Qwen
  ↓
Structured Facial Attributes
  ↓
Geometry Service
  ↓
Facial Component / Control Representation
  ↓
ControlNet
  ↓
Stable Diffusion 1.5
  ↓
Forensic Sketch
```

First perform:

1.  dataset validation
2.  preprocessing
3.  component extraction
4.  geometry normalization
5.  evaluation
6.  controlled experiments

Only then decide whether LoRA/fine-tuning is justified.

------------------------------------------------------------------------

# 13. Dataset Validation

Create:

``` text
ai-service/scripts/validate_datasets.py
```

It should eventually validate:

### CelebAMask-HQ

-   image count
-   mask count
-   image/mask identifiers
-   image dimensions
-   mask dimensions
-   corrupted files
-   missing masks

### FS2K

-   photo count
-   sketch count
-   photo/sketch pairing
-   `anno_train.json`
-   `anno_test.json`
-   missing files
-   corrupted files
-   duplicate identifiers

Output:

``` text
datasets/metadata/validation_report.json
```

------------------------------------------------------------------------

# 14. Dataset Manifest

Create:

``` text
ai-service/datasets/metadata/dataset_manifest.json
```

Recommended:

``` json
{
  "datasets": {
    "CelebAMask-HQ": {
      "version": "official",
      "purpose": [
        "face_parsing",
        "facial_component_analysis",
        "geometry_reference"
      ],
      "raw_path": "datasets/raw/CelebAMask-HQ",
      "processed_path": "datasets/processed/CelebAMask-HQ"
    },
    "FS2K": {
      "version": "official",
      "purpose": [
        "photo_sketch_pairs",
        "sketch_domain_learning",
        "evaluation"
      ],
      "raw_path": "datasets/raw/FS2K",
      "processed_path": "datasets/processed/FS2K"
    }
  }
}
```

Do not place restricted dataset images inside the manifest.

------------------------------------------------------------------------

# 15. Git Protection

Add to:

``` text
ai-service/.gitignore
```

``` gitignore
# Research datasets
datasets/raw/
datasets/processed/

# Generated dataset artifacts
datasets/metadata/validation_report.json

# Local dataset caches
.cache_downloads/
```

Keep only lightweight documentation and metadata under version control.

------------------------------------------------------------------------

# 16. Dataset-Specific READMEs

Create:

``` text
ai-service/datasets/raw/
├── CelebAMask-HQ/
│   └── README.md
└── FS2K/
    └── README.md
```

Each README should record:

-   official source
-   citation
-   license/restrictions
-   download date
-   expected structure
-   preprocessing status
-   checksum if available
-   local modifications

------------------------------------------------------------------------

# 17. Recommended Processing Stages

## Stage 1 --- Acquisition

``` text
Download → Extract → Raw Dataset
```

## Stage 2 --- Validation

``` text
Raw Dataset → Integrity Checks → Validation Report
```

## Stage 3 --- Normalization

``` text
Images → Resolution / Format Normalization → Processed Dataset
```

## Stage 4 --- Component Processing

Primarily CelebAMask-HQ:

``` text
Masks → Component Extraction → Geometry → Component Catalog
```

## Stage 5 --- Sketch Processing

Primarily FS2K:

``` text
Photo + Sketch → Pair Validation → Alignment → Evaluation Dataset
```

## Stage 6 --- AI Integration

``` text
Qwen
  ↓
Facial Attributes
  ↓
Geometry
  ↓
Component / Control Representation
  ↓
ControlNet + SD1.5
  ↓
Generated Forensic Sketch
```

------------------------------------------------------------------------

# 18. Complete Data Flow

``` text
                    ┌─────────────────────┐
                    │   CelebAMask-HQ     │
                    │ 30K Face + Masks    │
                    └──────────┬──────────┘
                               ↓
                     Facial Component Data
                               ↓
                        Geometry / Parsing
                               │
                               ├───────────────┐
                               ↓               ↓
                         Components      Control Input
                                               │
                                               │
┌──────────────────┐                           │
│      FS2K        │                           │
│ 2,104 Photo/     │                           │
│ Sketch Pairs     │                           │
└────────┬─────────┘                           │
         ↓                                     │
 Photo ↔ Sketch Relationship                   │
         │                                     │
         └──────────────────┬──────────────────┘
                            ↓
                    Criminal Eye AI
                            │
                     ┌──────┴──────┐
                     ↓             ↓
                   Qwen        Geometry
                     │             │
                     └──────┬──────┘
                            ↓
                     ControlNet + SD1.5
                            ↓
                      FORENSIC SKETCH
```

------------------------------------------------------------------------

# 19. What These Datasets Are Not

### CelebAMask-HQ is not:

-   a forensic sketch dataset
-   a criminal database
-   a suspect identity database
-   evidence of criminal identity
-   a replacement for FS2K

### FS2K is not:

-   a criminal database
-   a suspect recognition database
-   a replacement for CelebAMask-HQ
-   a dataset for determining criminal identity or guilt

They are research inputs for **facial structure, sketch synthesis and
evaluation**.

------------------------------------------------------------------------

# 20. Responsible AI Boundary

Generated sketches must be treated as **investigative reconstruction
aids**, not proof of identity.

Avoid claims such as:

``` text
"This generated sketch is definitely the suspect."
```

Use language such as:

``` text
"AI-generated forensic reconstruction for investigative assistance."
```

Human investigators remain responsible for interpretation and decisions.

------------------------------------------------------------------------

# 21. Installation Checklist

## CelebAMask-HQ

-   [x] Opened official CUHK project page
-   [x] Reviewed dataset agreement
-   [x] Downloaded from official source
-   [x] Extracted under `datasets/raw/CelebAMask-HQ/`
-   [x] Preserved original files
-   [x] Verified images (30,000 images verified, 1024×1024)
-   [x] Verified masks (372,776 masks verified across 15 subfolders, 512×512)
-   [x] Added raw dataset to Git ignore
-   [x] Created dataset README

## FS2K

-   [x] Opened official FS2K repository
-   [x] Downloaded official dataset
-   [x] Extracted under `datasets/raw/FS2K/`
-   [x] Verified `photo/` (2,104 photos verified across photo1, photo2, photo3)
-   [x] Verified `sketch/` (2,104 sketches verified across sketch1, sketch2, sketch3)
-   [x] Verified `anno_train.json` (1,058 items verified)
-   [x] Verified `anno_test.json` (1,046 items verified)
-   [x] Reviewed official train/test split (2,104 total pairs matched)
-   [x] Added raw dataset to Git ignore
-   [x] Created dataset README

## Integration

-   [x] Dataset manifest created (`dataset_manifest.json`)
-   [x] Validation script created (`validate_datasets.py`)
-   [x] Validation report generated (`validation_report.json` - PASSED)
-   [x] Raw data separated from processed data
-   [x] Component taxonomy finalized & populated (`datasets/components/`)
-   [x] Geometry normalization defined & computed (`00000_geom.json`)
-   [x] FS2K evaluation protocol defined & benchmarked (`fs2k_evaluation_report.json`)
-   [x] Dataset processing documented
-   [x] No raw dataset committed to Git (`.gitignore` protection active)

------------------------------------------------------------------------

# 22. Official References

### CelebAMask-HQ

-   Official project:
    https://mmlab.ie.cuhk.edu.hk/projects/CelebA/CelebAMask_HQ.html
-   Official repository:
    https://github.com/switchablenorms/CelebAMask-HQ

### FS2K

-   Official repository: https://github.com/DengPingFan/FS2K
-   Research paper: https://arxiv.org/abs/2112.15439
-   FSGAN implementation: https://github.com/DengPingFan/FSGAN

------------------------------------------------------------------------

# 23. Research Citations

## CelebAMask-HQ

``` bibtex
@inproceedings{CelebAMask-HQ,
  title={MaskGAN: Towards Diverse and Interactive Facial Image Manipulation},
  author={Lee, Cheng-Han and Liu, Ziwei and Wu, Lingyun and Luo, Ping},
  booktitle={IEEE Conference on Computer Vision and Pattern Recognition (CVPR)},
  year={2020}
}
```

## FS2K

``` bibtex
@article{Fan2022FS2K,
  title={Facial-Sketch Synthesis: A New Challenge},
  author={Fan, Deng-Ping and Huang, Ziling and Zheng, Peng and Liu, Hong and Qin, Xuebin and Van Gool, Luc},
  journal={Machine Intelligence Research},
  year={2022}
}
```

------------------------------------------------------------------------

# 24. Definition of Done

The dataset installation phase is complete only when:

``` text
✓ CelebAMask-HQ downloaded from the official source
✓ FS2K downloaded from the official source
✓ Both datasets stored under ai-service/datasets/raw/
✓ Raw datasets remain unmodified
✓ Large datasets excluded from Git
✓ Dataset structure validated
✓ FS2K annotations readable
✓ CelebAMask-HQ masks readable
✓ Dataset manifest exists
✓ Validation report exists
✓ Processing directories exist
✓ Dataset-specific READMEs exist
✓ Component taxonomy documented
✓ Dataset roles documented
✓ Pipeline ready for preprocessing
```

------------------------------------------------------------------------

# Current Final Dataset Architecture

``` text
ai-service/
└── datasets/
    │
    ├── raw/                                 # [INSTALLED & VERIFIED]
    │   ├── CelebAMask-HQ/                   # 30,000 images, 372,776 masks, annotations, README.md
    │   └── FS2K/                            # 2,104 photo/sketch pairs, train/test JSON, README.md
    │
    ├── processed/                           # [SCAFFOLDED FOR PIPELINES]
    │   ├── CelebAMask-HQ/                   # components/, geometry/, normalized/
    │   └── FS2K/                            # aligned/, normalized/, metadata/
    │
    ├── components/                          # [ESTABLISHED TAXONOMY]
    │   ├── eyebrows/
    │   ├── eyes/ (almond, narrow, round)
    │   ├── face_shapes/
    │   ├── jaws/
    │   ├── mouths/
    │   └── noses/ (broad, narrow, straight)
    │
    └── metadata/                            # [INITIALIZED]
        ├── dataset_manifest.json
        └── splits.json
```

**This document defines the dataset acquisition, organization,
validation and integration foundation for Criminal Eye Phase 7.**
