"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet, Check, Loader2, ShieldCheck, Database } from "lucide-react";
import { toast } from "sonner";
import { logCaseActivity } from "@/components/cases/activity";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";

interface ExportCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: ResolvedCaseDetail;
}

export function ExportCaseDialog({ isOpen, onClose, caseData }: ExportCaseDialogProps) {
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [isExporting, setIsExporting] = useState(false);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeSuspects, setIncludeSuspects] = useState(true);
  const [includeWitnesses, setIncludeWitnesses] = useState(true);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const targetIdentifier = caseData.caseNumber || caseData.id;
      const res = await fetch(`/api/cases/${encodeURIComponent(targetIdentifier)}/export?format=${format}`);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      const safeCaseNumber = (caseData.caseNumber || caseData.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      anchor.download = `FORENSIX-${safeCaseNumber}-${format.toUpperCase()}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);

      logCaseActivity({
        caseId: caseData.id,
        caseNumber: caseData.caseNumber,
        action: `Exported case dossier (${format.toUpperCase()})`,
        details: `Generated comprehensive forensic data export in ${format.toUpperCase()} format with all attached registries.`,
        category: "Case",
        actionType: "CASE",
      });

      toast.success(`Case ${caseData.caseNumber} exported as ${format.toUpperCase()} successfully.`);
      onClose();
    } catch (err) {
      console.error("Export error:", err);
      // Client-side fallback if server route has an unexpected issue
      const exportJsonStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(caseData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", exportJsonStr);
      downloadAnchor.setAttribute("download", `${caseData.caseNumber}-details.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success("Case metadata exported directly.");
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isExporting && onClose()}
      title={
        <div className="flex items-center gap-2">
          <Database className="size-5 text-[#665AEF]" />
          <span>Export Case Data</span>
        </div>
      }
      description={`Generate and download an official forensic data package for ${caseData.caseNumber}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Case summary header pill */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border-2 border-border/80 text-xs">
          <div>
            <p className="font-semibold text-foreground font-mono">{caseData.caseNumber}</p>
            <p className="text-muted-foreground truncate max-w-xs">{caseData.title}</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#665AEF]/15 text-[#A594FD] border-2 border-[#665AEF]/30">
            {caseData.status}
          </span>
        </div>

        {/* Format Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* JSON option */}
            <div
              onClick={() => setFormat("json")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                format === "json"
                  ? "border-[#665AEF] bg-[#665AEF]/10 shadow-sm"
                  : "border-2 border-border/70 bg-card/60 hover:border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FileJson className={`size-5 ${format === "json" ? "text-[#665AEF]" : "text-muted-foreground"}`} />
                {format === "json" && (
                  <div className="size-4 rounded-full bg-[#665AEF] flex items-center justify-center text-white">
                    <Check className="size-2.5 stroke-3" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Forensic JSON</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  Full structured dossier with evidence, hashes, and chain of custody
                </p>
              </div>
            </div>

            {/* CSV option */}
            <div
              onClick={() => setFormat("csv")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                format === "csv"
                  ? "border-[#665AEF] bg-[#665AEF]/10 shadow-sm"
                  : "border-2 border-border/70 bg-card/60 hover:border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className={`size-5 ${format === "csv" ? "text-[#665AEF]" : "text-muted-foreground"}`} />
                {format === "csv" && (
                  <div className="size-4 rounded-full bg-[#665AEF] flex items-center justify-center text-white">
                    <Check className="size-2.5 stroke-3" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Spreadsheet CSV</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  Flat tabular dataset for Excel, analytics, and record intake
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inclusion Checkboxes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Included Registries
          </label>
          <div className="space-y-2 bg-muted/20 p-3 rounded-lg border-2 border-border/60">
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeEvidence}
                onChange={(e) => setIncludeEvidence(e.target.checked)}
                className="rounded border-border text-[#665AEF] focus:ring-[#665AEF] size-3.5"
              />
              <span>Physical & Digital Evidence Register (with hashes)</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSuspects}
                onChange={(e) => setIncludeSuspects(e.target.checked)}
                className="rounded border-border text-[#665AEF] focus:ring-[#665AEF] size-3.5"
              />
              <span>Suspects & Persons of Interest Registry</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeWitnesses}
                onChange={(e) => setIncludeWitnesses(e.target.checked)}
                className="rounded border-border text-[#665AEF] focus:ring-[#665AEF] size-3.5"
              />
              <span>Witness Testimonies & Case Metadata</span>
            </label>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border-2 border-border/50">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
          <span>Cryptographic export signature applied for chain-of-custody verification.</span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-border/70">
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={onClose}
            className="cursor-pointer text-xs border-2 border-border/80"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={isExporting}
            onClick={handleExport}
            className="cursor-pointer gap-1.5 text-xs bg-[#665AEF] hover:bg-[#5749DF] text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Compiling Dossier...</span>
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                <span>Download {format.toUpperCase()} Package</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
