"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Shield,
  FileText,
  ChevronDown,
  Download,
  Printer,
  Share2,
  Edit,
  Loader2,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArchiveCaseDialog } from "@/components/cases/ArchiveCaseDialog";
import { ExportCaseDialog } from "@/components/cases/actions/ExportCaseDialog";
import { PrintSummaryDialog } from "@/components/cases/actions/PrintSummaryDialog";
import { ShareCaseDialog } from "@/components/cases/actions/ShareCaseDialog";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";
import { toast } from "sonner";

interface CaseDetailsHeaderProps {
  caseData: ResolvedCaseDetail;
}

export function CaseDetailsHeader({ caseData }: CaseDetailsHeaderProps) {
  const [currentStatus, setCurrentStatus] = useState(caseData.status);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const isArchived = currentStatus.toLowerCase().includes("archive");

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      toast.info(`Compiling records and generating PDF for ${caseData.caseNumber}...`, {
        duration: 5000,
      });

      const targetIdentifier = caseData.caseNumber || caseData.id;
      const response = await fetch(`/api/cases/${encodeURIComponent(targetIdentifier)}/report`);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || `Server returned ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const safeCaseNumber = (caseData.caseNumber || caseData.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      anchor.download = `FORENSIX-${safeCaseNumber}-REPORT.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast.success(`Forensic Report for ${caseData.caseNumber} downloaded successfully.`);
    } catch (err) {
      console.error("Report generation failed:", err);
      toast.error(
        err instanceof Error
          ? `Report generation failed: ${err.message}`
          : "Failed to generate report. Please try again."
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("archive")) {
      return (
        <span className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400 tracking-wide">
          Archived
        </span>
      );
    }
    if (normalized.includes("investigation")) {
      return (
        <span className="inline-flex items-center rounded-md border border-[#7E22CE]/40 bg-[#2D1B4E]/80 px-2.5 py-0.5 text-xs font-semibold text-[#C084FC] tracking-wide">
          Under Investigation
        </span>
      );
    }
    if (normalized.includes("open")) {
      return (
        <span className="inline-flex items-center rounded-md border border-blue-500/40 bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-400 tracking-wide">
          Open
        </span>
      );
    }
    if (normalized.includes("solved") || normalized.includes("closed")) {
      return (
        <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 tracking-wide">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md border border-border/80 bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground tracking-wide">
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-2">
      {/* Top Bar: Back link on left, Action buttons on right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back to Cases Link & Sidebar Toggle */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground cursor-pointer" />
          <Link
            href="/dashboard/cases"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer w-fit"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Cases</span>
          </Link>
        </div>

        {/* Action Buttons: Edit Case, Generate Report, More Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Edit Case Page Link Button */}
          <Link
            href={`/case-details/${caseData.caseNumber}/edit`}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground text-foreground cursor-pointer shadow-xs transition-colors"
          >
            <Edit className="size-3.5 text-muted-foreground" />
            <span>Edit Case</span>
          </Link>

          {/* Generate Report Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="h-9 gap-2 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer shadow-xs"
          >
            {generatingReport ? (
              <Loader2 className="size-3.5 text-muted-foreground animate-spin" />
            ) : (
              <FileText className="size-3.5 text-muted-foreground" />
            )}
            <span>{generatingReport ? "Generating..." : "Generate Report"}</span>
          </Button>

          {/* More Actions Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="h-9 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium shadow-sm shadow-[#665AEF]/25 px-3.5 cursor-pointer"
                />
              }
            >
              <span>More Actions</span>
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="w-48 p-1.5 rounded-xl border-2 border-border bg-card/95 backdrop-blur-xl shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => setIsExportOpen(true)}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Download className="size-3.5 text-muted-foreground" />
                <span>Export Case Data</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsPrintOpen(true)}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Printer className="size-3.5 text-muted-foreground" />
                <span>Print Summary</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsShareOpen(true)}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>Share Case Link</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-border/60" />

              <DropdownMenuItem
                onClick={() => setIsArchiveOpen(true)}
                className={`cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md font-medium ${
                  isArchived
                    ? "text-blue-400 hover:bg-blue-500/10 focus:bg-blue-500/10"
                    : "text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                }`}
              >
                {isArchived ? (
                  <>
                    <RefreshCw className="size-3.5 text-blue-400" />
                    <span>Restore Case</span>
                  </>
                ) : (
                  <>
                    <Archive className="size-3.5 text-destructive" />
                    <span>Archive Case</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Real-time Modals for More Actions */}
      <ExportCaseDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        caseData={{ ...caseData, status: currentStatus }}
      />

      <PrintSummaryDialog
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        caseData={{ ...caseData, status: currentStatus }}
      />

      <ShareCaseDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        caseData={{ ...caseData, status: currentStatus }}
      />

      <ArchiveCaseDialog
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        caseId={caseData.id}
        caseNumber={caseData.caseNumber}
        isArchived={isArchived}
        onStatusChange={(newStatus) => setCurrentStatus(newStatus)}
      />

      {/* Case ID and Status Badge */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
          {caseData.caseNumber}
        </h1>
        {renderStatusBadge(currentStatus)}
      </div>

      {/* Case Title and Description */}
      <div className="space-y-1.5">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
          {caseData.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
          {caseData.description}
        </p>
      </div>

      {/* Diffused Horizontal Rule below description */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-border/80 to-transparent my-1" />

      {/* 4 Metadata Columns with direct icons - matched to below 8-col section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full pt-1">
        <div className="xl:col-span-8 2xl:col-span-8 min-w-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Item 1: Date Reported */}
            <div className="flex items-center gap-3 min-w-0">
              <Calendar className="size-5 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground leading-tight truncate">
                  {caseData.dateReported}
                </span>
                <span className="text-xs text-muted-foreground truncate">Date Reported</span>
              </div>
            </div>

            {/* Item 2: Time of Incident */}
            <div className="flex items-center gap-3 min-w-0">
              <Clock className="size-5 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground leading-tight truncate">
                  {caseData.timeOfIncident}
                </span>
                <span className="text-xs text-muted-foreground truncate">Time of Incident</span>
              </div>
            </div>

            {/* Item 3: Location */}
            <div className="flex items-center gap-3 min-w-0">
              <MapPin className="size-5 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground leading-tight truncate">
                  {caseData.location}
                </span>
                <span className="text-xs text-muted-foreground truncate">Location</span>
              </div>
            </div>

            {/* Item 4: Case Type */}
            <div className="flex items-center gap-3 min-w-0">
              <Shield className="size-5 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground leading-tight truncate">
                  {caseData.caseType}
                </span>
                <span className="text-xs text-muted-foreground truncate">Case Type</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
