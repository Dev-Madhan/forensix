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
  prompt?: string;
  sketch_style?: string;
  camera_angle?: "frontal" | "three_quarter" | "profile";
  age_group?: string;
  gender?: string;
  ethnicity?: string;
  lighting_mood?: "neutral_studio" | "crime_scene";
  detail_level?: "Draft" | "Standard" | "Master";
}

export interface LLMForensicAnalysis {
  feature_summary?: Record<string, string>;
  morphological_traits?: string[];
  demographic_heritage?: string;
  age_markers?: string[];
  perspective_parameters?: Record<string, unknown>;
  style_execution?: Record<string, unknown>;
  confidence_score?: number;
  reasoning?: string;
}

export interface SketchGenerateResponse extends BaseAIResponse {
  case_id: string;
  witness_id: string;
  image: SketchImage;
  seed?: number;
  llm_analysis?: LLMForensicAnalysis;
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
  query_embedding?: number[];
  vector_engine?: string;
}
