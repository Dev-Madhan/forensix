"use client";

import React, { useState } from "react";
import { Printer, Download, Share2, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface DossierActionButtonsProps {
  criminalId: string;
  criminalName: string;
  criminalData: Record<string, any>;
}

export function DossierActionButtons({
  criminalId,
  criminalName,
  criminalData,
}: DossierActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(criminalData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `FORENSIX-DOSSIER-${criminalId || "RECORD"}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(`Dossier JSON for ${criminalName} exported successfully.`);
    } catch {
      toast.error("Failed to export dossier JSON.");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Dossier verification URL copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href={`/dashboard/criminals/${criminalId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Return to Profile ({criminalId})</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="h-8 gap-1.5 border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium px-3 cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
          <span>{copied ? "Link Copied" : "Share"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="h-8 gap-1.5 border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium px-3 cursor-pointer"
        >
          <Download className="size-3.5" />
          <span>Export JSON</span>
        </Button>

        <Button
          size="sm"
          onClick={handlePrint}
          className="h-8 gap-1.5 bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold px-3.5 shadow-md cursor-pointer"
        >
          <Printer className="size-3.5" />
          <span>Print Official PDF</span>
        </Button>
      </div>
    </div>
  );
}
