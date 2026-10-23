"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { broadcastSyndicateEvent } from "@/lib/syndicate-events";
import { SuspectRole, SuspectCaseStatus } from "@prisma/client";
import { getCriminalSlug } from "@/features/criminals/slug";

/**
 * Server Action: Link an associate to a criminal's syndicate via mutual case association.
 */
export async function linkCoOffenderAction(input: {
  subjectId: string;
  targetCriminalId: string;
  caseId: string;
  role?: string;
  notes?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized: Investigator authentication required.");
  }

  const { subjectId, targetCriminalId, caseId, role, notes } = input;

  if (!subjectId || !targetCriminalId || !caseId) {
    throw new Error("Missing required fields: subjectId, targetCriminalId, and caseId are mandatory.");
  }

  if (subjectId === targetCriminalId) {
    throw new Error("Cannot link a subject to themselves as a co-offender.");
  }

  // 1. Verify that case exists
  const targetCase = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, caseNumber: true, title: true },
  });

  if (!targetCase) {
    throw new Error(`Case with ID ${caseId} does not exist.`);
  }

  // 2. Map role string to SuspectRole enum
  let mappedRole: SuspectRole = SuspectRole.ACCOMPLICE;
  if (role) {
    const cleanRole = role.toUpperCase().replace(/\s+/g, "_");
    if (Object.values(SuspectRole).includes(cleanRole as SuspectRole)) {
      mappedRole = cleanRole as SuspectRole;
    }
  }

  // 3. Ensure primary subject is linked to this case
  const subjectLink = await prisma.caseSuspect.findUnique({
    where: {
      caseId_criminalId: {
        caseId,
        criminalId: subjectId,
      },
    },
  });

  if (!subjectLink) {
    await prisma.caseSuspect.create({
      data: {
        caseId,
        criminalId: subjectId,
        role: SuspectRole.DIRECT_INVOLVEMENT,
        status: SuspectCaseStatus.PRIMARY_SUSPECT,
        notes: `Syndicate nexus established with linked associates.`,
      },
    });
  }

  // 4. Upsert target associate suspect link on this case
  await prisma.caseSuspect.upsert({
    where: {
      caseId_criminalId: {
        caseId,
        criminalId: targetCriminalId,
      },
    },
    update: {
      role: mappedRole,
      notes: notes || `Direct co-accused link with subject ${subjectId}`,
      updatedAt: new Date(),
    },
    create: {
      caseId,
      criminalId: targetCriminalId,
      role: mappedRole,
      status: SuspectCaseStatus.ACCOMPLICE,
      notes: notes || `Direct co-accused link with subject ${subjectId}`,
    },
  });

  // 5. Revalidate cache
  revalidatePath(`/dashboard/criminals`);
  revalidatePath(`/dashboard/criminals/${subjectId}`);

  // 6. Broadcast live real-time event across all active investigator sessions
  broadcastSyndicateEvent({
    type: "NODE_LINKED",
    criminalId: subjectId,
    associateId: targetCriminalId,
    caseNumber: targetCase.caseNumber,
    timestamp: Date.now(),
  });

  return {
    success: true,
    caseNumber: targetCase.caseNumber,
    message: `Associate successfully linked to Case ${targetCase.caseNumber}.`,
  };
}

/**
 * Server Action: Sever/unlink a co-offender relationship.
 */
export async function unlinkCoOffenderAction(input: {
  subjectId: string;
  targetCriminalId: string;
  caseId?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized.");
  }

  const { subjectId, targetCriminalId, caseId } = input;

  if (caseId) {
    // Delete target suspect's link from the specific mutual case
    await prisma.caseSuspect.deleteMany({
      where: {
        caseId,
        criminalId: targetCriminalId,
      },
    });
  } else {
    // Find all cases shared between subject and associate and remove associate
    const sharedCases = await prisma.case.findMany({
      where: {
        AND: [
          { suspects: { some: { criminalId: subjectId } } },
          { suspects: { some: { criminalId: targetCriminalId } } },
        ],
      },
      select: { id: true },
    });

    const sharedCaseIds = sharedCases.map((c) => c.id);
    if (sharedCaseIds.length > 0) {
      await prisma.caseSuspect.deleteMany({
        where: {
          caseId: { in: sharedCaseIds },
          criminalId: targetCriminalId,
        },
      });
    }
  }

  revalidatePath(`/dashboard/criminals`);
  revalidatePath(`/dashboard/criminals/${subjectId}`);

  broadcastSyndicateEvent({
    type: "NODE_UNLINKED",
    criminalId: subjectId,
    associateId: targetCriminalId,
    timestamp: Date.now(),
  });

  return {
    success: true,
    message: "Associate link successfully severed.",
  };
}

