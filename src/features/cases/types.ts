export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  location: string;
  date: string;
  timestamp?: string;
  status: "Under Investigation" | "Open" | "Solved" | "Closed";
  closedDate?: string;
  description?: string;
  assignedTo?: string;
}

export const INITIAL_CASES: CaseItem[] = [
  {
    id: "994049a2-5356-4402-8494-da404fe72f1d",
    caseNumber: "FX-2026-001",
    title: "Operation Apex: Downtown Transit Incident",
    type: "Transit Crime",
    location: "Chennai, TN",
    date: "Oct 4, 2026",
    timestamp: "09:14 PM",
    status: "Under Investigation",
    description:
      "High-priority transit corridor monitoring and forensic investigation involving key persons of interest.",
    assignedTo: "Madhan Kumar",
  },
];
