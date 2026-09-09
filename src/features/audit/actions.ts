"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActivityItem, ActivityCategory, ActivityActionType } from "@/components/cases/activity/types";

export interface CreateAuditLogParams {
  caseId?: string;
  caseNumber?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

/**
 * Server action to record an audit log in Postgres if database is connected.
 */
export async function recordAuditLogAction(params: CreateAuditLogParams) {
  try {
    let userId: string | null = null;

    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // Graceful fallback if session reading fails
    }

    const created = await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType || "Case",
        entityId: params.entityId || params.caseId || null,
        details: (params.details || {}) as any,
        userId: userId,
      },
    });

    if (params.caseNumber) {
      revalidatePath(`/case-details/${params.caseNumber}`);
    }

    return { success: true, logId: created.id };
  } catch (error) {
    console.warn("AuditLog recording skipped or database offline:", error);
    return { success: false, fallback: true };
  }
}

/**
 * Helper to normalize raw database audit logs into frontend ActivityItem structure
 */
function normalizeAuditLogToActivity(log: {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: unknown;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    image?: string | null;
    avatarUrl?: string | null;
  } | null;
}): ActivityItem {
  const detailsObj = (log.details as Record<string, unknown>) || {};
  const actionRaw = log.action.toUpperCase();

  let category: ActivityCategory = "Case";
  let actionType: ActivityActionType = "CASE";
  let actionLabel = log.action;

  if (actionRaw.includes("EVIDENCE") || log.entityType === "Evidence") {
    category = "Evidence";
    actionType = "EVIDENCE";
    actionLabel = actionRaw.includes("ADD") ? "Added Evidence" : "Evidence Updated";
  } else if (actionRaw.includes("SUSPECT") || actionRaw.includes("CRIMINAL")) {
    category = "Suspect";
    actionType = "SUSPECT";
    actionLabel = actionRaw.includes("ADD") ? "Added Suspect" : "Updated Suspect";
  } else if (actionRaw.includes("RECOGNITION") || actionRaw.includes("ANALYSIS") || actionRaw.includes("MATCH")) {
    category = "Analysis";
    actionType = "ANALYSIS";
    actionLabel = actionRaw.includes("RECOGNITION") ? "Facial Recognition" : "AI Analysis";
  } else if (actionRaw.includes("NOTE")) {
    category = "Note";
    actionType = "NOTE";
    actionLabel = "Added Note";
  } else if (actionRaw.includes("RECORD") || actionRaw.includes("LINK")) {
    category = "Records";
    actionType = "RECORD";
    actionLabel = "Linked Record";
  } else if (actionRaw.includes("CREATE")) {
    category = "Case";
    actionType = "CASE";
    actionLabel = "Case Created";
  } else if (actionRaw.includes("DELETE") || actionRaw.includes("REMOVE")) {
    actionType = "DELETE";
    actionLabel = "Removed Item";
  }

  const detailText =
    (typeof detailsObj.description === "string" && detailsObj.description) ||
    (typeof detailsObj.details === "string" && detailsObj.details) ||
    (typeof detailsObj.fileName === "string" && `Evidence file ${detailsObj.fileName} processed.`) ||
    (typeof detailsObj.note === "string" && detailsObj.note) ||
    `Action ${actionLabel} recorded on ${log.entityType}.`;

  const userName = log.user?.name || "System";
  const userInitials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SY";

  return {
    id: log.id,
    timestamp: log.createdAt.toISOString(),
    formattedDate: log.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    formattedTime: log.createdAt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    user: {
      id: log.user?.id,
      name: userName,
      role: log.user?.role || (log.user ? "Investigator" : "Forensix AI"),
      avatar: log.user?.image || log.user?.avatarUrl || undefined,
      initials: userInitials,
      email: log.user?.email,
    },
    action: actionLabel,
    actionType,
    details: detailText,
    category,
    metadata: detailsObj,
  };
}

/**
 * Server action to fetch real case activity logs from Prisma AuditLog table in PostgreSQL.
 * Returns null if database is empty/unavailable so the UI gracefully falls back to seed data.
 */
export async function fetchRealCaseActivityLogs(
  caseId?: string,
  caseNumber?: string
): Promise<ActivityItem[] | null> {
  if (!caseId && !caseNumber) return null;

  try {
    const whereConditions: any[] = [];
    if (caseId) whereConditions.push({ entityId: caseId });
    if (caseNumber) whereConditions.push({ entityId: caseNumber });

    const rawLogs = await prisma.auditLog.findMany({
      where: {
        OR: whereConditions.length > 0 ? whereConditions : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    if (!rawLogs || rawLogs.length === 0) {
      return null;
    }

    return rawLogs.map(normalizeAuditLogToActivity);
  } catch (err) {
    console.warn("fetchRealCaseActivityLogs error (using fallback):", err);
    return null;
  }
}
