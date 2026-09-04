import { NextRequest, NextResponse } from "next/server";
import { searchSuspectRecognition } from "@/services/ai/recognition";
import { AIServiceError } from "@/services/ai/client";

/**
 * Next.js server route proxy for suspect face recognition / database search.
 * Keeps biometric/embedding operations behind the server boundary.
 * Complies with Section 27 and Phase 6/7 integration architecture.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    const imageRef = rawBody.image_reference || rawBody.image_storage_ref;

    if (!imageRef || typeof imageRef !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "image_reference is required.",
          },
        },
        { status: 422 }
      );
    }

    const payload = {
      case_id: rawBody.case_id || "case-default",
      image_reference: imageRef,
      limit: rawBody.limit ?? 5,
    };

    const result = await searchSuspectRecognition(payload);
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
