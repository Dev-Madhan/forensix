"use server";

import { recordAuditLogAction } from "@/features/audit/actions";

export interface RecordReportGenerationParams {
  caseId: string;
  caseNumber: string;
  reportVersion: string;
  generatedBy?: string;
}

/**
 * Audit recording for report generation event, utilizing the existing audit system.
 */
export async function recordReportGeneratedAction(params: RecordReportGenerationParams) {
  return recordAuditLogAction({
    caseId: params.caseId,
    caseNumber: params.caseNumber,
    action: "REPORT_GENERATED",
    entityType: "Report",
    entityId: params.caseId,
    details: {
      version: params.reportVersion,
      generatedBy: params.generatedBy || "Investigator",
      timestamp: new Date().toISOString(),
      format: "PDF (A4 Standard)",
    },
  });
}
