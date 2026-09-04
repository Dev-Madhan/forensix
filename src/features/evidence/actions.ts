"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function uploadEvidence(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const caseId = formData.get("caseId") as string;
  const file = formData.get("file") as File;

  if (!caseId || !file) {
    return { error: "Case ID and File are required" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate SHA256 for integrity
    const hashSum = crypto.createHash("sha256");
    hashSum.update(buffer);
    const sha256Hash = hashSum.digest("hex");

    // Secure Storage Key
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const evidenceId = crypto.randomUUID();
    const storageKey = `cases/${caseId}/evidence/${evidenceId}/${safeFileName}`;

    // Upload to Tigris
    await tigris.send(
      new PutObjectCommand({
        Bucket: TIGRIS_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Create Database Record
    const evidence = await prisma.evidence.create({
      data: {
        caseId,
        fileName: file.name,
        storageKey,
        mimeType: file.type,
        fileSize: file.size,
        sha256Hash,
        uploadedBy: session.user.id,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "EVIDENCE_UPLOADED",
        entityType: "Evidence",
        entityId: evidence.id,
        userId: session.user.id,
        details: { caseId, fileName: file.name, sha256Hash },
      },
    });

    revalidatePath(`/dashboard/cases/${caseId}`);
    return { success: true, data: evidence };
  } catch (error) {
    console.error("Failed to upload evidence:", error);
    return { error: "Failed to upload evidence" };
  }
}

export async function deleteEvidence(evidenceId: string, caseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      return { error: "Evidence not found" };
    }

    // Delete from Tigris Object Storage
    await tigris.send(
      new DeleteObjectCommand({
        Bucket: TIGRIS_BUCKET,
        Key: evidence.storageKey,
      })
    );

    // Delete record from Prisma DB
    await prisma.evidence.delete({
      where: { id: evidenceId },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: "EVIDENCE_DELETED",
        entityType: "Evidence",
        entityId: evidenceId,
        userId: session.user.id,
        details: { caseId, fileName: evidence.fileName, sha256Hash: evidence.sha256Hash },
      },
    });

    revalidatePath(`/dashboard/cases/${caseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete evidence:", error);
    return { error: "Failed to delete evidence" };
  }
}
