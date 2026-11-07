import type { EvidenceItem } from "./types";

/**
 * Empty baseline evidence collection.
 * All case evidence items are dynamically retrieved from the PostgreSQL database (Evidence relation).
 */
export const MOCK_EVIDENCE_ITEMS: EvidenceItem[] = [];
