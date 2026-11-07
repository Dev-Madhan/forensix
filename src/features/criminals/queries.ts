import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CriminalRiskLevel, CriminalStatus, Prisma } from "@prisma/client";
import { type CriminalItem } from "@/features/criminals/types";
import { getSafeStorageUrl } from "@/lib/storage-url";
import { formatCriminalDob, computeCriminalAge } from "@/features/criminals/formatters";

export interface GetCriminalsFilters {
  status?: CriminalStatus | string;
  riskLevel?: CriminalRiskLevel | string;
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  take?: number;
  skip?: number;
  sortKey?: "name" | "id" | "dob" | "risk" | "status";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedCriminalsResult {
  items: CriminalItem[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export async function getCriminals(filters?: GetCriminalsFilters) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const whereClause: Prisma.CriminalWhereInput = {};

  if (filters?.status && filters.status !== "ALL") {
    const raw = String(filters.status).toUpperCase();
    if (Object.values(CriminalStatus).includes(raw as CriminalStatus)) {
      whereClause.status = raw as CriminalStatus;
    }
  }

  if (filters?.riskLevel && filters.riskLevel !== "ALL") {
    const raw = String(filters.riskLevel).toUpperCase();
    if (Object.values(CriminalRiskLevel).includes(raw as CriminalRiskLevel)) {
      whereClause.riskLevel = raw as CriminalRiskLevel;
    }
  }

  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim();
    whereClause.OR = [
      { firstName: { contains: s, mode: "insensitive" } },
      { lastName: { contains: s, mode: "insensitive" } },
      { alias: { contains: s, mode: "insensitive" } },
      { criminalId: { contains: s, mode: "insensitive" } },
      { lastKnownLocation: { contains: s, mode: "insensitive" } },
    ];
  }

  // Calculate order
  let orderByClause: Prisma.CriminalOrderByWithRelationInput = { createdAt: "desc" };
  if (filters?.sortKey) {
    const dir = filters.sortOrder === "asc" ? "asc" : "desc";
    if (filters.sortKey === "name") {
      orderByClause = { lastName: dir };
    } else if (filters.sortKey === "id") {
      orderByClause = { criminalId: dir };
    } else if (filters.sortKey === "dob") {
      orderByClause = { dateOfBirth: dir };
    } else if (filters.sortKey === "risk") {
      orderByClause = { riskLevel: dir };
    } else if (filters.sortKey === "status") {
      orderByClause = { status: dir };
    }
  }

  const page = Math.max(1, filters?.page || 1);
  const pageSize = filters?.pageSize || filters?.take;
  const skip =
    filters?.skip !== undefined
      ? filters.skip
      : filters?.page && pageSize
      ? (page - 1) * pageSize
      : undefined;
  const take = pageSize;

  const [criminals, totalCount] = await Promise.all([
    prisma.criminal.findMany({
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
      orderBy: orderByClause,
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
    }),
    prisma.criminal.count({ where: whereClause }),
  ]);

  return { criminals, totalCount, page, pageSize: pageSize || totalCount };
}

/**
 * Returns formatted CriminalItem objects ready for the CriminalsTable component
 * Returns an array decorated with pagination metadata for backwards compatibility.
 */
export async function getCriminalsForTable(
  filters?: GetCriminalsFilters
): Promise<CriminalItem[] & { totalCount: number; pageCount: number; currentPage: number; pageSize: number }> {
  try {
    const { criminals: dbCriminals, totalCount, page, pageSize } = await getCriminals(filters);

    if (dbCriminals.length === 0) {
      const empty = [] as unknown as CriminalItem[] & {
        totalCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
      };
      empty.totalCount = totalCount;
      empty.pageCount = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));
      empty.currentPage = page;
      empty.pageSize = pageSize;
      return empty;
    }

    const formatted = (await Promise.all(
      dbCriminals.map(async (c) => {
        const demo = (c.demographics as Record<string, any>) || {};
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

        const age = computeCriminalAge(c.dateOfBirth, demo.age);
        const formattedDob = formatCriminalDob(c.dateOfBirth);

        // Normalize crime categories (support both demo.secondaryCategory and demo.secondaryCategories)
        const primaryCat = demo.primaryCategory || demo.category || "General Offense";
        const secondaryCat = demo.secondaryCategory || demo.secondaryCategories;
        const secondaryList = Array.isArray(secondaryCat)
          ? secondaryCat
          : typeof secondaryCat === "string" && secondaryCat.trim()
          ? secondaryCat.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
        const crimeCategories = Array.from(new Set([primaryCat, ...secondaryList].filter(Boolean)));
        if (crimeCategories.length === 0) {
          crimeCategories.push("General Offense");
        }

        // Normalize aliases from DB column and demographic metadata
        const rawAliases = [
          ...(Array.isArray(demo.aliases) ? demo.aliases : demo.aliases ? [demo.aliases] : []),
          ...(demo.knownAs ? [demo.knownAs] : []),
          ...(c.alias ? [c.alias] : []),
        ].filter(Boolean);
        const aliases = Array.from(new Set(rawAliases));
        const primaryAlias = c.alias || demo.knownAs || (aliases.length > 0 ? aliases[0] : "—");

        // Resolve raw storage keys or Tigris URLs to permanent safe proxy endpoint
        const resolvedMugshot =
          getSafeStorageUrl(c.mugshotUrl) || "/images/suspects/arun-prakash.jpg";

        // Fallback location matching profile resolution
        const resolvedLocation =
          c.lastKnownLocation ||
          c.address ||
          demo.knownAddresses ||
          demo.placeOfBirth ||
          "Location Not Disclosed";

        return {
          id: c.id,
          criminalId: c.criminalId,
          firstName: c.firstName,
          lastName: c.lastName,
          alias: primaryAlias,
          aliases: aliases.length > 0 ? aliases : (primaryAlias !== "—" ? [primaryAlias] : []),
          gender: c.gender || demo.gender || "Male",
          nationality: c.nationality || demo.nationality || "Indian",
          riskLevel: riskMap[c.riskLevel] || "Medium",
          status: statusMap[c.status] || "Active",
          lastKnownLocation: resolvedLocation,
          mugshotUrl: resolvedMugshot || null,
          height: demo.height || "—",
          weight: demo.weight || "—",
          build: demo.build || "—",
          complexion: demo.complexion || "—",
          eyeColor: demo.eyeColor || "—",
          hairColor: demo.hairColor || "—",
          distinctiveMarks: demo.distinctiveMarks || demo.tattoos || "None documented",
          dateOfBirth: formattedDob,
          age,
          crimeCategories,
          linkedCases: c._count.caseLinks || demo.totalCasesCount || 0,
        };
      })
    )) as CriminalItem[] & {
      totalCount: number;
      pageCount: number;
      currentPage: number;
      pageSize: number;
    };

    formatted.totalCount = totalCount;
    formatted.pageCount = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));
    formatted.currentPage = page;
    formatted.pageSize = pageSize;

    return formatted;
  } catch (error) {
    console.warn("Failed to load table criminals from database:", error);
    const fallback = [] as unknown as CriminalItem[] & {
      totalCount: number;
      pageCount: number;
      currentPage: number;
      pageSize: number;
    };
    fallback.totalCount = 0;
    fallback.pageCount = 1;
    fallback.currentPage = 1;
    fallback.pageSize = 50;
    return fallback;
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
      identifiedViaAI: confirmedAiMatches,
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
