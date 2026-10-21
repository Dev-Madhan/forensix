"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { RealtimeCriminalEvent } from "@/lib/sse-bus";

export interface UseCriminalRealtimeOptions {
  criminalId?: string;
  onSurveillanceHit?: (event: RealtimeCriminalEvent) => void;
  onStatusChanged?: (event: RealtimeCriminalEvent) => void;
  onCaseLinked?: (event: RealtimeCriminalEvent) => void;
  enableToasts?: boolean;
}

export function useCriminalRealtime({
  criminalId,
  onSurveillanceHit,
  onStatusChanged,
  onCaseLinked,
  enableToasts = true,
}: UseCriminalRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeCriminalEvent | null>(null);
  const [recentHits, setRecentHits] = useState<RealtimeCriminalEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = criminalId
      ? `/api/criminals/stream?criminalId=${encodeURIComponent(criminalId)}`
      : "/api/criminals/stream";

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
    };

    es.onmessage = (messageEvent) => {
      try {
        const payload: RealtimeCriminalEvent = JSON.parse(messageEvent.data);

        if (payload.type === "CONNECTED" as any) {
          setIsConnected(true);
          return;
        }

        setLastEvent(payload);

        switch (payload.type) {
          case "SURVEILLANCE_HIT": {
            setRecentHits((prev) => [payload, ...prev.slice(0, 19)]);
            onSurveillanceHit?.(payload);

            if (enableToasts) {
              const isHighRisk =
                payload.data?.status === "WANTED" || payload.data?.riskLevel === "CRITICAL";
              toast(
                isHighRisk ? "🚨 HIGH-RISK RADAR DETECTION" : "📡 Live Surveillance Radar Hit",
                {
                  description: `${payload.data?.subjectName || "Subject"} detected at ${
                    payload.data?.location || "Unknown Sensor Location"
                  } (${Math.round((payload.data?.confidenceScore || 0) * 100)}% match)`,
                  duration: 6000,
                  action: payload.criminalId
                    ? {
                        label: "View Dossier",
                        onClick: () => {
                          window.location.href = `/dashboard/criminals/${payload.criminalId}`;
                        },
                      }
                    : undefined,
                }
              );
            }
            break;
          }

          case "STATUS_CHANGED":
          case "CRIMINAL_UPDATED": {
            onStatusChanged?.(payload);
            if (enableToasts) {
              toast.info("Criminal Record Updated", {
                description: `Status for ${payload.criminalId} changed to ${
                  payload.data?.status || "Active"
                }`,
              });
            }
            break;
          }

          case "CASE_LINKED": {
            onCaseLinked?.(payload);
            if (enableToasts) {
              toast.success("Case Link Established", {
                description: `Subject linked to case ${payload.data?.caseNumber || ""}`,
              });
            }
            break;
          }

          case "CASE_UNLINKED": {
            onCaseLinked?.(payload);
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.warn("Failed to parse realtime SSE payload:", err);
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Reconnect with backoff
      setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [criminalId, enableToasts, onCaseLinked, onStatusChanged, onSurveillanceHit]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastEvent,
    recentHits,
  };
}
