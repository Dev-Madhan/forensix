import type { SuspectItem } from "./types";

/**
 * Empty baseline suspects collection.
 * All case suspects are dynamically fetched from the PostgreSQL database (CaseSuspect relation).
 */
export const INITIAL_SUSPECTS: SuspectItem[] = [];
