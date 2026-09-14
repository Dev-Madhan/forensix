# CelebAMask-HQ + FS2K Dataset Installation & Integration Guide

> **Datasets:** CelebAMask-HQ + FS2K  
> **Purpose:** Establish the research-data foundation for the Forensix (Criminal Eye) forensic sketch pipeline.  
> **Target:** `ai-service/datasets/`  
> **Platform:** Windows + Python/FastAPI + local AI workflow  

---

## 1. Dataset Strategy

Forensix uses two complementary datasets:

| Dataset | Role |
| :--- | :--- |
| **CelebAMask-HQ** | Facial component segmentation, parsing, structure, geometry and component-reference development (30,000 images, 19 component masks). |
| **FS2K** | Paired photo-sketch research, sketch-domain learning and evaluation (2,104 paired photo-sketch drawings). |

They should **not** be treated as interchangeable.

```text
CelebAMask-HQ
      ↓
Facial Parsing / Component Masks
      ↓
Normalized Components + Geometry
      ↓
                         ┌────────────────┐
                         │  Forensix Data │
                         │     Layer      │
                         └───────┬────────┘
                                 ↓
FS2K ─────────→ Photo ↔ Sketch Learning / Evaluation
                                 ↓
                       Control Representation
                                 ↓
                   ControlNet + Stable Diffusion (LoRA)
                                 ↓
                        Forensic Sketch
```

---

## 2. Official Sources & Licensing

### 2.1 CelebAMask-HQ
- **Official project page:** https://mmlab.ie.cuhk.edu.hk/projects/CelebA/CelebAMask_HQ.html
- **Official repository:** https://github.com/switchablenorms/CelebAMask-HQ
- **Contents:** 30,000 high-resolution face images with manually annotated 512×512 masks covering 19 facial classes.
- **License Warning:** Provided for **non-commercial research purposes only**. Review the official agreement before using outside academic contexts.

### 2.2 FS2K
- **Official repository:** https://github.com/DengPingFan/FS2K
- **Paper:** https://arxiv.org/abs/2112.15439
- **Contents:** 2,104 photo-sketch pairs (1,058 Train / 1,046 Test) across 3 sketch drawing styles.

---

## 3. Storage Layout

```text
ai-service/datasets/
├── raw/
│   ├── CelebAMask-HQ/
│   │   ├── images/       # 30,000 images (0.jpg - 29999.jpg)
│   │   └── masks/        # 15 subdirectories (0 - 14) with 19 component mask types
│   └── FS2K/
│       ├── photo/        # photo1, photo2, photo3
│       ├── sketch/       # sketch1, sketch2, sketch3
│       ├── anno_train.json
│       └── anno_test.json
└── processed/
    ├── diffusion_train.jsonl # 5,000 paired attention-weighted diffusion prompts
    └── llm_sft_train.jsonl   # 5,000 conversational witness statements + JSON schemas
```
