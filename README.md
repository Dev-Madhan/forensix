# Forensix --- PDF Report Generation Implementation Guide

> **Architecture-aligned edition**
>
> This guide is specifically adapted to the existing Forensix
> project structure. It defines **only the files and folders required
> for PDF report generation**, without redesigning or duplicating the
> rest of the application architecture.
>
> **Existing project convention:** Next.js 16 App Router + `src/`
> architecture + feature-based modules + Prisma + Better Auth + PNPM.
>
> **Recommended PDF engine:** `@react-pdf/renderer`

------------------------------------------------------------------------

## 1. Purpose

Forensix already has a structured `src/` architecture with:

``` text
src/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── schemas/
└── services/
```

The PDF report system should fit into this architecture rather than
introducing a second application structure.

The PDF system should therefore be placed as a **Reports feature**:

``` text
src/features/reports/
```

The route that exposes the generated PDF should remain under the
existing App Router API structure:

``` text
src/app/api/cases/[caseId]/report/route.ts
```

Static PDF fonts belong under:

``` text
public/fonts/
```

This keeps:

-   routing in `src/app`
-   report domain logic in `src/features/reports`
-   database access in the report feature
-   reusable application infrastructure in existing `src/lib`
-   static assets in `public`
-   the PDF renderer isolated from the dashboard UI

------------------------------------------------------------------------

# 2. Final PDF-Only Folder Architecture

## Recommended placement

``` text
criminal-eye/
│
├── src/
│   │
│   ├── app/
│   │   └── api/
│   │       └── cases/
│   │           └── [caseId]/
│   │               └── report/
│   │                   └── route.ts
│   │
│   └── features/
│       └── reports/
│           │
│           ├── actions.ts
│           ├── queries.ts
│           ├── types.ts
│           │
│           └── pdf/
│               ├── CaseReportDocument.tsx
│               │
│               ├── components/
│               │   ├── ReportCover.tsx
│               │   ├── ReportHeader.tsx
│               │   ├── ReportFooter.tsx
│               │   ├── CaseInformationSection.tsx
│               │   ├── InvestigationSummarySection.tsx
│               │   ├── EvidenceRegisterSection.tsx
│               │   ├── EvidenceDetailsSection.tsx
│               │   ├── WitnessSection.tsx
│               │   ├── SuspectsSection.tsx
│               │   ├── RecognitionResultsSection.tsx
│               │   ├── ForensicSketchSection.tsx
│               │   ├── IncidentMediaSection.tsx
│               │   ├── InvestigationNotesSection.tsx
│               │   ├── ActivityTimelineSection.tsx
│               │   ├── FindingsSection.tsx
│               │   └── ReportMetadataSection.tsx
│               │
│               ├── styles/
│               │   ├── reportFonts.ts
│               │   ├── reportTheme.ts
│               │   └── reportStyles.ts
│               │
│               └── utils/
│                   ├── formatReportDate.ts
│                   ├── formatReportNumber.ts
│                   └── sanitizeReportText.ts
│
├── public/
│   └── fonts/
│       ├── Inter-Regular.ttf
│       ├── Inter-Medium.ttf
│       ├── Inter-SemiBold.ttf
│       ├── Inter-Bold.ttf
│       ├── SourceSerif4-Regular.ttf
│       └── SourceSerif4-SemiBold.ttf
│
├── prisma/
│   └── schema.prisma
│
├── package.json
└── pnpm-lock.yaml
```

### Why this placement is recommended

Your existing architecture uses feature-based vertical slices under:

``` text
src/features/
```

The report generator is a domain capability, so it belongs there.

The actual PDF renderer is isolated further under:

``` text
src/features/reports/pdf/
```

This prevents PDF-specific code from being mixed with:

``` text
src/components/
src/services/ai/
src/features/cases/
src/features/evidence/
```

The API route remains thin and acts only as the HTTP boundary.

------------------------------------------------------------------------

# 3. Responsibility of Each PDF File

  ---------------------------------------------------------------------------------------
  Location                                            Responsibility
  --------------------------------------------------- -----------------------------------
  `src/app/api/cases/[caseId]/report/route.ts`        HTTP endpoint, authentication,
                                                      authorization, PDF response

  `src/features/reports/actions.ts`                   Report-related server
                                                      mutations/audit operations

  `src/features/reports/queries.ts`                   Prisma queries required to build a
                                                      report

  `src/features/reports/types.ts`                     Shared report domain types

  `src/features/reports/pdf/CaseReportDocument.tsx`   Root React PDF document

  `src/features/reports/pdf/components/`              Individual PDF sections

  `src/features/reports/pdf/styles/reportFonts.ts`    Font registration

  `src/features/reports/pdf/styles/reportTheme.ts`    PDF design tokens

  `src/features/reports/pdf/styles/reportStyles.ts`   React PDF styles

  `src/features/reports/pdf/utils/`                   Formatting/sanitization helpers

  `public/fonts/`                                     Static TTF font files

  `prisma/schema.prisma`                              Existing `Report`, `Case`,
                                                      `Evidence`, `Witness`, etc. models
  ---------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Important Architectural Rule

Do **not** create:

``` text
src/components/pdf/
src/services/pdf/
src/lib/pdf/
src/app/pdf/
```

for this implementation.

Use one authoritative location:

``` text
src/features/reports/pdf/
```

The only exception is the API route:

``` text
src/app/api/cases/[caseId]/report/route.ts
```

This gives the report feature a clean boundary.

------------------------------------------------------------------------

# 5. Install the PDF Package

From the project root:

``` powershell
pnpm add @react-pdf/renderer
```

Verify:

``` powershell
pnpm list @react-pdf/renderer
```

Then verify the application still builds:

``` powershell
pnpm build
```

Official documentation:

-   https://react-pdf.org/
-   https://react-pdf.org/docs/v4
-   https://github.com/diegomura/react-pdf
-   https://www.npmjs.com/package/@react-pdf/renderer

