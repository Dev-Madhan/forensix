import { NextRequest, NextResponse } from "next/server";
import { generateForensicSketch } from "@/services/ai/sketch";
import { AIServiceError } from "@/services/ai/client";

/**
 * Next.js server route proxy for forensic sketch synthesis.
 * Forwards requests to FastAPI `/api/v1/sketch/generate` with server-side authentication.
 * Complies with Sections 27-30 of the Forensix AI Integration Guide.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    const payload = {
      case_id: rawBody.case_id || "case-default",
      witness_id: rawBody.witness_id || "wit-default",
      attributes: rawBody.attributes || {},
      seed: rawBody.seed ?? undefined,
      resolution: rawBody.resolution ?? 512,
      steps: rawBody.steps ?? 24,
      control_strength: rawBody.control_strength ?? 0.85,
    };

    if (!payload.attributes || typeof payload.attributes !== "object") {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Facial attributes object is required.",
          },
        },
        { status: 422 }
      );
    }

    const result = await generateForensicSketch(payload);
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
