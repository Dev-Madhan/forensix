import { NextRequest } from "next/server";
import { criminalEventEmitter, type CriminalEventPayload } from "@/lib/criminal-events";
import { syndicateEventEmitter, type SyndicateEventPayload } from "@/lib/syndicate-events";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ criminalId: string }> }
) {
  const { criminalId } = await context.params;

  let heartbeatTimer: NodeJS.Timeout | null = null;
  let criminalHandler: ((payload: CriminalEventPayload) => void) | null = null;
  let syndicateHandler: ((payload: SyndicateEventPayload) => void) | null = null;

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
        criminalId,
        timestamp: Date.now(),
      });

      // Criminal profile specific events (activity logs, surveillance hits, status)
      criminalHandler = (payload: CriminalEventPayload) => {
        sendEvent(payload);
      };
      criminalEventEmitter.on(`criminal:${criminalId}`, criminalHandler);

      // Syndicate events (associate links, role changes)
      syndicateHandler = (payload: SyndicateEventPayload) => {
        sendEvent({
          ...payload,
          isSyndicateEvent: true,
        });
      };
      syndicateEventEmitter.on(`syndicate:${criminalId}`, syndicateHandler);

      // Keepalive heartbeat every 15 seconds
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 15000);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (criminalHandler) {
          criminalEventEmitter.off(`criminal:${criminalId}`, criminalHandler);
        }
        if (syndicateHandler) {
          syndicateEventEmitter.off(`syndicate:${criminalId}`, syndicateHandler);
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
      if (criminalHandler) {
        criminalEventEmitter.off(`criminal:${criminalId}`, criminalHandler);
      }
      if (syndicateHandler) {
        syndicateEventEmitter.off(`syndicate:${criminalId}`, syndicateHandler);
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

