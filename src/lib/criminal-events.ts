import { EventEmitter } from "events";

// Global singleton event bus across hot reloads in development
const globalForCriminalEvents = globalThis as unknown as {
  criminalEventEmitter?: EventEmitter;
};

export const criminalEventEmitter =
  globalForCriminalEvents.criminalEventEmitter || new EventEmitter();

// Allow investigator clients across multiple browser tabs
criminalEventEmitter.setMaxListeners(250);

if (process.env.NODE_ENV !== "production") {
  globalForCriminalEvents.criminalEventEmitter = criminalEventEmitter;
}

export type CriminalEventType =
  | "CRIMINAL_CREATED"
  | "STATUS_UPDATED"
  | "WATCHLIST_TOGGLED"
  | "SURVEILLANCE_HIT"
  | "ACTIVITY_LOGGED"
  | "BIOMETRIC_ENROLLED"
  | "CASE_LINKED"
  | "CASE_UNLINKED"
  | "ASSOCIATE_LINKED"
  | "RECORD_ADDED"
  | "RECORD_UPDATED"
  | "RECORD_DELETED";

export interface CriminalEventPayload {
  type: CriminalEventType;
  criminalId: string;
  criminalName?: string;
  actorName?: string;
  actorBadgeId?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Broadcast an event to both the subject-specific channel and the global database channel
 */
export function broadcastCriminalEvent(payload: CriminalEventPayload) {
  try {
    // 1. Broadcast to specific criminal profile channel
    criminalEventEmitter.emit(`criminal:${payload.criminalId}`, payload);
    // 2. Broadcast to global catalog channel (for table updates, alert toasts)
    criminalEventEmitter.emit("criminal:global", payload);
  } catch (err) {
    console.warn("Failed to broadcast criminal event:", err);
  }
}

