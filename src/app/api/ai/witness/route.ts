import { NextRequest, NextResponse } from "next/server";
import { processWitnessStatement } from "@/services/ai/witness";
import { AIServiceError } from "@/services/ai/client";

/**
 * Next.js server route proxy for witness statement processing.
 * Keeps AI microservice URL and authentication credentials internal to the server.
 * Complies with Sections 27-30 of the Forensix AI Integration Guide.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    const payload = {
      case_id: rawBody.case_id || "case-default",
      witness_id: rawBody.witness_id || "wit-default",
      description: rawBody.description || rawBody.text || "",
    };

    if (!payload.description || payload.description.trim().length < 10) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Witness description must be at least 10 characters.",
          },
        },
        { status: 422 }
      );
    }

    const result = await processWitnessStatement(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof AIServiceError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            requestId: error.requestId,
            details: error.details,
          },
        },
        { status: error.status }
      );
    }

    const message =
      error instanceof Error ? error.message : "Internal server proxy error";
    return NextResponse.json(
      { error: { code: "PROXY_ERROR", message } },
      { status: 500 }
    );
  }
}
