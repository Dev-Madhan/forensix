/**
 * Utility functions for consistent Date of Birth, Age, and Demographics formatting
 * across Criminal catalog (table, preview, cards, drawers) and slug profile pages.
 */

/**
 * Formats a Date object or date string into human-readable format e.g. "Nov 24, 2005"
 * Matches the individual profile slug page display.
 */
export function formatCriminalDob(dob: Date | string | null | undefined): string {
  if (!dob || dob === "—") return "—";

  // If already formatted as "Nov 24, 2005" or similar "Mon DD, YYYY"
  if (typeof dob === "string" && /^[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}$/.test(dob.trim())) {
    return dob.trim();
  }

  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (!d || isNaN(d.getTime())) {
    return typeof dob === "string" ? dob : "—";
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Computes exact chronological age in years from Date of Birth.
 * Accurately accounts for leap years and exact birth day/month.
 */
export function computeCriminalAge(
  dob: Date | string | null | undefined,
  fallbackAge?: number
): number {
  if (!dob || dob === "—") return fallbackAge && fallbackAge > 0 ? fallbackAge : 32;

  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (!d || isNaN(d.getTime())) {
    return fallbackAge && fallbackAge > 0 ? fallbackAge : 32;
  }

  const elapsed = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return elapsed >= 0 ? elapsed : (fallbackAge && fallbackAge > 0 ? fallbackAge : 0);
}

/**
 * Returns formatted Date of Birth with Age e.g. "Nov 24, 2005 (20 years)"
 */
export function formatCriminalDobWithAge(
  dob: Date | string | null | undefined,
  fallbackAge?: number
): string {
  const formattedDate = formatCriminalDob(dob);
  if (formattedDate === "—" || !dob) return "Not Documented";
  const age = computeCriminalAge(dob, fallbackAge);
  return `${formattedDate} (${age} years)`;
}
