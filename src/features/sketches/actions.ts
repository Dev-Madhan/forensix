"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { searchSuspectsByVector, executeNeonQuery, FormattedSuspectCandidate } from "@/lib/neon-pgvector";

export interface StudioCaseOption {
  id: string;
  caseNumber: string;
  title: string;
  witnesses: Array<{ id: string; name: string }>;
}

export interface StudioCriminalOption {
  id: string;
  criminalId: string;
  firstName: string;
  lastName: string;
  alias?: string | null;
  mugshotUrl?: string | null;
  status: string;
}

export async function getStudioInitialData(): Promise<{
  cases: StudioCaseOption[];
  criminals: StudioCriminalOption[];
}> {
  try {
    let cases = await prisma.case.findMany({
      take: 25,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        witnesses: {
          select: { id: true, name: true },
        },
      },
    });

    // If no case exists yet, create a default demonstrative case
    if (cases.length === 0) {
      let defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        defaultUser = await prisma.user.create({
          data: {
            name: "Chief Investigator",
            email: "investigator@forensix.local",
            role: "INVESTIGATOR",
          },
        });
      }

      const newCase = await prisma.case.create({
        data: {
          caseNumber: "FX-2026-001",
          title: "Operation Apex: Downtown Transit Incident",
          description: "Investigation of unidentified suspect in high-priority downtown corridor incident.",
          status: "UNDER_INVESTIGATION",
          priority: "HIGH",
          assignedToId: defaultUser.id,
          witnesses: {
            create: [
              {
                name: "Sarah Jenkins",
                contactInfo: "s.jenkins@witness.local",
                statement: "Suspect was male, around 35 years old, sharp oval face, arched dark eyebrows, straight pointed nose, thin lips, and slight stubble.",
              },
            ],
          },
        },
        select: {
          id: true,
          caseNumber: true,
          title: true,
          witnesses: {
            select: { id: true, name: true },
          },
        },
      });
      cases = [newCase];
    }

    let criminals = await prisma.criminal.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        criminalId: true,
        firstName: true,
        lastName: true,
        alias: true,
        mugshotUrl: true,
        status: true,
      },
    });

    // Seed default known suspect catalog if empty
    if (criminals.length === 0) {
      await prisma.criminal.createMany({
        data: [
          {
            criminalId: "crim-arun-prakash-01",
            firstName: "Arun",
            lastName: "Prakash",
            alias: "The Shadow",
            gender: "Male",
            nationality: "Indian",
            mugshotUrl: "/images/suspects/arun-prakash.jpg",
            description: "Suspect associated with commercial burglary and surveillance evasion.",
            status: "WANTED",
          },
          {
            criminalId: "crim-karthik-selvan-02",
            firstName: "Karthik",
            lastName: "Selvan",
            alias: "Viper",
            gender: "Male",
            nationality: "Indian",
            mugshotUrl: "/images/suspects/karthik-selvan.jpg",
            description: "Identified in transit hub CCTV recordings; violent offender warning.",
            status: "ACTIVE",
          },
        ],
      });

      criminals = await prisma.criminal.findMany({
        take: 25,
        select: {
          id: true,
          criminalId: true,
          firstName: true,
          lastName: true,
          alias: true,
          mugshotUrl: true,
          status: true,
        },
      });
    }

    return { cases, criminals };
  } catch (error) {
    console.warn("Prisma query failed for studio initial data; querying Neon directly:", error);
    try {
      const neonCriminals = await executeNeonQuery<any>(
        `SELECT id, "criminalId", "firstName", "lastName", alias, "mugshotUrl", status FROM "Criminal" ORDER BY "createdAt" DESC LIMIT 25;`
      );
      const fallbackCriminals: StudioCriminalOption[] = neonCriminals.map((c) => ({
        id: c.id,
        criminalId: c.criminalId || c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        alias: c.alias,
        mugshotUrl: c.mugshotUrl,
        status: c.status,
      }));

      return {
        cases: [
          {
            id: "case-apex-01",
            caseNumber: "FX-2026-001",
            title: "Operation Apex: Downtown Transit Incident",
            witnesses: [
              {
                id: "wit-01",
                name: "Sarah Jenkins",
              },
            ],
          },
        ],
        criminals: fallbackCriminals,
      };
    } catch (fallbackError) {
      console.error("Failed to load studio initial data from Neon fallback:", fallbackError);
      return { cases: [], criminals: [] };
    }
  }
}

/**
 * Executes a forensic vector similarity search against Neon PostgreSQL pgvector.
 * Uses HNSW cosine distance indexing to return top matching suspect candidates.
 */
export async function searchCriminalsByPgVector(
  vector: number[],
  limit = 5
): Promise<FormattedSuspectCandidate[]> {
  return searchSuspectsByVector(vector, limit);
}


export async function attachSketchToCase(data: {
  caseId: string;
  witnessId?: string;
  imageUrl: string;
  description?: string;
}) {
  try {
    const sketch = await prisma.sketch.create({
      data: {
        caseId: data.caseId,
        witnessId: data.witnessId || null,
        imageUrl: data.imageUrl,
        description: data.description || "Synthesized AI Forensic Composite Sketch",
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "SKETCH_GENERATED",
          entityType: "Sketch",
          entityId: sketch.id,
          details: {
            caseId: data.caseId,
            witnessId: data.witnessId,
            imageUrl: data.imageUrl,
          },
        },
      });
    } catch {
      // Non-fatal audit log failure
    }

    revalidatePath("/sketch");
    revalidatePath(`/cases/${data.caseId}`);
    return { success: true, sketch };
  } catch (error: unknown) {
    console.error("Failed to attach sketch to case:", error);
    return { error: error instanceof Error ? error.message : "Failed to save sketch." };
  }
}

export async function saveRecognitionMatch(data: {
  sketchId: string;
  criminalId: string;
  matchScore: number;
  status?: "PENDING" | "CONFIRMED" | "REJECTED";
}) {
  try {
    const criminal = await prisma.criminal.findFirst({
      where: {
        OR: [
          { id: data.criminalId },
          { criminalId: data.criminalId },
        ],
      },
    });

    if (!criminal) {
      return { error: "Target criminal record not found." };
    }

    const recResult = await prisma.recognitionResult.create({
      data: {
        sketchId: data.sketchId,
        criminalId: criminal.id,
        matchScore: data.matchScore,
        status: data.status || "CONFIRMED",
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "MATCH_CONFIRMED",
          entityType: "RecognitionResult",
          entityId: recResult.id,
          details: {
            sketchId: data.sketchId,
            criminalId: criminal.id,
            matchScore: data.matchScore,
          },
        },
      });
    } catch {
      // Non-fatal
    }

    revalidatePath("/sketch");
    return { success: true, result: recResult };
  } catch (error: unknown) {
    console.error("Failed to save recognition match:", error);
    return { error: error instanceof Error ? error.message : "Failed to confirm match." };
  }
}