------------------------------------------------------------------------

# 6. Why `@react-pdf/renderer`

Do not convert the existing Case Dashboard into a screenshot.

The dashboard and report have different purposes.

``` text
Dashboard
    ↓
Interactive investigation workspace

PDF
    ↓
Formal investigation record
```

The report needs:

-   A4 layout
-   predictable margins
-   controlled typography
-   tables
-   images
-   page wrapping
-   page breaks
-   fixed footer
-   page numbers
-   report metadata
-   versioning
-   auditability

React PDF provides a dedicated document rendering model for this.

------------------------------------------------------------------------

# 7. Font Placement

Use the project's existing `public/` directory:

``` text
public/
└── fonts/
```

Add:

``` text
Inter-Regular.ttf
Inter-Medium.ttf
Inter-SemiBold.ttf
Inter-Bold.ttf

SourceSerif4-Regular.ttf
SourceSerif4-SemiBold.ttf
```

Do not place these inside:

``` text
src/features/reports/pdf/
```

because fonts are static assets and should remain outside the source
tree.

------------------------------------------------------------------------

# 8. Typography

Criminal Eye uses:

``` text
Inter + Source Serif 4
```

### Inter

Use for:

``` text
Report title
Case ID
Labels
Tables
Evidence IDs
Suspect IDs
Status
Metadata
Timestamps
Headers
Footers
Page numbers
```

### Source Serif 4

Use for:

``` text
Investigation summary
Witness statements
Narrative descriptions
Investigation findings
Long-form notes
```

This keeps structured forensic data visually distinct from narrative
material.

------------------------------------------------------------------------

# 9. Font Registration

Create:

``` text
src/features/reports/pdf/styles/reportFonts.ts
```

``` ts
import path from "node:path";
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: path.join(
        process.cwd(),
        "public/fonts/Inter-Regular.ttf",
      ),
      fontWeight: 400,
    },
    {
      src: path.join(
        process.cwd(),
        "public/fonts/Inter-Medium.ttf",
      ),
      fontWeight: 500,
    },
    {
      src: path.join(
        process.cwd(),
        "public/fonts/Inter-SemiBold.ttf",
      ),
      fontWeight: 600,
    },
    {
      src: path.join(
        process.cwd(),
        "public/fonts/Inter-Bold.ttf",
      ),
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Source Serif 4",
  fonts: [
    {
      src: path.join(
        process.cwd(),
        "public/fonts/SourceSerif4-Regular.ttf",
      ),
      fontWeight: 400,
    },
    {
      src: path.join(
        process.cwd(),
        "public/fonts/SourceSerif4-SemiBold.ttf",
      ),
      fontWeight: 600,
    },
  ],
});
```

The server-side renderer should resolve the fonts from the filesystem.

------------------------------------------------------------------------

# 10. Report Feature Types

Create:

``` text
src/features/reports/types.ts
```

Recommended report DTO:

``` ts
export interface CaseReportData {
  report: {
    id: string;
    version: string;
    generatedAt: string;
    generatedBy: string;
  };

  case: {
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    location: string;
    dateReported: string;
    timeOfIncident: string;
    description: string;
    assignedTo: string;
    createdBy: string;
    lastUpdated: string;
  };

  evidence: Array<{
    id: string;
    name: string;
    type: string;
    description: string | null;
    status: string;
    capturedAt: string | null;
    fileUrl: string | null;
  }>;

  witnesses: Array<{
    id: string;
    name: string;
    statement: string | null;
    recordedAt: string | null;
  }>;

  suspects: Array<{
    id: string;
    displayName: string;
    status: string;
    notes: string | null;
  }>;

  recognitionResults: Array<{
    id: string;
    suspectId: string;
    similarity: number;
    status: string;
    createdAt: string;
  }>;

  sketches: Array<{
    id: string;
    imageUrl: string | null;
    generatedAt: string;
    status: string;
    generationId: string | null;
  }>;

  media: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    caption: string | null;
  }>;

  notes: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;

  activity: Array<{
    id: string;
    actor: string;
    action: string;
    createdAt: string;
  }>;

  findings: {
    summary: string | null;
    humanVerificationStatus: string;
  };
}
```

Use the real Prisma types and existing field names in the
implementation.

------------------------------------------------------------------------

# 11. Prisma Query Placement

Your project already uses feature-level `queries.ts`.

Therefore the report query belongs here:

``` text
src/features/reports/queries.ts
```

Do **not** create a second Prisma query layer inside the PDF folder.

Example:

``` ts
import { prisma } from "@/lib/prisma";

export async function getCaseReportSource(
  caseId: string,
) {
  return prisma.case.findUnique({
    where: {
      id: caseId,
    },

    include: {
      witnesses: true,
      sketches: true,
      criminals: true,
      recognitionResults: true,
      evidences: true,
      reports: true,
      auditLogs: true,
    },
  });
}
```

The exact relation names must match your existing
`prisma/schema.prisma`.

------------------------------------------------------------------------

# 12. Report DTO Transformation

The Prisma result should not be passed directly into the PDF.

Use:

``` text
Prisma result
      ↓
Normalization
      ↓
Formatting
      ↓
Report DTO
      ↓
PDF document
```

The DTO transformation can live in:

``` text
src/features/reports/queries.ts
```

or, if it becomes large, a dedicated:

``` text
src/features/reports/buildReportData.ts
```

Prefer the latter when the transformation becomes substantial.

Do not put database logic inside:

``` text
src/features/reports/pdf/components/
```

------------------------------------------------------------------------

# 13. PDF Root Document

Create:

``` text
src/features/reports/pdf/CaseReportDocument.tsx
```

