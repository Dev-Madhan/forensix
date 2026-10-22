// In-memory Real-Time Event Dispatcher for Forensix Criminal Database & Surveillance Bus
import { EventEmitter } from "events";

export interface RealtimeCriminalEvent {
  id: string;
  type:
    | "SURVEILLANCE_HIT"
    | "CRIMINAL_UPDATED"
    | "CRIMINAL_CREATED"
    | "CASE_LINKED"
    | "CASE_UNLINKED"
    | "STATUS_CHANGED"
    | "LEDGER_ENTRY"
    | "RECORD_CREATED"
    | "RECORD_DELETED"
    | "WATCHLIST_TOGGLED"
    | "PHOTO_UPDATED"
    | "BIOMETRIC_ENROLLED";
  criminalId: string;
  timestamp: string;
  data: Record<string, any>;
}

type EventListener = (event: RealtimeCriminalEvent) => void;

class CriminalEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  public subscribe(listener: EventListener): () => void {
    this.emitter.on("criminal-event", listener);
    return () => {
      this.emitter.off("criminal-event", listener);
    };
  }

  public subscribeToCriminal(criminalId: string, listener: EventListener): () => void {
    const wrappedListener: EventListener = (event) => {
      if (event.criminalId === criminalId || event.data?.criminalId === criminalId) {
        listener(event);
      }
    };
    this.emitter.on("criminal-event", wrappedListener);
    return () => {
      this.emitter.off("criminal-event", wrappedListener);
    };
  }

  public broadcast(event: Omit<RealtimeCriminalEvent, "id" | "timestamp"> & { id?: string; timestamp?: string }) {
    const fullEvent: RealtimeCriminalEvent = {
      id: event.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: event.timestamp || new Date().toISOString(),
      type: event.type,
      criminalId: event.criminalId,
      data: event.data,
    };
    this.emitter.emit("criminal-event", fullEvent);
  }
}

// Global singleton pattern to survive Next.js module reloading in dev
const globalForBus = globalThis as unknown as {
  criminalEventBus: CriminalEventBus | undefined;
};

export const criminalEventBus = globalForBus.criminalEventBus ?? new CriminalEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForBus.criminalEventBus = criminalEventBus;
}