/**
 * Server Action: Update role/relationship of an associate.
 */
export async function updateAssociateRoleAction(input: {
  subjectId: string;
  targetCriminalId: string;
  caseNumber: string;
  newRole: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized.");
  }

  const cCase = await prisma.case.findUnique({
    where: { caseNumber: input.caseNumber },
    select: { id: true },
  });

  if (!cCase) {
    throw new Error(`Case ${input.caseNumber} not found.`);
  }

  const cleanRole = input.newRole.toUpperCase().replace(/\s+/g, "_") as SuspectRole;

  await prisma.caseSuspect.updateMany({
    where: {
      caseId: cCase.id,
      criminalId: input.targetCriminalId,
    },
    data: {
      role: cleanRole,
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/criminals/${input.subjectId}`);

  broadcastSyndicateEvent({
    type: "ROLE_UPDATED",
    criminalId: input.subjectId,
    associateId: input.targetCriminalId,
    caseNumber: input.caseNumber,
    timestamp: Date.now(),
  });

  return { success: true };
}

/**
 * Server Action: Fetch candidate criminals available for linking into the syndicate.
 */
export async function getCandidateAssociatesAction(currentCriminalId: string, search?: string) {
  const where: any = {
    id: { not: currentCriminalId },
  };

  if (search && search.trim()) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { alias: { contains: search, mode: "insensitive" } },
      { criminalId: { contains: search, mode: "insensitive" } },
    ];
  }

  const criminals = await prisma.criminal.findMany({
    where,
    take: 12,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      criminalId: true,
      firstName: true,
      lastName: true,
      alias: true,
      mugshotUrl: true,
      riskLevel: true,
      status: true,
    },
  });

  return criminals.map((c) => ({
    id: c.id,
    criminalId: c.criminalId,
    name: `${c.firstName} ${c.lastName}`.trim(),
    alias: c.alias,
    mugshotUrl: c.mugshotUrl,
    riskLevel: c.riskLevel,
    status: c.status,
    slug: getCriminalSlug(c),
  }));
}

/**
 * Server Action: Fetch cases available to link this subject and associate together.
 */
export async function getCasesForSyndicateLinkAction(criminalId: string) {
  // First, get cases that this criminal is already linked to
  const linkedCases = await prisma.case.findMany({
    where: {
      suspects: { some: { criminalId } },
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      caseNumber: true,
      title: true,
      status: true,
    },
  });

  // Second, get recent active open cases
  const recentCases = await prisma.case.findMany({
    where: {
      id: { notIn: linkedCases.map((c) => c.id) },
      status: { in: ["OPEN", "UNDER_INVESTIGATION"] },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseNumber: true,
      title: true,
      status: true,
    },
  });

  return {
    linkedCases,
    otherCases: recentCases,
  };
}

/**
 * Server Action: Expand 2nd-degree cartel connections ("associates of an associate").
 */
export async function getSecondDegreeAssociatesAction(
  associateId: string,
  excludeIds: string[]
) {
  const casesWithAssociate = await prisma.case.findMany({
    where: {
      suspects: { some: { criminalId: associateId } },
    },
    select: {
      id: true,
      caseNumber: true,
      title: true,
      suspects: {
        where: {
          criminalId: { notIn: [associateId, ...excludeIds] },
        },
        select: {
          role: true,
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
  });

  const secondDegreeMap = new Map<string, any>();

  for (const c of casesWithAssociate) {
    for (const s of c.suspects) {
      if (!s.criminal) continue;
      const cid = s.criminal.id;
      if (!secondDegreeMap.has(cid)) {
        secondDegreeMap.set(cid, {
          id: cid,
          criminalId: s.criminal.criminalId,
          name: `${s.criminal.firstName} ${s.criminal.lastName}`.trim(),
          alias: s.criminal.alias,
          mugshotUrl: s.criminal.mugshotUrl,
          status: s.criminal.status || "ACTIVE",
          riskLevel: s.criminal.riskLevel || "MEDIUM",
          sharedCases: [],
          slug: getCriminalSlug(s.criminal),
          isSecondDegree: true,
          bridgeAssociateId: associateId,
        });
      }

      const entry = secondDegreeMap.get(cid);
      if (!entry.sharedCases.some((sc: any) => sc.caseNumber === c.caseNumber)) {
        entry.sharedCases.push({
          caseNumber: c.caseNumber,
          title: c.title,
          role: s.role || "Co-Accused",
        });
      }
    }
  }

  return Array.from(secondDegreeMap.values());
}