``` tsx
import {
  Document,
  Page,
} from "@react-pdf/renderer";

import "./styles/reportFonts";

import { reportStyles } from "./styles/reportStyles";

import { ReportCover } from "./components/ReportCover";
import { ReportHeader } from "./components/ReportHeader";
import { ReportFooter } from "./components/ReportFooter";
import { CaseInformationSection } from "./components/CaseInformationSection";
import { InvestigationSummarySection } from "./components/InvestigationSummarySection";
import { EvidenceRegisterSection } from "./components/EvidenceRegisterSection";
import { EvidenceDetailsSection } from "./components/EvidenceDetailsSection";
import { WitnessSection } from "./components/WitnessSection";
import { SuspectsSection } from "./components/SuspectsSection";
import { RecognitionResultsSection } from "./components/RecognitionResultsSection";
import { ForensicSketchSection } from "./components/ForensicSketchSection";
import { IncidentMediaSection } from "./components/IncidentMediaSection";
import { InvestigationNotesSection } from "./components/InvestigationNotesSection";
import { ActivityTimelineSection } from "./components/ActivityTimelineSection";
import { FindingsSection } from "./components/FindingsSection";
import { ReportMetadataSection } from "./components/ReportMetadataSection";

import type { CaseReportData } from "../types";

export function CaseReportDocument({
  data,
}: {
  data: CaseReportData;
}) {
  return (
    <Document
      title={`Case Investigation Report — ${data.case.id}`}
      author="Criminal Eye"
      subject="Forensic Investigation Case Report"
      creator="Criminal Eye"
      keywords="forensic, investigation, case report"
    >
      <Page
        size="A4"
        style={reportStyles.page}
        wrap
      >
        <ReportCover data={data} />

        <ReportHeader data={data} />

        <CaseInformationSection data={data} />

        <InvestigationSummarySection data={data} />

        <EvidenceRegisterSection data={data} />

        <EvidenceDetailsSection data={data} />

        <WitnessSection data={data} />

        <SuspectsSection data={data} />

        <RecognitionResultsSection data={data} />

        <ForensicSketchSection data={data} />

        <IncidentMediaSection data={data} />

        <InvestigationNotesSection data={data} />

        <ActivityTimelineSection data={data} />

        <FindingsSection data={data} />

        <ReportMetadataSection data={data} />

        <ReportFooter data={data} />
      </Page>
    </Document>
  );
}
```

For large reports, use multiple pages intentionally rather than forcing
every section into one page tree.

------------------------------------------------------------------------

# 14. PDF Components

Every major report section should be a separate component.

``` text
src/features/reports/pdf/components/
```

Recommended components:

``` text
ReportCover.tsx
ReportHeader.tsx
ReportFooter.tsx

CaseInformationSection.tsx
InvestigationSummarySection.tsx

EvidenceRegisterSection.tsx
EvidenceDetailsSection.tsx

WitnessSection.tsx

SuspectsSection.tsx
RecognitionResultsSection.tsx

ForensicSketchSection.tsx
IncidentMediaSection.tsx

InvestigationNotesSection.tsx
ActivityTimelineSection.tsx

FindingsSection.tsx
ReportMetadataSection.tsx
```

This makes each section independently testable and maintainable.

------------------------------------------------------------------------

# 15. Header

Create:

``` text
src/features/reports/pdf/components/ReportHeader.tsx
```

``` tsx
import { Text, View } from "@react-pdf/renderer";

import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function ReportHeader({
  data,
}: {
  data: CaseReportData;
}) {
  return (
    <View style={reportStyles.header}>
      <Text style={reportStyles.brand}>
        CRIMINAL EYE
      </Text>

      <Text style={reportStyles.reportTitle}>
        Case Investigation Report
      </Text>

      <Text style={reportStyles.reportSubtitle}>
        Case ID: {data.case.id} · Report {data.report.version}
      </Text>
    </View>
  );
}
```

------------------------------------------------------------------------

# 16. Footer

Create:

``` text
src/features/reports/pdf/components/ReportFooter.tsx
```

``` tsx
import { Text, View } from "@react-pdf/renderer";

import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function ReportFooter({
  data,
}: {
  data: CaseReportData;
}) {
  return (
    <View fixed style={reportStyles.footer}>
      <Text style={reportStyles.footerText}>
        Criminal Eye · Confidential Investigation Record · {data.case.id}
      </Text>

      <Text
        style={reportStyles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}
```

The footer should repeat on every page.

Official references:

-   https://react-pdf.org/docs/v4/advanced/page-wrapping
-   https://react-pdf.org/docs/v4/advanced/dynamic-content

------------------------------------------------------------------------

# 17. Report Theme

Create:

``` text
src/features/reports/pdf/styles/reportTheme.ts
```

``` ts
export const reportTheme = {
  colors: {
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#111827",
    textSecondary: "#4B5563",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    borderStrong: "#D1D5DB",
    accent: "#4F46E5",
    accentSoft: "#EEF2FF",
    success: "#15803D",
    warning: "#B45309",
    danger: "#B91C1C",
  },

  spacing: {
    xs: 4,
    sm: 7,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 24,
  },
} as const;
```

------------------------------------------------------------------------

# 18. Report Styles

Create:

``` text
src/features/reports/pdf/styles/reportStyles.ts
```

Baseline:

``` ts
import { StyleSheet } from "@react-pdf/renderer";

export const reportStyles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 52,
    paddingHorizontal: 48,
    fontFamily: "Inter",
    fontSize: 9,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },

  brand: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.4,
    color: "#4F46E5",
  },

  reportTitle: {
    marginTop: 6,
    fontSize: 21,
    fontWeight: 700,
    color: "#111827",
  },

  reportSubtitle: {
    marginTop: 4,
    fontSize: 9,
    color: "#6B7280",
  },

  section: {
    marginTop: 18,
  },

  sectionTitle: {
    marginBottom: 9,
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
  },

  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },

  row: {
    flexDirection: "row",
    marginBottom: 7,
  },

  label: {
    width: "32%",
    fontSize: 8,
    fontWeight: 600,
    color: "#6B7280",
  },

  value: {
    width: "68%",
    fontSize: 9,
    color: "#111827",
  },

  narrative: {
    fontFamily: "Source Serif 4",
    fontSize: 10,
    lineHeight: 1.55,
    color: "#374151",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },

  tableCell: {
    fontSize: 8,
    color: "#374151",
  },

  caption: {
    marginTop: 6,
    fontSize: 7.5,
    lineHeight: 1.35,
    color: "#6B7280",
  },

  footer: {
    position: "absolute",
    bottom: 22,
    left: 48,
    right: 48,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    fontSize: 7,
    color: "#9CA3AF",
  },

  warning: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
    borderRadius: 5,
  },

  warningText: {
    fontSize: 8,
    lineHeight: 1.45,
    color: "#92400E",
  },
});
```

