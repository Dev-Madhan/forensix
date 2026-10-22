"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { searchSuspectsByVector, executeNeonQuery, FormattedSuspectCandidate } from "@/lib/neon-pgvector";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";

export interface StudioCaseOption {
  id: string;
  caseNumber: string;
  title: string;
  witnesses: Array<{ id: string; name: string; statement?: string | null }>;
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

export async function getStudioInitialData(targetCaseIdentifier?: string): Promise<{
  cases: StudioCaseOption[];
  criminals: StudioCriminalOption[];
}> {
  try {
    let cases = await prisma.case.findMany({
      take: 30,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        witnesses: {
          select: { id: true, name: true, statement: true },
        },
      },
    });

    // If a targetCaseIdentifier was requested, ensure it's loaded and positioned at index 0
    if (targetCaseIdentifier) {
      const targetMatchIndex = cases.findIndex(
        (c) => c.id === targetCaseIdentifier || c.caseNumber.toLowerCase() === targetCaseIdentifier.toLowerCase()
      );

      if (targetMatchIndex > 0) {
        const [target] = cases.splice(targetMatchIndex, 1);
        cases.unshift(target);
      } else if (targetMatchIndex === -1) {
        const directMatch = await prisma.case.findFirst({
          where: {
            OR: [
              { id: targetCaseIdentifier },
              { caseNumber: targetCaseIdentifier },
            ],
          },
          select: {
            id: true,
            caseNumber: true,
            title: true,
            witnesses: {
              select: { id: true, name: true, statement: true },
            },
          },
        });
        if (directMatch) {
          cases.unshift(directMatch);
        }
      }
    }

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
            select: { id: true, name: true, statement: true },
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
                statement: "Suspect was male, around 35 years old, sharp oval face, arched dark eyebrows, straight pointed nose, thin lips, and slight stubble.",
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
      include: {
        sketch: {
          select: {
            id: true,
            caseId: true,
            case: {
              select: {
                id: true,
                caseNumber: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Automatically link suspect to the Case if sketch is associated with a case
    if (recResult.sketch?.caseId) {
      await prisma.caseSuspect.upsert({
        where: {
          caseId_criminalId: {
            caseId: recResult.sketch.caseId,
            criminalId: criminal.id,
          },
        },
        update: {
          status: "PRIMARY_SUSPECT",
          role: "DIRECT_INVOLVEMENT",
          matchConfidence: Math.round(data.matchScore * 100),
          notes: `Automated link from composite sketch match (${Math.round(data.matchScore * 100)}% confidence).`,
        },
        create: {
          caseId: recResult.sketch.caseId,
          criminalId: criminal.id,
          status: "PRIMARY_SUSPECT",
          role: "DIRECT_INVOLVEMENT",
          matchConfidence: Math.round(data.matchScore * 100),
          notes: `Automated link from composite sketch match (${Math.round(data.matchScore * 100)}% confidence).`,
        },
      }).catch((e) => {
        console.warn("Could not upsert CaseSuspect for sketch match:", e);
      });
    }

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
            caseNumber: recResult.sketch?.case?.caseNumber,
          },
        },
      });
    } catch {
      // Non-fatal
    }

    try {
      revalidatePath("/sketch");
      revalidatePath("/dashboard/criminals");
      revalidatePath(`/dashboard/criminals/${criminal.id}`);
      if (recResult.sketch?.caseId) {
        revalidatePath(`/case-details/${recResult.sketch.case?.caseNumber || recResult.sketch.caseId}`);
      }
    } catch {
      // Revalidation ignored outside request context
    }

    return { success: true, result: recResult };
  } catch (error: unknown) {
    console.error("Failed to save recognition match:", error);
    return { error: error instanceof Error ? error.message : "Failed to confirm match." };
  }
}

/**
 * Persists a synthesized forensic composite sketch directly to Tigris Object Storage (S3),
 * registers a permanent Sketch record in Neon PostgreSQL, and cross-catalogs it as an official
 * Case Evidence record for complete bidirectional case visibility.
 */
