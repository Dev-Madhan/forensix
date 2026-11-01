import { NextRequest } from "next/server";
import { criminalEventEmitter, type CriminalEventPayload } from "@/lib/criminal-events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let eventHandler: ((payload: CriminalEventPayload) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (payload: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // Stream might be closed
        }
      };

      // Initial connection greeting
      sendEvent({
        type: "CONNECTED",
        channel: "global",
        timestamp: Date.now(),
      });

      // Listen for all forensic criminal events on the global channel
      eventHandler = (payload: CriminalEventPayload) => {
        sendEvent(payload);
      };

      criminalEventEmitter.on("criminal:global", eventHandler);

      // Keepalive heartbeat every 15s to prevent timeouts
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 15000);

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (eventHandler) {
          criminalEventEmitter.off("criminal:global", eventHandler);
        }
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
    cancel() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (eventHandler) {
        criminalEventEmitter.off("criminal:global", eventHandler);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

