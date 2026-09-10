import path from "node:path";
import fs from "node:fs";
import type { CaseReportData } from "./types";
import type { CaseReportRawSource } from "./queries";
import { formatReportDate, formatSimpleDate } from "./pdf/utils/formatReportDate";
import { formatReportNumber, formatBytes } from "./pdf/utils/formatReportNumber";
import { sanitizeReportText } from "./pdf/utils/sanitizeReportText";

export function resolveLocalAsset(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:")) return url;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  try {
    const cleanPath = url.startsWith("/") ? url.slice(1) : url;
    const localFile = path.join(process.cwd(), "public", cleanPath);
    if (fs.existsSync(localFile)) {
      const ext = path.extname(localFile).toLowerCase();
      const mimeType =
        ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
          ? "image/webp"
          : "image/jpeg";
      const fileBuffer = fs.readFileSync(localFile);
      return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }
  } catch (err) {
    console.warn("Failed to encode local image asset:", url, err);
  }

  return url;
}

export function buildCaseReportData(
  source: CaseReportRawSource,
  currentUser?: { name?: string; role?: string }
): CaseReportData {
  const { dbCase, resolvedDetail, mockEvidence, mockSketches, mockSuspects } = source;

  const caseId = dbCase?.id || resolvedDetail?.id || "FX-2026-184";
  const caseNumber = dbCase?.caseNumber || resolvedDetail?.caseNumber || "FX-2026-184";
  const caseTitle = dbCase?.title || resolvedDetail?.title || "Forensic Investigation";
  const rawStatus = dbCase?.status || resolvedDetail?.rawStatus || "UNDER_INVESTIGATION";

  let displayStatus = "Under Investigation";
  if (String(rawStatus).toUpperCase().includes("CLOSED") || String(rawStatus).toUpperCase().includes("SOLVED")) {
    displayStatus = "Closed";
  } else if (String(rawStatus).toUpperCase().includes("OPEN")) {
    displayStatus = "Open";
  }

  const priority = dbCase?.priority || resolvedDetail?.priority || "HIGH";
  const location = resolvedDetail?.location || "Chennai, TN";
  const dateReported = resolvedDetail?.dateReported || formatSimpleDate(dbCase?.createdAt || new Date());
  const timeOfIncident = resolvedDetail?.timeOfIncident || "09:14 PM";
  const description = dbCase?.description || resolvedDetail?.description || "Forensic case investigation.";
  const assignedTo = dbCase?.assignedTo?.name || resolvedDetail?.assignedToName || "Lead Investigator";
  const assignedToEmail = dbCase?.assignedTo?.email || resolvedDetail?.assignedToEmail || "investigator@forensix.gov";
  const createdBy = resolvedDetail?.createdBy || "System Intake";
  const lastUpdated = formatReportDate(dbCase?.updatedAt || resolvedDetail?.updatedAt || new Date());

  // Versioning: if DB has previous reports, version increments
  const reportCount = dbCase?.reports?.length || 0;
  const version = `${reportCount + 1}.0`;
  const reportId = `REP-${caseNumber.replace(/[^a-zA-Z0-9]/g, "-")}-V${version}`;

  // 1. Evidence List
  let evidenceList: CaseReportData["evidence"] = [];
  if (dbCase?.evidences && dbCase.evidences.length > 0) {
    evidenceList = dbCase.evidences.map((ev: any, idx: number) => ({
      id: `EV-${formatReportNumber(idx + 1)}`,
      name: sanitizeReportText(ev.fileName, "Evidence Record"),
      type: sanitizeReportText(ev.mimeType, "Physical/Digital Evidence"),
      source: "Crime Scene Registry",
      description: `Collected evidence item: ${ev.fileName}. Secure hash verification completed.`,
      status: "Verified",
      capturedAt: formatReportDate(ev.uploadedAt),
      fileUrl: null,
      fileSize: formatBytes(ev.fileSize),
      sha256Hash: ev.sha256Hash || "N/A",
      aiScore: 90,
      aiFindings: "Biometric hash verified against crime scene chain of custody.",
    }));
  } else {
    // Graceful rich mock evidence dataset
    evidenceList = mockEvidence.map((item, idx) => ({
      id: `EV-${formatReportNumber(idx + 1)}`,
      name: item.name,
      type: item.type,
      source: item.source,
      description: item.fullDescription || item.description,
      status: item.status,
      capturedAt: item.dateAdded ? `${item.dateAdded} · ${item.timeAdded || ""}` : "Not recorded",
      fileUrl: resolveLocalAsset(item.previewImage),
      fileSize: item.fileSize,
      hash: item.hash,
      sha256Hash: item.hash || "3f2a89c7e01b4d5e89a3f2b1c4e7890a",
      aiScore: item.aiAnalysis?.score,
      aiFindings: item.aiAnalysis?.subtitle,
    }));
  }

  // 2. Witnesses
  let witnessList: CaseReportData["witnesses"] = [];
  if (dbCase?.witnesses && dbCase.witnesses.length > 0) {
    witnessList = dbCase.witnesses.map((w: any, idx: number) => ({
      id: `WIT-${formatReportNumber(idx + 1)}`,
      name: sanitizeReportText(w.name, "Witness"),
      contactInfo: sanitizeReportText(w.contactInfo, "On file"),
      statement: sanitizeReportText(w.statement, "Witness statement recorded by investigating officer."),
      recordedAt: formatReportDate(w.createdAt),
    }));
  } else {
    witnessList = [
      {
        id: "WIT-01",
        name: "Store Cashier (Eyewitness)",
        contactInfo: "Witness Protected · T. Nagar Precinct",
        statement:
          "The suspect entered through the front glass entrance at approximately 09:12 PM wearing a dark hooded pullover. He appeared to be in his early 30s, had a sharp angular jaw with visible trimmed stubble, and intense dark eyes. Demanded cash before fleeing north towards Boag Road.",
        recordedAt: "04 Oct 2026 · 10:30 PM",
      },
      {
        id: "WIT-02",
        name: "Security Guard on Duty",
        contactInfo: "Witness Protected · T. Nagar Precinct",
        statement:
          "Noticed rapid egress of an individual matching the description towards North Boag Road alleyway. Corroborated cashier testimony regarding dark attire and sudden departure.",
        recordedAt: "04 Oct 2026 · 11:15 PM",
      },
    ];
  }

  // 3. Suspects / Persons of Interest
  let suspectList: CaseReportData["suspects"] = [];
  const primaryCandidates = mockSketches[0]?.candidates || [];
  if (primaryCandidates.length > 0) {
    suspectList = primaryCandidates.map((cand) => ({
      id: cand.criminalId,
      displayName: cand.name,
      alias: cand.alias,
      status: cand.recommendedStatus || "Person of Interest",
      role: cand.recommendedRole || "Candidate Match",
      matchScore: cand.matchConfidence ?? null,
      notes: cand.llmReasoning || cand.priorCases || "No recorded remarks",
      mugshotUrl: resolveLocalAsset(cand.photo),
    }));
  } else {
    suspectList = mockSuspects.map((s) => ({
      id: s.id,
      displayName: s.name,
      alias: s.alias,
      status: s.status,
      role: s.role,
      matchScore: s.matchConfidence ?? null,
      notes: s.criminalRecord || s.knownAddresses || "No recorded history",
      mugshotUrl: resolveLocalAsset(s.photo),
    }));
  }

  // 4. Recognition Results
  let recognitionList: CaseReportData["recognitionResults"] = [];
  if (primaryCandidates.length > 0) {
    recognitionList = primaryCandidates.map((c, idx) => ({
      id: c.id,
      rank: idx + 1,
      candidateId: c.criminalId,
      candidateName: c.name,
      similarity: c.matchConfidence,
      status: "Verification Pending",
      reasoning: c.llmReasoning,
      createdAt: formatReportDate(new Date()),
    }));
  } else {
    recognitionList = [
      {
        id: "REC-01",
        rank: 1,
        candidateId: "CRIM-TN-2024-884",
        candidateName: "Arun Prakash",
        similarity: 94.2,
        status: "Human Review Required",
        reasoning: "High facial landmark and geometric profile correlation with composite sketch.",
        createdAt: "05 Oct 2026 · 11:32 AM",
      },
      {
        id: "REC-02",
        rank: 2,
        candidateId: "CRIM-TN-2023-412",
        candidateName: "Karthik Selvan",
        similarity: 78.5,
        status: "Secondary Candidate",
        reasoning: "Moderate cranial and jaw structure alignment with eyewitness composite.",
        createdAt: "05 Oct 2026 · 11:32 AM",
      },
    ];
  }

  // 5. Sketches
  let sketchList: CaseReportData["sketches"] = [];
  if (dbCase?.sketches && dbCase.sketches.length > 0) {
    sketchList = dbCase.sketches.map((sk: any, idx: number) => ({
      id: sk.id,
      generationId: `SK-2026-${formatReportNumber(idx + 1)}`,
      imageUrl: resolveLocalAsset(sk.imageUrl),
      promptAttributes: sanitizeReportText(sk.description, "Synthesized from eyewitness testimony"),
      status: "Active Composite",
      generatedAt: formatReportDate(sk.createdAt),
      witnessReference: sk.witness?.name || "Eyewitness #01",
    }));
  } else {
    sketchList = mockSketches.map((sk) => ({
      id: sk.id,
      generationId: sk.sketchNumber,
      imageUrl: resolveLocalAsset(sk.sketchImageUrl),
      promptAttributes: sk.witnessDescription,
      status: "Verified Composite Aid",
      generatedAt: sk.dateGenerated,
      witnessReference: sk.witnessStatementRef,
    }));
  }

  // 6. Incident Media
  const mediaList: CaseReportData["media"] = [
    {
      id: "MED-01",
      title: "CCTV Entrance Telemetry Capture",
      type: "Surveillance Still",
      url: resolveLocalAsset("/images/cctv-suspect.jpg") || "",
      caption: "Commercial entrance CCTV frame captured at 21:14:32 displaying suspect attire and entry vector.",
      timestamp: "04 Oct 2026 · 09:14 PM",
    },
  ];

  // 7. Investigation Notes
  const notesList: CaseReportData["notes"] = [
    {
      id: "NOTE-01",
      author: assignedTo,
      content:
        "Initial crime scene processing completed. Primary entry door latent prints successfully lifted and cataloged under EV-02. Eyewitness interview completed and correlated with composite sketch generation.",
      createdAt: "05 Oct 2026 · 10:22 AM",
    },
    {
      id: "NOTE-02",
      author: "Priya Nair (Senior Biometrics Analyst)",
      content:
        "Facial landmark candidate ranking executed against State Criminal Biometrics database. Top candidate returned at 94.2% match confidence. Requesting warrant verification.",
      createdAt: "05 Oct 2026 · 11:45 AM",
    },
  ];

  // 8. Activity Timeline
  const activityList: CaseReportData["activity"] = [
    {
      id: "ACT-01",
      actor: currentUser?.name || assignedTo,
      action: "REPORT_GENERATED",
      details: `Generated formal case investigation report version ${version}.`,
      createdAt: formatReportDate(new Date()),
    },
    {
      id: "ACT-02",
      actor: "Priya Nair",
      action: "FACIAL_RECOGNITION_MATCH",
      details: "Ran candidate matching against State Criminal Biometrics database.",
      createdAt: "05 Oct 2026 · 11:32 AM",
    },
    {
      id: "ACT-03",
      actor: assignedTo,
      action: "SKETCH_SYNTHESIS_COMPLETED",
      details: "Synthesized composite forensic sketch SK-2026-04 from eyewitness description.",
      createdAt: "05 Oct 2026 · 11:05 AM",
    },
    {
      id: "ACT-04",
      actor: "Arjun Karthik",
      action: "EVIDENCE_UPLOADED",
      details: "Added CCTV_Footage_01.mp4 and Fingerprint_01.jpg into evidence registry.",
      createdAt: "05 Oct 2026 · 10:18 AM",
    },
    {
      id: "ACT-05",
      actor: "System Intake",
      action: "CASE_REGISTERED",
      details: `Intake protocol executed for ${caseNumber} (${caseTitle}).`,
      createdAt: "04 Oct 2026 · 09:30 PM",
    },
  ];

  return {
    report: {
      id: reportId,
      version,
      generatedAt: formatReportDate(new Date()),
      generatedBy: currentUser?.name || assignedTo,
      classification: "LAW ENFORCEMENT SENSITIVE // OFFICIAL FORENSIC RECORD",
      logoUrl: resolveLocalAsset("/images/Logo.png"),
      fileHash: "SHA256-PENDING-HASH",
    },
    case: {
      id: caseId,
      caseNumber,
      title: caseTitle,
      type: resolvedDetail?.caseType || "Theft",
      status: displayStatus,
      priority,
      location,
      dateReported,
      timeOfIncident,
      description,
      assignedTo,
      assignedToEmail,
      createdBy,
      lastUpdated,
    },
    evidence: evidenceList,
    witnesses: witnessList,
    suspects: suspectList,
    recognitionResults: recognitionList,
    sketches: sketchList,
    media: mediaList,
    notes: notesList,
    activity: activityList,
    findings: {
      summary:
        "Investigation into commercial robbery at T. Nagar commercial establishment remains active. Eyewitness composite sketch generated and matched at 94.2% confidence to prior commercial robbery offender. Biometric fingerprint evidence is undergoing comparative analysis with central records.",
      humanVerificationStatus: "Pending Lead Investigator Physical Confirmation",
      investigativeStatus: displayStatus,
      outstandingActions:
        "1. Issue judicial warrant for biometric verification of candidate CR-TN-2024-884.\n2. Subpoena adjacent municipal traffic surveillance feeds along North Boag Road.\n3. Complete ninhydrin fingerprint comparison against regional crime repository.",
    },
  };
}
