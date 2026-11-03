"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import type { WitnessItem } from "./types";

interface UseWitnessRealtimeOptions {
  caseId: string;
  onWitnessEnrolled?: (witness: any) => void;
  onWitnessUpdated?: (witness: any) => void;
  onWitnessDeleted?: (witnessId: string) => void;
  onInquiryLogged?: (witnessId: string, inquiry: any) => void;
}

export function useWitnessRealtime({
  caseId,
  onWitnessEnrolled,
  onWitnessUpdated,
  onWitnessDeleted,
  onInquiryLogged,
}: UseWitnessRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!caseId) return;

    let isMounted = true;
    const sseUrl = `/api/cases/${caseId}/witness-stream`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      if (isMounted) setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      if (!isMounted) return;
      try {
        const payload = JSON.parse(event.data);
        if (!payload || !payload.type) return;

        switch (payload.type) {
          case "CONNECTED":
            setIsConnected(true);
            break;

          case "WITNESS_ENROLLED":
            if (payload.data) {
              toast.info(`Live Update: Witness ${payload.data.name || "profile"} enrolled`, {
                description: `Witness code: ${payload.data.witnessCode || "FX-WIT"}`,
              });
              onWitnessEnrolled?.(payload.data);
            }
            break;

          case "WITNESS_UPDATED":
            if (payload.data) {
              toast.info(`Live Update: Witness ${payload.data.name || "profile"} updated`);
              onWitnessUpdated?.(payload.data);
            }
            break;

          case "WITNESS_DELETED":
            if (payload.data?.witnessId) {
              toast.info("Live Update: Witness record removed from registry");
              onWitnessDeleted?.(payload.data.witnessId);
            }
            break;

          case "WITNESS_INQUIRY_LOGGED":
            if (payload.data?.witnessId) {
              toast.info("Live Update: New witness inquiry recorded");
              onInquiryLogged?.(payload.data.witnessId, payload.data);
            }
            break;
        }
      } catch (e) {
        // Heartbeat or unparseable event
      }
    };

    eventSource.onerror = () => {
      if (isMounted) setIsConnected(false);
    };

    return () => {
      isMounted = false;
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [caseId, onWitnessEnrolled, onWitnessUpdated, onWitnessDeleted, onInquiryLogged]);

  return { isConnected };
}
