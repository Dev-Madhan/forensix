import { prisma } from "@/lib/prisma";

export interface AuditLogDetails {
  fileName?: string;
  sha256Hash?: string;
  caseId?: string;
  [key: string]: unknown;
}

export interface CaseAuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: AuditLogDetails | null;
  userId: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    badgeId: string | null;
  } | null;
}


/**
 * Fetches the chronological audit history for a specific case.
 */
export async function getCaseAuditTimeline(caseId: string): Promise<CaseAuditLogItem[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: caseId },
          {
            details: {
              path: ["caseId"],
              equals: caseId,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            badgeId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return logs as unknown as CaseAuditLogItem[];
  } catch (error) {

    console.error("Failed to fetch case audit timeline:", error);
    return [];
  }
}
