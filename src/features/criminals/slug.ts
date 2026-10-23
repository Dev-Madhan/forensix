/**
 * Slug utility functions for Criminals, Cases, and Judicial Records
 * Ensures canonical, human-readable URLs across the Forensix ecosystem
 */

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Returns canonical slug for a criminal profile
 * Example: "arun-prakash-CR-2026-101" or "CR-2026-101"
 */
export function getCriminalSlug(criminal: {
  firstName?: string | null;
  lastName?: string | null;
  criminalId?: string | null;
  id: string;
}): string {
  const fullName = `${criminal.firstName || ""} ${criminal.lastName || ""}`.trim();
  const idToken = criminal.criminalId || criminal.id;
  if (!fullName) return idToken;
  const nameSlug = slugify(fullName);
  return `${nameSlug}-${idToken}`;
}

/**
 * Extracts potential identifier from a criminal slug
 * e.g., "arun-prakash-CR-2026-101" -> "CR-2026-101"
 */
export function extractCriminalIdFromSlug(slug: string): string {
  if (!slug) return "";
  const decoded = decodeURIComponent(slug).trim();

  // Check if it's already a clean ID (e.g. CR-2026-101 or UUID)
  if (/^CR-\d{4}-\d+$/i.test(decoded) || /^[a-f0-9-]{36}$/i.test(decoded)) {
    return decoded;
  }

  // If formatted as "name-slug-CR-2026-101"
  const crMatch = decoded.match(/(CR-\d{4}-\d+)$/i);
  if (crMatch) return crMatch[1];

  // If trailing segment looks like a UUID
  const uuidMatch = decoded.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
  if (uuidMatch) return uuidMatch[1];

  // If trailing segment looks like a CUID
  const cuidMatch = decoded.match(/(c[a-z0-9]{24})$/i);
  if (cuidMatch) return cuidMatch[1];

  return decoded;
}

/**
 * Returns canonical slug for a case
 * Example: "FX-2026-184-armed-robbery-anna-nagar"
 */
export function getCaseSlug(caseItem: {
  caseNumber?: string | null;
  title?: string | null;
  id?: string;
}): string {
  const code = caseItem.caseNumber || caseItem.id || "";
  if (!caseItem.title) return code;
  const titleSlug = slugify(caseItem.title);
  return code ? `${code}-${titleSlug}` : titleSlug;
}

/**
 * Returns canonical slug for a judicial record
 * Example: "CC-2024-8842-armed-robbery"
 */
export function getRecordSlug(record: {
  courtCaseNumber?: string | null;
  caseId?: string | null;
  offenceType?: string | null;
  id: string;
}): string {
  const caseId = record.courtCaseNumber || record.caseId || record.id;
  const offence = record.offenceType ? slugify(record.offenceType) : "";
  return offence ? `${slugify(caseId)}-${offence}` : slugify(caseId);
}
