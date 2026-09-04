import "server-only";
import { aiFetch } from "./client";
import { RecognitionSearchRequest, RecognitionSearchResponse } from "./types";

/**
 * Searches candidate suspect records by matching the query sketch/image reference.
 */
export async function searchSuspectRecognition(
  payload: RecognitionSearchRequest
): Promise<RecognitionSearchResponse> {
  return aiFetch<RecognitionSearchResponse>("/api/v1/recognition/search", {
    method: "POST",
    body: payload,
  });
}
