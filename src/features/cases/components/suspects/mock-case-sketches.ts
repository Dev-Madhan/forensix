import type { SuspectStatus, SuspectRole } from "./types";

export interface CaseSketchMatchCandidate {
  id: string;
  criminalId: string;
  name: string;
  alias: string;
  photo: string;
  matchConfidence: number;
  rawCosineScore?: number;
  aiModel?: string;
  statisticalFar?: string;
  recommendedStatus: SuspectStatus;
  recommendedRole: SuspectRole;
  llmReasoning: string;
  priorCases: string;
  dob?: string;
  age?: number;
  gender?: string;
  height?: string;
  build?: string;
  complexion?: string;
  hairColor?: string;
  eyeColor?: string;
  identifyingMarks?: string;
  phone?: string;
  knownAddresses?: string;
  isLiveDatabaseRecord?: boolean;
}

export interface CaseSketchReference {
  id: string;
  sketchNumber: string;
  witnessStatementRef: string;
  dateGenerated: string;
  sketchImageUrl: string;
  witnessDescription: string;
  candidates: CaseSketchMatchCandidate[];
  isCaseSpecific?: boolean;
}

/**
 * Empty baseline reference collection.
 * All case sketches and biometric matches are strictly loaded from PostgreSQL database entities.
 */
export const MOCK_CASE_SKETCHES: CaseSketchReference[] = [];
