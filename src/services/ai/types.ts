/**
 * TypeScript type contracts mirroring the Criminal Eye FastAPI backend schemas.
 */

export interface BaseAIResponse {
  request_id: string;
  status: string;
  processing_time_ms: number;
}

export interface AIErrorDetail {
  code: string;
  message: string;
  request_id: string;
  details?: Record<string, unknown>;
}

export interface AIErrorResponse {
  error: AIErrorDetail;
}

// --- Witness Types ---

export interface WitnessProcessRequest {
  case_id: string;
  witness_id: string;
  description: string;
}

export interface WitnessProcessResponse extends BaseAIResponse {
  case_id: string;
  witness_id: string;
  attributes: Record<string, unknown>;
}

// --- Sketch Types ---

export interface SketchImage {
  url: string;
  content_type: string;
}

export interface SketchGenerateRequest {
  case_id: string;
  witness_id: string;
  attributes: Record<string, unknown>;
  seed?: number;
  resolution?: number;
  steps?: number;
  control_strength?: number;
}

export interface SketchGenerateResponse extends BaseAIResponse {
  case_id: string;
  witness_id: string;
  image: SketchImage;
  seed?: number;
  metadata?: Record<string, unknown>;
}


// --- Recognition Types ---

export interface SuspectMatch {
  criminal_id: string;
  confidence_score: number;
  metadata?: Record<string, unknown>;
}

export interface RecognitionSearchRequest {
  case_id: string;
  image_reference: string;
  limit?: number;
}

export interface RecognitionSearchResponse extends BaseAIResponse {
  case_id: string;
  matches: SuspectMatch[];
}
