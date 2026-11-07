"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ForensicEventPayload } from "@/lib/forensic-events";

interface UseDashboardRealtimeOptions {
  onCaseCreated?: (caseItem: {
    id: string;
    caseId: string;
    title: string;
    date: string;
    status: "Under Investigation" | "Open" | "Solved" | "Closed" | "Cold" | "Archived";
  }) => void;
  onCaseStatusChanged?: (caseUpdate: {
    id: string;
    caseNumber?: string;
    title?: string;
    status: string;
  }) => void;
  onCriminalEnrolled?: (criminal: {
    criminalId?: string;
    criminalName?: string;
  }) => void;
  onSketchGenerated?: (sketch: {
    id: string;
    imageUrl: string;
    title: string;
    prompt?: string;
    caseNumber?: string;
    caseTitle?: string;
    date: string;
  }) => void;
  onSketchesSync?: (sketches: Array<{
    id: string;
    imageUrl: string;
    title: string;
    prompt?: string;
    caseNumber?: string;
    caseTitle?: string;
    date: string;
  }>) => void;
  onSurveillanceHit?: (hit: {
    criminalName?: string;
    location?: string;
    confidenceScore?: number;
  }) => void;
  onMetricsUpdate?: () => void;
}

export function useDashboardRealtime(options: UseDashboardRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = React.useState(false);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Keep options in ref to avoid re-triggering effect on every render
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  React.useEffect(() => {
    let mounted = true;

    function connect() {
      if (!mounted) return;

      try {
        const es = new EventSource("/api/dashboard/stream");
        eventSourceRef.current = es;

        es.onopen = () => {
          if (!mounted) return;
          setIsConnected(true);
        };

        es.onmessage = (event) => {
          if (!mounted) return;
          try {
            const payload: ForensicEventPayload = JSON.parse(event.data);

            switch (payload.type) {
              case "CASE_CREATED": {
                const c = payload.data as {
                  id: string;
                  caseNumber: string;
                  title: string;
                  status: string;
                  createdAt?: string;
                };

                let mappedStatus: "Under Investigation" | "Open" | "Solved" | "Closed" | "Cold" | "Archived" = "Open";
                if (c.status === "UNDER_INVESTIGATION") mappedStatus = "Under Investigation";
                else if (c.status === "ARCHIVED") mappedStatus = "Archived";
                else if (c.status === "CLOSED") mappedStatus = "Closed";
                else if (c.status === "SOLVED") mappedStatus = "Solved";
                else if (c.status === "COLD") mappedStatus = "Cold";

                toast.info(`New Case Logged: ${c.caseNumber}`, {
                  description: c.title,
                });

                optionsRef.current.onCaseCreated?.({
                  id: c.id,
                  caseId: c.caseNumber,
                  title: c.title,
                  date: new Date(c.createdAt || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                  status: mappedStatus,
                });
                break;
              }

              case "CASE_STATUS_CHANGED": {
                const c = payload.data as {
                  id: string;
                  caseNumber?: string;
                  title?: string;
                  status: string;
                };

                optionsRef.current.onCaseStatusChanged?.(c);
                break;
              }

              case "CRIMINAL_ENROLLED": {
                const crim = payload.data as {
                  criminalId?: string;
                  criminalName?: string;
                };

                toast.success("Subject Profile Enrolled", {
                  description: crim.criminalName ? `${crim.criminalName} added to database` : "New subject record verified",
                });

                optionsRef.current.onCriminalEnrolled?.(crim);
                break;
              }

              case "SKETCH_GENERATED": {
                if ((payload.data as any)?.isCleared) {
                  optionsRef.current.onSketchesSync?.([]);
                  break;
                }

                const sk = payload.data as {
                  id: string;
                  imageUrl: string;
                  title: string;
                  prompt?: string;
                  caseNumber?: string;
                  caseTitle?: string;
                  createdAt?: string;
                };

                toast.success("Composite Sketch Synthesized", {
                  description: sk.caseNumber ? `Attached to case ${sk.caseNumber}` : "Saved to forensic vault",
                });

                optionsRef.current.onSketchGenerated?.({
                  id: sk.id,
                  imageUrl: sk.imageUrl,
                  title: sk.title,
                  prompt: sk.prompt,
                  caseNumber: sk.caseNumber,
                  caseTitle: sk.caseTitle,
                  date: new Date(sk.createdAt || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                });
                break;
              }

              case "SURVEILLANCE_HIT": {
                const hit = payload.data as {
                  criminalName?: string;
                  location?: string;
                  confidenceScore?: number;
                };

                toast.error("Surveillance Radar Alert", {
                  description: `${hit.criminalName || "Target"} sighted at ${hit.location || "Monitored Sector"}`,
                });

                optionsRef.current.onSurveillanceHit?.(hit);
                break;
              }

              default:
                break;
            }
          } catch {
            // Heartbeat or malformed frame
          }
        };

        es.onerror = () => {
          if (!mounted) return;
          setIsConnected(false);
          es.close();
          // Attempt reconnection after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };
      } catch (err) {
        console.warn("EventSource connection error:", err);
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    }

    connect();

    // ── Inter-tab Live Broadcast Channel ──
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("forensix:sketches");
        bc.onmessage = (event) => {
          if (!mounted) return;
          if (event.data?.type === "SKETCH_GENERATED" && event.data.sketch) {
            optionsRef.current.onSketchGenerated?.(event.data.sketch);
          }
        };
      }
    } catch {
      // BroadcastChannel unavailable
    }

    // ── Window Custom Event & LocalStorage Sync Fallbacks ──
    const handleSketchCustomEvent = (event: Event) => {
      if (!mounted) return;
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        optionsRef.current.onSketchGenerated?.(customEvent.detail);
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (!mounted) return;
      if (event.key === "forensix:recent-sketch-sync" && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed && parsed.imageUrl) {
            optionsRef.current.onSketchGenerated?.(parsed);
          }
        } catch {
          // ignore
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("forensix:sketch-created", handleSketchCustomEvent);
      window.addEventListener("storage", handleStorageEvent);
    }

    // ── Continuous Background Sync (Every 6 seconds + Tab Focus) ──
    async function syncSketches() {
      if (!mounted) return;
      try {
        const res = await fetch("/api/dashboard/sketches", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.sketches && Array.isArray(data.sketches)) {
            optionsRef.current.onSketchesSync?.(data.sketches);
          }
        }
      } catch {
        // Silent sync fallback
      }
    }

    const syncInterval = setInterval(syncSketches, 6000);

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        syncSketches();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      mounted = false;
      clearInterval(syncInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("forensix:sketch-created", handleSketchCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);

      if (bc) {
        bc.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return { isConnected };
}
