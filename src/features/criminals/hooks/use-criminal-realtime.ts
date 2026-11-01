"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { CriminalEventPayload } from "@/lib/criminal-events";

interface UseCriminalRealtimeOptions {
  criminalId: string;
  criminalName?: string;
  onActivityLogged?: (payload: CriminalEventPayload) => void;
  onSurveillanceHit?: (payload: CriminalEventPayload) => void;
  onStatusUpdated?: (payload: CriminalEventPayload) => void;
  onRecordChanged?: (payload: CriminalEventPayload) => void;
  onSyndicateEvent?: (payload: any) => void;
}

export function useCriminalRealtime({
  criminalId,
  criminalName,
  onActivityLogged,
  onSurveillanceHit,
  onStatusUpdated,
  onRecordChanged,
  onSyndicateEvent,
}: UseCriminalRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<CriminalEventPayload | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Store callbacks in refs to avoid reconnection loops when handlers change
  const callbacksRef = useRef({
    onActivityLogged,
    onSurveillanceHit,
    onStatusUpdated,
    onRecordChanged,
    onSyndicateEvent,
  });

  useEffect(() => {
    callbacksRef.current = {
      onActivityLogged,
      onSurveillanceHit,
      onStatusUpdated,
      onRecordChanged,
      onSyndicateEvent,
    };
  });

  const connect = useCallback(() => {
    if (!criminalId || typeof window === "undefined") return;

    try {
      const es = new EventSource(`/api/criminals/${encodeURIComponent(criminalId)}/stream`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const payload: CriminalEventPayload & { isSyndicateEvent?: boolean } = JSON.parse(
            event.data
          );

          if ((payload.type as string) === "CONNECTED") {
            return;
          }

          setLastEvent(payload);

          // Handle syndicate graph events
          if (payload.isSyndicateEvent) {
            callbacksRef.current.onSyndicateEvent?.(payload);
            return;
          }

          // Handle forensic criminal events
          switch (payload.type) {
            case "ACTIVITY_LOGGED":
              callbacksRef.current.onActivityLogged?.(payload);
              toast.info("Custody Ledger Updated", {
                description: `${(payload.metadata?.action as string) || "Event"} logged by ${payload.actorName || "Investigator"}.`,
              });
              break;

            case "SURVEILLANCE_HIT":
              callbacksRef.current.onSurveillanceHit?.(payload);
              toast.error("Live ANPR Sighting Match!", {
                description: `Camera ${payload.metadata?.sensorName || "sensor"} recorded detection at ${payload.metadata?.location || "monitored zone"}.`,
                duration: 7000,
              });
              break;

            case "STATUS_UPDATED":
              callbacksRef.current.onStatusUpdated?.(payload);
              toast.info("Classification Updated", {
                description: `Status or risk profile modified by ${payload.actorName || "system"}.`,
              });
              break;

            case "RECORD_ADDED":
            case "RECORD_UPDATED":
            case "RECORD_DELETED":
              callbacksRef.current.onRecordChanged?.(payload);
              toast.info("Judicial Records Updated", {
                description: "Criminal history ledger updated in real-time.",
              });
              break;

            default:
              break;
          }
        } catch (err) {
          console.warn("Failed to parse real-time criminal event payload:", err);
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        // Automatic reconnection attempt after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current === es) {
            connect();
          }
        }, 5000);
      };
    } catch (err) {
      console.warn("Could not establish criminal SSE stream:", err);
    }
  }, [criminalId]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [connect]);

  return { isConnected, lastEvent };
}

/**
 * Hook for global criminal database telemetry and live state alerts
 */
export function useCriminalDatabaseRealtime({
  onGlobalEvent,
}: {
  onGlobalEvent?: (payload: CriminalEventPayload) => void;
} = {}) {
  const [isGlobalConnected, setIsGlobalConnected] = useState(false);
  const [activeSurveillanceHit, setActiveSurveillanceHit] = useState<CriminalEventPayload | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let es: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const establishConnection = () => {
      try {
        es = new EventSource("/api/criminals/stream");

        es.onopen = () => {
          setIsGlobalConnected(true);
        };

        es.onmessage = (event) => {
          try {
            const payload: CriminalEventPayload = JSON.parse(event.data);
            if ((payload.type as string) === "CONNECTED") return;

            onGlobalEvent?.(payload);

            if (payload.type === "SURVEILLANCE_HIT") {
              setActiveSurveillanceHit(payload);
              toast.error(`ANPR Alert: Suspect Detection`, {
                description: `High-confidence match detected at ${payload.metadata?.location || "Zone"}!`,
                duration: 8000,
              });
            } else if (payload.type === "CRIMINAL_CREATED") {
              toast.success("New Criminal Profile Enrolled", {
                description: `${payload.criminalName || "Subject"} registered into the central database.`,
              });
            }
          } catch (err) {
            console.warn("Global SSE payload parse error:", err);
          }
        };

        es.onerror = () => {
          setIsGlobalConnected(false);
          if (es) es.close();
          reconnectTimer = setTimeout(establishConnection, 6000);
        };
      } catch (err) {
        console.warn("Failed to open global criminal stream:", err);
      }
    };

    establishConnection();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (es) es.close();
      setIsGlobalConnected(false);
    };
  }, [onGlobalEvent]);

  return {
    isGlobalConnected,
    activeSurveillanceHit,
    clearSurveillanceHit: () => setActiveSurveillanceHit(null),
  };
}
