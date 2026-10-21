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

import argparse

async def run_gauntlet(target_style: str = None, count: int = 10):
    provider = LocalDiffusionProvider()
    print("=======================================")
    print("STARTING FORENSIC GENERATION GAUNTLET")
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

    test_styles = [target_style] if target_style else STYLES

    for style in test_styles:
        print(f"\n--- Testing Style: {style} ---")
        for i in range(count):
            try:
                print(f"[{total_images + 1}/{len(test_styles) * count}] Generating {style} (#{i + 1}/{count})...")
                res = await provider.generate_sketch(
                    case_id="GAUNTLET_TEST",
                    witness_id=f"TEST_{total_images}",
                    attributes=attributes,
                    sketch_style=style,
                    detail_level="Standard",
                    control_strength=0.0
                )
                print(f"  ✓ Saved to: {res.get('local_path', 'ok')}")
                total_images += 1
            except Exception as e:
                print(f"FAILED on image {total_images + 1} ({style}): {e}")
                failures += 1
                total_images += 1
                
    print("\n=======================================")
    print("GAUNTLET COMPLETE")
    print(f"Total Generations: {total_images}")
    print(f"Failures: {failures}")
    if failures == 0:
        print("RESULT: SUCCESS - All forensic composites rendered cleanly!")
    else:
        print("RESULT: FAILED - Issues detected.")
    print("=======================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Forensic Sketch Gauntlet")
    parser.add_argument("--style", type=str, default="Forensic Graphite (Pencil)", help="Style to evaluate")
    parser.add_argument("--count", type=int, default=5, help="Number of samples to generate")
    args = parser.parse_args()
    asyncio.run(run_gauntlet(target_style=args.style, count=args.count))
