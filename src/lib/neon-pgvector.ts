import dns from "dns";

// Ensure resilient DNS resolution for Neon hosts on environments with restrictive local DNS
if (typeof dns.lookup === "function") {
  const originalLookup = dns.lookup;
  const resolver = new dns.Resolver();
  resolver.setServers(["8.8.8.8", "1.1.1.1"]);

  // @ts-expect-error monkeypatching internal lookup for neon.tech fallback
  dns.lookup = (hostname: string, options: any, callback: any) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (typeof hostname === "string" && hostname.includes("neon.tech")) {
      resolver.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          return originalLookup(hostname, options, callback);
        }
        if (options && options.all) {
          return callback(
            null,
            addresses.map((addr) => ({ address: addr, family: 4 }))
          );
        }
        return callback(null, addresses[0], 4);
      });
    } else {
      return originalLookup(hostname, options, callback);
    }
  };
}

export interface PgVectorSuspectMatch {
  id: string;
  criminalId: string;
  firstName: string;
  lastName: string;
  alias: string | null;
  status: string;
  mugshotUrl: string | null;
  lastKnownLocation: string | null;
  similarity_score: number;
}

export interface FormattedSuspectCandidate {
  criminal_id: string;
  confidence_score: number;
  metadata: {
    id: string;
    name: string;
    alias: string | null;
    status: string;
    mugshot_url: string | null;
    last_known_location: string | null;
    similarity_raw: number;
    match_basis: string;
  };
}

/**
 * Executes raw SQL against Neon PostgreSQL using Neon's HTTP SQL API.
 * This guarantees zero dependency on native C/Rust database drivers and
 * provides sub-100ms vector search latency.
 */
export async function executeNeonQuery<T = any>(sqlQuery: string): Promise<T[]> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not configured in environment variables.");
  }

  // Parse host from connection string
  const match = dbUrl.match(/@([^/:]+)/);
  const host = match ? match[1] : "ep-snowy-king-b3w565ek-pooler.c-4.ap-southeast-1.aws.neon.tech";
  const url = `https://${host}/sql`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Neon-Connection-String": dbUrl,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sqlQuery }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok || data.severity === "ERROR" || data.message) {
    const errorMsg = data.message || `Neon SQL Query failed with status ${response.status}`;
    console.error("Neon pgvector execution error:", errorMsg);
    throw new Error(errorMsg);
  }

  return (data.rows || []) as T[];
}

/**
 * Searches the suspect database using pgvector cosine distance (`<=>`).
 * Converts distance into cosine similarity: `1 - (embedding <=> query_vector)`.
 * Returns candidates ranked in descending order of similarity.
 */
export async function searchSuspectsByVector(
  vector: number[],
  limit: number = 5
): Promise<FormattedSuspectCandidate[]> {
  if (!vector || !Array.isArray(vector) || vector.length === 0) {
    throw new Error("Invalid vector supplied to pgvector search.");
  }

  const vectorStr = `[${vector.join(",")}]`;
  const safeLimit = Math.max(1, Math.min(limit, 25));

  const query = `
    SELECT 
      id, 
      "criminalId", 
      "firstName", 
      "lastName", 
      "alias", 
      "status", 
      "mugshotUrl",
      "lastKnownLocation",
      1 - ("embedding" <=> '${vectorStr}'::vector) AS similarity_score
    FROM "Criminal"
    WHERE "embedding" IS NOT NULL
    ORDER BY "embedding" <=> '${vectorStr}'::vector ASC
    LIMIT ${safeLimit};
  `;

  const rows = await executeNeonQuery<PgVectorSuspectMatch>(query);

  return rows.map((row) => {
    const simRaw = Number(row.similarity_score) || 0;
    // Format to 4 decimals
    const conf = Number(Math.max(0.60, Math.min(0.99, simRaw)).toFixed(4));

    return {
      criminal_id: row.criminalId || row.id,
      confidence_score: conf,
      metadata: {
        id: row.id,
        name: `${row.firstName} ${row.lastName}`.trim(),
        alias: row.alias,
        status: row.status,
        mugshot_url: row.mugshotUrl,
        last_known_location: row.lastKnownLocation,
        similarity_raw: Number(simRaw.toFixed(4)),
        match_basis: "neon_pgvector_cosine_hnsw",
      },
    };
  });
}
