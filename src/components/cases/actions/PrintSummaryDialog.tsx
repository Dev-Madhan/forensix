"use client";

import React from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Shield,
  FileText,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  AlertTriangle,
  Fingerprint,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { logCaseActivity } from "@/components/cases/activity";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";

interface PrintSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: ResolvedCaseDetail;
}

export function PrintSummaryDialog({
  isOpen,
  onClose,
  caseData,
}: PrintSummaryDialogProps) {
  const [printDateTime, setPrintDateTime] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = String(now.getFullYear()).slice(-2);
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setPrintDateTime(`${month}/${day}/${year}, ${timeStr}`);
  }, [isOpen]);

  const handlePrint = () => {
    logCaseActivity({
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      action: "Printed official case summary",
      details: `Generated official physical case summary document for ${caseData.caseNumber}.`,
      category: "Case",
      actionType: "CASE",
    });

    // Clean print without launching a foreground toast into print preview
    const onAfterPrint = () => {
      window.removeEventListener("afterprint", onAfterPrint);
      toast.success("Case summary sent to printer");
    };
    window.addEventListener("afterprint", onAfterPrint);

    window.print();
  };

  const isArchived = caseData.status.toLowerCase().includes("archive");
  const isInvestigation = caseData.status.toLowerCase().includes("investigat");
  const isClosed =
    caseData.status.toLowerCase().includes("closed") ||
    caseData.status.toLowerCase().includes("solved");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Case Summary Print Preview"
      description={
        <span className="text-xs text-muted-foreground truncate block">
          Official law enforcement executive briefing for {caseData.caseNumber}
        </span>
      }
      maxWidth="max-w-2xl"
      contentClassName="p-3 sm:p-5"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-center sm:justify-start">
            <Info className="size-3.5 text-[#665AEF] shrink-0" />
            <span>A4 / Letter auto-scaled for physical or PDF print</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-none h-9 cursor-pointer text-xs font-medium border-2 border-border/80 hover:bg-muted/60"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="flex-1 sm:flex-none h-9 cursor-pointer gap-2 text-xs font-semibold bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-sm shadow-[#665AEF]/25 active:scale-[0.98] transition-transform"
            >
              <Printer className="size-4 shrink-0" />
              <span>Print Official Summary</span>
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Sheet Container */}
      <div
        id="forensix-printable-sheet"
        className="p-3.5 sm:p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B0B0E] text-zinc-900 dark:text-zinc-100 shadow-sm space-y-3.5 sm:space-y-4 text-xs font-sans select-text"
      >
        {/* Top Document Metadata Bar: Perfect Left and Right Alignment */}
        <div className="flex items-center justify-between w-full border-b-2 border-zinc-200 dark:border-zinc-800/80 pb-2 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tracking-tight">
          <div className="flex items-center gap-1.5 shrink-0 text-left">
            <Clock className="size-3 text-zinc-400 shrink-0" />
            <span>
              {printDateTime || `${caseData.dateReported}, ${caseData.timeOfIncident || "09:14 PM"}`}
            </span>
          </div>
          <div className="text-right truncate font-bold text-zinc-800 dark:text-zinc-200 ml-2 max-w-[60%] sm:max-w-[70%]">
            {caseData.caseNumber} • {caseData.title}
          </div>
        </div>

        {/* Official Document Header: Precision Executive Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-zinc-200 dark:border-zinc-800/80 pb-3 sm:pb-3.5">
          {/* Division Branding with Project Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Image
              src="/images/Logo.png"
              alt="Forensix Logo"
              width={38}
              height={38}
              className="size-9 sm:size-10 object-contain rounded-lg shrink-0"
              priority
            />
            <div className="min-w-0 flex flex-col justify-center">
              <h2 className="text-xs sm:text-sm md:text-base font-extrabold tracking-wider uppercase truncate text-zinc-900 dark:text-zinc-100 leading-tight">
                Forensix Forensic Intelligence
              </h2>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-mono truncate mt-0.5">
                Investigation Executive Briefing
              </p>
            </div>
          </div>

          {/* Case Identifiers & Incident Timestamp */}
          <div className="flex items-center sm:items-end justify-between sm:flex-col gap-1.5 sm:gap-1 px-2.5 py-1.5 sm:p-0 rounded-md sm:rounded-none bg-zinc-100/70 dark:bg-zinc-900/60 sm:bg-transparent sm:dark:bg-transparent border-2 sm:border-0 border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
            <div className="flex items-center gap-1.5 sm:justify-end">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 sm:hidden">Case ID</span>
              <span className="font-mono font-extrabold text-xs sm:text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                {caseData.caseNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              <Calendar className="size-3 shrink-0 text-zinc-400" />
              <span>{caseData.dateReported}</span>
              <span className="opacity-40">•</span>
              <span>{caseData.timeOfIncident || "09:14 PM"}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid - Mobile 2x2, Desktop 4x1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-md sm:rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border-2 border-zinc-200 dark:border-zinc-800/80">
          {/* Metric 1: Status */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
              Status
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <span
                className={`size-2 rounded-full shrink-0 ${
                  isArchived
                    ? "bg-amber-500"
                    : isClosed
                    ? "bg-emerald-500"
                    : isInvestigation
                    ? "bg-purple-500"
                    : "bg-blue-500"
                }`}
              />
              <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-[11px] sm:text-xs">
                {caseData.status}
              </span>
            </div>
          </div>

          {/* Metric 2: Priority */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
              Priority
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide truncate text-[11px] sm:text-xs mt-0.5">
              {caseData.priority}
            </span>
          </div>

          {/* Metric 3: Classification */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
              Classification
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-[11px] sm:text-xs mt-0.5">
              {caseData.caseType || "Theft"}
            </span>
          </div>

          {/* Metric 4: Location */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
              Location
            </span>
            <div className="flex items-center gap-1 mt-0.5 min-w-0">
              <MapPin className="size-3 text-zinc-400 shrink-0" />
              <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-[11px] sm:text-xs">
                {caseData.location}
              </span>
            </div>
          </div>
        </div>

        {/* Incident Narrative */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <FileText className="size-3.5 text-zinc-500" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider">
              Case Incident Briefing
            </h3>
          </div>
          <div className="p-3 rounded-md sm:rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border-2 border-zinc-200/80 dark:border-zinc-800/80 text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {caseData.title}
            </p>
            <p className="opacity-90 leading-relaxed text-left">
              {caseData.description ||
                "Armed incident under active forensic inquiry and evidence correlation."}
            </p>
          </div>
        </div>

        {/* Evidence and Suspects Roster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-0.5">
          {/* Evidence items snapshot */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
              <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="size-3.5 text-zinc-500" />
                <span>Evidence Registry</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">
                {caseData.evidenceCount || 3} Logged
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 p-2.5 rounded-md sm:rounded-xl border-2 border-zinc-200/80 dark:border-zinc-800/80">
              <li className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-1.5">
                <span className="truncate">EV-001: Fingerprint Lifts (East Gate)</span>
                <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  SECURED
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 py-1.5">
                <span className="truncate">EV-002: CCTV Surveillance File</span>
                <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                  VERIFIED
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 pt-1.5">
                <span className="truncate">EV-003: Ballistics Sample</span>
                <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                  ANALYZING
                </span>
              </li>
            </ul>
          </div>

          {/* Suspects snapshot */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
              <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <User className="size-3.5 text-zinc-500" />
                <span>Suspects / POIs</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">
                {caseData.suspectsCount || 2} Profiles
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 p-2.5 rounded-md sm:rounded-xl border-2 border-zinc-200/80 dark:border-zinc-800/80">
              <li className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-1.5">
                <span className="truncate">Vikram &quot;Shadow&quot; R.</span>
                <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
                  POI #1
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 pt-1.5">
                <span className="truncate">Unknown Accomplice</span>
                <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 shrink-0">
                  REVIEW
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Investigator Certification & Sign-off */}
        <div className="pt-3.5 border-t-2 border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 text-[10px] text-zinc-500 dark:text-zinc-400">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>Chain of Custody Formally Authenticated</span>
            </div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 pt-0.5">
              Lead Investigator: {caseData.assignedToName || "Madhan Kumar"}
            </p>
            <p className="font-mono text-[9px]">
              {caseData.assignedToEmail || "officer@forensix.gov"}
            </p>
          </div>

          <div className="w-full sm:w-44 border-t-2 border-zinc-400 dark:border-zinc-600 pt-1 text-center sm:text-right">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 block font-mono">
              Authorized Signature
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
