export interface CaseMediaItem {
  id: string;
  title: string;
  category: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "SKETCH";
  source?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  metadata?: {
    cameraName?: string;
    timestamp?: string;
    location?: string;
    duration?: number;
    [key: string]: unknown;
  };
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  location: string;
  date: string;
  timestamp?: string;
  status: "Under Investigation" | "Open" | "Solved" | "Closed" | "Cold" | "Archived";
  closedDate?: string;
  description?: string;
  assignedTo?: string;
  media?: CaseMediaItem[];
}

export const INITIAL_CASES: CaseItem[] = [
  {
    id: "994049a2-5356-4402-8494-da404fe72f1d",
    caseNumber: "FX-2026-185",
    title: "Operation Apex: Downtown Transit Incident",
    type: "Transit Crime",
    location: "Madurai, TN (Goripalayam Junction)",
    date: "Nov 1, 2026",
    timestamp: "09:14 PM",
    status: "Cold",
    description:
      "Incident Location: Madurai, TN (Goripalayam Junction)\n\nHigh-priority transit corridor monitoring and forensic investigation involving key persons of interest.",
    assignedTo: "Lead Investigator",
    media: [],
  },
];