React PDF has its own style system. Do not attempt to use Tailwind
classes inside PDF components.

Official styling reference:

https://react-pdf.org/docs/v4/styling

------------------------------------------------------------------------

# 19. Case Information

Render:

``` text
CASE INFORMATION

Case ID
Case Title
Case Type
Status
Priority
Location
Date Reported
Time of Incident
Assigned Investigator
Created By
Last Updated
```

Use a two-column label/value layout.

------------------------------------------------------------------------

# 20. Investigation Summary

Use Source Serif 4 for the case narrative.

``` tsx
<View style={reportStyles.section}>
  <Text style={reportStyles.sectionTitle}>
    Investigation Summary
  </Text>

  <View style={reportStyles.card}>
    <Text style={reportStyles.narrative}>
      {data.case.description || "No summary recorded."}
    </Text>
  </View>
</View>
```

Do not silently rewrite the stored case narrative.

------------------------------------------------------------------------

# 21. Evidence Register

Use explicit table widths:

``` text
ID          18%
Evidence    42%
Type        20%
Status      20%
```

Total:

``` text
18 + 42 + 20 + 20 = 100%
```

This is important for consistent alignment.

------------------------------------------------------------------------

# 22. Evidence Details

Each important evidence item can contain:

``` text
Evidence ID
File Name
Evidence Type
Status
Captured At
Description
Associated Media
```

For a compact card that should not split:

``` tsx
<View wrap={false}>
  ...
</View>
```

------------------------------------------------------------------------

# 23. Incident Media

For photographs:

``` tsx
<Image
  src={media.url}
  style={{
    width: "100%",
    height: 240,
    objectFit: "cover",
  }}
/>

<Text style={reportStyles.caption}>
  Figure {index + 1}. {media.caption}
</Text>
```

For forensic sketches:

``` tsx
<Image
  src={sketch.imageUrl}
  style={{
    width: 260,
    height: 320,
    objectFit: "contain",
    alignSelf: "center",
  }}
/>
```

Use:

``` text
cover
```

when controlled cropping is acceptable.

Use:

``` text
contain
```

when the complete image must remain visible.

------------------------------------------------------------------------

# 24. Witness Information

Include:

``` text
Witness ID
Name
Statement
Recorded At
```

Use Source Serif 4 for the statement.

Do not alter the witness statement during report rendering.

------------------------------------------------------------------------

# 25. Suspect / Person-of-Interest Register

Use neutral investigative language.

Preferred:

``` text
Suspect
Person of Interest
Candidate
Candidate Match
Human Verification
```

Avoid automatically writing:

``` text
Guilty
Confirmed Criminal
Identified Offender
```

based solely on a database record or AI result.

------------------------------------------------------------------------

# 26. Recognition Results

Recommended format:

``` text
FACE RECOGNITION ANALYSIS

Rank    Candidate       Similarity
-----------------------------------
01      CR-00184        92.7%
02      CR-00821        86.4%
03      CR-00417        81.9%

Human Verification: Pending
```

Include:

> Similarity scores are computational candidate-ranking results and
> require appropriate human verification and corroborating evidence.

------------------------------------------------------------------------

# 27. Forensic Sketch

Recommended presentation:

``` text
FORENSIC SKETCH

Generated from witness-described facial attributes

             [ SKETCH ]

Generation ID:
SK-2026-0018

Generated:
05 Oct 2026 · 11:32 AM

Review Status:
Human Review Required
```

Include:

> AI-generated forensic sketches are investigative aids and should not
> be treated as conclusive evidence of identity or guilt.

------------------------------------------------------------------------

# 28. Investigation Notes

Recommended structure:

``` text
INVESTIGATION NOTES

05 Oct 2026 · 10:22 AM
Author Name

Investigation note...
```

Always display:

``` text
Author
Timestamp
Content
```

------------------------------------------------------------------------

# 29. Activity Timeline

Sort activity by timestamp before rendering.

Example:

``` text
05 Oct 2026 · 11:32 AM
Madhan Kumar
Added evidence CCTV_Footage_01.mp4

04 Oct 2026 · 08:21 PM
Priya Nair
Updated case status to Under Investigation

04 Oct 2026 · 07:14 PM
System
Case created
```

Do not rely on database insertion order.

------------------------------------------------------------------------

# 30. Findings

The report should distinguish:

``` text
Observed
Computed
Reported
Verified
Pending
```

Recommended final section:

``` text
INVESTIGATION FINDINGS

Summary
...

Current Status
Under Investigation

Human Verification
Pending

Outstanding Actions
...
```

------------------------------------------------------------------------

# 31. Cover Page

Create:

``` text
src/features/reports/pdf/components/ReportCover.tsx
```

Suggested content:

``` text
CRIMINAL EYE

CASE INVESTIGATION REPORT

FX-2026-184

Downtown Robbery

UNDER INVESTIGATION

Location
North Boag Road, T. Nagar, Chennai

Date of Incident
04 Oct 2026 · 09:14 PM

Prepared By
Investigator Name

Report Version
1.0

Generated
05 Oct 2026 · 11:42 AM

CONFIDENTIAL INVESTIGATION RECORD
```

Keep the cover minimal and document-like.

------------------------------------------------------------------------

# 32. Page Management

React PDF supports page wrapping and explicit page control.

