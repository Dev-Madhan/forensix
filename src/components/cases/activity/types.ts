export type ActivityCategory =
  | "Evidence"
  | "Case"
  | "Analysis"
  | "Suspect"
  | "Note"
  | "Records";

export type ActivityActionType =
  | "EVIDENCE"
  | "CASE"
  | "ANALYSIS"
  | "SUSPECT"
  | "NOTE"
  | "RECORD"
  | "DELETE"
  | "OTHER";

export interface ActivityUser {
  id?: string;
  name: string;
  role: string;
  avatar?: string;
  initials: string;
  email?: string;
  isCurrentUser?: boolean;
}

export interface ActivityItem {
  id: string; // e.g. "01", "02", "act-..."
  timestamp: string; // ISO string or parsable date
  formattedDate: string; // "Oct 5, 2026"
  formattedTime: string; // "11:32 AM"
  user: ActivityUser;
  action: string; // "Added Evidence", "Updated Case", "AI Analysis", etc.
  actionType: ActivityActionType;
  details: string; // "Added CCTV_Footage_01.mp4 to the case."
  category: ActivityCategory;
  metadata?: Record<string, unknown>;
}

export interface ActivityFilterState {
  activityType: string; // "ALL" | ActivityCategory
  userFilter: string; // "ALL" | "CURRENT_USER" | specific user name
  onlySessionUser: boolean;
  dateRange: string; // "Date Range" | "Oct 1, 2026 - Oct 5, 2026", etc.
  sortBy: "LATEST_FIRST" | "OLDEST_FIRST";
  searchQuery: string;
}

export interface ActivitySummaryStats {
  total: number;
  evidenceCount: number;
  suspectCount: number;
  caseUpdatesCount: number;
  aiAnalysisCount: number;
  deletionsCount: number;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  timestamp: string;
  formattedTime: string;
  dotColor: "blue" | "red" | "emerald" | "amber" | "purple";
  description?: string;
}
