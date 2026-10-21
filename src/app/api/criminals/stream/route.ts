import { NextRequest } from "next/server";
import { criminalEventBus, RealtimeCriminalEvent } from "@/lib/sse-bus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetCriminalId = searchParams.get("criminalId");

  const encoder = new TextEncoder();

  // Send initial connection handshake event
  const initialPayload = `data: ${JSON.stringify({
    type: "CONNECTED",
    timestamp: new Date().toISOString(),
    message: "Forensix Central Intelligence Event Stream Active",
    targetCriminalId: targetCriminalId || "ALL",
  })}\n\n`;

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial handshake
      controller.enqueue(encoder.encode(initialPayload));

      // 2. Bus event listener
      const eventHandler = (event: RealtimeCriminalEvent) => {
        if (!targetCriminalId || event.criminalId === targetCriminalId || event.data?.criminalId === targetCriminalId) {
          try {
            const sseFormatted = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(sseFormatted));
          } catch {
            // Controller closed
          }
        }
      };

      const unsubscribe = criminalEventBus.subscribe(eventHandler);

      // 3. 15s Heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping ${new Date().toISOString()}\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
          unsubscribe();
        }
      }, 15000);

      cleanup = () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
      };

      req.signal.addEventListener("abort", () => {
        if (cleanup) cleanup();
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      if (cleanup) cleanup();
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