## New page

Use:

``` tsx
<View break>
  ...
</View>
```

## Keep a block together

Use:

``` tsx
<View wrap={false}>
  ...
</View>
```

## Repeat footer/header

Use:

``` tsx
<View fixed>
  ...
</View>
```

Official documentation:

https://react-pdf.org/docs/v4/advanced/page-wrapping

------------------------------------------------------------------------

# 33. Alignment Rules

These rules are mandatory.

### 1. Explicit table widths

Never allow table columns to size unpredictably.

### 2. Explicit image dimensions

Never rely on natural image dimensions.

### 3. Registered fonts

Always register the fonts before rendering.

### 4. Centralized styles

Use:

``` text
reportTheme.ts
reportStyles.ts
```

### 5. Controlled page breaks

Use `break` only for intentional section boundaries.

### 6. Controlled unbreakable blocks

Use `wrap={false}` selectively.

### 7. Avoid huge containers

Do not put an entire report inside one giant unbreakable `<View>`.

### 8. Test long content

Short sample data can hide layout problems.

------------------------------------------------------------------------

# 34. API Route Placement

Create exactly:

``` text
src/app/api/cases/[caseId]/report/route.ts
```

This matches your existing:

``` text
src/app/api/
```

architecture.

The API route is responsible for:

``` text
Authentication
Authorization
Case ID validation
Report data retrieval
PDF rendering
Audit operation
HTTP response
```

It should **not** contain the actual report layout.

------------------------------------------------------------------------

# 35. API Route Baseline

``` ts
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { CaseReportDocument } from "@/features/reports/pdf/CaseReportDocument";
import { getCaseReportSource } from "@/features/reports/queries";
import { buildCaseReportData } from "@/features/reports/buildReportData";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    caseId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { caseId } = await context.params;

    if (!caseId) {
      return NextResponse.json(
        {
          error: "Case ID is required",
        },
        {
          status: 400,
        },
      );
    }

    // Authenticate current session.
    // Authorize access to this case.

    const source =
      await getCaseReportSource(caseId);

    if (!source) {
      return NextResponse.json(
        {
          error: "Case not found",
        },
        {
          status: 404,
        },
      );
    }

    const reportData =
      buildCaseReportData(source);

    const pdfBuffer =
      await renderToBuffer(
        <CaseReportDocument
          data={reportData}
        />,
      );

    const filename =
      `CRIMINAL-EYE-${reportData.case.id}-REPORT-${reportData.report.version}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `attachment; filename="${filename}"`,
        "Cache-Control":
          "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "Criminal Eye report generation failed:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to generate case report",
      },
      {
        status: 500,
      },
    );
  }
}
```

Keep the actual authentication and authorization consistent with your
existing Better Auth implementation.

------------------------------------------------------------------------

# 36. Better Auth Integration

The route must verify:

``` text
Current session
        ↓
User exists
        ↓
User has permitted role
        ↓
User can access requested case
        ↓
Generate report
```

Suggested roles from the existing system:

``` text
ADMIN
INVESTIGATOR
OFFICER
```

Do not expose report generation publicly.

------------------------------------------------------------------------

# 37. Generate Report Button

Your existing case UI can call:

``` text
GET /api/cases/[caseId]/report
```

Client-side:

``` ts
async function handleGenerateReport() {
  const response = await fetch(
    `/api/cases/${caseId}/report`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to generate report",
    );
  }

  const blob = await response.blob();

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;

  anchor.download =
    `CRIMINAL-EYE-${caseId}-REPORT.pdf`;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}
```

The dashboard UI should only trigger the operation.

It should not contain the PDF document structure.

------------------------------------------------------------------------

# 38. Button States

Use:

``` text
Generate Report
       ↓
Generating Report...
       ↓
Report Generated
```

Failure:

``` text
Report generation failed.
Please try again.
```

Disable the button during an active request.

------------------------------------------------------------------------

# 39. Report Versioning

Recommended filename:

``` text
CRIMINAL-EYE-{CASE_ID}-REPORT-{VERSION}.pdf
```

Example:

``` text
CRIMINAL-EYE-FX-2026-184-REPORT-1.0.pdf
```

Your existing Prisma `Report` entity should be used as the persistent
report record.

Recommended information:

``` text
Report ID
Case ID
Version
Generated By
Generated At
File URL
File Hash
Status
```

Adapt the exact field names to your current Prisma schema.

------------------------------------------------------------------------

# 40. Audit Integration

Your existing project already has:

``` text
src/features/audit/
```

Use the existing audit system.

Do **not** create:

``` text
src/features/reports/audit/
```

The report feature should call the existing audit functionality after
successful generation.

Recommended event:

``` text
REPORT_GENERATED
```

Example:

``` text
Action:
REPORT_GENERATED

Case:
FX-2026-184

Actor:
Investigator

Timestamp:
05 Oct 2026 · 11:42 AM
```

------------------------------------------------------------------------

# 41. Storage Integration

Your existing project already has:

``` text
src/lib/tigris.ts
```

and S3-compatible storage.

Do not create another storage client inside:

``` text
src/features/reports/pdf/
```

The PDF generator should only produce:

``` text
Buffer
```

Storage belongs to the existing storage infrastructure.

Recommended production flow:

``` text
PDF Renderer
     ↓
PDF Buffer
     ↓
SHA-256
     ↓
Existing S3 / Tigris Storage
     ↓
Report Record
     ↓
Audit Log
```

------------------------------------------------------------------------

# 42. Image Integration with Existing Storage

Your project already uses secure evidence storage and presigned URLs.

The report layer should consume an appropriate server-accessible image
source.

Do not expose private credentials to the PDF component.

Do not use browser-only temporary URLs unless they are intentionally
supported during server rendering.

For private assets:

``` text
Storage
   ↓
Secure server access
   ↓
