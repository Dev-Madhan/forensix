"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  CreateCriminalSchema,
  UpdateCriminalSchema,
  LinkCriminalToCaseSchema,
  CreateCriminalRecordSchema,
} from "@/schemas/criminal.schema";
import { revalidatePath } from "next/cache";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { CriminalRiskLevel, CriminalStatus } from "@prisma/client";
import { getEvidenceSignedUrl } from "@/features/evidence/queries";
import { getSafeStorageUrl } from "@/lib/storage-url";

export async function createCriminal(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const result = CreateCriminalSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid data", details: result.error.flatten() };
  }

  try {
    const createPayload = { ...result.data };
    if (!createPayload.criminalId || createPayload.criminalId.trim() === "") {
      delete createPayload.criminalId;
    }

    const criminal = await prisma.criminal.create({
      data: createPayload,
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_CREATED",
        entityType: "Criminal",
        entityId: criminal.id,
        userId: session.user.id,
        details: {
          criminalId: criminal.criminalId,
          name: `${criminal.firstName} ${criminal.lastName}`,
          status: criminal.status,
          riskLevel: criminal.riskLevel,
        },
      },
    });


    revalidatePath("/dashboard/criminals");
    return { success: true, data: criminal };
  } catch (error) {
    console.error("Failed to create criminal:", error);
    return { error: "Failed to create criminal" };
  }
}

export async function updateCriminal(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const result = UpdateCriminalSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid data", details: result.error.flatten() };
  }

  try {
    const { id, ...updateData } = result.data;
    const criminal = await prisma.criminal.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_UPDATED",
        entityType: "Criminal",
        entityId: criminal.id,
        userId: session.user.id,
        details: {
          updatedFields: Object.keys(updateData),
          status: criminal.status,
          riskLevel: criminal.riskLevel,
        },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminal.id}`);
    if (criminal.criminalId) {
      revalidatePath(`/dashboard/criminals/${criminal.criminalId}`);
    }
    return { success: true, data: criminal };
  } catch (error) {
    console.error("Failed to update criminal:", error);
    return { error: "Failed to update criminal" };
  }
}

export async function uploadMugshot(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "File is required" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const mugshotId = crypto.randomUUID();
    const storageKey = `criminals/mugshots/${mugshotId}/${safeFileName}`;

    await tigris.send(
      new PutObjectCommand({
        Bucket: TIGRIS_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return { success: true, storageKey };
  } catch (error) {
    console.error("Failed to upload mugshot:", error);
    return { error: "Failed to upload mugshot" };
  }
}

export async function archiveCriminal(criminalId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const criminal = await prisma.criminal.update({
      where: { id: criminalId },
      data: {
        status: "ARCHIVED",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_ARCHIVED",
        entityType: "Criminal",
        entityId: criminal.id,
        userId: session.user.id,
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminal.id}`);
    return { success: true, data: criminal };
  } catch (error) {
    console.error("Failed to archive criminal:", error);
    return { error: "Failed to archive criminal" };
  }
}

/**
 * Link a Criminal to a Case as a Suspect with role, status, and match confidence
 */
