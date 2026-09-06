export type EvidenceType = "Video" | "Image" | "Document" | "Audio";

export type EvidenceStatus = "Verified" | "Under Review" | "Flagged";

export type EvidenceSource = "CCTV" | "Crime Scene" | "Investigator" | "Phone Record";

export interface EvidenceAddedBy {
  name: string;
  avatar?: string;
  initials: string;
}

export interface AiAnalysisData {
  score: number;
  title: string;
  subtitle: string;
  attributes: string[];
}

export interface EvidenceItem {
  id: string; // e.g. "01", "02"
  name: string;
  description: string;
  type: EvidenceType;
  source: EvidenceSource;
  addedBy: EvidenceAddedBy;
  dateAdded: string;
  timeAdded: string;
  status: EvidenceStatus;
  fileSize: string;
  hash: string;
  location: string;
  thumbnailType:
    | "cctv"
    | "fingerprint"
    | "suspect"
    | "document"
    | "weapon"
    | "audio"
    | "receipt"
    | "vehicle";
  previewImage?: string;
  camId?: string;
  timestamp?: string;
  fullDescription: string;
  aiAnalysis: AiAnalysisData;
}
