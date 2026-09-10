import { NextResponse } from "next/server";
import { headers } from "next/headers";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";

import { auth } from "@/lib/auth";
import { CaseReportDocument } from "@/features/reports/pdf/CaseReportDocument";
import { getCaseReportSource } from "@/features/reports/queries";
import { buildCaseReportData } from "@/features/reports/buildReportData";
import { recordReportGeneratedAction } from "@/features/reports/actions";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params;

    if (!caseId) {
      return NextResponse.json(
        { error: "Case identifier is required" },
        { status: 400 }
      );
    }

    // Authenticate current session if available
    let sessionUser: { name?: string; role?: string } | undefined;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user) {
        sessionUser = {
          name: session.user.name,
          role: (session.user as { role?: string })?.role || "INVESTIGATOR",
        };
      }
    } catch (authErr) {
      console.warn("Session authentication fallback in report generation:", authErr);
    }

    // Retrieve report source (Prisma database record with fallback)
    const source = await getCaseReportSource(caseId);

    if (!source) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // Transform into CaseReportData DTO
    const reportData = buildCaseReportData(source, sessionUser);

    // Render PDF Document directly into a Node.js Buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(CaseReportDocument, { data: reportData }) as any
    );

    // Record audit event in the background (fire and forget / non-blocking)
    try {
      await recordReportGeneratedAction({
        caseId: reportData.case.id,
        caseNumber: reportData.case.caseNumber,
        reportVersion: reportData.report.version,
        generatedBy: reportData.report.generatedBy,
      });
    } catch (auditErr) {
      console.warn("Audit log recording failed for report generation:", auditErr);
    }

    const safeCaseNumber = reportData.case.caseNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `FORENSIX-${safeCaseNumber}-REPORT-V${reportData.report.version}.pdf`;
    const url = new URL(_request.url);
    const isInline = url.searchParams.get("inline") === "true";
    const disposition = `${isInline ? "inline" : "attachment"}; filename="${filename}"`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Criminal Eye report generation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to generate case report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
