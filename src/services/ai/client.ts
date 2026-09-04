import "server-only";
import { env } from "@/env";
import { AIErrorResponse } from "./types";
import crypto from "crypto";

export class AIServiceError extends Error {
  public readonly code: string;
  public readonly requestId: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    status: number = 500,
    requestId: string = "unknown",
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Server-side client executing authenticated requests to the FastAPI AI microservice.
 * Secrets and backend endpoints are never exposed to browser bundles.
 */
export async function aiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = env.AI_SERVICE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const requestId = `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const timeoutMs = options.timeoutMs ?? 30000;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Request-ID": requestId,
    ...options.headers,
  };

  if (env.AI_SERVICE_SECRET) {
    headers["X-AI-Secret"] = env.AI_SERVICE_SECRET;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: options.method || "POST",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const responseRequestId =
      response.headers.get("X-Request-ID") || requestId;

    if (!response.ok) {
      let errorData: AIErrorResponse | null = null;
      try {
        errorData = (await response.json()) as AIErrorResponse;
      } catch {
        // Response was not JSON
      }

      const code = errorData?.error?.code || `HTTP_${response.status}`;
      const message =
        errorData?.error?.message ||
        `AI Service responded with status ${response.status}: ${response.statusText}`;

      throw new AIServiceError(
        message,
        code,
        response.status,
        responseRequestId,
        errorData?.error?.details
      );
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof AIServiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AIServiceError(
        `AI Service request to ${path} timed out after ${timeoutMs}ms.`,
        "TIMEOUT",
        504,
        requestId
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown AI Service connection error";
    throw new AIServiceError(
      `Failed to communicate with AI Service at ${path}: ${message}`,
      "SERVICE_UNAVAILABLE",
      503,
      requestId
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
