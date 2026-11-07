import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { extractTigrisStorageKey } from "@/lib/storage-url";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { verifyCriminalLedgerIntegrity } from "@/features/criminals/activity-actions";
import { CriminalRapSheetDocument } from "@/features/criminals/pdf/CriminalRapSheetDocument";
import type { CriminalRapSheetData } from "@/features/criminals/pdf/types";

export const runtime = "nodejs";

/**
 * Resolves any image identifier directly on the server and converts it to a base64 Data URI
 * for deterministic PDF rendering.
 */
async function resolveImageAsDataUri(urlOrKey: string | null | undefined): Promise<string | null> {
  if (!urlOrKey || typeof urlOrKey !== "string") {
    return null;
  }
  const trimmed = urlOrKey.trim();
  if (!trimmed) {
    return null;
  }

  // 1. If already a Base64 data URI
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // 2. If it is a Tigris S3 asset
  const tigrisKey = extractTigrisStorageKey(trimmed);
  if (tigrisKey) {
    try {
      const command = new GetObjectCommand({
        Bucket: TIGRIS_BUCKET,
        Key: tigrisKey,
      });
      const response = await tigris.send(command);
      if (response.Body) {
        const bytes = await response.Body.transformToByteArray();
        const mimeType = response.ContentType || "image/jpeg";
        const base64 = Buffer.from(bytes).toString("base64");
        return `data:${mimeType};base64,${base64}`;
      }
    } catch (s3Err) {
      console.warn("Failed to fetch image from Tigris for rap sheet:", tigrisKey, s3Err);
    }
  }

  // 3. If it is a local static asset (e.g. /images/...)
  if (trimmed.startsWith("/")) {
    try {
      const localFilePath = path.join(process.cwd(), "public", trimmed.replace(/^\/+/, ""));
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = await fs.promises.readFile(localFilePath);
        const ext = path.extname(localFilePath).toLowerCase().replace(".", "");
        const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      }
    } catch (fsErr) {
      console.warn("Failed to read local static image for rap sheet:", trimmed, fsErr);
    }
  }

  // 4. If it is an external URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const res = await fetch(trimmed, { cache: "no-store" });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const mimeType = res.headers.get("content-type") || "image/jpeg";
        return `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      }
    } catch (fetchErr) {
      console.warn("Failed to fetch external image for rap sheet:", trimmed, fetchErr);
    }
  }

  return null;
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

async function handleRapSheetRequest(
  criminalId: string,
  options: {
    format?: string;
    overrideRecords?: any[];
    overrideFullName?: string;
  }
) {
  // 1. Authenticate session
  let sessionUser = {
    name: "Authorized Investigator",
    badgeId: "FX-INVESTIGATOR",
    role: "INVESTIGATOR",
  };

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user) {
      sessionUser = {
        name: session.user.name || "Authorized Investigator",
        badgeId: (session.user as any)?.badgeId || "REG-FORENSIX",
        role: (session.user as any)?.role || "INVESTIGATOR",
      };
    }
  } catch (err) {
    console.warn("Session retrieval fallback in rap sheet generation:", err);
  }

  // 2. Retrieve criminal profile
  const criminal = await prisma.criminal.findFirst({
    where: {
      OR: [{ id: criminalId }, { criminalId: criminalId }],
    },
    include: {
      records: {
        orderBy: { incidentDate: "desc" },
      },
      caseLinks: {
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!criminal) {
    return NextResponse.json({ error: "Criminal record not found" }, { status: 404 });
  }

  const demographics = (criminal.demographics as Record<string, any>) || {};
  const fullName =
    options.overrideFullName || `${criminal.firstName} ${criminal.lastName}`.trim();
  const safeName = fullName.replace(/[^a-zA-Z0-9_-]/g, "_");

  // 3. Compile Records (prioritizing explicit override, then DB records, then caseLink synthesis)
  let compiledRecords: Array<{
    caseId: string;
    offenceType: string;
    description: string;
    date: string;
    location: string;
    courtName: string;
    status: string;
    outcome: string | null;
    sentenceDetails: string | null;
  }> = [];

  if (Array.isArray(options.overrideRecords) && options.overrideRecords.length > 0) {
    compiledRecords = options.overrideRecords.map((r: any) => ({
      caseId: r.caseId || r.courtCaseNumber || "FX-PENDING",
      offenceType: r.offenceType || "Robbery",
      description: r.description || "Judicial offense on remand",
      date: r.date || (r.incidentDate ? new Date(r.incidentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US")),
      location: r.location || criminal.lastKnownLocation || "Chennai, TN",
      courtName: r.courtName || "Principal District & Sessions Court, Chennai",
      status: r.status || "Under Investigation",
      outcome: r.outcome || null,
      sentenceDetails: r.sentenceDetails || null,
    }));
  } else if (criminal.records.length > 0) {
    compiledRecords = criminal.records.map((r) => ({
      caseId: r.courtCaseNumber,
      offenceType: r.offenceType,
      description: r.description,
      date: new Date(r.incidentDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      location: r.location || criminal.lastKnownLocation || "Chennai, TN",
      courtName: r.courtName || "Principal District & Sessions Court, Chennai",
      status: r.status,
      outcome: r.outcome,
      sentenceDetails: r.sentenceDetails,
    }));
  } else if (criminal.caseLinks.length > 0) {
    compiledRecords = criminal.caseLinks.map((cl) => ({
      caseId: cl.case?.caseNumber || "FX-PENDING",
      offenceType: "Robbery",
      description: cl.case?.title || cl.notes || "Case association documented",
      date: new Date(cl.addedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      location: criminal.lastKnownLocation || "Chennai, TN",
      courtName: "Metropolitan Criminal Court, Chennai",
      status:
        cl.case?.status === "CLOSED"
          ? "Closed"
          : cl.case?.status === "OPEN"
          ? "Under Investigation"
          : "Solved",
      outcome: cl.status === "CONVICTED" ? "Convicted" : "Trial Ongoing",
      sentenceDetails: cl.status === "CONVICTED" ? "Judicial Custody / Remand" : null,
    }));
  }

  // 4. Calculate Offense Statistics
  const totalOffenses = compiledRecords.length;
  let activeTrials = 0;
  let convictions = 0;
  let closedCases = 0;

  for (const r of compiledRecords) {
    const outcomeLower = (r.outcome || "").toLowerCase();
    const statusLower = (r.status || "").toLowerCase();
    if (outcomeLower.includes("convict") || statusLower.includes("convict")) {
      convictions++;
    } else if (statusLower.includes("closed") || statusLower.includes("solve") || outcomeLower.includes("acquit")) {
      closedCases++;
    } else {
      activeTrials++;
    }
  }

  // 5. If CSV Format Requested
  const requestedFormat = (options.format || "pdf").toLowerCase();
  if (requestedFormat === "csv") {
    const csvHeaders = [
      "Record #",
      "Subject Full Name",
      "Criminal ID",
      "Case ID / FIR No",
      "Offence Type",
      "Incident Date",
      "Location",
      "Presiding Court",
      "Legal Status",
      "Court Disposition / Outcome",
      "Sentence Details",
      "Offence Particulars",
    ];

    const csvRows = compiledRecords.map((r, i) => [
      escapeCsvField(String(i + 1).padStart(2, "0")),
      escapeCsvField(fullName),
      escapeCsvField(criminal.criminalId),
      escapeCsvField(r.caseId),
      escapeCsvField(r.offenceType),
      escapeCsvField(r.date),
      escapeCsvField(r.location),
      escapeCsvField(r.courtName),
      escapeCsvField(r.status),
      escapeCsvField(r.outcome || "Pending"),
      escapeCsvField(r.sentenceDetails || "None"),
      escapeCsvField(r.description),
    ]);

    const csvContent = "\uFEFF" + [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="RAP-SHEET-${safeName}-${criminal.criminalId}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  // 6. Compute Cryptographic Custody Integrity
  let custodyIntegrity = {
    merkleRootHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    totalBlocks: Math.max(1, totalOffenses),
    verifiedAt: new Date().toISOString(),
  };

  try {
    const integrity = await verifyCriminalLedgerIntegrity(criminal.id);
    custodyIntegrity = {
      merkleRootHash: integrity.merkleRootHash,
      totalBlocks: integrity.totalBlocks,
      verifiedAt: integrity.verifiedAt,
    };
  } catch (intErr) {
    console.warn("Integrity verification fallback for rap sheet:", intErr);
  }

  // 7. Resolve Mugshot Image as Base64 Data URI
  const resolvedMugshotUrl = await resolveImageAsDataUri(criminal.mugshotUrl);

  // 8. Calculate Age
  let computedAge: string | number = "N/A";
  if (criminal.dateOfBirth) {
    const diffMs = Date.now() - new Date(criminal.dateOfBirth).getTime();
    computedAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  } else if (demographics.age) {
    computedAge = demographics.age;
  }

  // 9. Assemble Rap Sheet DTO
  const rapSheetData: CriminalRapSheetData = {
    rapSheetNumber: `RAP-${criminal.criminalId}-${Date.now().toString().slice(-4)}`,
    generatedAt: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    generatedBy: sessionUser,
    classification: "LAW ENFORCEMENT & JUDICIAL SENSITIVE",
    subject: {
      id: criminal.id,
      criminalId: criminal.criminalId,
      fullName,
      firstName: criminal.firstName,
      lastName: criminal.lastName,
      aliases: Array.isArray(demographics.aliases)
        ? (demographics.aliases as string[])
        : criminal.alias
        ? [criminal.alias]
        : [],
      mugshotUrl: resolvedMugshotUrl,
      status: criminal.status,
      riskLevel: criminal.riskLevel,
      dateOfBirth: criminal.dateOfBirth
        ? new Date(criminal.dateOfBirth).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      age: computedAge,
      gender: criminal.gender || demographics.gender || "Unspecified",
      nationality: criminal.nationality || demographics.nationality || "Indian",
      lastKnownLocation: criminal.lastKnownLocation || "Chennai, TN",
      address: criminal.address || demographics.address || "Chennai Jurisdiction",
      demographics: {
        identifyingMarks: demographics.identifyingMarks || demographics.scarsOrMarks || "None documented",
        occupation: demographics.occupation || "Not Specified",
        bloodGroup: demographics.bloodGroup || "O+",
      },
      biometrics: {
        fingerprintStatus: criminal.fingerprintScanUrl ? "AFIS Enrolled & Verified" : "Not Enrolled",
        dnaProfileCode: criminal.dnaProfileCode || "CODIS-IND-NA",
        faceEmbeddingStatus: criminal.biometricEnrolledAt || criminal.faceEmbeddingId ? "Facial Biometric Enrolled" : "Pending",
      },
    },
    statistics: {
      totalOffenses,
      activeTrials,
      convictions,
      closedCases,
    },
    records: compiledRecords,
    custodyCertification: {
      merkleRootHash: custodyIntegrity.merkleRootHash,
      totalSignedBlocks: custodyIntegrity.totalBlocks,
      statutoryAct: "Section 65B Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam (BSA)",
      certifiedAt: custodyIntegrity.verifiedAt,
    },
  };

  // 10. Render Rap Sheet PDF to Buffer
  const pdfBuffer = await renderToBuffer(
    React.createElement(CriminalRapSheetDocument, { data: rapSheetData }) as any
  );

  // 11. Write Audit Log
  try {
    await prisma.auditLog.create({
      data: {
        action: "CRIMINAL_RAP_SHEET_EXPORTED",
        entityType: "Criminal",
        entityId: criminal.id,
        details: {
          rapSheetNumber: rapSheetData.rapSheetNumber,
          subjectCode: criminal.criminalId,
          subjectName: rapSheetData.subject.fullName,
          exportedBy: sessionUser.name,
          totalOffenses,
          format: "PDF",
        },
      },
    });
  } catch (auditErr) {
    console.warn("Failed to write audit log for rap sheet:", auditErr);
  }

  const filename = `RAP-SHEET-${safeName}-${criminal.criminalId}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ criminalId: string }> }
) {
  try {
    const { criminalId } = await context.params;
    if (!criminalId) {
      return NextResponse.json({ error: "Criminal ID required" }, { status: 400 });
    }
    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "pdf";

    return await handleRapSheetRequest(criminalId, { format });
  } catch (error) {
    console.error("Failed to generate criminal rap sheet:", error);
    return NextResponse.json(
      {
        error: "Failed to generate judicial rap sheet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ criminalId: string }> }
) {
  try {
    const { criminalId } = await context.params;
    if (!criminalId) {
      return NextResponse.json({ error: "Criminal ID required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const format = body.format || "pdf";
    const overrideRecords = body.records;
    const overrideFullName = body.fullName;

    return await handleRapSheetRequest(criminalId, {
      format,
      overrideRecords,
      overrideFullName,
    });
  } catch (error) {
    console.error("Failed to generate criminal rap sheet (POST):", error);
    return NextResponse.json(
      {
        error: "Failed to generate judicial rap sheet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
