import json
from pathlib import Path
import sys

SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(AI_SERVICE_DIR))

from app.providers.face.insightface_provider import InsightFaceProvider

def main():
    workspace_root = AI_SERVICE_DIR.parent
    provider = InsightFaceProvider(workspace_root=str(workspace_root))

    p1 = workspace_root / "public" / "images" / "suspects" / "arun-prakash.jpg"
    p2 = workspace_root / "public" / "images" / "suspects" / "karthik-selvan.jpg"

    emb1 = provider.extract_embedding(p1)
    emb2 = provider.extract_embedding(p2)

    if emb1 is None:
        raise ValueError(f"Could not extract embedding for {p1}")
    if emb2 is None:
        raise ValueError(f"Could not extract embedding for {p2}")

    vec1_str = "[" + ", ".join(f"{x:.6f}" for x in emb1) + "]"
    vec2_str = "[" + ", ".join(f"{x:.6f}" for x in emb2) + "]"

    output = {
        "vec1": vec1_str,
        "vec2": vec2_str
    }
    print(json.dumps(output))

if __name__ == "__main__":
    main()
