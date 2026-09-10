"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Mail, ShieldAlert, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";
import { logCaseActivity } from "@/components/cases/activity";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";

interface ShareCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: ResolvedCaseDetail;
}

export function ShareCaseDialog({ isOpen, onClose, caseData }: ShareCaseDialogProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [caseUrl, setCaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCaseUrl(window.location.href);
    }
  }, [isOpen]);

  const dispatchMemo = `[FORENSIX INVESTIGATION DISPATCH]
Case Identifier : ${caseData.caseNumber}
Incident Title  : ${caseData.title}
Status          : ${caseData.status}
Priority        : ${caseData.priority}
Incident Date   : ${caseData.dateReported} (${caseData.timeOfIncident})
Location        : ${caseData.location}
Investigator    : ${caseData.assignedToName}
Access Dossier  : ${caseUrl || `http://localhost:3000/case-details/${caseData.caseNumber}`}
Classification  : CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE`;

  const handleCopyUrl = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(caseUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = caseUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedUrl(true);
      toast.success("Case URL copied to clipboard");
      logCaseActivity({
        caseId: caseData.id,
        caseNumber: caseData.caseNumber,
        action: "Shared case URL link",
        details: `Generated secure direct access link for case ${caseData.caseNumber}.`,
        category: "Case",
        actionType: "CASE",
      });
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error("Failed to copy link. Please manually copy the URL.");
    }
  };

  const handleCopyMemo = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(dispatchMemo);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = dispatchMemo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedMemo(true);
      toast.success("Dispatch memo copied to clipboard");
      logCaseActivity({
        caseId: caseData.id,
        caseNumber: caseData.caseNumber,
        action: "Shared case dispatch memo",
        details: `Formatted and copied inter-agency dispatch brief for ${caseData.caseNumber}.`,
        category: "Case",
        actionType: "CASE",
      });
      setTimeout(() => setCopiedMemo(false), 2000);
    } catch {
      toast.error("Failed to copy dispatch memo.");
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`[FORENSIX DISPATCH] Case ${caseData.caseNumber}: ${caseData.title}`);
    const body = encodeURIComponent(
      `Investigator,\n\nPlease review the active case file below:\n\n${dispatchMemo}\n\nDirect Dossier Link: ${caseUrl}\n\nForensix Digital Forensics Unit`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    logCaseActivity({
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      action: "Shared case via email dispatch",
      details: `Generated email case referral dispatch for case ${caseData.caseNumber}.`,
      category: "Case",
      actionType: "CASE",
    });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Forensix Case: ${caseData.caseNumber}`,
          text: `Case ${caseData.caseNumber} - ${caseData.title} (${caseData.status})`,
          url: caseUrl,
        });
        toast.success("Shared successfully");
        logCaseActivity({
          caseId: caseData.id,
          caseNumber: caseData.caseNumber,
          action: "Shared case via system share sheet",
          details: `Broadcast case ${caseData.caseNumber} via native device share.`,
          category: "Case",
          actionType: "CASE",
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Native share failed:", err);
        }
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Share2 className="size-5 text-[#665AEF]" />
          <span>Share Case Link & Dispatch</span>
        </div>
      }
      description={`Share secure access or generate dispatch briefing for ${caseData.caseNumber}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* URL Box with 1-click copy */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Direct Case URL</label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={caseUrl}
              className="font-mono text-xs bg-muted/40 h-9 select-all border-2 border-border/80"
            />
            <Button
              size="sm"
              onClick={handleCopyUrl}
              className={`h-9 px-3 shrink-0 cursor-pointer gap-1.5 text-xs transition-colors ${
                copiedUrl
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[#665AEF] hover:bg-[#5749DF] text-white"
              }`}
            >
              {copiedUrl ? (
                <>
                  <Check className="size-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Dispatch Briefing */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Inter-Department Dispatch Memo
            </label>
            <button
              type="button"
              onClick={handleCopyMemo}
              className="text-xs text-[#665AEF] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              {copiedMemo ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span>{copiedMemo ? "Copied Memo!" : "Copy Memo"}</span>
            </button>
          </div>
          <textarea
            readOnly
            rows={6}
            value={dispatchMemo}
            className="w-full rounded-lg border-2 border-border/80 bg-muted/20 p-2.5 font-mono text-[11px] text-muted-foreground select-all leading-relaxed focus:outline-none"
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailShare}
            className="cursor-pointer gap-2 text-xs h-9 justify-center border-2 border-border/80 hover:bg-muted/60"
          >
            <Mail className="size-3.5 text-muted-foreground" />
            <span>Email Dispatch</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="cursor-pointer gap-2 text-xs h-9 justify-center border-2 border-border/80 hover:bg-muted/60"
          >
            <Send className="size-3.5 text-muted-foreground" />
            <span>Share via Apps</span>
          </Button>
        </div>

        {/* Security Warning Notice */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border-2 border-amber-500/20 text-amber-500 text-[11px]">
          <ShieldAlert className="size-4 shrink-0 mt-0.5" />
          <p>
            Law Enforcement Sensitive. Sharing is restricted to authorized personnel with active badge credentials.
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t-2 border-border/70">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer text-xs border-2 border-border/80"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