export async function saveSketchToVault(data: {
  caseId: string;
  witnessId?: string | null;
  imageDataUrl: string;
  description?: string;
  promptUsed?: string;
  metadata?: Record<string, any>;
}): Promise<{
  success: boolean;
  sketch?: any;
  evidenceId?: string;
  fileUrl?: string;
  caseNumber?: string;
  error?: string;
}> {
  try {
    let sessionUser = "System Investigator";
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user?.name) {
        sessionUser = session.user.name;
      }
    } catch {
      // Session fallback
    }

    if (!data.caseId) {
      return { success: false, error: "Case ID is required to save sketch to case vault." };
    }

    if (!data.imageDataUrl) {
      return { success: false, error: "No synthesized sketch image provided." };
    }

    // Verify target case exists
    const targetCase = await prisma.case.findFirst({
      where: {
        OR: [{ id: data.caseId }, { caseNumber: data.caseId }],
      },
      select: { id: true, caseNumber: true, title: true },
    });

    if (!targetCase) {
      return { success: false, error: `Target case "${data.caseId}" not found in database.` };
    }

    const realCaseId = targetCase.id;

    // Decode base64 or SVG
    let buffer: Buffer;
    let mimeType = "image/png";
    let ext = "png";

    if (data.imageDataUrl.startsWith("data:image/svg+xml;base64,")) {
      buffer = Buffer.from(data.imageDataUrl.replace("data:image/svg+xml;base64,", ""), "base64");
      mimeType = "image/svg+xml";
      ext = "svg";
    } else if (
      data.imageDataUrl.startsWith("data:image/svg+xml;utf8,") ||
      data.imageDataUrl.startsWith("data:image/svg+xml,")
    ) {
      const svgText = decodeURIComponent(data.imageDataUrl.replace(/^data:image\/svg\+xml(;utf8)?,/, ""));
      buffer = Buffer.from(svgText, "utf-8");
      mimeType = "image/svg+xml";
      ext = "svg";
    } else if (data.imageDataUrl.startsWith("data:image/png;base64,")) {
      buffer = Buffer.from(data.imageDataUrl.replace("data:image/png;base64,", ""), "base64");
      mimeType = "image/png";
      ext = "png";
    } else if (data.imageDataUrl.startsWith("data:image/jpeg;base64,")) {
      buffer = Buffer.from(data.imageDataUrl.replace("data:image/jpeg;base64,", ""), "base64");
      mimeType = "image/jpeg";
      ext = "jpg";
    } else if (data.imageDataUrl.startsWith("http://") || data.imageDataUrl.startsWith("https://")) {
      // Direct remote URL
      const sketch = await prisma.sketch.create({
        data: {
          caseId: realCaseId,
          witnessId: data.witnessId || null,
          imageUrl: data.imageDataUrl,
          description: data.description || `AI Forensic Composite Sketch (${targetCase.caseNumber})`,
        },
      });

      return {
        success: true,
        sketch,
        fileUrl: data.imageDataUrl,
        caseNumber: targetCase.caseNumber,
      };
    } else {
      const base64Data = data.imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    }

    // Cryptographic SHA-256 Checksum
    const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const sketchId = crypto.randomUUID();
    const storageKey = `cases/${realCaseId}/sketches/${sketchId}.${ext}`;

    // Stream binary buffer to Tigris S3
    let fileUrl = data.imageDataUrl;
    try {
      await tigris.send(
        new PutObjectCommand({
          Bucket: TIGRIS_BUCKET,
          Key: storageKey,
          Body: buffer,
          ContentType: mimeType,
        })
      );
      fileUrl = `https://fly.storage.tigris.dev/${TIGRIS_BUCKET}/${storageKey}`;
    } catch (uploadError) {
      console.warn("Tigris S3 sketch streaming notice (fallback to data URL):", uploadError);
    }

    // 1. Insert permanent Sketch entity
    const sketch = await prisma.sketch.create({
      data: {
        id: sketchId,
        caseId: realCaseId,
        witnessId: data.witnessId || null,
        imageUrl: fileUrl,
        description: data.description || `AI Forensic Composite Sketch (${targetCase.caseNumber})`,
      },
    });

    // 2. Dual-catalog into Case Evidence so it immediately appears in Case Intelligence Evidence gallery
    let evidenceId: string | undefined;
    try {
      const evidence = await prisma.evidence.create({
        data: {
          caseId: realCaseId,
          title: `Composite Sketch - ${targetCase.caseNumber}`,
          description: data.promptUsed
            ? `Witness-guided AI synthesis: "${data.promptUsed.slice(0, 150)}..."`
            : "Synthesized AI Forensic Composite Portrait",
          category: "IMAGE",
          source: "INVESTIGATOR",
          status: "VERIFIED",
          fileName: `composite_sketch_${sketchId.slice(0, 8)}.${ext}`,
          storageKey,
          mimeType,
          fileSize: buffer.length,
          sha256Hash,
          fileUrl,
          metadata: {
            sketchId: sketch.id,
            isAiCompositeSketch: true,
            engine: data.metadata?.engine || "Forensix-SD15-Procedural",
            confidenceScore: data.metadata?.confidenceScore || 96.4,
            promptUsed: data.promptUsed,
          },
          uploadedBy: sessionUser,
        },
      });
      evidenceId = evidence.id;
    } catch (evErr) {
      console.warn("Evidence dual-catalog notice:", evErr);
    }

    // 3. Immutable Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "SKETCH_PERSISTED_TO_VAULT",
          entityType: "Sketch",
          entityId: sketch.id,
          details: {
            caseId: realCaseId,
            caseNumber: targetCase.caseNumber,
            evidenceId,
            fileUrl,
            sha256Hash,
            witnessId: data.witnessId,
          },
        },
      });
    } catch {
      // Non-fatal
    }

    try {
      revalidatePath("/sketch");
      revalidatePath(`/case-details/${targetCase.caseNumber}`);
      revalidatePath(`/case-details/${realCaseId}`);
    } catch {
      // Revalidation ignored outside request context
    }

    return {
      success: true,
      sketch,
      evidenceId,
      fileUrl,
      caseNumber: targetCase.caseNumber,
    };
  } catch (error: unknown) {
    console.error("Failed to save sketch to vault:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to persist sketch to case vault.",
    };
  }
}

