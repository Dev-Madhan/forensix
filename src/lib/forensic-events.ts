import { EventEmitter } from "events";
import { criminalEventEmitter, type CriminalEventPayload } from "./criminal-events";

const globalForForensicEvents = globalThis as unknown as {
  forensicEventEmitter?: EventEmitter;
};

export const forensicEventEmitter =
  globalForForensicEvents.forensicEventEmitter || new EventEmitter();

forensicEventEmitter.setMaxListeners(250);

if (process.env.NODE_ENV !== "production") {
  globalForForensicEvents.forensicEventEmitter = forensicEventEmitter;
}

export type ForensicEventType =
  | "CASE_CREATED"
  | "CASE_STATUS_CHANGED"
  | "CRIMINAL_ENROLLED"
  | "SKETCH_GENERATED"
  | "SURVEILLANCE_HIT"
  | "AUDIT_RECORD_ADDED"
  | "METRICS_REFRESH"
  | "WITNESS_ENROLLED"
  | "WITNESS_UPDATED"
  | "WITNESS_DELETED"
  | "WITNESS_INQUIRY_LOGGED";

export interface ForensicEventPayload {
  type: ForensicEventType;
  data: Record<string, unknown>;
  timestamp: number;
}

export function broadcastForensicEvent(payload: ForensicEventPayload) {
  try {
    forensicEventEmitter.emit("forensic:global", payload);
  } catch (err) {
    console.warn("Failed to broadcast forensic event:", err);
  }
}

// Forward criminal events to unified forensic stream
criminalEventEmitter.on("criminal:global", (p: CriminalEventPayload) => {
  try {
    let eventType: ForensicEventType = "CRIMINAL_ENROLLED";
    if (p.type === "SURVEILLANCE_HIT") {
      eventType = "SURVEILLANCE_HIT";
    } else if (p.type === "ACTIVITY_LOGGED") {
      eventType = "AUDIT_RECORD_ADDED";
    }

    broadcastForensicEvent({
      type: eventType,
      data: {
        criminalId: p.criminalId,
        criminalName: p.criminalName,
        subType: p.type,
        ...(p.metadata || {}),
      },
      timestamp: p.timestamp || Date.now(),
    });
  } catch (e) {
    console.warn("Error forwarding criminal event to forensic event bus:", e);
  }
});
