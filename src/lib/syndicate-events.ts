import { EventEmitter } from "events";

// Global singleton event bus across hot reloads in development
const globalForSyndicate = globalThis as unknown as {
  syndicateEventEmitter?: EventEmitter;
};

export const syndicateEventEmitter =
  globalForSyndicate.syndicateEventEmitter || new EventEmitter();

// Allow unlimited listeners for active investigator sessions
syndicateEventEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalForSyndicate.syndicateEventEmitter = syndicateEventEmitter;
}

export type SyndicateEventType =
  | "NODE_LINKED"
  | "NODE_UNLINKED"
  | "ROLE_UPDATED"
  | "STATUS_CHANGED";

export interface SyndicateEventPayload {
  type: SyndicateEventType;
  criminalId: string;
  associateId?: string;
  caseNumber?: string;
  timestamp: number;
}

export function broadcastSyndicateEvent(payload: SyndicateEventPayload) {
  try {
    syndicateEventEmitter.emit(`syndicate:${payload.criminalId}`, payload);
    // Also broadcast to associate's channel if applicable
    if (payload.associateId) {
      syndicateEventEmitter.emit(`syndicate:${payload.associateId}`, payload);
    }
  } catch (err) {
    console.warn("Failed to broadcast syndicate event:", err);
  }
}
