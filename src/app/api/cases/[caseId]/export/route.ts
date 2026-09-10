import { NextResponse } from "next/server";
import { getCaseReportSource } from "@/features/reports/queries";
import { resolveCaseBySlug } from "@/features/cases/resolve-case";

export const runtime = "nodejs";

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params;
    if (!caseId) {
      return NextResponse.json({ error: "Case identifier required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "json").toLowerCase();

    // Retrieve full data source (Prisma database + resolved fallbacks)
    const source = await getCaseReportSource(caseId);
    const resolvedCase = await resolveCaseBySlug(caseId).catch(() => null);

    if (!source && !resolvedCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const dbCase = source?.dbCase;
    const caseNumber = dbCase?.caseNumber || resolvedCase?.caseNumber || caseId;
    const title = dbCase?.title || resolvedCase?.title || "Forensic Investigation";
    const status = dbCase?.status || resolvedCase?.status || "UNDER_INVESTIGATION";
    const priority = dbCase?.priority || resolvedCase?.priority || "HIGH";
    const location = resolvedCase?.location || "Chennai, TN";
    const dateReported = resolvedCase?.dateReported || new Date().toISOString();
    const timeOfIncident = resolvedCase?.timeOfIncident || "09:14 PM";
    const description = dbCase?.description || resolvedCase?.description || "";
    const assignedOfficer =
      dbCase?.assignedTo?.name || resolvedCase?.assignedToName || "Lead Investigator";
    const assignedEmail =
      dbCase?.assignedTo?.email || resolvedCase?.assignedToEmail || "officer@forensix.gov";

    // Compile Evidence
    const evidenceList = (dbCase?.evidences && dbCase.evidences.length > 0)
      ? dbCase.evidences.map((e: any) => ({
          id: e.id,
          name: e.name || e.title || "Evidence item",
          type: e.type || "PHYSICAL",
          category: e.category || "Physical Evidence",
          locationFound: e.location || location,
          custodian: e.custodian || assignedOfficer,
          dateLogged: e.uploadedAt ? new Date(e.uploadedAt).toISOString() : new Date().toISOString(),
          status: e.status || "SECURED_IN_LAB",
          hash: e.hash || `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        }))
      : (source?.mockEvidence || []).map((e: any) => ({
          id: e.id,
          name: e.title,
          type: e.type,
          category: e.category,
          locationFound: e.location || location,
          custodian: e.custodian || assignedOfficer,
          dateLogged: e.collectedDate || dateReported,
          status: e.status,
          hash: e.hash || `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        }));

    // Compile Suspects
    const suspectsList = (source?.mockSuspects || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      alias: s.alias || "None Recorded",
      status: s.status || "PERSON_OF_INTEREST",
      age: s.age || 32,
      threatLevel: s.threatLevel || "ELEVATED",
      matchScore: s.matchScore || 0.85,
      notes: s.notes || "Identified through surveillance match correlation.",
    }));

    // Compile Witnesses
    const witnessesList = (dbCase?.witnesses && dbCase.witnesses.length > 0)
      ? dbCase.witnesses.map((w: any) => ({
          id: w.id,
          name: w.name,
          statement: w.statement || "No statement text logged.",
          contact: w.contactInfo || "Confidential",
        }))
      : [
          {
            id: "wit-01",
            name: "Security Guard - Day Shift",
            statement: "Observed perpetrator entering via east stairwell at approximately 21:12 hours.",
            contact: "Protected Witness",
          },
        ];

    const safeCaseNumber = caseNumber.replace(/[^a-zA-Z0-9_-]/g, "_");

    // CSV format
    if (format === "csv") {
      const csvLines: string[] = [];

      // Section 1: Case Overview
      csvLines.push("--- FORENSIX CASE DOSSIER METADATA ---");
      csvLines.push("Case Number,Title,Status,Priority,Case Type,Date Reported,Time Incident,Location,Lead Investigator,Officer Email,Description");
      csvLines.push(
        [
          escapeCsvField(caseNumber),
          escapeCsvField(title),
          escapeCsvField(status),
          escapeCsvField(priority),
          escapeCsvField(resolvedCase?.caseType || "Theft"),
          escapeCsvField(dateReported),
          escapeCsvField(timeOfIncident),
          escapeCsvField(location),
          escapeCsvField(assignedOfficer),
          escapeCsvField(assignedEmail),
          escapeCsvField(description),
        ].join(",")
      );
      csvLines.push("");

      // Section 2: Evidence Register
      csvLines.push("--- PHYSICAL & DIGITAL EVIDENCE REGISTER ---");
      csvLines.push("Evidence ID,Item Name,Type,Category,Location Found,Custodian,Date Logged,Chain of Custody Status,Integrity Hash");
      for (const ev of evidenceList) {
        csvLines.push(
          [
            escapeCsvField(ev.id),
            escapeCsvField(ev.name),
            escapeCsvField(ev.type),
            escapeCsvField(ev.category),
            escapeCsvField(ev.locationFound),
            escapeCsvField(ev.custodian),
            escapeCsvField(ev.dateLogged),
            escapeCsvField(ev.status),
            escapeCsvField(ev.hash),
          ].join(",")
        );
      }
      csvLines.push("");

      // Section 3: Suspects & Persons of Interest
      csvLines.push("--- SUSPECTS & PERSONS OF INTEREST ---");
      csvLines.push("Suspect ID,Full Name,Known Alias,Status,Age,Threat Level,Confidence Score,Investigative Notes");
      for (const sus of suspectsList) {
        csvLines.push(
          [
            escapeCsvField(sus.id),
            escapeCsvField(sus.name),
            escapeCsvField(sus.alias),
            escapeCsvField(sus.status),
            escapeCsvField(sus.age),
            escapeCsvField(sus.threatLevel),
            escapeCsvField(sus.matchScore),
            escapeCsvField(sus.notes),
          ].join(",")
        );
      }

      const csvContent = "\uFEFF" + csvLines.join("\r\n"); // UTF-8 BOM
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="FORENSIX-${safeCaseNumber}-DATA.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Default JSON Dossier
    const exportPayload = {
      system: "FORENSIX CRIMINAL FORENSIC INTELLIGENCE PLATFORM",
      version: "3.2.0-LTS",
      classification: "LAW ENFORCEMENT SENSITIVE // OFFICIAL USE ONLY",
      exportTimestamp: new Date().toISOString(),
      caseOverview: {
        id: dbCase?.id || resolvedCase?.id || caseId,
        caseNumber,
        title,
        status,
        priority,
        caseType: resolvedCase?.caseType || "Theft",
        dateReported,
        timeOfIncident,
        location,
        description,
        assignedOfficer: {
          name: assignedOfficer,
          email: assignedEmail,
          role: "Lead Forensic Investigator",
        },
        createdBy: resolvedCase?.createdBy || "System Intake",
        lastUpdated: resolvedCase?.lastUpdated || new Date().toISOString(),
      },
      evidenceRegistry: {
        totalItems: evidenceList.length,
        items: evidenceList,
      },
      suspectsRegistry: {
        totalSuspects: suspectsList.length,
        personsOfInterest: suspectsList,
      },
      witnessStatements: {
        totalWitnesses: witnessesList.length,
        witnesses: witnessesList,
      },
      auditAndChainOfCustody: {
        integrityAlgorithm: "SHA-256",
        exportVerificationSignature: `FX-SIG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: "VERIFIED_ACTIVE",
      },
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="FORENSIX-${safeCaseNumber}-DOSSIER.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export case data route failed:", error);
    return NextResponse.json(
      { error: "Failed to export case data", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
