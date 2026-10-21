"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  CreateCriminalSchema,
  UpdateCriminalSchema,
  LinkCriminalToCaseSchema,
  RecordSurveillanceHitSchema,
} from "@/schemas/criminal.schema";
import { revalidatePath } from "next/cache";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { criminalEventBus } from "@/lib/sse-bus";
import { CriminalRiskLevel, CriminalStatus, SurveillanceHitStatus } from "@prisma/client";

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

    // Broadcast real-time event to connected investigators
    criminalEventBus.broadcast({
      type: "CRIMINAL_CREATED",
      criminalId: criminal.id,
      data: {
        criminalId: criminal.criminalId,
        firstName: criminal.firstName,
        lastName: criminal.lastName,
        alias: criminal.alias,
        status: criminal.status,
        riskLevel: criminal.riskLevel,
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

    // Broadcast real-time event
    criminalEventBus.broadcast({
      type: "CRIMINAL_UPDATED",
      criminalId: criminal.id,
      data: {
        criminalId: criminal.criminalId,
        status: criminal.status,
        riskLevel: criminal.riskLevel,
        updatedFields: Object.keys(updateData),
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

    criminalEventBus.broadcast({
      type: "STATUS_CHANGED",
      criminalId: criminal.id,
      data: { status: "ARCHIVED" },
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
    const caseSuspect = await prisma.caseSuspect.upsert({
      where: {
        caseId_criminalId: {
          caseId,
          criminalId,
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
        caseId,
        criminalId,
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
          caseId,
          caseNumber: caseSuspect.case.caseNumber,
          criminalId,
          criminalName: `${caseSuspect.criminal.firstName} ${caseSuspect.criminal.lastName}`,
          role,
          status,
          matchConfidence,
        },
      },
    });

    // Realtime Broadcast
    criminalEventBus.broadcast({
      type: "CASE_LINKED",
      criminalId,
      data: {
        caseId,
        caseNumber: caseSuspect.case.caseNumber,
        caseTitle: caseSuspect.case.title,
        status,
        role,
        matchConfidence,
      },
    });

    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminalId}`);
    revalidatePath(`/case-details/${caseSuspect.case.caseNumber}`);
    revalidatePath(`/case-details/${caseId}`);

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
    await prisma.caseSuspect.delete({
      where: {
        caseId_criminalId: {
          caseId,
          criminalId,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CASE_SUSPECT_UNLINKED",
        entityType: "CaseSuspect",
        userId: session.user.id,
        details: { caseId, criminalId },
      },
    });

    criminalEventBus.broadcast({
      type: "CASE_UNLINKED",
      criminalId,
      data: { caseId, criminalId },
    });

    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminalId}`);
    revalidatePath(`/case-details/${caseId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to unlink criminal from case:", error);
    return { error: "Failed to unlink criminal from case" };
  }
}

/**
 * Record a Live Surveillance / ANPR sensor hit into the central database
 */
export async function recordSurveillanceHit(data: unknown) {
  const result = RecordSurveillanceHitSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid sensor hit data", details: result.error.flatten() };
  }

  const {
    criminalId,
    sensorId,
    sensorName,
    location,
    latitude,
    longitude,
    confidenceScore,
    capturedMediaUrl,
    details,
  } = result.data;

  try {
    const hit = await prisma.surveillanceHit.create({
      data: {
        criminalId,
        sensorId,
        sensorName,
        location,
        latitude,
        longitude,
        confidenceScore,
        capturedMediaUrl,
        details,
        status: "UNACKNOWLEDGED",
      },
      include: {
        criminal: {
          select: {
            id: true,
            criminalId: true,
            firstName: true,
            lastName: true,
            alias: true,
            status: true,
            riskLevel: true,
          },
        },
      },
    });

    // Also record into immutable AuditLog
    await prisma.auditLog.create({
      data: {
        action: "SURVEILLANCE_HIT_RECORDED",
        entityType: "SurveillanceHit",
        entityId: hit.id,
        details: {
          criminalId,
          sensorId,
          location,
          confidenceScore,
          isHighRisk: hit.criminal.status === "WANTED" || hit.criminal.riskLevel === "CRITICAL",
        },
      },
    });

    // Broadcast live event across all active screens
    criminalEventBus.broadcast({
      type: "SURVEILLANCE_HIT",
      criminalId,
      data: {
        hitId: hit.id,
        sensorId: hit.sensorId,
        sensorName: hit.sensorName || hit.sensorId,
        location: hit.location,
        coordinates: [hit.latitude, hit.longitude],
        confidenceScore: hit.confidenceScore,
        subjectName: `${hit.criminal.firstName} ${hit.criminal.lastName}`,
        subjectAlias: hit.criminal.alias,
        status: hit.criminal.status,
        riskLevel: hit.criminal.riskLevel,
        capturedMediaUrl: hit.capturedMediaUrl,
        timestamp: hit.createdAt.toISOString(),
      },
    });

    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminalId}`);

    return { success: true, data: hit };
  } catch (error) {
    console.error("Failed to record surveillance hit:", error);
    return { error: "Failed to record surveillance hit" };
  }
}

/**
 * Acknowledge an active surveillance detection
 */
export async function acknowledgeSurveillanceHit(hitId: string, status: SurveillanceHitStatus = "INVESTIGATING") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const updated = await prisma.surveillanceHit.update({
      where: { id: hitId },
      data: {
        status,
        acknowledgedBy: session.user.id,
        acknowledgedAt: new Date(),
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to acknowledge hit:", error);
    return { error: "Failed to acknowledge hit" };
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

    criminalEventBus.broadcast({
      type: "STATUS_CHANGED",
      criminalId: criminal.id,
      data: {
        status: criminal.status,
        riskLevel: criminal.riskLevel,
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
 * Simulates a realistic live sensor ping on demand (e.g. from the Live Radar UI button)
 */
export async function triggerLiveRadarSimulatedDetection(criminalId: string) {
  const sensors = [
    {
      sensorId: "ANPR-CAM-11-ANNA-SALAI",
      sensorName: "Anna Salai High-Speed ANPR Camera #11",
      location: "Anna Salai - Mount Road Junction, Chennai",
      latitude: 13.0604,
      longitude: 80.2496,
      score: 0.965,
      detail: "Automated license recognition detected vehicle matching registered associate vehicle.",
    },
    {
      sensorId: "CCTV-AI-03-CENTRAL-STATION",
      sensorName: "Central Railway Station CCTV Terminal #03",
      location: "Chennai Central Railway Station - Gate 4",
      latitude: 13.0827,
      longitude: 80.2707,
      score: 0.938,
      detail: "Biometric face tracker matched subject face embedding with 93.8% confidence.",
    },
    {
      sensorId: "METRO-RADAR-GATE-02",
      sensorName: "Airport Metro Station Concourse Sensor",
      location: "Chennai Airport Metro Concourse",
      latitude: 12.9818,
      longitude: 80.1637,
      score: 0.912,
      detail: "Perimeter checkpoint camera triggered facial similarity match.",
    },
  ];

  const pick = sensors[Math.floor(Math.random() * sensors.length)];
  return await recordSurveillanceHit({
    criminalId,
    sensorId: pick.sensorId,
    sensorName: pick.sensorName,
    location: pick.location,
    latitude: pick.latitude,
    longitude: pick.longitude,
    confidenceScore: pick.score,
    details: pick.detail,
  });
}
