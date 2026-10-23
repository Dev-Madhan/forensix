/**
 * Ensures an image or asset URL is safe for browser and Next.js Image rendering.
 * - If it's already an absolute URL (http/https/data:) or root-relative path (/...), returns it as-is.
 * - If it's a Tigris S3 storage key (e.g. "criminals/mugshots/..."), routes it through /api/storage?key=...
 * - If null/undefined/empty, returns the provided fallback (or null).
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
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  // Otherwise it's a raw storage key (e.g. Tigris S3 path)
  return `/api/storage?key=${encodeURIComponent(trimmed)}`;
}
