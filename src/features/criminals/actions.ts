"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateCriminalSchema, UpdateCriminalSchema } from "@/schemas/criminal.schema";
import { revalidatePath } from "next/cache";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

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
    const criminal = await prisma.criminal.create({
      data: {
        ...result.data,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_CREATED",
        entityType: "Criminal",
        entityId: criminal.id,
        userId: session.user.id,
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
      },
    });

    revalidatePath("/dashboard/criminals");
    revalidatePath(`/dashboard/criminals/${criminal.id}`);
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