PDF renderer
```

------------------------------------------------------------------------

# 43. What Should NOT Be Added

For this PDF implementation, do **not** create:

``` text
src/pdf/
src/components/pdf/
src/services/pdf/
src/lib/pdf/
src/app/pdf/
src/features/cases/pdf/
src/features/evidence/pdf/
```

Also do not duplicate:

``` text
Prisma client
S3/Tigris client
Better Auth
AI client
```

The PDF feature should consume the infrastructure already present in
your project.

------------------------------------------------------------------------

# 44. What Belongs in `src/components`

Generally, nothing PDF-specific.

Your existing:

``` text
src/components/
```

contains dashboard and reusable UI components.

Those components are designed for browser rendering.

React PDF components use a different rendering environment.

Therefore:

``` text
src/components/cases/case-details-header.tsx
```

should not be imported into the PDF.

Instead create:

``` text
src/features/reports/pdf/components/ReportHeader.tsx
```

with PDF-native primitives:

``` tsx
<Text />
<View />
<Image />
<Page />
```

------------------------------------------------------------------------

# 45. What Belongs in `src/features/reports`

Keep domain-level report operations here:

``` text
src/features/reports/
├── actions.ts
├── queries.ts
├── types.ts
├── buildReportData.ts
└── pdf/
```

The distinction is:

``` text
reports/
    Domain / data / report lifecycle

reports/pdf/
    PDF-specific rendering
```

This is the cleanest boundary for your current architecture.

------------------------------------------------------------------------

# 46. What Belongs in `src/features/reports/pdf`

Only PDF rendering concerns:

``` text
CaseReportDocument.tsx
components/
styles/
utils/
```

Do not put:

``` text
Prisma queries
Better Auth configuration
S3 credentials
AI model calls
database mutations
```

inside this directory.

------------------------------------------------------------------------

# 47. Report Data Flow

The final request lifecycle should be:

``` text
Investigator
      │
      ▼
Case Detail Page
      │
      │ Generate Report
      ▼
src/app/api/cases/[caseId]/report/route.ts
      │
      ├── Authenticate
      │
      ├── Authorize
      │
      ▼
src/features/reports/queries.ts
      │
      ▼
Prisma
      │
      ▼
PostgreSQL
      │
      ▼
buildReportData()
      │
      ▼
CaseReportData
      │
      ▼
src/features/reports/pdf/CaseReportDocument.tsx
      │
      ├── Cover
      ├── Case
      ├── Evidence
      ├── Witnesses
      ├── Suspects
      ├── Recognition
      ├── Sketch
      ├── Media
      ├── Notes
      ├── Activity
      └── Findings
      │
      ▼
@react-pdf/renderer
      │
      ▼
PDF Buffer
      │
      ├── Download
      │
      └── Optional Storage
             │
             ▼
        Report Record
             │
             ▼
          Audit Log
```

------------------------------------------------------------------------

# 48. Final PDF Content Order

Use this order:

``` text
01 — Cover
02 — Case Information
03 — Investigation Summary
04 — Evidence Register
05 — Evidence Details
06 — Witness Information
07 — Suspect / Person-of-Interest Register
08 — Face Recognition Analysis
09 — Forensic Sketch
10 — Incident Media
11 — Investigation Notes
12 — Activity Timeline
13 — Investigation Findings
14 — Report Metadata
15 — Confidentiality / AI-Assisted Analysis Notice
```

Sections should be conditionally rendered.

------------------------------------------------------------------------

# 49. Conditional Rendering

Example:

``` tsx
{data.witnesses.length > 0 && (
  <WitnessSection data={data} />
)}
```

Recognition:

``` tsx
{data.recognitionResults.length > 0 && (
  <RecognitionResultsSection data={data} />
)}
```

Sketch:

``` tsx
{data.sketches.length > 0 && (
  <ForensicSketchSection data={data} />
)}
```

This prevents unnecessary empty sections.

------------------------------------------------------------------------

# 50. Missing Data Policy

Never render:

``` text
undefined
null
NaN
```

Use:

``` text
Not available
Not recorded
Pending
No records available
```

Examples:

``` text
No evidence records available.

No recognition analysis has been recorded for this case.

No forensic sketch has been generated.
```

------------------------------------------------------------------------

# 51. Confidentiality and AI Notice

Include an appropriate notice for AI-assisted results:

> **AI-Assisted Analysis Notice:** AI-generated sketches and
> computational similarity results are provided as investigative aids.
> They do not independently establish identity, guilt, or legal
> responsibility. Investigative conclusions require appropriate human
> review, corroborating evidence, and applicable procedures.

This should appear wherever AI-generated analysis is presented and in
the final report notice section.

------------------------------------------------------------------------

# 52. Security Requirements

The report route must:

``` text
[ ] Require authentication
[ ] Verify case authorization
[ ] Validate caseId
[ ] Avoid public report URLs
[ ] Avoid sensitive logging
[ ] Protect stored report files
[ ] Protect private evidence images
[ ] Use Cache-Control: private, no-store
[ ] Record report generation
[ ] Preserve report version
```

Never expose:

``` text
DATABASE_URL
AI secrets
S3 credentials
internal filesystem paths
Prisma stack traces
```

------------------------------------------------------------------------

# 53. Performance Requirements

Use Prisma efficiently.

Good:

``` text
Case ID
 ↓
Required relations only
 ↓
Report DTO
 ↓
PDF
```

Avoid:

``` text
Entire database
 ↓
Huge object
 ↓
PDF
```

Avoid N+1 queries.

The PDF renderer should receive only the data required by the document.

------------------------------------------------------------------------

# 54. Report Snapshot

A generated report is a snapshot.

Example:

``` text
Generated:
05 Oct 2026 · 11:42 AM
```

If the case changes afterward, the existing generated report should not
silently change.

When storage is enabled:

``` text
Report 1.0
Report 1.1
Report 2.0
```

should remain independently traceable.

------------------------------------------------------------------------

# 55. Optional SHA-256 Integrity

After PDF rendering:

``` text
PDF Buffer
     ↓
