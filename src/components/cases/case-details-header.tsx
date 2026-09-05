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
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";
import { toast } from "sonner";

interface CaseDetailsHeaderProps {
  caseData: ResolvedCaseDetail;
}

export function CaseDetailsHeader({ caseData }: CaseDetailsHeaderProps) {
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    toast.info(`Generating investigative report for ${caseData.caseNumber}...`);
    setTimeout(() => {
      setGeneratingReport(false);
      toast.success(`Forensic Report for ${caseData.caseNumber} generated successfully.`);
    }, 1200);
  };

  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(caseData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${caseData.caseNumber}-details.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Case metadata exported.");
  };

  const handlePrint = () => {
    window.print();
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("investigation")) {
      return (
        <span className="inline-flex items-center rounded-md border-2 border-[#7E22CE]/60 bg-[#2D1B4E]/80 px-2.5 py-0.5 text-xs font-semibold text-[#C084FC] tracking-wide">
          Under Investigation
        </span>
      );
    }
    if (normalized.includes("open")) {
      return (
        <span className="inline-flex items-center rounded-md border-2 border-blue-500/50 bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-400 tracking-wide">
          Open
        </span>
      );
    }
    if (normalized.includes("solved") || normalized.includes("closed")) {
      return (
        <span className="inline-flex items-center rounded-md border-2 border-emerald-500/50 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 tracking-wide">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md border-2 border-border/80 bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground tracking-wide">
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
            <FileText className="size-3.5 text-muted-foreground" />
            <span>{generatingReport ? "Generating..." : "Generate Report"}</span>
          </Button>

          {/* More Actions Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="h-9 gap-1.5 rounded-lg bg-[#0070F3] hover:bg-[#0060DF] text-white text-xs sm:text-sm font-medium shadow-sm shadow-[#0070F3]/30 px-3.5 cursor-pointer"
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
                onClick={handleExportJson}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium"
              >
                <Download className="size-3.5 text-muted-foreground" />
                <span>Export Case Data</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handlePrint}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium"
              >
                <Printer className="size-3.5 text-muted-foreground" />
                <span>Print Summary</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Case URL copied to clipboard");
                }}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium"
              >
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>Share Case Link</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-border/60" />

              <div className="px-1 py-0.5">
                <ArchiveCaseDialog
                  caseId={caseData.id}
                  caseNumber={caseData.caseNumber}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Case ID and Status Badge */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
          {caseData.caseNumber}
        </h1>
        {renderStatusBadge(caseData.status)}
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
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border/80 to-transparent my-1" />

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
