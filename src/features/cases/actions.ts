"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateCaseSchema, UpdateCaseSchema } from "@/schemas/case.schema";
import { revalidatePath } from "next/cache";

export async function createCase(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const result = CreateCaseSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid data", details: result.error.flatten() };
  }

  try {
    const newCase = await prisma.case.create({
      data: {
        ...result.data,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CASE_CREATED",
        entityType: "Case",
        entityId: newCase.id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/cases");
    return { success: true, data: newCase };
  } catch (error) {
    console.error("Failed to create case:", error);
    return { error: "Failed to create case" };
  }
}

export async function updateCase(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const result = UpdateCaseSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid data", details: result.error.flatten() };
  }

  try {
    const updatedCase = await prisma.case.update({
      where: { id: result.data.id },
      data: {
        title: result.data.title,
        description: result.data.description,
        status: result.data.status,
        priority: result.data.priority,
        assignedToId: result.data.assignedToId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CASE_UPDATED",
        entityType: "Case",
        entityId: updatedCase.id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/cases");
    revalidatePath(`/dashboard/cases/${updatedCase.id}`);
    return { success: true, data: updatedCase };
  } catch (error) {
    console.error("Failed to update case:", error);
    return { error: "Failed to update case" };
  }
}

export async function archiveCase(caseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        status: "ARCHIVED",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CASE_ARCHIVED",
        entityType: "Case",
        entityId: updatedCase.id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/cases");
    revalidatePath(`/dashboard/cases/${updatedCase.id}`);
    return { success: true, data: updatedCase };
  } catch (error) {
    console.error("Failed to archive case:", error);
    return { error: "Failed to archive case" };
  }
}
