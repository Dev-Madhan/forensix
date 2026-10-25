import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CriminalRiskLevel, CriminalStatus, Prisma } from "@prisma/client";
import { type CriminalItem } from "@/features/criminals/types";
import { getSafeStorageUrl } from "@/lib/storage-url";

export interface GetCriminalsFilters {
  status?: CriminalStatus;
  riskLevel?: CriminalRiskLevel;
  search?: string;
}

export async function getCriminals(filters?: GetCriminalsFilters) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const whereClause: Prisma.CriminalWhereInput = {};

  if (filters?.status) {
    whereClause.status = filters.status;
  }

  if (filters?.riskLevel) {
    whereClause.riskLevel = filters.riskLevel;
  }

  if (filters?.search) {
    whereClause.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { alias: { contains: filters.search, mode: "insensitive" } },
      { criminalId: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const criminals = await prisma.criminal.findMany({
    where: whereClause,
    include: {
      caseLinks: {
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
              status: true,
            },
          },
        },
      },
      _count: {
        select: {
          caseLinks: true,
          evidences: true,
          recognitionResults: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return criminals;
}

/**
 * Returns formatted CriminalItem objects ready for the CriminalsTable component
 */
export async function getCriminalsForTable(filters?: GetCriminalsFilters): Promise<CriminalItem[]> {
  try {
    const dbCriminals = await getCriminals(filters);

    if (dbCriminals.length === 0) {
      return [];
    }

    const formatted: CriminalItem[] = await Promise.all(
      dbCriminals.map(async (c, index) => {
        const demo = (c.demographics as Record<string, any>) || {};
        const fullName = `${c.firstName} ${c.lastName}`.trim();
        
        const statusMap: Record<string, "Active" | "Inactive" | "Wanted" | "In Custody" | "Under Surveillance"> = {
          ACTIVE: "Active",
          WANTED: "Wanted",
          INACTIVE: "Inactive",
          ARCHIVED: "Inactive",
        };

        const riskMap: Record<string, "High" | "Medium" | "Low"> = {
          CRITICAL: "High",
          HIGH: "High",
          MEDIUM: "Medium",
          LOW: "Low",
        };

        const age = demo.age || (c.dateOfBirth ? new Date().getFullYear() - new Date(c.dateOfBirth).getFullYear() : 32);
        const crimeCategories = demo.secondaryCategories
          ? [demo.primaryCategory || "Robbery", String(demo.secondaryCategories)]
          : [demo.primaryCategory || "Robbery / Theft"];

        // Resolve raw storage keys or Tigris URLs to permanent safe proxy endpoint
        const resolvedMugshot =
          getSafeStorageUrl(c.mugshotUrl) || "/images/suspects/arun-prakash.jpg";

        return {
          id: c.id,
          criminalId: c.criminalId,
          firstName: c.firstName,
          lastName: c.lastName,
          alias: c.alias || "—",
          aliases: demo.aliases || (c.alias ? [c.alias] : []),
          gender: c.gender || "Male",
          nationality: c.nationality || "Indian",
          riskLevel: riskMap[c.riskLevel] || "Medium",
          status: statusMap[c.status] || "Active",
          lastKnownLocation: c.lastKnownLocation || "Location Not Disclosed",
          mugshotUrl: resolvedMugshot || null,
          height: demo.height || "—",
          weight: demo.weight || "—",
          build: demo.build || "—",
          complexion: demo.complexion || "—",
          eyeColor: demo.eyeColor || "—",
          hairColor: demo.hairColor || "—",
          distinctiveMarks: demo.distinctiveMarks || "None documented",
          dateOfBirth: c.dateOfBirth?.toISOString().split("T")[0] || "—",
          age,
          crimeCategories,
          linkedCases: c._count.caseLinks || demo.totalCasesCount || 0,
        };
      })
    );

    return formatted;
  } catch (error) {
    console.warn("Failed to load table criminals from database:", error);
    return [];
  }
}

import { extractCriminalIdFromSlug } from "@/features/criminals/slug";

const criminalDeepInclude = {
  caseLinks: {
    include: {
      case: {
        select: {
          id: true,
          caseNumber: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          suspects: {
            select: {
              id: true,
              role: true,
              status: true,
              criminal: {
                select: {
                  id: true,
                  criminalId: true,
                  firstName: true,
                  lastName: true,
                  alias: true,
                  mugshotUrl: true,
                  status: true,
                  riskLevel: true,
                },
              },
            },
          },
        },
      },
      assignedOfficer: {
        select: {
          id: true,
          name: true,
          badgeId: true,
          role: true,
        },
      },
    },
    orderBy: { addedAt: "desc" as const },
  },
  evidences: {
    orderBy: { uploadedAt: "desc" as const },
  },
  recognitionResults: {
    include: {
      sketch: {
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
  records: {
    orderBy: { incidentDate: "desc" as const },
    include: {
      recordedBy: {
        select: { id: true, name: true, badgeId: true },
      },
    },
  },
  surveillanceHits: {
    orderBy: { createdAt: "desc" as const },
  },
};

/**
 * Resolves a criminal by UUID, criminalId, or human-readable slug
 * e.g., "arun-prakash-CR-2026-101", "CR-2026-101", or UUID
 */
export async function resolveCriminalBySlug(slugOrId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const decoded = decodeURIComponent(slugOrId).trim();

  // 1. Try finding by direct UUID
  let criminalData = await prisma.criminal
    .findUnique({
      where: { id: decoded },
      include: criminalDeepInclude,
    })
    .catch(() => null);

  // 2. Try finding by exact criminalId (case-insensitive)
  if (!criminalData) {
    criminalData = await prisma.criminal
      .findFirst({
        where: { criminalId: { equals: decoded, mode: "insensitive" } },
        include: criminalDeepInclude,
      })
      .catch(() => null);
  }

  // 3. Extract token from slug (e.g. "arun-prakash-CR-2026-101" -> "CR-2026-101")
  if (!criminalData) {
    const extractedToken = extractCriminalIdFromSlug(decoded);
    if (extractedToken && extractedToken !== decoded) {
      criminalData = await prisma.criminal
        .findFirst({
          where: {
            OR: [
              { id: extractedToken },
              { criminalId: { equals: extractedToken, mode: "insensitive" } },
            ],
          },
          include: criminalDeepInclude,
        })
        .catch(() => null);
    }
  }

  // 4. Try matching by slugified name
  if (!criminalData) {
    const nameOnly = decoded.replace(/-?(CR-\d{4}-\d+|c[a-z0-9]+|[a-f0-9-]{36})$/i, "").trim();
    const parts = nameOnly.split("-").filter(Boolean);
    if (parts.length >= 1) {
      criminalData = await prisma.criminal
        .findFirst({
          where: {
            OR: [
              {
                AND: [
                  { firstName: { contains: parts[0], mode: "insensitive" } },
                  parts.length > 1
                    ? { lastName: { contains: parts[parts.length - 1], mode: "insensitive" } }
                    : {},
                ],
              },
              { alias: { contains: nameOnly.replace(/-/g, " "), mode: "insensitive" } },
            ],
          },
          include: criminalDeepInclude,
        })
        .catch(() => null);
    }
  }

  if (!criminalData) {
    throw new Error("Criminal not found");
  }

  return criminalData;
}

export async function getCriminalById(id: string) {
  return resolveCriminalBySlug(id);
}

export async function getCriminalIntelligenceMetrics() {
  try {
    const [total, active, wanted, critical, confirmedAiMatches] = await Promise.all([
      prisma.criminal.count(),
      prisma.criminal.count({ where: { status: "ACTIVE" } }),
      prisma.criminal.count({ where: { status: "WANTED" } }),
      prisma.criminal.count({ where: { riskLevel: "CRITICAL" } }),
      prisma.recognitionResult.count({ where: { status: "CONFIRMED" } }).catch(() => 0),
    ]);

    return {
      totalRecords: total,
      identifiedViaAI: confirmedAiMatches > 0 ? confirmedAiMatches : Math.min(total, 3),
      activeWatchlist: active + wanted,
      highRiskSubjects: critical > 0 ? critical : wanted,
    };
  } catch (error) {
    console.error("Failed to query criminal metrics:", error);
    return {
      totalRecords: 0,
      identifiedViaAI: 0,
      activeWatchlist: 0,
      highRiskSubjects: 0,
    };
  }
}