SHA-256
     ↓
Report.fileHash
```

This is useful when the generated report is stored as an official
artifact.

Do this after the basic generation pipeline is stable.

------------------------------------------------------------------------

# 56. Testing Strategy

## Test 1 --- Minimal

``` text
Case
Title
Status
Description
```

Expected:

``` text
PDF opens
A4
Correct fonts
Correct footer
Correct page number
```

## Test 2 --- Full case

``` text
8 evidence items
3 witnesses
2 suspects
3 recognition results
1 forensic sketch
3 media items
4 notes
10 activity records
```

Expected:

``` text
Multiple pages
No overlap
No clipping
Correct page numbers
```

## Test 3 --- Long text

Test:

``` text
Very long case description
Very long witness statement
Very long investigation note
```

Expected:

``` text
Correct wrapping
No text clipping
```

## Test 4 --- Long filename

Expected:

``` text
Column remains aligned
Filename wraps correctly
```

## Test 5 --- Missing image

Expected:

``` text
Professional placeholder
No complete report failure
```

## Test 6 --- Missing relations

Expected:

``` text
Professional empty state
No runtime crash
```

------------------------------------------------------------------------

# 57. Visual QA Checklist

Inspect every generated PDF for:

``` text
[ ] A4 page size
[ ] Consistent margins
[ ] Header alignment
[ ] Footer alignment
[ ] Page numbers
[ ] Case ID
[ ] Report version
[ ] Table alignment
[ ] Image dimensions
[ ] Sketch dimensions
[ ] Captions
[ ] Text wrapping
[ ] No clipping
[ ] No overlap
[ ] No accidental blank pages
[ ] No broken cards
[ ] Embedded fonts
[ ] Correct timestamps
[ ] Correct case information
[ ] Correct evidence
[ ] Correct recognition values
[ ] AI notice
[ ] Confidentiality notice
```

------------------------------------------------------------------------

# 58. Debugging Order

When something fails, debug in this order:

``` text
1. Package installation
2. Minimal PDF
3. Font registration
4. A4 page
5. Header/footer
6. Case data
7. Tables
8. Images
9. Large sections
10. Full report
```

Minimal test:

``` tsx
<Document>
  <Page size="A4">
    <Text>Hello Criminal Eye</Text>
  </Page>
</Document>
```

Only add complexity after this works.

------------------------------------------------------------------------

# 59. Recommended Implementation Sequence

## Step 1 --- Install

``` powershell
pnpm add @react-pdf/renderer
```

## Step 2 --- Create feature

``` text
src/features/reports/
```

## Step 3 --- Create PDF module

``` text
src/features/reports/pdf/
```

## Step 4 --- Add fonts

``` text
public/fonts/
```

## Step 5 --- Register fonts

``` text
pdf/styles/reportFonts.ts
```

## Step 6 --- Create theme

``` text
pdf/styles/reportTheme.ts
```

## Step 7 --- Create styles

``` text
pdf/styles/reportStyles.ts
```

## Step 8 --- Create types

``` text
src/features/reports/types.ts
```

## Step 9 --- Create query

``` text
src/features/reports/queries.ts
```

## Step 10 --- Create DTO builder

``` text
src/features/reports/buildReportData.ts
```

## Step 11 --- Create minimal document

``` text
pdf/CaseReportDocument.tsx
```

## Step 12 --- Add sections

``` text
Case
Evidence
Witness
Suspect
Recognition
Sketch
Media
Notes
Activity
Findings
Metadata
```

## Step 13 --- Create API route

``` text
src/app/api/cases/[caseId]/report/route.ts
```

## Step 14 --- Add authentication/authorization

Use existing Better Auth.

## Step 15 --- Add audit

Use existing:

``` text
src/features/audit/
```

## Step 16 --- Connect Generate Report button

## Step 17 --- Test

## Step 18 --- Add persistent storage

Use existing:

``` text
src/lib/tigris.ts
```

only after the renderer is stable.

------------------------------------------------------------------------

# 60. What the Final Repository Should Look Like

Only the PDF-related additions should look like:

``` text
criminal-eye/
│
├── src/
│   ├── app/
│   │   └── api/
│   │       └── cases/
│   │           └── [caseId]/
│   │               └── report/
│   │                   └── route.ts
│   │
│   └── features/
│       └── reports/
│           ├── actions.ts
│           ├── queries.ts
│           ├── types.ts
│           ├── buildReportData.ts
│           │
│           └── pdf/
│               ├── CaseReportDocument.tsx
│               │
│               ├── components/
│               │   ├── ReportCover.tsx
│               │   ├── ReportHeader.tsx
│               │   ├── ReportFooter.tsx
│               │   ├── CaseInformationSection.tsx
│               │   ├── InvestigationSummarySection.tsx
│               │   ├── EvidenceRegisterSection.tsx
│               │   ├── EvidenceDetailsSection.tsx
│               │   ├── WitnessSection.tsx
│               │   ├── SuspectsSection.tsx
│               │   ├── RecognitionResultsSection.tsx
│               │   ├── ForensicSketchSection.tsx
│               │   ├── IncidentMediaSection.tsx
│               │   ├── InvestigationNotesSection.tsx
│               │   ├── ActivityTimelineSection.tsx
│               │   ├── FindingsSection.tsx
│               │   └── ReportMetadataSection.tsx
│               │
│               ├── styles/
│               │   ├── reportFonts.ts
│               │   ├── reportTheme.ts
│               │   └── reportStyles.ts
│               │
│               └── utils/
│                   ├── formatReportDate.ts
│                   ├── formatReportNumber.ts
│                   └── sanitizeReportText.ts
│
├── public/
│   └── fonts/
│       ├── Inter-Regular.ttf
│       ├── Inter-Medium.ttf
│       ├── Inter-SemiBold.ttf
│       ├── Inter-Bold.ttf
│       ├── SourceSerif4-Regular.ttf
│       └── SourceSerif4-SemiBold.ttf
│
├── prisma/
│   └── schema.prisma
│
├── package.json
└── pnpm-lock.yaml
```

This is the **PDF-specific architecture only**. It does not replace or
duplicate your existing application folders.

------------------------------------------------------------------------

# 61. Final Architecture Diagram

``` text
                        CRIMINAL EYE
                             │
                             ▼
                    EXISTING CASE PAGE
                             │
                     Generate Report
                             │
                             ▼
        src/app/api/cases/[caseId]/report/route.ts
                             │
                  ┌──────────┴──────────┐
                  │                     │
             Auth Check           Access Check
                  │                     │
                  └──────────┬──────────┘
                             ▼
               src/features/reports/queries.ts
                             │
                             ▼
                         Prisma
                             │
                             ▼
                       PostgreSQL
                             │
                             ▼
              src/features/reports/buildReportData.ts
                             │
                             ▼
                    CaseReportData DTO
                             │
                             ▼
         src/features/reports/pdf/CaseReportDocument.tsx
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       Case Data          Evidence          Witnesses
          │                  │                  │
          ▼                  ▼                  ▼
       Suspects          Recognition          Sketch
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
                    @react-pdf/renderer
                             │
                             ▼
                         A4 PDF
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
               Download            Existing Storage
                                        │
                                        ▼
                                 Report Record
                                        │
                                        ▼
                               Existing Audit System
