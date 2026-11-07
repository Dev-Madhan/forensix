"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { tigrisEvidenceValidator, getFileCategory } from "@/lib/evidence-upload-config";

export async function uploadEvidence(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Unauthorized: Active session required to upload evidence." };
    }

    const rawCaseId = (formData.get("caseId") as string)?.trim() || "";
    const rawCaseNumber = (formData.get("caseNumber") as string)?.trim() || "";
    const file = formData.get("file") as File;
    const titleInput = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const categoryInput = (formData.get("category") as string)?.trim();
    const source = (formData.get("source") as string)?.trim() || "CRIME_SCENE";
    const status = (formData.get("status") as string)?.trim() || "VERIFIED";
    const locationFound = (formData.get("locationFound") as string)?.trim() || null;
    const criminalId = (formData.get("criminalId") as string)?.trim() || null;

    let metadata: Record<string, any> | null = null;
    try {
      const metaStr = formData.get("metadata") as string;
      if (metaStr) metadata = JSON.parse(metaStr);
    } catch {
      // Ignore JSON parse errors for optional metadata
    }

    if (!file || typeof file.arrayBuffer !== "function" || file.size <= 0) {
      return { error: "A valid non-empty file is required for evidence upload." };
    }

    // 1. Robust Case Resolution: match either Case.id (UUID) or Case.caseNumber
    let targetCase: { id: string; caseNumber: string } | null = null;
    const caseLookupQueries = [rawCaseId, rawCaseNumber].filter(Boolean);

    for (const identifier of caseLookupQueries) {
      targetCase = await prisma.case.findFirst({
        where: {
          OR: [
            { id: identifier },
            { caseNumber: { equals: identifier, mode: "insensitive" } },
          ],
        },
        select: { id: true, caseNumber: true },
      });
      if (targetCase) break;
    }

    // 2. Resolve criminalId (support both Criminal.id and Criminal.criminalId slug)
    let resolvedCriminalDbId: string | null = null;
    if (criminalId) {
      const targetCriminal = await prisma.criminal.findFirst({
        where: {
          OR: [
            { id: criminalId },
            { criminalId: { equals: criminalId, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      if (targetCriminal) {
        resolvedCriminalDbId = targetCriminal.id;
      }
    }

    // 3. Fallback: If caseId was not provided or not matched, attempt finding case via suspect link
    if (!targetCase && resolvedCriminalDbId) {
      const suspect = await prisma.caseSuspect.findFirst({
        where: { criminalId: resolvedCriminalDbId },
        select: { caseId: true },
      });
      if (suspect) {
        targetCase = await prisma.case.findUnique({
          where: { id: suspect.caseId },
          select: { id: true, caseNumber: true },
        });
      }
    }

    // 4. Fallback: If still not found, associate to the latest active case
    if (!targetCase) {
      targetCase = await prisma.case.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, caseNumber: true },
      });
    }

    if (!targetCase) {
      return { error: "Target investigation case could not be located." };
    }

    // 5. Enforce storage validation
    const validationError = tigrisEvidenceValidator(file);
    if (validationError) {
      return { error: validationError.message };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate SHA-256 for cryptographic chain of custody
    const hashSum = crypto.createHash("sha256");
    hashSum.update(buffer);
    const sha256Hash = hashSum.digest("hex");

    // Secure Storage Key in Tigris S3
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const evidenceId = crypto.randomUUID();
    const storageKey = `cases/${targetCase.id}/evidence/${evidenceId}/${safeFileName}`;

    const mimeType = file.type || "application/octet-stream";
    const detectedCategory = categoryInput && categoryInput !== "UNKNOWN" ? categoryInput : getFileCategory(file);
    const title = titleInput || file.name || "Evidence Item";

    // Upload binary stream to Tigris Object Storage
    await tigris.send(
      new PutObjectCommand({
        Bucket: TIGRIS_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    const fileUrl = `https://fly.storage.tigris.dev/${TIGRIS_BUCKET}/${storageKey}`;

    // Create Database Record with complete metadata linked to targetCase.id (UUID)
    const evidence = await prisma.evidence.create({
      data: {
        caseId: targetCase.id,
        criminalId: resolvedCriminalDbId || undefined,
        title,
        description,
        category: detectedCategory,
        source,
        status,
        locationFound,
        fileName: file.name,
        storageKey,
        mimeType,
        fileSize: file.size,
        sha256Hash,
        fileUrl,
        metadata: metadata || undefined,
        uploadedBy: session.user.id,
      },
    });

    // Write persistent Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "EVIDENCE_UPLOADED",
          entityType: "Evidence",
          entityId: evidence.id,
          userId: session.user.id,
          details: {
            caseId: targetCase.id,
            caseNumber: targetCase.caseNumber,
            fileName: file.name,
            title,
            category: detectedCategory,
            sha256Hash,
          },
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr);
    }

    // Revalidate routes
    revalidatePath(`/cases/${targetCase.caseNumber}`);
    revalidatePath(`/case-details/${targetCase.caseNumber}`);
    revalidatePath(`/dashboard/cases/${targetCase.id}`);
    revalidatePath(`/dashboard/cases/${targetCase.caseNumber}`);
    revalidatePath(`/case-details/${targetCase.id}`);
    revalidatePath(`/cases`);
    revalidatePath(`/dashboard/cases`);
    revalidatePath(`/evidence`);
    revalidatePath(`/dashboard/evidence`);
    if (resolvedCriminalDbId) {
      revalidatePath(`/dashboard/criminals/${resolvedCriminalDbId}`);
      revalidatePath(`/criminals/${resolvedCriminalDbId}`);
    }

    return { success: true, data: evidence };
  } catch (error: any) {
    console.error("Failed to upload evidence:", error);
    return { error: error?.message || "Failed to upload evidence to storage" };
  }
}

export async function deleteEvidence(evidenceId: string, caseId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Unauthorized" };
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        case: { select: { id: true, caseNumber: true } },
      },
    });

    if (!evidence) {
      return { error: "Evidence not found" };
    }

    // Delete from Tigris Object Storage
    try {
      await tigris.send(
        new DeleteObjectCommand({
          Bucket: TIGRIS_BUCKET,
          Key: evidence.storageKey,
        })
      );
    } catch (s3Err) {
      console.warn("Failed to delete object from Tigris S3:", s3Err);
    }

    // Delete record from Prisma DB
    await prisma.evidence.delete({
      where: { id: evidenceId },
    });

    // Write audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "EVIDENCE_DELETED",
          entityType: "Evidence",
          entityId: evidenceId,
          userId: session.user.id,
          details: {
            caseId: evidence.caseId,
            caseNumber: evidence.case?.caseNumber,
            fileName: evidence.fileName,
            sha256Hash: evidence.sha256Hash,
          },
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr);
    }

    const targetCaseNumber = evidence.case?.caseNumber;
    revalidatePath(`/cases/${evidence.caseId}`);
    revalidatePath(`/case-details/${evidence.caseId}`);
    revalidatePath(`/dashboard/cases/${evidence.caseId}`);
    if (targetCaseNumber) {
      revalidatePath(`/cases/${targetCaseNumber}`);
      revalidatePath(`/case-details/${targetCaseNumber}`);
      revalidatePath(`/dashboard/cases/${targetCaseNumber}`);
    }
    revalidatePath(`/dashboard/cases`);
    revalidatePath(`/cases`);
    revalidatePath(`/dashboard/evidence`);
    revalidatePath(`/evidence`);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete evidence:", error);
    return { error: error?.message || "Failed to delete evidence" };
  }
}

export async function updateEvidenceStatus(
  evidenceId: string,
  caseId: string,
  status: string,
  notes?: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Unauthorized" };
    }

    const updated = await prisma.evidence.update({
      where: { id: evidenceId },
      data: { status },
      include: {
        case: { select: { id: true, caseNumber: true } },
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "EVIDENCE_STATUS_UPDATED",
          entityType: "Evidence",
          entityId: evidenceId,
          userId: session.user.id,
          details: { caseId, status, notes },
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr);
    }

    const targetCaseNumber = updated.case?.caseNumber;
    revalidatePath(`/cases/${caseId}`);
    revalidatePath(`/case-details/${caseId}`);
    revalidatePath(`/dashboard/cases/${caseId}`);
    if (targetCaseNumber) {
      revalidatePath(`/cases/${targetCaseNumber}`);
      revalidatePath(`/case-details/${targetCaseNumber}`);
    }
    revalidatePath(`/dashboard/cases`);
    revalidatePath(`/cases`);
    revalidatePath(`/dashboard/evidence`);
    revalidatePath(`/evidence`);

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update evidence status:", error);
    return { error: error?.message || "Failed to update evidence status" };
  }
}
