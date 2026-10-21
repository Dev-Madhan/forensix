import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CaseStatus, CasePriority, Prisma } from "@prisma/client";

export async function getCases(filters?: { status?: CaseStatus; priority?: CasePriority; search?: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const whereClause: Prisma.CaseWhereInput = {};


  if (filters?.status) {
    whereClause.status = filters.status;
  }

  if (filters?.priority) {
    whereClause.priority = filters.priority;
  }

  if (filters?.search) {
    whereClause.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { caseNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const cases = await prisma.case.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return cases;
}

export async function getCaseById(caseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      evidences: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!caseData) {
    throw new Error("Case not found");
  }

  return caseData;
}

export async function getCaseSuspects(caseNumberOrId: string) {
  try {
    const caseSuspects = await prisma.caseSuspect.findMany({
      where: {
        case: {
          OR: [
            { id: caseNumberOrId },
            { caseNumber: { equals: caseNumberOrId, mode: "insensitive" } },
          ],
        },
      },
      include: {
        criminal: true,
        assignedOfficer: {
          select: {
            id: true,
            name: true,
            badgeId: true,
            role: true,
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    return caseSuspects;
  } catch (error) {
    console.warn("Failed to query case suspects:", error);
    return [];
  }
}

