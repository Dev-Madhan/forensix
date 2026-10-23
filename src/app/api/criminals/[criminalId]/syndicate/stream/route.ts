import { NextRequest } from "next/server";
import { syndicateEventEmitter, type SyndicateEventPayload } from "@/lib/syndicate-events";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ criminalId: string }> }
) {
  const { criminalId } = await context.params;

  let heartbeatTimer: NodeJS.Timeout | null = null;
  let eventHandler: ((payload: SyndicateEventPayload) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (payload: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // Controller might already be closed
        }
      };

      // Initial connection acknowledgment
      sendEvent({
        type: "CONNECTED",
        criminalId,
        timestamp: Date.now(),
      });

      // Listen for syndicate events targeted to this criminal
      eventHandler = (payload: SyndicateEventPayload) => {
        sendEvent(payload);
      };

      syndicateEventEmitter.on(`syndicate:${criminalId}`, eventHandler);

      // Keepalive heartbeat ping every 15s to keep proxy/gateway connections active
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 15000);

      // Clean up when client disconnects or aborts
      request.signal.addEventListener("abort", () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (eventHandler) {
          syndicateEventEmitter.off(`syndicate:${criminalId}`, eventHandler);
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
        syndicateEventEmitter.off(`syndicate:${criminalId}`, eventHandler);
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
