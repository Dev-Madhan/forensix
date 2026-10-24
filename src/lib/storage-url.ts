/**
 * Extracts the raw Tigris storage key from any raw key, Tigris S3 URL, or storage API route.
 * Returns null if the URL is a local static path (/images/...) or external 3rd party URL.
 */
export function extractTigrisStorageKey(urlOrKey: string | null | undefined): string | null {
  if (!urlOrKey || typeof urlOrKey !== "string") return null;
  const trimmed = urlOrKey.trim();
  if (!trimmed) return null;

  // 1. If it's already an /api/storage?key=... URL
  if (trimmed.startsWith("/api/storage")) {
    try {
      const parsed = new URL(trimmed, "http://localhost");
      const key = parsed.searchParams.get("key");
      return key ? decodeURIComponent(key).replace(/^\/+/, "") : null;
    } catch {
      return null;
    }
  }

  // 2. If it's an HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.toLowerCase();

      // Check if it's a Tigris domain (e.g. fly.storage.tigris.dev, storage.tigris.dev)
      if (host.includes("tigris.dev")) {
        let path = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
        const bucketName = process.env.TIGRIS_BUCKET_NAME || "forensix-evidence";
        // If path-style URL (fly.storage.tigris.dev/<bucket>/<key>)
        if (path.startsWith(`${bucketName}/`)) {
          path = path.slice(bucketName.length + 1);
        }
        return path || null;
      }

      // External 3rd party URL (e.g. googleusercontent, github avatar)
      return null;
    } catch {
      return null;
    }
  }

  // 3. If it's a local static asset (e.g., "/images/suspects/...") or data URI
  if (trimmed.startsWith("/") || trimmed.startsWith("data:")) {
    return null;
  }

  // 4. Otherwise, it's a raw storage key (e.g., "criminals/mugshots/...")
  return trimmed.replace(/^\/+/, "");
}

/**
 * Ensures an image or asset URL is safe for browser and Next.js Image rendering.
 * - Extracts Tigris S3 storage keys and routes them through the direct streaming /api/storage?key=...
 * - Passes through static public paths (/images/...) and non-Tigris absolute URLs (Google/GitHub avatars) as-is.
 * - If null/undefined/empty, returns the provided fallback.
 */
export function getSafeStorageUrl(
  urlOrKey: string | null | undefined,
  fallback: string | null = "/images/suspects/arun-prakash.jpg"
): string | null {
  if (!urlOrKey || typeof urlOrKey !== "string") {
    return fallback;
  }
  const trimmed = urlOrKey.trim();
  if (!trimmed) {
    return fallback;
  }

  // Check if it's a Tigris asset
  const tigrisKey = extractTigrisStorageKey(trimmed);
  if (tigrisKey) {
    return `/api/storage?key=${encodeURIComponent(tigrisKey)}`;
  }

  // If local static path or external URL
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  return fallback;
}

