import os
import re
import sys
from pathlib import Path
import psycopg

# Add parent directory to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
AI_SERVICE_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(AI_SERVICE_DIR))

from app.providers.face.insightface_provider import InsightFaceProvider

ENV_PATH = AI_SERVICE_DIR.parent / ".env"


def get_database_url() -> str:
    if not ENV_PATH.exists():
        raise FileNotFoundError(f".env file not found at {ENV_PATH}")
    
    content = ENV_PATH.read_text(encoding="utf-8")
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("DATABASE_URL="):
            raw_val = line.split("=", 1)[1].strip()
            # Remove enclosing quotes
            if (raw_val.startswith('"') and raw_val.endswith('"')) or (raw_val.startswith("'") and raw_val.endswith("'")):
                raw_val = raw_val[1:-1]
            return raw_val
    raise ValueError("DATABASE_URL not found in .env")


def main():
    db_url = get_database_url()
    print("Connecting to Neon PostgreSQL...")

    workspace_root = AI_SERVICE_DIR.parent
    provider = InsightFaceProvider(workspace_root=str(workspace_root))

    suspects_to_seed = [
        {
            "criminal_id": "crim-arun-prakash-01",
            "first_name": "Arun",
            "last_name": "Prakash",
            "alias": "The Shadow",
            "gender": "Male",
            "nationality": "Indian",
            "mugshot_path": workspace_root / "public" / "images" / "suspects" / "arun-prakash.jpg",
            "mugshot_url": "/images/suspects/arun-prakash.jpg",
            "description": "Suspect associated with commercial burglary and cyber intrusion cases.",
            "status": "WANTED",
        },
        {
            "criminal_id": "crim-karthik-selvan-02",
            "first_name": "Karthik",
            "last_name": "Selvan",
            "alias": "Viper",
            "gender": "Male",
            "nationality": "Indian",
            "mugshot_path": workspace_root / "public" / "images" / "suspects" / "karthik-selvan.jpg",
            "mugshot_url": "/images/suspects/karthik-selvan.jpg",
            "description": "Identified in surveillance footage relating to transit hub incidents.",
            "status": "ACTIVE",
        },
    ]

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            # 1. Verify vector extension
            cur.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
            ext = cur.fetchone()
            print(f"pgvector extension status: {ext}")

            # 2. Extract embeddings and seed database
            for s in suspects_to_seed:
                print(f"Extracting InsightFace embedding for {s['first_name']} {s['last_name']}...")
                emb = provider.extract_embedding(Path(s["mugshot_path"]))
                if not emb or len(emb) != 512:
                    print(f"WARNING: Could not extract 512D embedding for {s['first_name']}, skipping.")
                    continue

                # Format as pgvector string: '[0.123, -0.456, ...]'
                vector_str = "[" + ", ".join(f"{x:.6f}" for x in emb) + "]"

                # Check if criminal exists
                cur.execute(
                    'SELECT id FROM "Criminal" WHERE "criminalId" = %s OR ("firstName" = %s AND "lastName" = %s);',
                    (s["criminal_id"], s["first_name"], s["last_name"])
                )
                row = cur.fetchone()

                if row:
                    crim_id = row[0]
                    cur.execute(
                        """
                        UPDATE "Criminal"
                        SET "embedding" = %s::vector,
                            "mugshotUrl" = %s,
                            "alias" = %s,
                            "status" = %s::"CriminalStatus",
                            "updatedAt" = NOW()
                        WHERE id = %s;
                        """,
                        (vector_str, s["mugshot_url"], s["alias"], s["status"], crim_id)
                    )
                    print(f"Updated Criminal id={crim_id} with InsightFace 512D vector.")
                else:
                    import uuid
                    new_id = str(uuid.uuid4())
                    cur.execute(
                        """
                        INSERT INTO "Criminal" (
                            id, "criminalId", "firstName", "lastName", "alias",
                            gender, nationality, description, status, "mugshotUrl",
                            "embedding", "createdAt", "updatedAt"
                        ) VALUES (
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s::"CriminalStatus", %s,
                            %s::vector, NOW(), NOW()
                        );
                        """,
                        (
                            new_id, s["criminal_id"], s["first_name"], s["last_name"], s["alias"],
                            s["gender"], s["nationality"], s["description"], s["status"], s["mugshot_url"],
                            vector_str
                        )
                    )
                    print(f"Created new Criminal id={new_id} ({s['first_name']}) with InsightFace 512D vector.")

            conn.commit()

            # 3. Test pgvector similarity query
            cur.execute("""
                SELECT id, "criminalId", "firstName", "lastName", "alias",
                       1 - ("embedding" <=> "embedding") AS self_similarity
                FROM "Criminal"
                WHERE "embedding" IS NOT NULL
                LIMIT 5;
            """)
            rows = cur.fetchall()
            print("\nVerification pgvector self-similarity check:")
            for r in rows:
                print(f" - {r[2]} {r[3]} ({r[1]}): cosine self-similarity = {r[5]}")

    print("\nSUCCESS: All criminal profiles seeded with InsightFace 512D embeddings in pgvector.")


if __name__ == "__main__":
    main()
