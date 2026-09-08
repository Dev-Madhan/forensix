export type SuspectStatus = "Primary Suspect" | "Person of Interest" | "Cleared";

export type SuspectRole =
  | "Direct Involvement"
  | "Possible Associate"
  | "Accomplice"
  | "Informant"
  | "Witness"
  | "Under Investigation";

export interface AssociatedEvidenceRef {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  date: string;
}

export interface SuspectItem {
  id: string;
  numberIndex: string; // "01", "02", etc.
  name: string;
  alias: string;
  photo: string;
  status: SuspectStatus;
  role: SuspectRole | string;
  matchConfidence: number; // 0 - 100
  lastSeenDate: string;
  lastSeenTime: string;
  // Key Information & Demographics (for detail view)
  dob?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  knownAddresses?: string;
  phone?: string;
  occupation?: string;
  criminalRecord?: string;
  priorCasesCount?: number;
  // Physical Description
  height?: string;
  build?: string;
  complexion?: string;
  hairColor?: string;
  eyeColor?: string;
  identifyingMarks?: string;
  // Associated Evidence
  associatedEvidence?: AssociatedEvidenceRef[];
  notes?: string;
}