export async function linkCriminalToCase(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const result = LinkCriminalToCaseSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid link parameters", details: result.error.flatten() };
  }

  const { caseId, criminalId, status, role, matchConfidence, notes } = result.data;

  try {
    // 1. Resolve actual Case in database (by UUID or caseNumber)
    let targetCase = await prisma.case.findFirst({
      where: {
        OR: [
          { id: caseId },
          { caseNumber: { equals: caseId, mode: "insensitive" } },
        ],
      },
      select: { id: true, caseNumber: true, title: true },
    });

    if (!targetCase) {
      // Auto-upsert case if not present yet
      const defaultOfficer = await prisma.user.findFirst({ select: { id: true } });
      targetCase = await prisma.case.create({
        data: {
          caseNumber: caseId.includes("-") ? caseId : `FX-2026-${Math.floor(180 + Math.random() * 20)}`,
          title: `Investigation ${caseId}`,
          status: "UNDER_INVESTIGATION",
          priority: "HIGH",
          assignedToId: defaultOfficer?.id || session.user.id,
        },
        select: { id: true, caseNumber: true, title: true },
      });
    }

    // 2. Resolve actual Criminal in database (by UUID or criminalId code)
    let targetCriminal = await prisma.criminal.findFirst({
      where: {
        OR: [
          { id: criminalId },
          { criminalId: { equals: criminalId, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        criminalId: true,
        firstName: true,
        lastName: true,
        alias: true,
      },
    });

    if (!targetCriminal) {
      // Look up in mock constants or auto-create if newly linked
      targetCriminal = await prisma.criminal.create({
        data: {
          criminalId: criminalId.startsWith("CRIM-") ? criminalId : `CRIM-${Date.now().toString().slice(-4)}`,
          firstName: "Suspect",
          lastName: criminalId,
          alias: "Person of Interest",
          status: "ACTIVE",
          riskLevel: "MEDIUM",
        },
        select: {
          id: true,
          criminalId: true,
          firstName: true,
          lastName: true,
          alias: true,
        },
      });
    }

    const actualCaseId = targetCase.id;
    const actualCriminalId = targetCriminal.id;

    const caseSuspect = await prisma.caseSuspect.upsert({
      where: {
        caseId_criminalId: {
          caseId: actualCaseId,
          criminalId: actualCriminalId,
        },
      },
      update: {
        status,
        role,
        matchConfidence,
        notes,
        assignedOfficerId: session.user.id,
      },
      create: {
        caseId: actualCaseId,
        criminalId: actualCriminalId,
        status,
        role,
        matchConfidence,
        notes,
        assignedOfficerId: session.user.id,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        criminal: {
          select: {
            id: true,
            criminalId: true,
            firstName: true,
            lastName: true,
            alias: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CASE_SUSPECT_LINKED",
        entityType: "CaseSuspect",
        entityId: caseSuspect.id,
        userId: session.user.id,
        details: {
          caseId: actualCaseId,
          caseNumber: caseSuspect.case.caseNumber,
          criminalId: actualCriminalId,
          criminalName: `${caseSuspect.criminal.firstName} ${caseSuspect.criminal.lastName}`,
          role,
          status,
          matchConfidence,
        },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${actualCriminalId}`);
    revalidatePath(`/case-details/${caseSuspect.case.caseNumber}`);
    revalidatePath(`/case-details/${actualCaseId}`);

    return { success: true, data: caseSuspect };
  } catch (error) {
    console.error("Failed to link criminal to case:", error);
    return { error: "Failed to link criminal to case" };
  }
}

/**
 * Unlink a Criminal from a Case
 */
export async function unlinkCriminalFromCase(caseId: string, criminalId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    // Resolve case by ID or caseNumber
    const targetCase = await prisma.case.findFirst({
      where: {
        OR: [
          { id: caseId },
          { caseNumber: { equals: caseId, mode: "insensitive" } },
        ],
      },
      select: { id: true, caseNumber: true },
    });

    const actualCaseId = targetCase?.id || caseId;

    // Resolve criminal by ID or criminalId
    const targetCriminal = await prisma.criminal.findFirst({
      where: {
        OR: [
          { id: criminalId },
          { criminalId: { equals: criminalId, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    const actualCriminalId = targetCriminal?.id || criminalId;

    await prisma.caseSuspect.deleteMany({
      where: {
        caseId: actualCaseId,
        criminalId: actualCriminalId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CASE_SUSPECT_UNLINKED",
        entityType: "CaseSuspect",
        userId: session.user.id,
        details: { caseId: actualCaseId, criminalId: actualCriminalId },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${actualCriminalId}`);
    if (targetCase?.caseNumber) {
      revalidatePath(`/case-details/${targetCase.caseNumber}`);
    }
    revalidatePath(`/case-details/${actualCaseId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to unlink criminal from case:", error);
    return { error: "Failed to unlink criminal from case" };
  }
}

/**
 * Get available registered criminals for linking to a case
 */
export async function getAvailableCriminalsForCase(searchTerm?: string) {
  try {
    const where: any = {};
    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { alias: { contains: q, mode: "insensitive" } },
        { criminalId: { contains: q, mode: "insensitive" } },
        { lastKnownLocation: { contains: q, mode: "insensitive" } },
      ];
    }

    const criminals = await prisma.criminal.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 25,
      select: {
        id: true,
        criminalId: true,
        firstName: true,
        lastName: true,
        alias: true,
        status: true,
        riskLevel: true,
        mugshotUrl: true,
        lastKnownLocation: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
      },
    });

    const resolved = await Promise.all(
      criminals.map(async (c) => {
        let mugshot = c.mugshotUrl;
        if (
          mugshot &&
          !mugshot.startsWith("http://") &&
          !mugshot.startsWith("https://") &&
          !mugshot.startsWith("/")
        ) {
          try {
            mugshot = await getEvidenceSignedUrl(mugshot);
          } catch {
            mugshot = `/api/storage?key=${encodeURIComponent(c.mugshotUrl!)}`;
          }
        }
        return {
          ...c,
          mugshotUrl: mugshot || "/images/suspects/arun-prakash.jpg",
        };
      })
    );

    return { success: true, data: resolved };
  } catch (error) {
    console.error("Failed to fetch available criminals:", error);
    return { error: "Failed to fetch criminals", data: [] };
  }
}


/**
 * Quick status & risk level updater with real-time broadcast
 */
export async function updateCriminalStatusAndRisk(params: {
  criminalId: string;
  status?: CriminalStatus;
  riskLevel?: CriminalRiskLevel;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const criminal = await prisma.criminal.update({
      where: { id: params.criminalId },
      data: {
        ...(params.status ? { status: params.status } : {}),
        ...(params.riskLevel ? { riskLevel: params.riskLevel } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_STATUS_OR_RISK_UPDATED",
        entityType: "Criminal",
        entityId: criminal.id,
        userId: session.user.id,
        details: {
          newStatus: criminal.status,
          newRiskLevel: criminal.riskLevel,
        },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminal.id}`);
    return { success: true, data: criminal };
  } catch (error) {
    console.error("Failed to update status and risk:", error);
    return { error: "Failed to update status and risk" };
  }
}


/**
 * Create an official Judicial / Criminal Record (Priors, Convictions, Cases)
 */
export async function createCriminalRecord(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const result = CreateCriminalRecordSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid data", details: result.error.flatten() };
  }

  try {
    const record = await prisma.criminalRecord.create({
      data: {
        ...result.data,
        recordedById: session.user.id,
      },
      include: {
        criminal: {
          select: {
            id: true,
            criminalId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_RECORD_CREATED",
        entityType: "CriminalRecord",
        entityId: record.id,
        userId: session.user.id,
        details: {
          criminalId: record.criminalId,
          courtCaseNumber: record.courtCaseNumber,
          offenceType: record.offenceType,
          status: record.status,
          outcome: record.outcome,
        },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${record.criminalId}`);
    if (record.criminal?.criminalId) {
      revalidatePath(`/dashboard/criminals/${record.criminal.criminalId}`);
    }

    return { success: true, data: record };
  } catch (error) {
    console.error("Failed to create criminal record:", error);
    return { error: "Failed to create criminal record" };
  }
}

/**
 * Delete a Judicial / Criminal Record
 */
export async function deleteCriminalRecord(recordId: string, criminalId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.criminalRecord.delete({
      where: { id: recordId },
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_RECORD_DELETED",
        entityType: "CriminalRecord",
        entityId: recordId,
        userId: session.user.id,
        details: { criminalId, recordId },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminalId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete criminal record:", error);
    return { error: "Failed to delete criminal record" };
  }
}

/**
 * Persistently toggle priority watchlist status on PostgreSQL
 */
export async function toggleCriminalWatchlist(criminalId: string, onWatchlist: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const existing = await prisma.criminal.findUnique({
      where: { id: criminalId },
      select: { id: true, criminalId: true, demographics: true },
    });

    if (!existing) {
      return { error: "Criminal not found" };
    }

    const currentDemo = (existing.demographics as Record<string, any>) || {};
    const updatedDemo = {
      ...currentDemo,
      watchlistStatus: onWatchlist ? "On Watchlist" : "Standard",
    };

    const updated = await prisma.criminal.update({
      where: { id: criminalId },
      data: {
        watchlistStatus: onWatchlist ? "PRIORITY_WATCHLIST" : "STANDARD",
        demographics: updatedDemo,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: onWatchlist ? "PLACED_ON_WATCHLIST" : "REMOVED_FROM_WATCHLIST",
        entityType: "Criminal",
        entityId: criminalId,
        userId: session.user.id,
        details: { onWatchlist },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminalId}`);
    if (existing.criminalId) {
      revalidatePath(`/dashboard/criminals/${existing.criminalId}`);
    }

    return { success: true, onWatchlist };
  } catch (error) {
    console.error("Failed to toggle criminal watchlist:", error);
    return { error: "Failed to toggle watchlist" };
  }
}

/**
 * Bulk toggle watchlist status for multiple criminals
 */
export async function bulkToggleCriminalWatchlist(criminalIds: string[], onWatchlist: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const existing = await prisma.criminal.findMany({
      where: { id: { in: criminalIds } },
      select: { id: true, criminalId: true, demographics: true },
    });

    if (existing.length === 0) {
      return { error: "No matching suspects found" };
    }

    const targetIds = existing.map((c) => c.id);

    await prisma.$transaction(
      existing.map((c) => {
        const currentDemo = (c.demographics as Record<string, any>) || {};
        return prisma.criminal.update({
          where: { id: c.id },
          data: {
            watchlistStatus: onWatchlist ? "PRIORITY_WATCHLIST" : "STANDARD",
            demographics: {
              ...currentDemo,
              watchlistStatus: onWatchlist ? "On Watchlist" : "Standard",
            },
          },
        });
      })
    );

    await prisma.auditLog.create({
      data: {
        action: onWatchlist ? "BULK_PLACED_ON_WATCHLIST" : "BULK_REMOVED_FROM_WATCHLIST",
        entityType: "Criminal",
        entityId: "BULK",
        userId: session.user.id,
        details: { count: targetIds.length, targetIds, onWatchlist },
      },
    });


    revalidatePath("/dashboard/criminals");
    return { success: true, count: targetIds.length, onWatchlist };
  } catch (error) {
    console.error("Failed to bulk toggle watchlist:", error);
    return { error: "Failed to update suspects watchlist status" };
  }
}

/**
 * Bulk update status for multiple suspects
 */
export async function bulkUpdateCriminalStatus(criminalIds: string[], status: CriminalStatus) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const existing = await prisma.criminal.findMany({
      where: { id: { in: criminalIds } },
      select: { id: true, criminalId: true },
    });

    if (existing.length === 0) {
      return { error: "No matching suspects found" };
    }

    const targetIds = existing.map((c) => c.id);

    await prisma.criminal.updateMany({
      where: { id: { in: targetIds } },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: "BULK_CRIMINAL_STATUS_UPDATED",
        entityType: "Criminal",
        entityId: "BULK",
        userId: session.user.id,
        details: { count: targetIds.length, targetIds, status },
      },
    });


    revalidatePath("/dashboard/criminals");
    return { success: true, count: targetIds.length, status };
  } catch (error) {
    console.error("Failed to bulk update criminal status:", error);
    return { error: "Failed to update suspects status" };
  }
}


/**
 * Upload an updated front-facing booking photo / mugshot to Tigris S3 and update Criminal
 */
export async function updateCriminalPhoto(criminalId: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "File is required" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compute SHA-256 integrity hash
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const mugshotId = crypto.randomUUID();
    const storageKey = `criminals/${criminalId}/mugshots/${mugshotId}/${safeFileName}`;

    await tigris.send(
      new PutObjectCommand({
        Bucket: TIGRIS_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const updated = await prisma.criminal.update({
      where: { id: criminalId },
      data: {
        mugshotUrl: storageKey,
      },
      select: { id: true, criminalId: true, mugshotUrl: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_PHOTO_UPDATED",
        entityType: "Criminal",
        entityId: criminalId,
        userId: session.user.id,
        details: { storageKey, sha256, fileName: file.name },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminalId}`);
    if (updated.criminalId) {
      revalidatePath(`/dashboard/criminals/${updated.criminalId}`);
    }

    return { success: true, storageKey };
  } catch (error) {
    console.error("Failed to update criminal photo:", error);
    return { error: "Failed to update criminal photo" };
  }
}

/**
 * Upload Biometric Assets (Fingerprint card scan or DNA profile report) to Tigris S3
 */
export async function uploadCriminalBiometric(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const criminalId = formData.get("criminalId") as string;
  const biometricType = (formData.get("biometricType") as string) || "fingerprint";
  const file = formData.get("file") as File;

  if (!criminalId || !file) {
    return { error: "Criminal ID and File are required" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageKey = `criminals/${criminalId}/biometrics/${biometricType}/${crypto.randomUUID()}/${safeFileName}`;

    await tigris.send(
      new PutObjectCommand({
        Bucket: TIGRIS_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const updateData: Record<string, any> = {
      biometricEnrolledAt: new Date(),
    };

    if (biometricType === "fingerprint") {
      updateData.fingerprintScanUrl = storageKey;
    } else if (biometricType === "dna") {
      updateData.dnaProfileCode = `CODIS-${sha256.substring(0, 10).toUpperCase()}`;
    }

    const updated = await prisma.criminal.update({
      where: { id: criminalId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: "BIOMETRIC_ASSET_ENROLLED",
        entityType: "Criminal",
        entityId: criminalId,
        userId: session.user.id,
        details: { biometricType, storageKey, sha256 },
      },
    });


    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminalId}`);

    return { success: true, storageKey, biometricType };
  } catch (error) {
    console.error("Failed to upload biometric asset:", error);
    return { error: "Failed to upload biometric asset" };
  }
}

/**
 * Runs a biometric face comparison search across all database suspects and sketches
 */
export async function runCriminalFacialBiometricSearch(criminalId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Fetch current subject and check if embedding is enrolled
    const subject = await prisma.criminal.findUnique({
      where: { id: criminalId },
      include: {
        recognitionResults: {
          include: {
            sketch: {
              include: {
                case: true,
              },
            },
          },
          take: 5,
        },
      },
    });

    if (!subject) {
      return { error: "Subject not found" };
    }

    // Check if subject has an enrolled pgvector embedding
    const subjectEmbCheck: any = await prisma.$queryRawUnsafe(
      `SELECT (embedding IS NOT NULL) as has_embedding FROM "Criminal" WHERE id = '${criminalId}'`
    );
    const hasEmbedding = Boolean(subjectEmbCheck?.[0]?.has_embedding);

    let candidates: Array<{
      id: string;
      name: string;
      code: string;
      confidence: number;
      imageSrc: string | null;
      status: string;
    }> = [];

    if (hasEmbedding) {
      // 2a. Execute real pgvector cosine similarity query
      const rows: any = await prisma.$queryRawUnsafe(`
        SELECT 
          id, 
          "criminalId", 
          "firstName", 
          "lastName", 
          "alias", 
          "status", 
          "mugshotUrl",
          1 - ("embedding" <=> (SELECT "embedding" FROM "Criminal" WHERE id = '${criminalId}')) AS similarity
        FROM "Criminal"
        WHERE id != '${criminalId}' AND "embedding" IS NOT NULL
        ORDER BY "embedding" <=> (SELECT "embedding" FROM "Criminal" WHERE id = '${criminalId}') ASC
        LIMIT 6;
      `);

      candidates = rows.map((c: any) => {
        const sim = Number(c.similarity) || 0;
        const confidence = Math.round(Math.max(0.1, Math.min(1, sim)) * 100);
        return {
          id: c.id,
          name: `${c.firstName} ${c.lastName}`.trim(),
          code: c.criminalId,
          confidence,
          imageSrc: c.mugshotUrl ? getSafeStorageUrl(c.mugshotUrl) : null,
          status: c.status,
        };
      });
    } else {
      // 2b. Subject does not have an embedding enrolled yet
      const otherCriminals = await prisma.criminal.findMany({
        where: { id: { not: criminalId } },
        take: 6,
        select: {
          id: true,
          criminalId: true,
          firstName: true,
          lastName: true,
          status: true,
          mugshotUrl: true,
        },
      });

      candidates = otherCriminals.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        code: c.criminalId,
        confidence: 0,
        imageSrc: c.mugshotUrl ? getSafeStorageUrl(c.mugshotUrl) : null,
        status: c.status,
      }));
    }

    const safeSubjectImg = subject.mugshotUrl
      ? getSafeStorageUrl(subject.mugshotUrl)
      : null;

    return {
      success: true,
      hasEmbedding,
      candidates,
      scannedAt: new Date().toISOString(),
      subjectMugshot: safeSubjectImg,
      message: hasEmbedding
        ? `Evaluated ${candidates.length} candidate comparisons via Neon pgvector cosine similarity.`
        : "Subject does not have a 512D facial embedding enrolled yet. Catalog candidates displayed for manual comparison.",
    };
  } catch (error) {
    console.error("Failed to run facial biometric search:", error);
    return { error: "Failed to run biometric search" };
  }
}