```

------------------------------------------------------------------------

# 62. Final Architectural Principle

The report system should follow this rule:

> **Keep the report domain inside `src/features/reports`, keep the PDF
> renderer inside `src/features/reports/pdf`, keep the HTTP boundary
> inside `src/app/api/cases/[caseId]/report`, and reuse the existing
> Prisma, Better Auth, storage, and audit infrastructure.**

Do not create duplicate infrastructure.

The final separation is:

``` text
src/app
    → HTTP / routing

src/features/reports
    → Report domain and data

src/features/reports/pdf
    → PDF rendering only

public/fonts
    → PDF fonts

src/lib/prisma.ts
    → Existing database infrastructure

src/lib/tigris.ts
    → Existing object storage infrastructure

src/features/audit
    → Existing audit infrastructure
```

This is the cleanest fit for the current Criminal Eye architecture.

------------------------------------------------------------------------

# 63. Definition of Done

## Installation

``` text
[ ] @react-pdf/renderer installed
[ ] pnpm-lock.yaml updated
[ ] pnpm build succeeds
```

## Placement

``` text
[ ] src/features/reports exists
[ ] src/features/reports/pdf exists
[ ] PDF components are inside pdf/components
[ ] PDF styles are inside pdf/styles
[ ] PDF utilities are inside pdf/utils
[ ] API route is under src/app/api/cases/[caseId]/report
[ ] Fonts are under public/fonts
```

## Architecture

``` text
[ ] No PDF components inside src/components
[ ] No PDF-specific Prisma client
[ ] No PDF-specific storage client
[ ] No PDF-specific authentication implementation
[ ] No duplicate audit system
[ ] Database access isolated from PDF renderer
```

## Layout

``` text
[ ] A4
[ ] Stable margins
[ ] Explicit table widths
[ ] Controlled image dimensions
[ ] Page numbers
[ ] Repeated footer
[ ] Controlled page breaks
[ ] No clipping
[ ] No overlap
```

## Content

``` text
[ ] Cover
[ ] Case information
[ ] Investigation summary
[ ] Evidence
[ ] Witnesses
[ ] Suspects
[ ] Recognition
[ ] Forensic sketch
[ ] Media
[ ] Notes
[ ] Activity
[ ] Findings
[ ] Metadata
[ ] AI notice
[ ] Confidentiality notice
```

## Security

``` text
[ ] Authentication
[ ] Authorization
[ ] Private response
[ ] Protected media
[ ] Safe error handling
[ ] Audit event
```

## Quality

``` text
[ ] Minimal case tested
[ ] Large case tested
[ ] Long text tested
[ ] Missing data tested
[ ] Missing image tested
[ ] Multi-page report tested
[ ] Final PDF visually inspected
```

------------------------------------------------------------------------

# 64. Quick Start

From the project root:

``` powershell
pnpm add @react-pdf/renderer
```

Then implement:

``` text
src/features/reports/
src/features/reports/pdf/
public/fonts/
src/app/api/cases/[caseId]/report/
```

Start the project:

``` powershell
pnpm dev
```

Then:

``` text
Criminal Eye
    ↓
Cases
    ↓
Select Case
    ↓
Generate Report
    ↓
Authenticated API
    ↓
Prisma query
    ↓
Report DTO
    ↓
React PDF document
    ↓
A4 PDF
    ↓
Download
    ↓
Audit
```

------------------------------------------------------------------------

# 65. Official References

### React PDF

-   https://react-pdf.org/
-   https://react-pdf.org/docs/v4
-   https://react-pdf.org/docs/v4/styling
-   https://react-pdf.org/docs/v4/fonts
-   https://react-pdf.org/docs/v4/advanced/page-wrapping
-   https://react-pdf.org/docs/v4/advanced/dynamic-content
-   https://react-pdf.org/docs/v4/components/document
-   https://github.com/diegomura/react-pdf
-   https://www.npmjs.com/package/@react-pdf/renderer

### Next.js

-   https://nextjs.org/docs

------------------------------------------------------------------------

# Final Standard

The Criminal Eye PDF system should be:

``` text
Feature-aligned
Server-generated
A4 standardized
Font-controlled
Data-driven
Modular
Secure
Versioned
Auditable
Storage-ready
Visually verified
```

Most importantly:

``` text
The PDF is NOT the dashboard.
```

It is a dedicated investigation document generated from a controlled
case-data snapshot.

The existing Criminal Eye architecture remains the source of truth; the
PDF system simply adds a clean `reports` feature and a dedicated `pdf`
rendering boundary.
