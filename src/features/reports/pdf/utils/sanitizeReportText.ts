/**
 * Applies the Forensix Missing Data Policy:
 * Never render undefined, null, NaN, or raw empty strings.
 */
export function sanitizeReportText(
  value: string | number | null | undefined,
  fallback = "Not recorded"
): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && isNaN(value)) return fallback;

  const str = String(value).trim();
  if (!str || str === "null" || str === "undefined" || str === "NaN") {
    return fallback;
  }

  return str;
}

export function sanitizeNarrativeText(
  value: string | null | undefined,
  fallback = "No narrative summary recorded for this case."
): string {
  return sanitizeReportText(value, fallback);
}
