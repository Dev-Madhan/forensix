import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CriminalStatus } from "@prisma/client";

export async function getCriminals(filters?: { status?: CriminalStatus; search?: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const whereClause: any = {};

  if (filters?.status) {
    whereClause.status = filters.status;
  }

  if (filters?.search) {
    whereClause.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { alias: { contains: filters.search, mode: "insensitive" } },
      { criminalId: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const criminals = await prisma.criminal.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return criminals;
}

export async function getCriminalById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const criminalData = await prisma.criminal.findUnique({
    where: { id },
  });

  if (!criminalData) {
    throw new Error("Criminal not found");
  }

  return criminalData;
}
