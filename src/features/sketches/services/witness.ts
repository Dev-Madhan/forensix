import "server-only";
import { aiFetch } from "./client";
import { WitnessProcessRequest, WitnessProcessResponse } from "./types";

/**
 * Submits a natural language witness statement to the FastAPI AI service
 * for facial attribute extraction.
 */
export async function processWitnessStatement(
  payload: WitnessProcessRequest
): Promise<WitnessProcessResponse> {
  return aiFetch<WitnessProcessResponse>("/api/v1/witness/process", {
    method: "POST",
    body: payload,
  });
}
