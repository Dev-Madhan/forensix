export type WitnessType =
  | "EYEWITNESS"
  | "VICTIM_WITNESS"
  | "EARWITNESS"
  | "FIRST_RESPONDER"
  | "INFORMANT"
  | "EXPERT_WITNESS"
  | "CHARACTER_WITNESS";

export type WitnessCredibility =
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNVERIFIED"
  | "COMPROMISED";

export type WitnessAvailability =
  | "ACTIVE_AVAILABLE"
  | "RELOCATED"
  | "UNREACHABLE"
  | "UNDER_PROTECTION"
  | "SUBPOENA_ISSUED"
  | "DECEASED";

export type IdentificationType =
  | "AADHAAR"
  | "PASSPORT"
  | "DRIVERS_LICENSE"
  | "NATIONAL_ID"
  | "VOTER_ID"
  | "OTHER";

export interface WitnessInquiryItem {
  id: string;
  witnessId: string;
  investigatorId: string;
  investigatorName: string;
  investigatorInitials: string;
  inquiryDate: string;
  contactMethod: string;
  purpose: string;
  notes: string;
  outcome?: string | null;
  nextFollowUpDate?: string | null;
  createdAt: string;
}

export interface WitnessItem {
  id: string;
  witnessCode: string;
  caseId: string;
  caseNumber?: string;
  name: string;
  alias?: string | null;
  dateOfBirth?: string | null;
  ageAtIncident?: number | null;
  gender?: string | null;
  occupation?: string | null;
  employerName?: string | null;
  idType: IdentificationType;
  idNumberMasked?: string | null;
  idVerified: boolean;
  contactInfo?: string | null;
  primaryPhone: string;
  secondaryPhone?: string | null;
  email?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyRelationship?: string | null;
  currentAddress?: string | null;
  permanentAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  witnessType: WitnessType;
  credibility: WitnessCredibility;
  availabilityStatus: WitnessAvailability;
  isProtected: boolean;
  protectionProtocol?: string | null;
  incidentDistanceMeters?: number | null;
  lightingCondition?: string | null;
  weatherCondition?: string | null;
  observationDurationSec?: number | null;
  timeElapsedHours?: number | null;
  impairmentFactors?: string | null;
  confidenceScore?: number | null;
  statement: string;
  statementAudioUrl?: string | null;
  keyFacialFeatures?: string | null;
  interviewDate: string;
  interviewingOfficerName?: string | null;
  sketchesCount: number;
  inquiriesCount: number;
  inquiries: WitnessInquiryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WitnessStats {
  total: number;
  availableCount: number;
  eyewitnessCount: number;
  highCredibilityCount: number;
  protectedCount: number;
  withSketchesCount: number;
}
