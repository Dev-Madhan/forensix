import { NextResponse } from "next/server";
import { aiFetch, AIServiceError } from "@/services/ai/client";

/**
 * Next.js server route to query AI microservice health & readiness.
 * Complies with Section 24 and Section 40 of the Forensix AI Integration Guide.
 */
export async function GET() {
  try {
    const health = await aiFetch<{ status: string; service: string }>(
      "/api/v1/health",
      { method: "GET", timeoutMs: 5000 }
    );
    return NextResponse.json(health, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AIServiceError) {
      return NextResponse.json(
        {
          status: "unavailable",
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        status: "unavailable",
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "AI microservice is unreachable.",
        },
      },
      { status: 503 }
    );
  }
}
