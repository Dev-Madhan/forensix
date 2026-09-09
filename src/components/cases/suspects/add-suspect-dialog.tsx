"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  UserPlus,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SuspectItem, SuspectStatus, SuspectRole } from "./types";
import {
  MOCK_CASE_SKETCHES,
  type CaseSketchReference,
  type CaseSketchMatchCandidate,
} from "./mock-case-sketches";

interface AddSuspectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSuspect: (suspect: SuspectItem) => void;
  nextIndexNumber: number;
  existingSuspects?: SuspectItem[];
}

export function AddSuspectDialog({
  isOpen,
  onOpenChange,
  onAddSuspect,
  nextIndexNumber,
  existingSuspects = [],
}: AddSuspectDialogProps) {
  const [activeTab, setActiveTab] = useState<"ai-sketch" | "manual">(
    "ai-sketch"
  );

  // AI Match Tab State
  const [selectedSketchId, setSelectedSketchId] = useState<string>(
    MOCK_CASE_SKETCHES[0].id
  );
  const [candidateRoles, setCandidateRoles] = useState<
    Record<string, { status: SuspectStatus; role: SuspectRole }>
  >({});

  // Manual Form State
  const [manualName, setManualName] = useState("");
  const [manualAlias, setManualAlias] = useState("");
  const [manualStatus, setManualStatus] =
    useState<SuspectStatus>("Person of Interest");
  const [manualRole, setManualRole] =
    useState<SuspectRole>("Possible Associate");
  const [manualMatchConfidence, setManualMatchConfidence] = useState("75");
  const [manualLastSeenDate, setManualLastSeenDate] = useState("Oct 5, 2026");
  const [manualLastSeenTime, setManualLastSeenTime] = useState("10:30 AM");

  // Dynamic Dialog Height Smooth Transition
  const contentMeasureRef = React.useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);
  const [viewportHeight, setViewportHeight] = useState<number>(800);

  // Track viewport height to clamp dialog within max-height constraints
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Measure content height with ResizeObserver
  React.useEffect(() => {
    const el = contentMeasureRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const h = Math.round(entry.contentRect.height);
        if (h > 0) {
          setMeasuredHeight(h);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  // Reset when dialog opens so it measures naturally
  React.useEffect(() => {
    if (isOpen) {
      setMeasuredHeight(undefined);
    }
  }, [isOpen]);

  // Calculate target height clamped to modal max-height bounds
  const isMobileScreen = typeof window !== "undefined" ? window.innerWidth < 640 : false;
  const maxAllowedBodyHeight = isMobileScreen
    ? Math.round(viewportHeight * 0.90 - 110)
    : Math.round(viewportHeight * 0.90 - 136);

  const targetBodyHeight = measuredHeight
    ? Math.min(measuredHeight, Math.max(280, maxAllowedBodyHeight))
    : undefined;

  const selectedSketch: CaseSketchReference =
    MOCK_CASE_SKETCHES.find((s) => s.id === selectedSketchId) ||
    MOCK_CASE_SKETCHES[0];

  const isCandidateInCase = (candidateName: string) => {
    return existingSuspects.some(
      (s) => s.name.toLowerCase() === candidateName.toLowerCase()
    );
  };

  const handleLinkCandidate = (candidate: CaseSketchMatchCandidate) => {
    const customConfig = candidateRoles[candidate.id] || {
      status: candidate.recommendedStatus,
      role: candidate.recommendedRole,
    };

    const newSuspect: SuspectItem = {
      id: `susp-${Date.now().toString().slice(-4)}`,
      numberIndex: String(nextIndexNumber).padStart(2, "0"),
      name: candidate.name,
      alias: candidate.alias,
      photo: candidate.photo,
      status: customConfig.status,
      role: customConfig.role,
      matchConfidence: candidate.matchConfidence,
      lastSeenDate: "Oct 4, 2026",
      lastSeenTime: "09:14 PM",
      dob: candidate.dob,
      age: candidate.age,
      gender: candidate.gender,
      nationality: "Indian",
      knownAddresses: candidate.knownAddresses,
      phone: candidate.phone,
      occupation: "Unknown",
      criminalRecord: candidate.priorCases,
      height: candidate.height,
      build: candidate.build,
      complexion: candidate.complexion,
      hairColor: candidate.hairColor,
      eyeColor: candidate.eyeColor,
      identifyingMarks: candidate.identifyingMarks,
      notes: `${candidate.llmReasoning} Matched from Composite ${selectedSketch.sketchNumber}.`,
    };

    onAddSuspect(newSuspect);
    toast.success(
      `Linked ${candidate.name} to case from ${selectedSketch.sketchNumber} (${candidate.matchConfidence}% confidence)`
    );
    onOpenChange(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      toast.error("Suspect name is required");
      return;
    }

    const newSuspect: SuspectItem = {
      id: `susp-${Date.now().toString().slice(-4)}`,
      numberIndex: String(nextIndexNumber).padStart(2, "0"),
      name: manualName.trim(),
      alias: manualAlias.trim() ? `Alias: ${manualAlias.trim()}` : "Alias: None",
      photo: "/images/suspects/arun-prakash.jpg",
      status: manualStatus,
      role: manualRole,
      matchConfidence: Math.min(
        100,
        Math.max(0, parseInt(manualMatchConfidence, 10) || 50)
      ),
      lastSeenDate: manualLastSeenDate.trim() || "Oct 5, 2026",
      lastSeenTime: manualLastSeenTime.trim() || "12:00 PM",
      notes: "Newly added suspect profile linked to current investigation.",
    };

    onAddSuspect(newSuspect);
    toast.success(`Suspect ${newSuspect.name} added to case.`);
    onOpenChange(false);

    setManualName("");
    setManualAlias("");
    setManualStatus("Person of Interest");
    setManualRole("Possible Associate");
    setManualMatchConfidence("75");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[92dvh] sm:max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border border-border/70 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl min-w-0">

        {/* ── Fixed Dialog Header (Strictly responsive) ── */}
        <div className="shrink-0 px-3.5 sm:px-6 pt-3.5 sm:pt-5 pb-3 border-b border-border/50 bg-muted/10 min-w-0">
          <div className="pr-8 sm:pr-0 min-w-0">
            <DialogHeader className="space-y-0 text-left min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground tracking-tight truncate">
                Add Suspect to Case
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2 sm:line-clamp-none">
                Review forensic biometric correlations against case composite sketches, or register a manual profile.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Clean Segmented Tab Navigation: Equal columns on mobile, inline on desktop */}
          <div className="pt-2.5 sm:pt-3 min-w-0">
            <div className="grid grid-cols-2 sm:inline-flex items-center rounded-lg bg-muted/40 p-1 border border-border/50 gap-1 sm:gap-0 w-full sm:w-auto min-w-0">
              <button
                type="button"
                onClick={() => setActiveTab("ai-sketch")}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer select-none text-center min-h-8.5 min-w-0",
                  activeTab === "ai-sketch"
                    ? "bg-[#665AEF] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                )}
              >
                <Sparkles className="size-3.5 shrink-0" />
                <span className="truncate">AI Biometric Match</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer select-none text-center min-h-8.5 min-w-0",
                  activeTab === "manual"
                    ? "bg-[#665AEF] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                )}
              >
                <UserPlus className="size-3.5 shrink-0" />
                <span className="truncate">Manual Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Dynamic Resizing Body (Zero horizontal overflow) ── */}
        <motion.div
          animate={{ height: targetBodyHeight ?? "auto" }}
          transition={{
            height: {
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          className="w-full min-w-0 overflow-y-auto overscroll-contain overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden max-h-[calc(92dvh-6.75rem)] sm:max-h-[calc(90vh-8.5rem)]"
        >
          <div ref={contentMeasureRef} className="w-full min-w-0 flow-root">
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === "ai-sketch" ? (
                <motion.div
                  key="tab-ai-sketch"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full min-w-0 px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4"
                >

                  {/* ── 1. Forensic Evidence Dossier Header ── */}
                  <div className="w-full min-w-0 rounded-xl border border-border/60 bg-card/50 p-3 sm:p-3.5 space-y-2.5 sm:space-y-3">
                    {/* Reference Thumbnail & Switcher Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Composite thumbnail */}
                        <div className="size-10 sm:size-11 rounded-lg border border-border/70 overflow-hidden bg-black shrink-0 shadow-inner">
                          <img
                            src={selectedSketch.sketchImageUrl}
                            alt={selectedSketch.sketchNumber}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[#a594fd] shrink-0">
                              Case Composite
                            </span>
                            <span className="text-xs sm:text-sm font-bold font-heading text-foreground truncate">
                              {selectedSketch.sketchNumber}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                            Generated {selectedSketch.dateGenerated}
                          </p>
                        </div>
                      </div>

                      {/* Sketch Switcher Pills */}
                      <div className="w-full sm:w-auto min-w-0 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                        {MOCK_CASE_SKETCHES.map((sketch) => {
                          const isSelected = sketch.id === selectedSketchId;
                          return (
                            <button
                              key={sketch.id}
                              type="button"
                              onClick={() => setSelectedSketchId(sketch.id)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-8 select-none active:scale-98",
                                isSelected
                                  ? "bg-[#665AEF] text-white font-semibold shadow-xs"
                                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium"
                              )}
                            >
                              <span className="font-mono">{sketch.sketchNumber}</span>
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium leading-none",
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-background/60 text-muted-foreground"
                                )}
                              >
                                {sketch.candidates.length} {sketch.candidates.length === 1 ? "match" : "matches"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Separator className="bg-border/30" />

                    {/* Witness Statement */}
                    <div className="border-l-2 border-[#665AEF] pl-2.5 sm:pl-3 py-1 bg-muted/15 rounded-r-md min-w-0">
                      <p className="text-[11px] italic text-muted-foreground leading-relaxed wrap-break-word">
                        &ldquo;{selectedSketch.witnessDescription}&rdquo;
                      </p>
                      <span className="text-[10px] text-muted-foreground/80 font-medium not-italic block mt-0.5 truncate">
                        — {selectedSketch.witnessStatementRef}
                      </span>
                    </div>
                  </div>

                  {/* ── 2. Biometric Vector Matches Section Header ── */}
                  <div className="space-y-2.5 sm:space-y-3 min-w-0">
                    <div className="flex items-center justify-between gap-2 px-0.5 min-w-0">
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-foreground truncate">
                          Vector Biometric Matches
                        </h3>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                          {selectedSketch.candidates.length} candidate profiles correlated by landmark analysis
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-emerald-400 shrink-0">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span>Active</span>
                      </div>
                    </div>

                    {/* Candidate Profiles List */}
                    <div className="space-y-3 sm:space-y-3.5 min-w-0">
                      {selectedSketch.candidates.map((candidate, index) => {
                        const inCase = isCandidateInCase(candidate.name);
                        const config = candidateRoles[candidate.id] || {
                          status: candidate.recommendedStatus,
                          role: candidate.recommendedRole,
                        };
                        const isHighConfidence = candidate.matchConfidence >= 85;

                        return (
                          <div
                            key={candidate.id}
                            className={cn(
                              "w-full min-w-0 rounded-xl border transition-all overflow-hidden bg-card/60 shadow-xs",
                              inCase
                                ? "border-border/40 opacity-80"
                                : "border-border/70 hover:border-border"
                            )}
                          >
                            {/* Candidate Header: Photo, Identification, Borderless Confidence Value */}
                            <div className="p-3 sm:p-4 pb-2.5 sm:pb-3 flex items-start justify-between gap-2 border-b border-border/40 bg-muted/10 min-w-0">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                {/* Booking Mugshot */}
                                <div className="relative size-11 sm:size-12 rounded-lg border border-border/70 overflow-hidden shrink-0 bg-black shadow-inner">
                                  <img
                                    src={candidate.photo}
                                    alt={candidate.name}
                                    className="size-full object-cover"
                                  />
                                  <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[7px] font-mono text-center text-muted-foreground leading-tight py-px uppercase">
                                    Mugshot
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1 space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="text-sm font-bold font-heading text-foreground truncate tracking-tight leading-tight">
                                      {candidate.name}
                                    </h4>
                                    <span className="font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-normal leading-none shrink-0">
                                      {candidate.criminalId}
                                    </span>
                                  </div>
                                  <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                                    <span>{candidate.alias}</span>
                                    <span className="mx-1 text-muted-foreground/40">•</span>
                                    <span>{candidate.priorCases}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Confidence Metric - Clean Borderless Number Value */}
                              <div className="flex flex-col items-end shrink-0 pl-1 text-right">
                                <div className="flex items-baseline gap-1">
                                  <span
                                    className={cn(
                                      "text-lg sm:text-2xl font-bold font-mono tracking-tight leading-none",
                                      isHighConfidence ? "text-rose-400" : "text-amber-400"
                                    )}
                                  >
                                    {candidate.matchConfidence}%
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[10px] sm:text-xs font-semibold uppercase tracking-wider leading-none",
                                      isHighConfidence ? "text-rose-400/80" : "text-amber-400/80"
                                    )}
                                  >
                                    Match
                                  </span>
                                </div>
                                <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground mt-0.5 whitespace-nowrap">
                                  {isHighConfidence ? "Rank #1 · High" : `Rank #${index + 1} · Secondary`}
                                </span>
                              </div>
                            </div>

                            {/* Mid Section: Forensic Comparison Strip & Physical Traits */}
                            <div className="p-3 sm:p-4 space-y-3 md:space-y-0 md:grid md:grid-cols-12 md:gap-3.5 md:items-center min-w-0">
                              {/* Direct Biometric Comparison Strip */}
                              <div className="md:col-span-5 flex items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-border/40 min-w-0">
                                {/* Case Composite Thumbnail */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                  <div className="size-10 sm:size-11 rounded-md border border-border/60 overflow-hidden bg-black/80">
                                    <img
                                      src={selectedSketch.sketchImageUrl}
                                      alt="Case Sketch"
                                      className="size-full object-cover"
                                    />
                                  </div>
                                  <span className="text-[7px] sm:text-[8px] font-mono text-muted-foreground uppercase">
                                    Composite
                                  </span>
                                </div>

                                {/* Vector Landmark Alignment Graphic */}
                                <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-1">
                                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#a594fd] uppercase tracking-wider truncate">
                                    {candidate.matchConfidence}% Vector
                                  </span>
                                  <div className="w-full flex items-center gap-1 my-0.5">
                                    <div className="h-px flex-1 bg-linear-to-r from-border/60 to-[#665AEF]/70" />
                                    <div className="size-1 rounded-full bg-[#665AEF] shrink-0" />
                                    <div className="h-px flex-1 bg-linear-to-l from-border/60 to-[#665AEF]/70" />
                                  </div>
                                  <span className="text-[7px] sm:text-[8px] font-mono text-muted-foreground/70 truncate">
                                    Facial Landmarks
                                  </span>
                                </div>

                                {/* Database Record Photo */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                  <div className="size-10 sm:size-11 rounded-md border border-border/60 overflow-hidden bg-black/80">
                                    <img
                                      src={candidate.photo}
                                      alt="Record Mugshot"
                                      className="size-full object-cover"
                                    />
                                  </div>
                                  <span className="text-[7px] sm:text-[8px] font-mono text-muted-foreground uppercase">
                                    Record
                                  </span>
                                </div>
                              </div>

                              {/* Physical Traits Matrix */}
                              <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs min-w-0">
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block truncate">
                                    Demographics
                                  </span>
                                  <span className="font-medium text-foreground text-[11px] sm:text-xs block truncate">
                                    {candidate.gender}, {candidate.age} yrs
                                  </span>
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block truncate">
                                    Height &amp; Build
                                  </span>
                                  <span className="font-medium text-foreground text-[11px] sm:text-xs block truncate">
                                    {candidate.height} · {candidate.build}
                                  </span>
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block truncate">
                                    Complexion
                                  </span>
                                  <span className="font-medium text-foreground text-[11px] sm:text-xs block truncate">
                                    {candidate.complexion}
                                  </span>
                                </div>
                                <div className="space-y-0.5 col-span-2 sm:col-span-2 min-w-0">
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block truncate">
                                    Identifying Marks
                                  </span>
                                  <span className="font-medium text-foreground text-[11px] sm:text-xs truncate block">
                                    {candidate.identifyingMarks || "None recorded"}
                                  </span>
                                </div>
                                <div className="space-y-0.5 col-span-2 sm:col-span-1 min-w-0">
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider block truncate">
                                    Jurisdiction
                                  </span>
                                  <span className="font-medium text-foreground text-[11px] sm:text-xs truncate block">
                                    {candidate.knownAddresses?.split(",")[0] || "Chennai, TN"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* AI Investigative Assessment Callout */}
                            <div className="mx-3 sm:mx-4 mb-2.5 sm:mb-3 p-2.5 rounded-lg border-l-2 border-[#665AEF] bg-muted/20 text-xs min-w-0">
                              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed wrap-break-word">
                                <strong className="text-foreground font-semibold font-heading">
                                  Forensic Intelligence Assessment:{" "}
                                </strong>
                                {candidate.llmReasoning}
                              </p>
                            </div>

                            {/* Disposition & Linking Toolbar */}
                            <div className="px-3 sm:px-4 py-2.5 bg-muted/15 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2 min-w-0 w-full sm:w-auto">
                                {/* Case Status Selector */}
                                <div className="min-w-0">
                                  <Select
                                    value={config.status}
                                    onValueChange={(val) => {
                                      if (!val) return;
                                      setCandidateRoles((prev) => ({
                                        ...prev,
                                        [candidate.id]: {
                                          status: val as SuspectStatus,
                                          role: config.role,
                                        },
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="h-8.5 sm:h-8 w-full sm:w-38 text-xs rounded-md bg-card/80 border-border/60 min-w-0">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border border-border bg-card/95 backdrop-blur-xl">
                                      <SelectItem value="Primary Suspect">Primary Suspect</SelectItem>
                                      <SelectItem value="Person of Interest">Person of Interest</SelectItem>
                                      <SelectItem value="Cleared">Cleared</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Case Role Selector */}
                                <div className="min-w-0">
                                  <Select
                                    value={config.role}
                                    onValueChange={(val) => {
                                      if (!val) return;
                                      setCandidateRoles((prev) => ({
                                        ...prev,
                                        [candidate.id]: {
                                          status: config.status,
                                          role: val as SuspectRole,
                                        },
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="h-8.5 sm:h-8 w-full sm:w-40 text-xs rounded-md bg-card/80 border-border/60 min-w-0">
                                      <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border border-border bg-card/95 backdrop-blur-xl">
                                      <SelectItem value="Direct Involvement">Direct Involvement</SelectItem>
                                      <SelectItem value="Possible Associate">Possible Associate</SelectItem>
                                      <SelectItem value="Accomplice">Accomplice</SelectItem>
                                      <SelectItem value="Informant">Informant</SelectItem>
                                      <SelectItem value="Witness">Witness</SelectItem>
                                      <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Action Link Control */}
                              <div className="w-full sm:w-auto shrink-0 pt-0.5 sm:pt-0">
                                {inCase ? (
                                  <span className="inline-flex items-center justify-center gap-1.5 h-8.5 sm:h-8 px-3 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-md select-none w-full sm:w-auto">
                                    <Check className="size-3.5" />
                                    Already Linked to Case
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleLinkCandidate(candidate)}
                                    className="h-8.5 sm:h-8 px-4 text-xs font-semibold bg-[#665AEF] hover:bg-[#5749df] text-white shadow-xs cursor-pointer gap-1.5 w-full sm:w-auto min-h-8.5"
                                  >
                                    <UserPlus className="size-3.5" />
                                    Link Suspect to Case
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

              ) : (
                /* ══ Tab 2: Manual Entry ══ */
                <motion.div
                  key="tab-manual"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <form onSubmit={handleManualSubmit} className="w-full min-w-0 px-3.5 sm:px-6 py-3.5 sm:py-4 space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                      <div className="space-y-1.5 min-w-0">
                        <Label htmlFor="suspect-name" className="text-xs font-semibold text-foreground">
                          Full Name <span className="text-rose-400">*</span>
                        </Label>
                        <Input
                          id="suspect-name"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          placeholder="e.g. Vikram Sharma"
                          required
                          className="h-9 text-xs rounded-md bg-background/50 border border-border/70"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <Label htmlFor="suspect-alias" className="text-xs font-semibold text-foreground">
                          Alias / Street Name
                        </Label>
                        <Input
                          id="suspect-alias"
                          value={manualAlias}
                          onChange={(e) => setManualAlias(e.target.value)}
                          placeholder="e.g. Rocky, Vicky"
                          className="h-9 text-xs rounded-md bg-background/50 border border-border/70"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <Label htmlFor="suspect-status" className="text-xs font-semibold text-foreground">
                          Suspect Status
                        </Label>
                        <Select
                          value={manualStatus}
                          onValueChange={(val) => {
                            if (val) setManualStatus(val as SuspectStatus);
                          }}
                        >
                          <SelectTrigger id="suspect-status" className="h-9 w-full text-xs rounded-md bg-background/50 border border-border/70">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-md border border-border bg-card/95 backdrop-blur-xl min-w-[max(var(--anchor-width),13rem)]">
                            <SelectItem value="Primary Suspect">Primary Suspect</SelectItem>
                            <SelectItem value="Person of Interest">Person of Interest</SelectItem>
                            <SelectItem value="Cleared">Cleared</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <Label htmlFor="suspect-role" className="text-xs font-semibold text-foreground">
                          Investigative Role
                        </Label>
                        <Select
                          value={manualRole}
                          onValueChange={(val) => {
                            if (val) setManualRole(val as SuspectRole);
                          }}
                        >
                          <SelectTrigger id="suspect-role" className="h-9 w-full text-xs rounded-md bg-background/50 border border-border/70">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent className="rounded-md border border-border bg-card/95 backdrop-blur-xl min-w-[max(var(--anchor-width),13rem)]">
                            <SelectItem value="Direct Involvement">Direct Involvement</SelectItem>
                            <SelectItem value="Possible Associate">Possible Associate</SelectItem>
                            <SelectItem value="Accomplice">Accomplice</SelectItem>
                            <SelectItem value="Informant">Informant</SelectItem>
                            <SelectItem value="Witness">Witness</SelectItem>
                            <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <Label htmlFor="match-confidence" className="text-xs font-semibold text-foreground">
                          Match Confidence (%)
                        </Label>
                        <Input
                          id="match-confidence"
                          type="number"
                          min="0"
                          max="100"
                          value={manualMatchConfidence}
                          onChange={(e) => setManualMatchConfidence(e.target.value)}
                          placeholder="e.g. 75"
                          className="h-9 text-xs rounded-md bg-background/50 border border-border/70"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <Label htmlFor="last-seen-date" className="text-xs font-semibold text-foreground">
                          Last Seen Date
                        </Label>
                        <Input
                          id="last-seen-date"
                          value={manualLastSeenDate}
                          onChange={(e) => setManualLastSeenDate(e.target.value)}
                          placeholder="Oct 5, 2026"
                          className="h-9 text-xs rounded-md bg-background/50 border border-border/70"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-3 border-t border-border/40">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-9 text-xs rounded-lg cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="h-9 text-xs rounded-lg font-semibold bg-[#665AEF] hover:bg-[#5749df] text-white shadow-xs cursor-pointer"
                      >
                        Save Suspect
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
