import "server-only";
import { aiFetch } from "./client";
import { SketchGenerateRequest, SketchGenerateResponse } from "./types";

/**
 * Requests the synthesis of a forensic composite sketch from facial attributes.
 */
export async function generateForensicSketch(
  payload: SketchGenerateRequest
): Promise<SketchGenerateResponse> {
  return aiFetch<SketchGenerateResponse>("/api/v1/sketch/generate", {
    method: "POST",
    body: payload,
  });
}
