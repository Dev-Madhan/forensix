import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from typing import Dict, Any
from app.providers.sketch.diffusion_local import LocalDiffusionProvider
from app.core.logging import logger

STYLES = [
    "Forensic Graphite (Pencil)",
    "Realistic Charcoal",
    "Digital Identi-Kit (Lineart)",
    "Color Age-Progressed",
    "Monochrome Inversion (Black Background)"
]

async def run_gauntlet():
    provider = LocalDiffusionProvider()
    print("=======================================")
    print("STARTING 50-GENERATION STRESS TEST")
    print("=======================================")
    
    total_images = 0
    failures = 0
    
    attributes: Dict[str, Any] = {
        "face_shape": "oval-shaped face",
        "eyes": "medium-sized almond-shaped eyes",
        "nose": "straight medium-width nose",
        "mouth": "medium-wide mouth",
        "hair": "short neat side-parted dark hair"
    }

    for style in STYLES:
        print(f"\n--- Testing Style: {style} ---")
        for i in range(10):
            try:
                print(f"[{total_images + 1}/50] Generating {style} (#{i + 1}/10)...")
                await provider.generate_sketch(
                    case_id="GAUNTLET_TEST",
                    witness_id=f"TEST_{total_images}",
                    attributes=attributes,
                    sketch_style=style,
                    detail_level="Standard", # Test Standard first to verify VRAM leak is fixed
                    control_strength=0.0
                )
                total_images += 1
            except Exception as e:
                print(f"FAILED on image {total_images + 1} ({style}): {e}")
                failures += 1
                total_images += 1
                
    print("\n=======================================")
    print("GAUNTLET COMPLETE")
    print(f"Total Generations: {total_images}")
    print(f"Failures (OOMs or crashes): {failures}")
    if failures == 0:
        print("RESULT: SUCCESS - VRAM Leak Fixed!")
    else:
        print("RESULT: FAILED - Memory leak still present.")
    print("=======================================")

if __name__ == "__main__":
    asyncio.run(run_gauntlet())
