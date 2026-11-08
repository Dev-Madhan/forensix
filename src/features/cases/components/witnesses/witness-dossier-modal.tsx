"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  Mail,
  MapPin,
  Shield,
  ShieldAlert,
  Sparkles,
  History,
  Eye,
  FileText,
  User,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Edit2,
  Lock,
} from "lucide-react";
import type { WitnessItem } from "../../witnesses/types";

interface WitnessDossierModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  witness: WitnessItem | null;
  caseId: string;
  caseNumber?: string;
  onLogRecontact: (witness: WitnessItem) => void;
  onEditWitness: (witness: WitnessItem) => void;
}

export function WitnessDossierModal({
  isOpen,
  onOpenChange,
  witness,
  caseId,
  caseNumber,
  onLogRecontact,
  onEditWitness,
}: WitnessDossierModalProps) {
  if (!witness) return null;

  const initials = witness.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[92dvh] sm:max-h-[88vh] overflow-hidden flex flex-col rounded-xl border border-neutral-800 bg-[#0a0a0a] text-neutral-100 p-0 shadow-2xl min-w-0 gap-0 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {/* ── Fixed Dossier Header (Page theme dark/black) ── */}
        <div className="shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-neutral-800 bg-[#0d0d0d] min-w-0">
          <DialogHeader className="space-y-0 text-left">
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3.5 min-w-0">
                <Avatar className="size-11 sm:size-12 rounded-lg border border-[#665AEF]/40 bg-[#121218] shrink-0 shadow-sm">
                  <AvatarFallback className="text-sm sm:text-base font-bold text-[#a89dff] font-mono rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-base sm:text-xl font-heading font-bold text-white tracking-tight truncate">
                      {witness.name}
                    </DialogTitle>
                    {witness.alias && (
                      <span className="text-xs text-neutral-400 italic font-normal">
                        (&quot;{witness.alias}&quot;)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-xs text-[#a89dff] font-semibold px-2 py-0.5 rounded-md bg-[#665AEF]/15 border border-[#665AEF]/30">
                      {witness.witnessCode}
                    </span>
                    <span className="text-xs text-neutral-400">
                      • {witness.witnessType.replace("_", " ")}
                    </span>
                    {caseNumber && (
                      <span className="text-xs text-neutral-400 font-mono">
                        • Case {caseNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 shrink-0">
                {witness.isProtected ? (
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono px-2.5 py-1 rounded-md">
                    <ShieldAlert className="size-3.5 mr-1" />
                    Witness Protected
                  </Badge>
                ) : (
                  <Badge
                    className={`text-xs font-mono border px-2.5 py-1 rounded-md ${
                      witness.credibility === "HIGH"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-neutral-900 border-neutral-800 text-neutral-300"
                    }`}
                  >
                    {witness.credibility.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── Scrollable Dossier Body (Pure dark obsidian & reduced radius) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4 min-w-0 text-xs bg-[#0a0a0a] no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden">
          {/* SECTION 1: PERSONAL PARTICULARS & ID */}
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-[#665AEF]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-heading">
                  1. Demographic Particulars & Identity
                </h4>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">REGISTRY RECORD</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Gender / Age</span>
                <span className="font-semibold text-neutral-100 text-xs mt-0.5 block">
                  {witness.gender || "Unspecified"}{" "}
                  {witness.ageAtIncident ? `(${witness.ageAtIncident} yrs)` : ""}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Occupation</span>
                <span className="font-semibold text-neutral-100 text-xs mt-0.5 block truncate">
                  {witness.occupation || "Not Specified"}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Govt ID Type</span>
                <span className="font-semibold text-neutral-100 text-xs mt-0.5 block">
                  {witness.idType.replace("_", " ")}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Masked ID Number</span>
                <span className="font-mono font-semibold text-neutral-100 text-xs mt-0.5 block">
                  {witness.idNumberMasked || "Verified on File"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: FUTURE VERIFICATION & REACHABILITY MATRIX */}
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-heading">
                  2. Cold-Case Verification & Reachability Matrix
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">REDUNDANT CHANNELS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Primary Mobile</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone className="size-3 text-emerald-400 shrink-0" />
                  <span className="font-mono font-bold text-neutral-100 text-xs">
                    {witness.primaryPhone}
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Secondary / Landline</span>
                <span className="font-mono text-neutral-200 text-xs mt-0.5 block">
                  {witness.secondaryPhone || "None registered"}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Email Address</span>
                <span className="text-neutral-200 text-xs mt-0.5 block truncate">
                  {witness.email || "None registered"}
                </span>
              </div>
            </div>

            {/* Emergency Secondary Contact */}
            {witness.emergencyContactName && (
              <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                  <span className="text-[10.5px] text-neutral-400 block font-medium">
                    Emergency Secondary Contact / Next of Kin
                  </span>
                  <span className="font-semibold text-neutral-100 text-xs mt-0.5 block">
                    {witness.emergencyContactName} ({witness.emergencyRelationship || "Family"})
                  </span>
                </div>
                <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                  <span className="text-[10.5px] text-neutral-400 block font-medium">Emergency Phone</span>
                  <span className="font-mono font-semibold text-neutral-100 text-xs mt-0.5 block">
                    {witness.emergencyContactPhone || "Same as primary"}
                  </span>
                </div>
              </div>
            )}

            {/* Addresses */}
            <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Current Living Address</span>
                <span className="text-neutral-200 text-xs mt-0.5 block">
                  {[witness.currentAddress, witness.city, witness.state]
                    .filter(Boolean)
                    .join(", ") || "No address entered"}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">
                  Permanent Hometown Address
                </span>
                <span className="text-neutral-200 text-xs mt-0.5 block">
                  {witness.permanentAddress || "Same as current residence"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: OBSERVATION PARAMETERS */}
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="size-3.5 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-heading">
                  3. Observation Environmental Parameters & Memory Decay
                </h4>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">SCENE CALIBRATION</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Sighting Distance</span>
                <span className="font-semibold text-neutral-100 text-xs mt-0.5 block">
                  {witness.incidentDistanceMeters
                    ? `${witness.incidentDistanceMeters} meters`
                    : "Not measured"}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Duration Observed</span>
                <span className="font-semibold text-neutral-100 text-xs mt-0.5 block">
                  {witness.observationDurationSec
                    ? `${witness.observationDurationSec} seconds`
                    : "Brief glance"}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Lighting Condition</span>
                <span className="font-semibold text-neutral-100 text-xs mt-0.5 block truncate">
                  {witness.lightingCondition || "Clear Daylight"}
                </span>
              </div>
              <div className="p-2.5 rounded-md border border-neutral-800/80 bg-black/60">
                <span className="text-[10.5px] text-neutral-400 block font-medium">Recall Confidence</span>
                <span className="font-mono font-bold text-[#a89dff] text-xs mt-0.5 block">
                  {witness.confidenceScore !== null && witness.confidenceScore !== undefined
                    ? `${witness.confidenceScore}%`
                    : "85%"}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: TESTIMONY & COMPOSITE SKETCH PROMPT */}
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-[#665AEF]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-heading">
                  4. Recorded Eyewitness Deposition & Suspect Features
                </h4>
              </div>
              <span className="text-[10.5px] text-neutral-400 font-mono">
                {witness.interviewDate ? `Recorded ${witness.interviewDate}` : "Case File"}
              </span>
            </div>

            <div className="p-4 rounded-md border border-neutral-800/80 bg-black/60 space-y-3">
              <p className="text-xs text-neutral-200 italic leading-relaxed whitespace-pre-wrap">
                &quot;{witness.statement}&quot;
              </p>
              {witness.keyFacialFeatures && (
                <div className="pt-3 border-t border-neutral-800 text-xs">
                  <span className="text-[#a89dff] font-semibold block mb-1">
                    Key Recalled Facial & Physical Identifiers:
                  </span>
                  <span className="text-neutral-200 leading-relaxed">{witness.keyFacialFeatures}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: HISTORICAL RE-CONTACT INQUIRY LOGS */}
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <History className="size-3.5 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
                  5. Cold-Case Re-Contact & Inquiry History ({witness.inquiries.length})
                </h4>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLogRecontact(witness)}
                className="h-8 px-3 text-xs border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md cursor-pointer font-medium"
              >
                + Record New Inquiry
              </Button>
            </div>

            {witness.inquiries.length === 0 ? (
              <div className="p-4 rounded-md border border-dashed border-neutral-800 bg-black/40 text-center text-neutral-400 text-xs">
                No future follow-up inquiries logged yet. If a sudden clue emerges or cold-case re-examination occurs, use &quot;Record New Inquiry&quot; to log the contact.
              </div>
            ) : (
              <div className="space-y-2.5">
                {witness.inquiries.map((inq, idx) => {
                  const uniqueKey = inq.id ? `${inq.id}-${idx}` : `inq-${idx}-${inq.inquiryDate || ""}`;
                  return (
                    <div
                      key={uniqueKey}
                      className="p-3.5 rounded-md border border-neutral-800/80 bg-black/60 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                        <span className="font-semibold text-neutral-100">
                          {inq.purpose} ({inq.contactMethod})
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400">
                          {new Date(inq.inquiryDate).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{inq.notes}</p>
                      {inq.outcome && (
                        <div className="text-xs text-emerald-400 font-medium">
                          Outcome: {inq.outcome}
                        </div>
                      )}
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Investigator: {inq.investigatorName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Fixed Dossier Footer (Page theme dark/black & reduced radius) ── */}
        <div className="shrink-0 px-5 sm:px-7 py-3.5 sm:py-4 border-t border-neutral-800 bg-[#0d0d0d] flex items-center justify-between gap-3 min-w-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onEditWitness(witness)}
            className="h-9 px-3.5 text-xs font-medium flex items-center gap-2 cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white transition-colors"
          >
            <Edit2 className="size-3.5" />
            <span>Edit Record</span>
          </Button>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/sketch?caseId=${caseId}&witnessId=${witness.id}`}
              onClick={() => onOpenChange(false)}
            >
              <Button
                className="h-9 px-4 text-xs font-semibold bg-[#665AEF] hover:bg-[#5748e6] text-white flex items-center gap-2 cursor-pointer rounded-lg shadow-sm transition-colors"
              >
                <Sparkles className="size-4" />
                <span>Generate Composite Sketch</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3.5 text-xs font-medium cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            >
              Close Dossier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
