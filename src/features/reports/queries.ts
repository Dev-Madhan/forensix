import { prisma } from "@/lib/prisma";
import { resolveCaseBySlug } from "@/features/cases/resolve-case";
import { MOCK_EVIDENCE_ITEMS } from "@/components/cases/evidence/mock-evidence";
import { MOCK_CASE_SKETCHES } from "@/components/cases/suspects/mock-case-sketches";
import { INITIAL_SUSPECTS } from "@/components/cases/suspects/mock-suspects";

export interface CaseReportRawSource {
  dbCase: any | null;
  resolvedDetail: any;
  mockEvidence: typeof MOCK_EVIDENCE_ITEMS;
  mockSketches: typeof MOCK_CASE_SKETCHES;
  mockSuspects: typeof INITIAL_SUSPECTS;
}

/**
 * Retrieves the comprehensive raw source data required to compile a case report.
 * Strictly queries Prisma first with all relations, and gracefully supplements
 * with case metadata if relations are not yet populated in the database.
 */
export async function getCaseReportSource(
  caseIdentifier: string
): Promise<CaseReportRawSource | null> {
  const decodedId = decodeURIComponent(caseIdentifier).trim();

  let dbCase = null;
  try {
    dbCase = await prisma.case.findFirst({
      where: {
        OR: [
          { id: decodedId },
          { caseNumber: { equals: decodedId, mode: "insensitive" } },
        ],
      },
      include: {
        assignedTo: true,
        witnesses: {
          include: {
            sketches: true,
          },
        },
        sketches: {
          include: {
            witness: true,
            recognitionResults: {
              include: {
                criminal: true,
              },
            },
          },
        },
        evidences: {
          orderBy: { uploadedAt: "desc" },
        },
        reports: {
          orderBy: { createdAt: "desc" },
          include: {
            author: true,
          },
        },
        // Audit logs can be matched by entityId
      },
    });
  } catch (error) {
    console.warn("Database query skipped or unavailable in getCaseReportSource:", error);
  }

  // Also resolve case details via existing resolver for consistent metadata
  let resolvedDetail;
  try {
    resolvedDetail = await resolveCaseBySlug(caseIdentifier);
  } catch {
    if (!dbCase) return null;
  }

  if (!dbCase && !resolvedDetail) {
    return null;
  }

  return {
    dbCase,
    resolvedDetail,
    mockEvidence: MOCK_EVIDENCE_ITEMS,
    mockSketches: MOCK_CASE_SKETCHES,
    mockSuspects: INITIAL_SUSPECTS,
  };
}
