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

    sql_statements = [
        f"UPDATE \"Criminal\" SET \"embedding\" = '{vec1_str}'::vector, \"mugshotUrl\" = '/images/suspects/arun-prakash.jpg' WHERE \"firstName\" = 'Henry' OR \"alias\" = 'Vecna';",
        f"UPDATE \"Criminal\" SET \"embedding\" = '{vec2_str}'::vector, \"mugshotUrl\" = '/images/suspects/karthik-selvan.jpg' WHERE \"firstName\" = 'Billy' OR \"alias\" = 'Billy';",
        f"INSERT INTO \"Criminal\" (id, \"criminalId\", \"firstName\", \"lastName\", \"alias\", gender, nationality, description, status, \"mugshotUrl\", \"embedding\", \"createdAt\", \"updatedAt\") VALUES ('crim-arun-01', 'CRIM-AP-01', 'Arun', 'Prakash', 'The Shadow', 'Male', 'Indian', 'Commercial burglary suspect', 'WANTED'::\"CriminalStatus\", '/images/suspects/arun-prakash.jpg', '{vec1_str}'::vector, NOW(), NOW()) ON CONFLICT (\"criminalId\") DO UPDATE SET \"embedding\" = EXCLUDED.\"embedding\";",
        f"INSERT INTO \"Criminal\" (id, \"criminalId\", \"firstName\", \"lastName\", \"alias\", gender, nationality, description, status, \"mugshotUrl\", \"embedding\", \"createdAt\", \"updatedAt\") VALUES ('crim-karthik-02', 'CRIM-KS-02', 'Karthik', 'Selvan', 'Viper', 'Male', 'Indian', 'Transit hub suspect', 'ACTIVE'::\"CriminalStatus\", '/images/suspects/karthik-selvan.jpg', '{vec2_str}'::vector, NOW(), NOW()) ON CONFLICT (\"criminalId\") DO UPDATE SET \"embedding\" = EXCLUDED.\"embedding\";"
    ]

    out_file = AI_SERVICE_DIR / "seed_embeddings.sql"
    out_file.write_text("\n\n".join(sql_statements), encoding="utf-8")
    print(f"Written SQL to {out_file}")

if __name__ == "__main__":
    main()
